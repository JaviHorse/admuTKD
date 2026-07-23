import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getTeamAttendanceStats, getPlayerAttendanceStats, getPlayerCompetitionStats, formatRate, formatWinRate } from "@/lib/computations";
import { getPlayers } from "@/app/actions/players";
import SemesterSelector from "@/components/SemesterSelector";
import ReportAttendanceChart from "@/components/ReportAttendanceChart";
import Link from "next/link";
import AttendanceExport from "@/components/AttendanceExport";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ semesterId?: string }> }) {
    const { semesterId } = await searchParams;
    const [semesters, activeSemester] = await Promise.all([getSemesters(), getActiveSemester()]);
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;
    if (!selectedSemesterId) return <div className="empty-state surface"><div className="empty-state-icon">R</div><div className="empty-state-text">No school years configured</div></div>;

    const [teamStats, attendanceStats, players] = await Promise.all([getTeamAttendanceStats(selectedSemesterId), getPlayerAttendanceStats(selectedSemesterId), getPlayers(true)]);
    const rows = await Promise.all(players.map(async (player) => ({ ...player, attendance: attendanceStats.find((item) => item.playerId === player.id), competition: await getPlayerCompetitionStats(player.id, selectedSemesterId) })));
    const tracked = rows.filter((player) => (player.attendance?.total || 0) > 0);
    const belowTarget = tracked.filter((player) => (player.attendance?.rate || 0) < .75);
    const perfectAttendance = tracked.filter((player) => player.attendance?.rate === 1);
    const totals = rows.reduce((summary, player) => ({ gold: summary.gold + player.competition.gold, silver: summary.silver + player.competition.silver, bronze: summary.bronze + player.competition.bronze, wins: summary.wins + player.competition.totalWins, matches: summary.matches + player.competition.totalMatches }), { gold: 0, silver: 0, bronze: 0, wins: 0, matches: 0 });
    const chartData = tracked.sort((a, b) => (b.attendance?.rate || 0) - (a.attendance?.rate || 0)).map((player) => ({ name: player.fullName, rate: Number(((player.attendance?.rate || 0) * 100).toFixed(1)) }));

    return <div>
        <header className="compact-page-header"><div><span className="eyebrow">Analytics workspace</span><h1>Reports</h1><p><strong>{semesters.find((item) => item.id === selectedSemesterId)?.name}</strong> · Attendance and competition performance</p></div><div className="page-header-actions"><SemesterSelector semesters={semesters} selectedId={selectedSemesterId} /></div></header>
        <AttendanceExport schoolYears={semesters.map(({ id, name }) => ({ id, name }))} initialSchoolYearId={selectedSemesterId} />
        <section className="metric-grid">
            <div className="metric-card accent"><span className="metric-label">Team attendance</span><strong className="metric-value">{formatRate(teamStats.attendanceRate)}</strong><span className="metric-note">75% team target</span></div>
            <div className="metric-card"><span className="metric-label">Training sessions</span><strong className="metric-value">{teamStats.totalSessions}</strong><span className="metric-note">in selected school year</span></div>
            <div className="metric-card"><span className="metric-label">Average turnout</span><strong className="metric-value">{teamStats.avgAttendancePerSession.toFixed(1)}</strong><span className="metric-note">athletes per session</span></div>
            <div className="metric-card"><span className="metric-label">Below target</span><strong className="metric-value">{belowTarget.length}</strong><span className="metric-note">athletes under 75%</span></div>
        </section>
        <div className="report-layout">
            <section className="surface"><div className="surface-header"><div><h2 className="surface-title">Attendance distribution</h2><p className="surface-subtitle">All tracked athletes, sorted by attendance rate</p></div><span className="status-chip status-warning">75% target</span></div><div className="report-chart" style={{ height: Math.max(330, chartData.length * 28) }}><ReportAttendanceChart data={chartData} /></div></section>
            <aside className="insight-panel"><span className="eyebrow" style={{ color: "#ffd569" }}>Calculated summary</span><h2>Key insights</h2><div className="insight-list"><div className="insight-item"><b>1</b><span>{belowTarget.length} athlete{belowTarget.length === 1 ? " is" : "s are"} below the configured attendance target.</span></div><div className="insight-item"><b>2</b><span>{perfectAttendance.length} athlete{perfectAttendance.length === 1 ? " has" : "s have"} perfect recorded attendance.</span></div><div className="insight-item"><b>3</b><span>The team earned {totals.gold + totals.silver + totals.bronze} medals: {totals.gold} gold, {totals.silver} silver, and {totals.bronze} bronze.</span></div><div className="insight-item"><b>4</b><span>Recorded match win rate is {totals.matches ? Math.round(totals.wins / totals.matches * 100) : 0}% across {totals.matches} matches.</span></div></div></aside>
        </div>
        <section className="metric-grid" style={{ marginTop: 18 }}><div className="metric-card"><span className="metric-label">Total medals</span><strong className="metric-value">{totals.gold + totals.silver + totals.bronze}</strong><span className="metric-note">🥇 {totals.gold} · 🥈 {totals.silver} · 🥉 {totals.bronze}</span></div><div className="metric-card"><span className="metric-label">Match win rate</span><strong className="metric-value">{totals.matches ? Math.round(totals.wins / totals.matches * 100) : 0}%</strong><span className="metric-note">{totals.wins} wins · {totals.matches} matches</span></div></section>
        <details className="report-table-toggle surface"><summary>Detailed athlete report</summary><div className="table-wrap" style={{ border: 0, boxShadow: "none" }}><table><thead><tr><th>Athlete</th><th>Attendance</th><th>Medals</th><th>Record</th><th>Win rate</th><th /></tr></thead><tbody>{rows.map((player) => <tr key={player.id}><td><Link className="table-link" href={`/players/${player.id}?semesterId=${selectedSemesterId}`}><span className="avatar-initial">{player.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>{player.fullName}</Link></td><td>{formatRate(player.attendance?.rate || 0)}</td><td><span className="medal-cluster"><span>🥇 {player.competition.gold}</span><span>🥈 {player.competition.silver}</span><span>🥉 {player.competition.bronze}</span></span></td><td>{player.competition.totalWins}–{Math.max(0, player.competition.totalMatches - player.competition.totalWins)}</td><td>{formatWinRate(player.competition.winRate)}</td><td><Link className="row-chevron" href={`/players/${player.id}?semesterId=${selectedSemesterId}`}>›</Link></td></tr>)}</tbody></table></div></details>
    </div>;
}
