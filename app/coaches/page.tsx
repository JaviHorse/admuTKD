import { getCoaches } from "@/app/actions/coaches";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function CoachesPage() {
    const coaches = await getCoaches();
    const sessionLinks = await prisma.sessionCoach.findMany({ include: { session: { include: { attendance: true } } } });
    const totalSessions = new Set(sessionLinks.map((link) => link.sessionId)).size;
    const uncovered = await prisma.session.count({ where: { coaches: { none: {} } } });
    const activeCoaches = coaches.filter((coach) => coach.isActive).length;
    const averageCoaches = totalSessions ? sessionLinks.length / totalSessions : 0;

    return <div>
        <header className="compact-page-header"><div><span className="eyebrow">Coaching staff</span><h1>Coaches</h1><p><strong>{activeCoaches} active coaches</strong> · Team coverage and participation</p></div></header>
        <section className="metric-grid">
            <div className="metric-card accent"><span className="metric-label">Active coaches</span><strong className="metric-value">{activeCoaches}</strong><span className="metric-note">of {coaches.length} profiles</span></div>
            <div className="metric-card"><span className="metric-label">Covered sessions</span><strong className="metric-value">{totalSessions}</strong><span className="metric-note">with a coach assigned</span></div>
            <div className="metric-card"><span className="metric-label">Average coverage</span><strong className="metric-value">{averageCoaches.toFixed(1)}</strong><span className="metric-note">coaches per covered session</span></div>
            <div className="metric-card"><span className="metric-label">Needs assignment</span><strong className="metric-value">{uncovered}</strong><span className="metric-note">sessions without a coach</span></div>
        </section>
        {coaches.length ? <section className="coach-directory">{coaches.map((coach) => {
            const links = sessionLinks.filter((link) => link.coachId === coach.id);
            const rates = links.map((link) => link.session.attendance.length ? link.session.attendance.filter((record) => record.status === "PRESENT" || record.status === "LATE").length / link.session.attendance.length : 0);
            const averageTurnout = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
            const initials = coach.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2);
            return <Link href={`/coaches/${coach.id}`} className="coach-card surface" key={coach.id}><div className="coach-card-head"><div className="coach-avatar">{initials}</div><div><h2>{coach.fullName}</h2><div className="coach-card-role">{coach.roleTitle || "Coaching staff"}</div></div></div><div className="coach-card-stats"><div><b>{links.length}</b><span>Sessions attended</span></div><div><b>{Math.round(averageTurnout * 100)}%</b><span>Turnout when present</span></div></div><div className="coach-card-footer"><span className={`status-chip ${coach.isActive ? "status-active" : "status-inactive"}`}>{coach.isActive ? "Active" : "Inactive"}</span><span>Open profile ›</span></div></Link>;
        })}</section> : <div className="empty-state surface"><div className="empty-state-icon">C</div><div className="empty-state-text">No coaches found</div></div>}
    </div>;
}
