import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function getModelBlocks(schemaText) {
    const blocks = {};
    const re = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
    let m;
    while ((m = re.exec(schemaText)) !== null) {
        blocks[m[1]] = m[2];
    }
    return blocks;
}

function getModels(schemaPath) {
    const schemaText = fs.readFileSync(schemaPath, "utf8");
    const blockMap = getModelBlocks(schemaText);
    return { schemaText, blockMap, modelNames: Object.keys(blockMap) };
}

function delegateName(modelName) {
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function buildDependencyGraph(blockMap) {
    const deps = new Map();
    for (const [model, body] of Object.entries(blockMap)) {
        deps.set(model, new Set());
        const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

        for (const line of lines) {
            const relMatch = line.match(/^(\w+)\s+(\w+)\s+.*@relation\(\s*fields\s*:/);
            if (relMatch) {
                const referencedModel = relMatch[2];
                if (blockMap[referencedModel] && referencedModel !== model) {
                    deps.get(model).add(referencedModel);
                }
            }
        }
    }
    return deps;
}

function topoSort(models, deps) {
    const visited = new Set();
    const temp = new Set();
    const out = [];

    function visit(n) {
        if (visited.has(n)) return;
        if (temp.has(n)) return;
        temp.add(n);
        for (const d of deps.get(n) || []) visit(d);
        temp.delete(n);
        visited.add(n);
        out.push(n);
    }

    for (const m of models) visit(m);
    return out;
}

async function safeCreateMany(prisma, delegate, data) {
    if (!data.length) return { count: 0 };

    try {
        return await prisma[delegate].createMany({
            data,
            skipDuplicates: true,
        });
    } catch (e) {
        let ok = 0;
        for (let i = 0; i < data.length; i++) {
            try {
                await prisma[delegate].create({ data: data[i] });
                ok++;
            } catch (err) {
                console.error(`Failed insert ${delegate}[${i}]`, err?.message || err);
                throw err;
            }
        }
        return { count: ok };
    }
}

async function main() {
    const prisma = new PrismaClient();
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const transferDir = path.join(process.cwd(), "prisma", "transfer");

    if (!fs.existsSync(transferDir)) {
        throw new Error("Missing prisma/transfer. Run export script first.");
    }

    const { blockMap, modelNames } = getModels(schemaPath);
    const deps = buildDependencyGraph(blockMap);
    const ordered = topoSort(modelNames, deps);

    const sqliteCountsPath = path.join(transferDir, `_counts.sqlite.json`);
    const sqliteCounts = fs.existsSync(sqliteCountsPath)
        ? JSON.parse(fs.readFileSync(sqliteCountsPath, "utf8"))
        : {};

    try {
        for (const model of ordered) {
            const file = path.join(transferDir, `${model}.json`);
            if (!fs.existsSync(file)) continue;

            const delegate = delegateName(model);
            if (!prisma[delegate]) continue;

            const data = JSON.parse(fs.readFileSync(file, "utf8"));
            const res = await safeCreateMany(prisma, delegate, data);

            console.log(`Imported ${model}: ${res.count ?? 0}`);
        }

        console.log("\nVerifying counts (Postgres vs SQLite export)...");
        for (const model of ordered) {
            const delegate = delegateName(model);
            if (!prisma[delegate]) continue;

            const pgCount = await prisma[delegate].count();
            const sqCount = sqliteCounts[model];

            if (typeof sqCount === "number") {
                console.log(`${model}: Postgres=${pgCount} | SQLite=${sqCount}`);
            } else {
                console.log(`${model}: Postgres=${pgCount}`);
            }
        }

        console.log("\nDone.");
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
