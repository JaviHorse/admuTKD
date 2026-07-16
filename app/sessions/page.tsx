import { getSessions } from "@/app/actions/sessions";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { calcTurnout } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ semesterId?: string; page?: string }> }) {
    const { semesterId, page: pageParam } = await searchParams;
    const [semesters, activeSemester, activePlayers] = await Promise.all([getSemesters(), getActiveSemester(), prisma.player.count({ where: { isActive: true } })]);
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;
    const sessions = selectedSemesterId ? await getSessions(selectedSemesterId) : await getSessions();
    const now = new Date();
    const sessionRows = sessions.map((session) => ({ ...session, turnout: calcTurnout(session.attendance || []), attended: (session.attendance || []).filter((record) => record.status === "PRESENT" || record.status === "LATE").length }));
    const completedRows = sessionRows.filter((session) => new Date(session.sessionDate) <= now);
    const averageTurnout = completedRows.length ? completedRows.reduce((sum, session) => sum + session.turnout, 0) / completedRows.length : 0;
    const highestTurnout = completedRows.length ? Math.max(...completedRows.map((session) => session.turnout)) : 0;
    const lowTurnout = completedRows.filter((session) => session.turnout < .6).length;
    const upcoming = [...sessionRows].filter((session) => new Date(session.sessionDate) > now).sort((a, b) => +new Date(a.sessionDate) - +new Date(b.sessionDate))[0];
    const pageSize = 15;
    const totalPages = Math.max(1, Math.ceil(sessionRows.length / pageSize));
    const currentPage = Math.min(totalPages, Math.max(1, Number(pageParam) || 1));
    const visibleSessions = sessionRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pageHref = (page: number) => `/sessions?${new URLSearchParams({ ...(selectedSemesterId ? { semesterId: selectedSemesterId } : {}), page: String(page) })}`;

    return <div>
        <header className="compact-page-header"><div><span className="eyebrow">Team operations</span><h1>Training</h1><p><strong>{sessions.length} sessions</strong> · {semesters.find((item) => item.id === selectedSemesterId)?.name || "All school years"}</p></div><div className="page-header-actions">{semesters.length > 0 && <SemesterSelector semesters={semesters} selectedId={selectedSemesterId || ""} />}</div></header>
        <section className="metric-grid">
            <div className="metric-card accent"><span className="metric-label">Sessions this year</span><strong className="metric-value">{sessions.length}</strong><span className="metric-note">training activities recorded</span></div>
            <div className="metric-card"><span className="metric-label">Average turnout</span><strong className="metric-value">{Math.round(averageTurnout * 100)}%</strong><span className="metric-note">across completed sessions</span></div>
            <div className="metric-card"><span className="metric-label">Highest turnout</span><strong className="metric-value">{Math.round(highestTurnout * 100)}%</strong><span className="metric-note">best recorded attendance</span></div>
            <div className="metric-card"><span className="metric-label">Needs review</span><strong className="metric-value">{lowTurnout}</strong><span className="metric-note">sessions below 60% turnout</span></div>
        </section>
        {upcoming && <Link href={`/sessions/${upcoming.id}`} className="surface" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", marginBottom: 15 }}><div><span className="eyebrow">Next team activity</span><strong>{new Date(upcoming.sessionDate).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })} · {upcoming.location || "Location TBA"}</strong></div><span className="status-chip status-upcoming">Upcoming</span></Link>}
        <section className="surface"><div className="surface-header"><div><h2 className="surface-title">Session log</h2><p className="surface-subtitle">Showing {visibleSessions.length} of {sessionRows.length} records</p></div><div className="page-header-actions"><span className="badge badge-view-only">List view</span><span className="badge">Calendar</span></div></div>
            <div className="table-wrap" style={{ border: 0, boxShadow: "none" }}><table><thead><tr><th>Date</th><th>Type</th><th>Location</th><th>Coach coverage</th><th>Turnout</th><th>Status</th><th aria-label="Open" /></tr></thead><tbody>
                {visibleSessions.length ? visibleSessions.map((session) => {
                    const isUpcoming = new Date(session.sessionDate) > now;
                    const missingRecord = !isUpcoming && session.attendance.length === 0;
                    return <tr key={session.id}><td><Link className="table-link" href={`/sessions/${session.id}`}><span className="avatar-initial">{new Date(session.sessionDate).toLocaleDateString("en-PH", { day: "2-digit" })}</span><span>{new Date(session.sessionDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}<span className="record-sub">{new Date(session.sessionDate).toLocaleDateString("en-PH", { weekday: "long" })}</span></span></Link></td><td><span className="status-chip status-upcoming">{session.sessionType}</span></td><td>{session.location || "—"}</td><td>{session.coaches.length ? `${session.coaches.length} coach${session.coaches.length === 1 ? "" : "es"}` : <span className="status-chip status-warning">Unassigned</span>}</td><td className="attendance-cell"><div><span>{session.attended}/{activePlayers || session.attendance.length}</span><b>{Math.round(session.turnout * 100)}%</b></div><div className="progress-track"><i style={{ width: `${Math.min(session.turnout * 100, 100)}%`, background: missingRecord ? "#e0a31b" : undefined }} /></div></td><td>{isUpcoming ? <span className="status-chip status-upcoming">Upcoming</span> : missingRecord ? <span className="status-chip status-warning">Attendance missing</span> : <span className="status-chip status-completed">Completed</span>}</td><td><Link className="row-chevron" href={`/sessions/${session.id}`} aria-label="Open session">›</Link></td></tr>;
                }) : <tr><td colSpan={7} className="empty-state" style={{ padding: 48 }}><div className="empty-state-icon">S</div><div className="empty-state-text">No training sessions found</div></td></tr>}
            </tbody></table></div>
            {totalPages > 1 && <div className="surface-header" style={{ borderTop: "1px solid #e8edf4", borderBottom: 0 }}><span className="surface-subtitle">Page {currentPage} of {totalPages}</span><div className="page-header-actions">{currentPage > 1 && <Link className="btn btn-ghost btn-sm" href={pageHref(currentPage - 1)}>Previous</Link>}{currentPage < totalPages && <Link className="btn btn-primary btn-sm" href={pageHref(currentPage + 1)}>Next</Link>}</div></div>}
        </section>
    </div>;
}
