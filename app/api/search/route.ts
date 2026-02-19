import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        // SQLite doesn't support case-insensitive mode, so we'll filter in memory
        const [allPlayers, allCoaches, allSessions, allCompetitions] = await Promise.all([
            prisma.player.findMany({ take: 100 }),
            prisma.coach.findMany({ take: 100 }),
            prisma.session.findMany({ take: 100, orderBy: { sessionDate: "desc" } }),
            prisma.competition.findMany({ take: 100, orderBy: { competitionDate: "desc" } }),
        ]);

        const players = allPlayers
            .filter((p) => p.fullName.toLowerCase().includes(query))
            .slice(0, 5);
        const coaches = allCoaches
            .filter((c) => c.fullName.toLowerCase().includes(query))
            .slice(0, 5);
        const sessions = allSessions
            .filter((s) => 
                s.sessionType?.toLowerCase().includes(query) ||
                s.location?.toLowerCase().includes(query)
            )
            .slice(0, 5);
        const competitions = allCompetitions
            .filter((c) => c.name.toLowerCase().includes(query))
            .slice(0, 5);

        const results = [
            ...players.map((p) => ({
                type: "player" as const,
                id: p.id,
                name: p.fullName,
                subtitle: "Player",
            })),
            ...coaches.map((c) => ({
                type: "coach" as const,
                id: c.id,
                name: c.fullName,
                subtitle: c.roleTitle || "Coach",
            })),
            ...sessions.map((s) => ({
                type: "session" as const,
                id: s.id,
                name: `${s.sessionType} - ${new Date(s.sessionDate).toLocaleDateString()}`,
                subtitle: s.location || undefined,
            })),
            ...competitions.map((c) => ({
                type: "competition" as const,
                id: c.id,
                name: c.name,
                subtitle: new Date(c.competitionDate).toLocaleDateString(),
            })),
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}

