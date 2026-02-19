import { getPlayerById } from "@/app/actions/players";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getPlayerAttendanceStats, getPlayerCompetitionStats } from "@/lib/computations";
import { formatRate, formatWinRate } from "@/lib/computations";
import { getCompetitionsInSemester } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlayerProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ semesterId?: string }>;
}) {
    const { id } = await params;
    const { semesterId } = await searchParams;
    const player = await getPlayerById(id);
    if (!player) notFound();

    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;

    const attendanceStats = selectedSemesterId
        ? (await getPlayerAttendanceStats(selectedSemesterId)).find((s) => s.playerId === player.id)
        : null;

    const competitionStats = selectedSemesterId
        ? await getPlayerCompetitionStats(player.id, selectedSemesterId)
        : null;

    const competitions = selectedSemesterId ? await getCompetitionsInSemester(selectedSemesterId) : [];

    // All-time win rate from ALL competition results of this player (across all semesters)
    const allTimeWins = (player.competitionResults || []).reduce((sum, r) => sum + (r?.wins ?? 0), 0);
    const allTimeMatches = (player.competitionResults || []).reduce((sum, r) => sum + (r?.matches ?? 0), 0);
    const allTimeWinRate = allTimeMatches > 0 ? allTimeWins / allTimeMatches : 0;

    // Get player's results for competitions in this semester
    const competitionResults = competitions.map((comp) => {
        const result = player.competitionResults.find((r) => r.competitionId === comp.id);
        return {
            competition: comp,
            result,
        };
    });

    return (
        <div>
            <Link href="/reports" className="back-link">
                ← Back to Reports
            </Link>

            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">{player.fullName}</h1>
                        <p className="page-subtitle">
                            <span className={`badge ${player.isActive ? "badge-active" : "badge-inactive"}`}>
                                {player.isActive ? "Active" : "Inactive"}
                            </span>
                        </p>
                    </div>
                    {semesters.length > 0 && (
                        <SemesterSelector semesters={semesters} selectedId={selectedSemesterId || ""} />
                    )}
                </div>
            </div>

            {selectedSemesterId ? (
                <>
                    <div className="grid-2" style={{ marginBottom: 28 }}>
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Attendance</div>
                            </div>
                            {attendanceStats ? (
                                <div>
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <div className="stat-value">{formatRate(attendanceStats.rate)}</div>
                                            <div className="stat-label">Attendance Rate</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{attendanceStats.present}</div>
                                            <div className="stat-label">Present</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{attendanceStats.late}</div>
                                            <div className="stat-label">Late</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{attendanceStats.absent}</div>
                                            <div className="stat-label">Absent</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{attendanceStats.excused}</div>
                                            <div className="stat-label">Excused</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "24px" }}>
                                    <div className="text-muted">No attendance data for this semester</div>
                                </div>
                            )}
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Competition Results</div>
                            </div>
                            {competitionStats ? (
                                <div>
                                    <div className="stat-row">
                                        <div className="stat-item">
                                            <div className="stat-value">
                                                <span className="medal-gold">🥇{competitionStats.gold}</span>{" "}
                                                <span className="medal-silver">🥈{competitionStats.silver}</span>{" "}
                                                <span className="medal-bronze">🥉{competitionStats.bronze}</span>
                                            </div>
                                            <div className="stat-label">Medals</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{competitionStats.totalWins}</div>
                                            <div className="stat-label">Total Wins</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{competitionStats.totalMatches}</div>
                                            <div className="stat-label">Total Matches</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">
                                                {allTimeMatches > 0 ? formatWinRate(allTimeWinRate) : "—"}
                                            </div>
                                            <div className="stat-label">All-Time Win Rate</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "24px" }}>
                                    <div className="text-muted">No competition data for this semester</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {competitionResults.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Competition History</div>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Competition</th>
                                            <th>Date</th>
                                            <th className="text-right">Medal</th>
                                            <th className="text-right">Wins</th>
                                            <th className="text-right">Matches</th>
                                            <th className="text-right">Win Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {competitionResults.map(({ competition, result }) => (
                                            <tr key={competition.id}>
                                                <td>
                                                    <Link href={`/competitions/${competition.id}`}>
                                                        {competition.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                    {new Date(competition.competitionDate).toLocaleDateString()}
                                                </td>
                                                <td className="text-right">
                                                    {result ? (
                                                        <span className={`medal-${result.medal.toLowerCase()}`}>
                                                            {result.medal === "GOLD" && "🥇"}
                                                            {result.medal === "SILVER" && "🥈"}
                                                            {result.medal === "BRONZE" && "🥉"}
                                                            {result.medal === "NONE" && "—"}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td className="text-right">{result?.wins || "—"}</td>
                                                <td className="text-right">{result?.matches || "—"}</td>
                                                <td className="text-right">
                                                    {result && result.matches > 0
                                                        ? formatWinRate(result.wins / result.matches)
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="card">
                    <div className="empty-state" style={{ padding: "48px" }}>
                        <div className="empty-state-icon">📅</div>
                        <div className="empty-state-text">Select a semester to view statistics</div>
                    </div>
                </div>
            )}
        </div>
    );
}
