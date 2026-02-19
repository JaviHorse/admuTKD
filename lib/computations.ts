import { prisma } from "@/lib/db";

export interface SemesterStats {
    attendanceRate: number;
    totalSessions: number;
    avgAttendancePerSession: number;
}

export interface PlayerAttendanceStat {
    playerId: string;
    fullName: string;
    present: number;
    late: number;
    absent: number;
    excused: number;
    total: number;
    rate: number;
}

export interface PlayerCompetitionStat {
    gold: number;
    silver: number;
    bronze: number;
    none: number;
    totalWins: number;
    totalMatches: number;
    winRate: number | null;
}

export interface AttendanceTrendPoint {
    date: string;
    attendance: number;
}

export interface AttendanceBreakdown {
    present: number;
    late: number;
    absent: number;
    excused: number;
    date: Date | null;
}

export async function getSessionsInSemester(semesterId: string) {
    const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
    if (!semester) return [];
    return prisma.session.findMany({
        where: {
            sessionDate: {
                gte: semester.startDate,
                lte: semester.endDate,
            },
        },
        orderBy: { sessionDate: "asc" },
    });
}

export async function getCompetitionsInSemester(semesterId: string) {
    const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
    if (!semester) return [];
    return prisma.competition.findMany({
        where: {
            competitionDate: {
                gte: semester.startDate,
                lte: semester.endDate,
            },
        },
        include: {
            results: true,
        },
        orderBy: { competitionDate: "asc" },
    });
}

export async function getTeamAttendanceStats(semesterId: string): Promise<SemesterStats> {
    const sessions = await getSessionsInSemester(semesterId);
    if (sessions.length === 0) {
        return { attendanceRate: 0, totalSessions: 0, avgAttendancePerSession: 0 };
    }

    const sessionIds = sessions.map((s) => s.id);
    const records = await prisma.attendanceRecord.findMany({
        where: { sessionId: { in: sessionIds } },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const attendanceRate = total > 0 ? present / total : 0;

    const presentPerSession = sessions.map((s) => {
        const sessionRecords = records.filter((r) => r.sessionId === s.id);
        return sessionRecords.filter((r) => r.status === "PRESENT").length;
    });

    const avgAttendancePerSession =
        sessions.length > 0 ? presentPerSession.reduce((a, b) => a + b, 0) / sessions.length : 0;

    return {
        attendanceRate,
        totalSessions: sessions.length,
        avgAttendancePerSession,
    };
}

export async function getPlayerAttendanceStats(semesterId: string): Promise<PlayerAttendanceStat[]> {
    const sessions = await getSessionsInSemester(semesterId);
    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);
    const records = await prisma.attendanceRecord.findMany({
        where: { sessionId: { in: sessionIds } },
        include: { player: true },
    });

    const playerMap = new Map<string, PlayerAttendanceStat>();

    for (const record of records) {
        if (!playerMap.has(record.playerId)) {
            playerMap.set(record.playerId, {
                playerId: record.playerId,
                fullName: record.player.fullName,
                present: 0,
                late: 0,
                absent: 0,
                excused: 0,
                total: 0,
                rate: 0,
            });
        }

        const stat = playerMap.get(record.playerId)!;
        stat.total++;

        if (record.status === "PRESENT") stat.present++;
        else if (record.status === "LATE") stat.late++;
        else if (record.status === "ABSENT") stat.absent++;
        else if (record.status === "EXCUSED") stat.excused++;
    }

    for (const stat of playerMap.values()) {
        stat.rate = stat.total > 0 ? stat.present / stat.total : 0;
    }

    return Array.from(playerMap.values());
}

export async function getPlayerCompetitionStats(playerId: string, semesterId: string): Promise<PlayerCompetitionStat> {
    const competitions = await getCompetitionsInSemester(semesterId);
    const competitionIds = competitions.map((c) => c.id);

    if (competitionIds.length === 0) {
        return { gold: 0, silver: 0, bronze: 0, none: 0, totalWins: 0, totalMatches: 0, winRate: null };
    }

    const results = await prisma.competitionResult.findMany({
        where: {
            playerId,
            competitionId: { in: competitionIds },
        },
    });

    const gold = results.filter((r) => r.medal === "GOLD").length;
    const silver = results.filter((r) => r.medal === "SILVER").length;
    const bronze = results.filter((r) => r.medal === "BRONZE").length;
    const none = results.filter((r) => r.medal === "NONE").length;

    const totalWins = results.reduce((sum, r) => sum + (r.wins || 0), 0);
    const totalMatches = results.reduce((sum, r) => sum + (r.matches || 0), 0);
    const winRate = totalMatches > 0 ? totalWins / totalMatches : null;

    return { gold, silver, bronze, none, totalWins, totalMatches, winRate };
}

export async function getAttendanceTrend(semesterId: string): Promise<AttendanceTrendPoint[]> {
    const sessions = await getSessionsInSemester(semesterId);
    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);
    const records = await prisma.attendanceRecord.findMany({
        where: { sessionId: { in: sessionIds } },
        select: { sessionId: true, status: true },
    });

    const bySession = new Map<string, { total: number; present: number }>();
    for (const s of sessions) {
        bySession.set(s.id, { total: 0, present: 0 });
    }

    for (const r of records) {
        const agg = bySession.get(r.sessionId);
        if (!agg) continue;
        agg.total++;
        if (r.status === "PRESENT") agg.present++;
    }

    return sessions.map((s) => {
        const agg = bySession.get(s.id) || { total: 0, present: 0 };
        const rate = agg.total > 0 ? agg.present / agg.total : 0;
        return {
            date: s.sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            attendance: Number((rate * 100).toFixed(1)),
        };
    });
}

export async function getMostRecentSessionBreakdown(semesterId: string): Promise<AttendanceBreakdown> {
    const sessions = await getSessionsInSemester(semesterId);
    if (sessions.length === 0) {
        return { present: 0, late: 0, absent: 0, excused: 0, date: null };
    }

    const latest = sessions[sessions.length - 1];

    const records = await prisma.attendanceRecord.findMany({
        where: { sessionId: latest.id },
        select: { status: true },
    });

    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;

    return { present, late, absent, excused, date: latest.sessionDate };
}

export function calcTurnout(records: { status: string }[]): number {
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === "PRESENT").length;
    return present / records.length;
}

export function formatWinRate(winRate: number | null): string {
    if (winRate === null) return "—";
    return `${(winRate * 100).toFixed(1)}%`;
}

export function formatRate(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
}
