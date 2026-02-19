import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getTeamAttendanceStats, getPlayerAttendanceStats } from "@/lib/computations";
import { getPlayers } from "@/app/actions/players";
import { getPlayerCompetitionStats } from "@/lib/computations";
import { formatRate, formatWinRate } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ semesterId?: string }>;
}) {
    const { semesterId } = await searchParams;
    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;

    if (!selectedSemesterId) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">No school years configured.</p>
                </div>
            </div>
        );
    }

    const teamStats = await getTeamAttendanceStats(selectedSemesterId);
    const playerAttendanceStats = await getPlayerAttendanceStats(selectedSemesterId);
    const players = await getPlayers(true);

    // Get competition stats for all players
    const playersWithStats = await Promise.all(
        players.map(async (player) => {
            const attendance = playerAttendanceStats.find((s) => s.playerId === player.id);
            const competition = await getPlayerCompetitionStats(player.id, selectedSemesterId);
            return {
                ...player,
                attendance,
                competition,
            };
        })
    );

    // Top 3 Unique Ratings
    const qualifiedPlayers = playersWithStats.filter((p) => (p.attendance?.total || 0) >= 1);
    const uniqueRatesDesc = Array.from(new Set(qualifiedPlayers.map(p => p.attendance?.rate || 0))).sort((a, b) => b - a);
    const top3Rates = uniqueRatesDesc.slice(0, 3);
    const topAttendance = qualifiedPlayers
        .filter(p => top3Rates.includes(p.attendance?.rate || 0))
        .sort((a, b) => (b.attendance?.rate || 0) - (a.attendance?.rate || 0));

    // Lowest 3 Unique Ratings (excluding Top Players)
    const uniqueRatesAsc = [...uniqueRatesDesc].reverse();
    const bottom3Rates = uniqueRatesAsc.slice(0, 3);
    const bottomAttendance = qualifiedPlayers
        .filter(p => bottom3Rates.includes(p.attendance?.rate || 0) && !topAttendance.some(tp => tp.id === p.id))
        .sort((a, b) => (a.attendance?.rate || 0) - (b.attendance?.rate || 0));

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Reports</h1>
                        <p className="page-subtitle">School year summary and analytics</p>
                    </div>
                    <SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />
                </div>
            </div>

            <div className="section">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Attendance Summary</div>
                    </div>
                    <div className="kpi-grid" style={{ marginBottom: 24 }}>
                        <div className="kpi-card">
                            <div className="kpi-label">Team Attendance Rate</div>
                            <div className="kpi-value">{formatRate(teamStats.attendanceRate)}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Total Sessions</div>
                            <div className="kpi-value">{teamStats.totalSessions}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-label">Avg Attendance</div>
                            <div className="kpi-value">{teamStats.avgAttendancePerSession.toFixed(1)}</div>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div>
                            <div className="card-title" style={{ marginBottom: 12 }}>Top Attendance Players</div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th className="text-right">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topAttendance.map((player) => (
                                            <tr key={player.id}>
                                                <td>
                                                    <Link href={`/players/${player.id}?semesterId=${selectedSemesterId}`} className="text-primary hover:underline">
                                                        {player.fullName}
                                                    </Link>
                                                </td>
                                                <td className="text-right">
                                                    {formatRate(player.attendance?.rate || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <div className="card-title" style={{ marginBottom: 12 }}>Lowest Attendance Players</div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th className="text-right">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bottomAttendance.map((player) => (
                                            <tr key={player.id}>
                                                <td>
                                                    <Link href={`/players/${player.id}?semesterId=${selectedSemesterId}`} className="text-primary hover:underline">
                                                        {player.fullName}
                                                    </Link>
                                                </td>
                                                <td className="text-right">
                                                    {formatRate(player.attendance?.rate || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Results Summary: Click on a player to see their individual stats</div>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th className="text-right">🥇</th>
                                    <th className="text-right">🥈</th>
                                    <th className="text-right">🥉</th>
                                    <th className="text-right">Total Medals</th>
                                    <th className="text-right">Wins</th>
                                    <th className="text-right">Matches</th>
                                    <th className="text-right">Win Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playersWithStats.map((player) => (
                                    <tr key={player.id}>
                                        <td>
                                            <Link href={`/players/${player.id}?semesterId=${selectedSemesterId}`} className="text-primary hover:underline">
                                                {player.fullName}
                                            </Link>
                                        </td>
                                        <td className="text-right">
                                            <span className="medal-gold">{player.competition.gold}</span>
                                        </td>
                                        <td className="text-right">
                                            <span className="medal-silver">{player.competition.silver}</span>
                                        </td>
                                        <td className="text-right">
                                            <span className="medal-bronze">{player.competition.bronze}</span>
                                        </td>
                                        <td className="text-right">
                                            {player.competition.gold + player.competition.silver + player.competition.bronze}
                                        </td>
                                        <td className="text-right">{player.competition.totalWins}</td>
                                        <td className="text-right">{player.competition.totalMatches}</td>
                                        <td className="text-right">{formatWinRate(player.competition.winRate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

