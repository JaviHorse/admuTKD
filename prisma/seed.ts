import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Users
    const adminHash = await bcrypt.hash("admin123", 10);
    const viewerHash = await bcrypt.hash("viewer123", 10);

    await prisma.user.upsert({
        where: { email: "admin@admutkd.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@admutkd.com",
            passwordHash: adminHash,
            role: "ADMIN",
        },
    });

    await prisma.user.upsert({
        where: { email: "viewer@admutkd.com" },
        update: {},
        create: {
            name: "Viewer User",
            email: "viewer@admutkd.com",
            passwordHash: viewerHash,
            role: "VIEWER",
        },
    });

    // Semesters
    const sem1 = await prisma.semester.upsert({
        where: { id: "sem1-2024" },
        update: {},
        create: {
            id: "sem1-2024",
            name: "Sem 1 AY 2024-2025",
            startDate: new Date("2024-08-01"),
            endDate: new Date("2024-12-31"),
            isActive: false,
        },
    });

    const sem2 = await prisma.semester.upsert({
        where: { id: "sem2-2025" },
        update: {},
        create: {
            id: "sem2-2025",
            name: "Sem 2 AY 2024-2025",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-05-31"),
            isActive: true,
        },
    });

    // Coaches
    const coach1 = await prisma.coach.upsert({
        where: { id: "coach-1" },
        update: {},
        create: {
            id: "coach-1",
            fullName: "Master Jun Santos",
            roleTitle: "Head Coach",
            isActive: true,
        },
    });

    const coach2 = await prisma.coach.upsert({
        where: { id: "coach-2" },
        update: {},
        create: {
            id: "coach-2",
            fullName: "Coach Maria Reyes",
            roleTitle: "Assistant Coach",
            isActive: true,
        },
    });

    // Players
    const playerNames = [
        "Alejandro Cruz",
        "Bianca Santos",
        "Carlos Mendoza",
        "Diana Lim",
        "Eduardo Ramos",
        "Francesca Tan",
        "Gabriel Uy",
        "Hannah Go",
        "Ivan Dela Cruz",
        "Julia Reyes",
    ];

    const players = [];
    for (let i = 0; i < playerNames.length; i++) {
        const player = await prisma.player.upsert({
            where: { id: `player-${i + 1}` },
            update: {},
            create: {
                id: `player-${i + 1}`,
                fullName: playerNames[i],
                isActive: i < 8, // first 8 active
            },
        });
        players.push(player);
    }

    // Sessions (Sem 2 2025)
    const sessionDates = [
        new Date("2025-01-10"),
        new Date("2025-01-17"),
        new Date("2025-01-24"),
        new Date("2025-01-31"),
        new Date("2025-02-07"),
    ];

    const statuses = ["PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT", "EXCUSED", "PRESENT", "PRESENT", "ABSENT", "PRESENT"];

    for (let si = 0; si < sessionDates.length; si++) {
        const session = await prisma.session.upsert({
            where: { id: `session-${si + 1}` },
            update: {},
            create: {
                id: `session-${si + 1}`,
                sessionDate: sessionDates[si],
                sessionType: si % 2 === 0 ? "Practice" : "Training",
                location: "ADMU Gym",
                notes: `Session ${si + 1} notes`,
            },
        });

        // Attach coaches
        await prisma.sessionCoach.upsert({
            where: { sessionId_coachId: { sessionId: session.id, coachId: coach1.id } },
            update: {},
            create: { sessionId: session.id, coachId: coach1.id },
        });

        if (si % 2 === 0) {
            await prisma.sessionCoach.upsert({
                where: { sessionId_coachId: { sessionId: session.id, coachId: coach2.id } },
                update: {},
                create: { sessionId: session.id, coachId: coach2.id },
            });
        }

        // Attendance for active players
        for (let pi = 0; pi < players.length; pi++) {
            if (!players[pi].isActive) continue;
            const status = statuses[(pi + si) % statuses.length];
            await prisma.attendanceRecord.upsert({
                where: { sessionId_playerId: { sessionId: session.id, playerId: players[pi].id } },
                update: {},
                create: {
                    sessionId: session.id,
                    playerId: players[pi].id,
                    status,
                },
            });
        }
    }

    // Competitions (Sem 2 2025)
    const comp1 = await prisma.competition.upsert({
        where: { id: "comp-1" },
        update: {},
        create: {
            id: "comp-1",
            name: "UAAP Taekwondo Championships",
            competitionDate: new Date("2025-02-01"),
            location: "UST Gym",
            notes: "UAAP Season 87",
        },
    });

    const comp2 = await prisma.competition.upsert({
        where: { id: "comp-2" },
        update: {},
        create: {
            id: "comp-2",
            name: "Ateneo Invitational Cup",
            competitionDate: new Date("2025-02-15"),
            location: "ADMU Gym",
        },
    });

    // Competition results
    const medals = ["GOLD", "SILVER", "BRONZE", "NONE", "GOLD", "SILVER", "BRONZE", "NONE"];
    const winsData = [3, 2, 1, 0, 2, 1, 1, 0];
    const matchesData = [3, 3, 2, 1, 3, 2, 2, 1];

    for (let pi = 0; pi < Math.min(players.length, 8); pi++) {
        await prisma.competitionResult.upsert({
            where: { competitionId_playerId: { competitionId: comp1.id, playerId: players[pi].id } },
            update: {},
            create: {
                competitionId: comp1.id,
                playerId: players[pi].id,
                medal: medals[pi],
                wins: winsData[pi],
                matches: matchesData[pi],
            },
        });
    }

    for (let pi = 0; pi < Math.min(players.length, 6); pi++) {
        await prisma.competitionResult.upsert({
            where: { competitionId_playerId: { competitionId: comp2.id, playerId: players[pi].id } },
            update: {},
            create: {
                competitionId: comp2.id,
                playerId: players[pi].id,
                medal: medals[(pi + 2) % medals.length],
                wins: winsData[(pi + 1) % winsData.length],
                matches: matchesData[(pi + 1) % matchesData.length],
            },
        });
    }

    console.log("✅ Seed complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
