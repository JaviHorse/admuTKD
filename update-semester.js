const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
    try {
        const sem2 = await prisma.semester.findFirst({
            where: { name: { contains: "Sem 2" } }
        });

        if (sem2) {
            const newStart = new Date("2026-02-01T00:00:00.000Z");
            await prisma.semester.update({
                where: { id: sem2.id },
                data: { startDate: newStart }
            });
            console.log(`Updated ${sem2.name} start date to ${newStart.toISOString()}`);
        } else {
            console.log("Sem 2 not found");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

update();
