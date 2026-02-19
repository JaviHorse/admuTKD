"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getCompetitionsInSemester } from "@/lib/computations";

export type Medal = "GOLD" | "SILVER" | "BRONZE" | "NONE";

export async function getCompetitions(semesterId?: string) {
    if (semesterId) {
        return getCompetitionsInSemester(semesterId);
    }

    return prisma.competition.findMany({
        orderBy: { competitionDate: "desc" },
        include: {
            results: {
                include: { player: true },
            },
        },
    });
}

export async function getCompetitionById(id: string) {
    const safeId = String(id || "").trim();
    if (!safeId) return null;

    return prisma.competition.findUnique({
        where: { id: safeId },
        include: {
            results: {
                include: { player: true },
                orderBy: { player: { fullName: "asc" } },
            },
        },
    });
}

export async function createCompetition(data: {
    name: string;
    competitionDate: Date;
    location?: string;
    notes?: string;
}) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const competition = await prisma.competition.create({ data });

    revalidatePath("/admin/competitions/new");
    revalidatePath("/competitions");
    revalidatePath("/dashboard");

    return competition;
}

export async function updateCompetition(
    id: string,
    data: {
        name?: string;
        competitionDate?: Date;
        location?: string;
        notes?: string;
    }
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const safeId = String(id || "").trim();
    if (!safeId) {
        throw new Error("Missing competition id");
    }

    const competition = await prisma.competition.update({
        where: { id: safeId },
        data: {
            ...data,
            location: data.location === "" ? null : data.location,
            notes: data.notes === "" ? null : data.notes,
        },
    });

    revalidatePath(`/competitions/${safeId}`);
    revalidatePath("/competitions");

    return competition;
}

export async function upsertCompetitionResults(
    competitionId: string,
    results: Array<{
        playerId: string;
        medal: Medal;
        wins: number;
        matches: number;
        notes?: string;
    }>
) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const safeCompetitionId = String(competitionId || "").trim();
    if (!safeCompetitionId) {
        throw new Error("Missing competition id");
    }

    for (const result of results) {
        const safePlayerId = String(result.playerId || "").trim();
        if (!safePlayerId) continue;

        const medal: Medal =
            result.medal === "GOLD" || result.medal === "SILVER" || result.medal === "BRONZE" || result.medal === "NONE"
                ? result.medal
                : "NONE";

        await prisma.competitionResult.upsert({
            where: {
                competitionId_playerId: {
                    competitionId: safeCompetitionId,
                    playerId: safePlayerId,
                },
            },
            update: {
                medal,
                wins: Math.max(0, Number(result.wins) || 0),
                matches: Math.max(0, Number(result.matches) || 0),
                notes: result.notes ? result.notes : null,
            },
            create: {
                competitionId: safeCompetitionId,
                playerId: safePlayerId,
                medal,
                wins: Math.max(0, Number(result.wins) || 0),
                matches: Math.max(0, Number(result.matches) || 0),
                notes: result.notes ? result.notes : null,
            },
        });
    }

    revalidatePath(`/competitions/${safeCompetitionId}`);
    revalidatePath("/competitions");
    revalidatePath("/dashboard");
}

export async function deleteCompetitionResult(competitionId: string, playerId: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const safeCompetitionId = String(competitionId || "").trim();
    const safePlayerId = String(playerId || "").trim();

    if (!safeCompetitionId || !safePlayerId) return;

    await prisma.competitionResult.deleteMany({
        where: {
            competitionId: safeCompetitionId,
            playerId: safePlayerId,
        },
    });

    revalidatePath(`/competitions/${safeCompetitionId}`);
    revalidatePath("/competitions");
    revalidatePath("/dashboard");
}

export async function deleteCompetition(id: string) {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const safeId = String(id || "").trim();
    if (!safeId) return;

    await prisma.competition.delete({ where: { id: safeId } });

    revalidatePath("/competitions");
    revalidatePath("/dashboard");
}
