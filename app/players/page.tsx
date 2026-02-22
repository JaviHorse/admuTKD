import { getPlayers } from "@/app/actions/players";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getPlayerAttendanceStats } from "@/lib/computations";
import { formatRate, formatWinRate } from "@/lib/computations";
import Link from "next/link";
import PlayersSearch from "@/components/PlayersSearch";
import { prisma } from "@/lib/db";

type Medal = "GOLD" | "SILVER" | "BRONZE" | "NONE";

export default async function PlayersPage({
    searchParams,
}: {
    searchParams: Promise<{ semesterId?: string; search?: string; active?: string }>;
}) {
    const { semesterId, search, active } = await searchParams;
    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;
    const activeOnly = active !== "false";
    const searchQuery = search?.toLowerCase() || "";

    const players = await getPlayers(!activeOnly);

    const attendanceStats = selectedSemesterId ? await getPlayerAttendanceStats(selectedSemesterId) : [];

    const allTimeResults = await prisma.competitionResult.findMany({
        where: {
            playerId: { in: players.map((p) => p.id) },
        },
        select: {
            playerId: true,
            medal: true,
            wins: true,
            matches: true,
        },
    });

    const allTimeByPlayerId = new Map<
        string,
        { gold: number; silver: number; bronze: number; totalWins: number; totalMatches: number; winRate: number | null }
    >();

    for (const r of allTimeResults) {
        const medal = String(r.medal || "NONE").toUpperCase() as Medal;
        const wins = typeof r.wins === "number" ? r.wins : 0;
        const matches = typeof r.matches === "number" ? r.matches : 0;

        const cur =
            allTimeByPlayerId.get(r.playerId) || {
                gold: 0,
                silver: 0,
                bronze: 0,
                totalWins: 0,
                totalMatches: 0,
                winRate: null,
            };

        if (medal === "GOLD") cur.gold += 1;
        if (medal === "SILVER") cur.silver += 1;
        if (medal === "BRONZE") cur.bronze += 1;

        cur.totalWins += wins;
        cur.totalMatches += matches;
        cur.winRate = cur.totalMatches > 0 ? cur.totalWins / cur.totalMatches : null;

        allTimeByPlayerId.set(r.playerId, cur);
    }

    const playersWithStats = players.map((player) => {
        const attendance = attendanceStats.find((s) => s.playerId === player.id);
        const allTime = allTimeByPlayerId.get(player.id) || {
            gold: 0,
            silver: 0,
            bronze: 0,
            totalWins: 0,
            totalMatches: 0,
            winRate: null,
        };

        return {
            ...player,
            attendanceRate: attendance?.rate || 0,
            medals: {
                gold: allTime.gold,
                silver: allTime.silver,
                bronze: allTime.bronze,
            },
            winRate: allTime.winRate,
        };
    });

    const filteredPlayers = searchQuery
        ? playersWithStats.filter((p) => p.fullName.toLowerCase().includes(searchQuery))
        : playersWithStats;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Players</h1>
                <p className="page-subtitle">Team roster and player statistics (click on a player's name to see their individual stats)</p>
            </div>

            <PlayersSearch
                semesters={semesters}
                selectedSemesterId={selectedSemesterId || ""}
                initialSearch={searchQuery}
                activeOnly={activeOnly}
            />

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Player Name</th>
                            <th className="text-right">Attendance %</th>
                            <th className="text-right">Medals</th>
                            <th className="text-right">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player) => (
                                <tr key={player.id} className="clickable">
                                    <td>
                                        <Link href={`/players/${player.id}?semesterId=${selectedSemesterId || ""}`}>
                                            {player.fullName}
                                        </Link>
                                        {!player.isActive && (
                                            <span className="badge badge-inactive" style={{ marginLeft: 8 }}>
                                                Inactive
                                            </span>
                                        )}
                                    </td>

                                    <td className="text-right">
                                        {selectedSemesterId ? formatRate(player.attendanceRate) : "—"}
                                    </td>

                                    <td className="text-right">
                                        <span>
                                            <span className="medal-gold">🥇{player.medals.gold}</span>{" "}
                                            <span className="medal-silver">🥈{player.medals.silver}</span>{" "}
                                            <span className="medal-bronze">🥉{player.medals.bronze}</span>
                                        </span>
                                    </td>

                                    <td className="text-right">{formatWinRate(player.winRate)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="empty-state" style={{ padding: "48px" }}>
                                    <div className="empty-state-icon">🥋</div>
                                    <div className="empty-state-text">No players found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
