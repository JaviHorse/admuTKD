import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "../prisma/generated/sqlite/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getModelsFromSchema(schemaPath) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    const modelNames = [];
    const re = /^model\s+(\w+)\s*\{/gm;
    let match;
    while ((match = re.exec(schema)) !== null) modelNames.push(match[1]);
    return modelNames;
}

function delegateName(modelName) {
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

async function main() {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.sqlite.prisma");
    const outDir = path.join(process.cwd(), "prisma", "transfer");
    fs.mkdirSync(outDir, { recursive: true });

    const models = getModelsFromSchema(schemaPath);

    const prisma = new PrismaClient();
    const counts = {};

    try {
        for (const model of models) {
            const delegate = delegateName(model);
            if (!prisma[delegate]) continue;

            const rows = await prisma[delegate].findMany();
            counts[model] = rows.length;

            fs.writeFileSync(
                path.join(outDir, `${model}.json`),
                JSON.stringify(rows, null, 2),
                "utf8"
            );

            console.log(`Exported ${model}: ${rows.length}`);
        }

        fs.writeFileSync(
            path.join(outDir, `_counts.sqlite.json`),
            JSON.stringify(counts, null, 2),
            "utf8"
        );

        console.log("\nDone. Files written to prisma/transfer/");
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
