import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getTeamAttendanceStats, getPlayerAttendanceStats } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import { formatRate } from "@/lib/computations";
import { getSessionsInSemester } from "@/lib/computations";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage({
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
            <div className="dash">
                <div className="dash-inner">
                    <div className="page-header">
                        <h1 className="page-title">Team Dashboard</h1>
                        <p className="page-subtitle">No school years configured. Admin must create a school year first.</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = await getTeamAttendanceStats(selectedSemesterId);
    const playerStats = await getPlayerAttendanceStats(selectedSemesterId);
    const sessions = await getSessionsInSemester(selectedSemesterId);

    const { prisma } = await import("@/lib/db");
    const sessionIds = sessions.map((s) => s.id);
    const allRecords = await prisma.attendanceRecord.findMany({
        where: { sessionId: { in: sessionIds } },
        include: { session: true },
    });

    const attendanceTrend = sessions.map((session) => {
        const sessionRecords = allRecords.filter((r) => r.sessionId === session.id);
        const present = sessionRecords.filter((r) => r.status === "PRESENT").length;
        const total = sessionRecords.length;
        const rate = total > 0 ? present / total : 0;
        return {
            date: new Date(session.sessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            attendance: parseFloat((rate * 100).toFixed(1)),
        };
    });

    const qualifiedPlayers = playerStats.filter((p) => p.total >= 1);

    // Top 3 Unique Ratings
    const uniqueRatesDesc = Array.from(new Set(qualifiedPlayers.map(p => p.rate))).sort((a, b) => b - a);
    const top3Rates = uniqueRatesDesc.slice(0, 3);
    const topPlayers = qualifiedPlayers
        .filter(p => top3Rates.includes(p.rate))
        .sort((a, b) => b.rate - a.rate);

    // Lowest 3 Unique Ratings (excluding Top Players)
    const uniqueRatesAsc = [...uniqueRatesDesc].reverse();
    const bottom3Rates = uniqueRatesAsc.slice(0, 3);
    const bottomPlayers = qualifiedPlayers
        .filter(p => bottom3Rates.includes(p.rate) && !topPlayers.some(tp => tp.playerId === p.playerId))
        .sort((a, b) => a.rate - b.rate);

    const breakdown = {
        present: playerStats.reduce((sum, p) => sum + p.present, 0),
        late: playerStats.reduce((sum, p) => sum + p.late, 0),
        absent: playerStats.reduce((sum, p) => sum + p.absent, 0),
        excused: playerStats.reduce((sum, p) => sum + p.excused, 0),
    };

    return (
        <div className="dash">
            <div className="dash-inner">
                <div className="page-header">
                    <div className="flex-between">
                        <div>
                            <h1 className="page-title">Team Dashboard</h1>
                            <p className="page-subtitle">Overview of team performance and attendance</p>
                        </div>
                        <SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />
                    </div>
                </div>

                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-label">Team Attendance Rate</div>
                        <div className="kpi-value">{formatRate(stats.attendanceRate)}</div>
                        <div className="kpi-sub">Present / Total Records</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">Total Sessions</div>
                        <div className="kpi-value">{stats.totalSessions}</div>
                        <div className="kpi-sub">This school year</div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-label">Avg Attendance</div>
                        <div className="kpi-value">{stats.avgAttendancePerSession.toFixed(1)}</div>
                        <div className="kpi-sub">Players per session</div>
                    </div>
                </div>

                <DashboardCharts attendanceTrend={attendanceTrend} breakdown={breakdown} />

                <div className="grid-2" style={{ marginBottom: 28 }}>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Top Attendance Players</div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th className="text-right">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPlayers.length > 0 ? (
                                        topPlayers.map((player) => (
                                            <tr key={player.playerId}>
                                                <td>{player.fullName}</td>
                                                <td className="text-right">{formatRate(player.rate)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Lowest Attendance Players</div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th className="text-right">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bottomPlayers.length > 0 ? (
                                        bottomPlayers.map((player) => (
                                            <tr key={player.playerId}>
                                                <td>{player.fullName}</td>
                                                <td className="text-right">{formatRate(player.rate)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
