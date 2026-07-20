import Link from "next/link";
import { auth } from "@/auth";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getTeamAttendanceStats, getPlayerAttendanceStats, getCompetitionsInSemester, formatRate } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import UaapCountdown from "@/components/UaapCountdown";
import { getUaapDate, isTrainingCancelled } from "@/app/actions/settings";
import { getScheduledTrainingDay } from "@/lib/trainingSchedule";
import { prisma } from "@/lib/db";
import { getDashboardPosts } from "@/app/actions/dashboardPosts";
import DashboardPosts from "@/components/DashboardPosts";

function Icon({ children }: { children: React.ReactNode }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ semesterId?: string }> }) {
    const { semesterId } = await searchParams;
    const [semesters, activeSemester, userSession] = await Promise.all([getSemesters(), getActiveSemester(), auth()]);
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;
    const selectedSemester = semesters.find((semester) => semester.id === selectedSemesterId);
    const scheduledTraining = getScheduledTrainingDay();

    if (!selectedSemesterId) return <div className="dash"><div className="dash-inner"><div className="empty-state dashboard-empty"><div className="empty-state-icon">AY</div><h1 className="page-title">Set up your first school year</h1><p className="page-subtitle">Create a school year to start tracking training, attendance, and competition readiness.</p>{userSession?.user?.role === "ADMIN" && <Link href="/admin/semesters" className="btn btn-primary">Create school year</Link>}</div></div></div>;

    const [stats, playerStats, competitions, uaapDate, activePlayers, trainingCancelled, dashboardPosts] = await Promise.all([
        getTeamAttendanceStats(selectedSemesterId),
        getPlayerAttendanceStats(selectedSemesterId),
        getCompetitionsInSemester(selectedSemesterId),
        getUaapDate(),
        prisma.player.count({ where: { isActive: true } }),
        isTrainingCancelled(scheduledTraining.dateKey),
        getDashboardPosts(),
    ]);
    const scheduledSession = await prisma.session.findFirst({
        where: { sessionDate: { gte: scheduledTraining.start, lte: scheduledTraining.end } },
        orderBy: { sessionDate: "asc" },
        include: { coaches: { include: { coach: true } }, attendance: true },
    });
    const now = new Date();
    const upcomingCompetitions = competitions.filter((competition) => competition.competitionDate >= now).slice(0, 3);
    const qualifiedPlayers = playerStats.filter((player) => player.total >= 1);
    const readinessTarget = .75;
    const readyPlayers = qualifiedPlayers.filter((player) => player.rate >= readinessTarget).length;
    const readinessRate = qualifiedPlayers.length ? readyPlayers / qualifiedPlayers.length : 0;
    const needsAttention = qualifiedPlayers.filter((player) => player.rate < readinessTarget).sort((a, b) => a.rate - b.rate).slice(0, 5);
    const consistencyLeaders = [...qualifiedPlayers].sort((a, b) => b.rate - a.rate || b.total - a.total).slice(0, 5);
    const dashboardAttendanceRate = stats.attendanceRate;
    const isAdmin = userSession?.user?.role === "ADMIN";
    const sessionActionHref = trainingCancelled ? "/admin/settings" : scheduledSession ? `/admin/sessions/${scheduledSession.id}/attendance` : "/admin/sessions/new";
    const sessionActionLabel = trainingCancelled ? "Manage cancellation" : scheduledSession ? "Mark attendance" : "Create session";

    return <div className="dash"><div className="dash-inner">
        <section className="dashboard-hero compact-dashboard-hero"><div className="dashboard-hero-copy"><span className="eyebrow">Performance command center</span><h1>Team Overview</h1><p>{new Date().toLocaleDateString("en-PH", { timeZone: "Asia/Manila", weekday: "long", month: "long", day: "numeric" })} · {selectedSemester?.name || "Current school year"}</p></div><div className="dashboard-header-tools"><SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />{isAdmin && <div className="quick-actions"><Link href={sessionActionHref} className="btn btn-gold"><Icon><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></Icon>{sessionActionLabel}</Link><Link href="/admin/players" className="btn btn-secondary"><Icon><path d="M12 5v14M5 12h14"/></Icon>Add player</Link></div>}</div></section>

        <section className="dashboard-priority-grid">
            <div className="priority-card priority-card-blue"><div className="priority-icon"><Icon><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></Icon></div><div><span>Team attendance</span><strong>{formatRate(dashboardAttendanceRate)}</strong><small>Across {stats.totalSessions} training sessions</small></div><div className="mini-progress"><i style={{ width: `${Math.min(dashboardAttendanceRate * 100, 100)}%` }}/></div></div>
            <div className={`priority-card ${trainingCancelled ? "priority-card-cancelled" : ""}`}><div className="priority-icon"><Icon><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Icon></div><div><span>Next session</span><strong className="priority-text">{trainingCancelled ? "Training cancelled" : scheduledTraining.date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", weekday: "short", month: "short", day: "numeric" })}</strong><small>{trainingCancelled ? scheduledTraining.date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", weekday: "long", month: "long", day: "numeric" }) : scheduledSession ? `${scheduledSession.sessionDate.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" })} · ${scheduledSession.location || "Location TBA"}` : "Regular Monday–Saturday team training"}</small></div></div>
            <div className="priority-card priority-card-gold"><div className="priority-icon"><Icon><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8"/></Icon></div><div><span>Competition readiness</span><strong>{formatRate(readinessRate)}</strong><small>{readyPlayers} of {qualifiedPlayers.length} tracked athletes at 75%+ attendance</small></div><div className="mini-progress"><i style={{ width: `${readinessRate * 100}%` }}/></div></div>
            <div className="priority-card"><div className="priority-icon"><Icon><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></Icon></div><div><span>Active athletes</span><strong>{activePlayers}</strong><small>{readyPlayers} meeting the 75% attendance target</small></div></div>
        </section>

        <div className="dashboard-main-grid"><div className="dashboard-main-column"><DashboardPosts posts={dashboardPosts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() }))} isAdmin={isAdmin} adminName={userSession?.user?.name} adminImage={userSession?.user?.profileImageUrl}/><UaapCountdown uaapDate={uaapDate}/></div><aside className="dashboard-rail">
            <section className="card rail-card"><div className="card-header"><div><span className="eyebrow">Coming up</span><h2 className="card-title">Competition calendar</h2></div><Link href="/competitions" className="text-link">View all</Link></div>{upcomingCompetitions.length ? <div className="event-list">{upcomingCompetitions.map((competition) => <Link href={`/competitions/${competition.id}`} className="event-item" key={competition.id}><div className="event-date"><b>{competition.competitionDate.toLocaleDateString("en-PH", { day: "2-digit" })}</b><span>{competition.competitionDate.toLocaleDateString("en-PH", { month: "short" })}</span></div><div><strong>{competition.name}</strong><small>{competition.location || "Venue TBA"}</small></div><span className="event-arrow">→</span></Link>)}</div> : <div className="compact-empty"><span>🏆</span><strong>No upcoming competitions</strong><p>{isAdmin ? "Add an event to start tracking team readiness." : "No upcoming competitions are scheduled."}</p>{isAdmin && <Link href="/admin/competitions/new" className="text-link">Create competition →</Link>}</div>}</section>
            <section className="card rail-card"><div className="card-header"><div><span className="eyebrow">Attendance pulse</span><h2 className="card-title">Athletes to review</h2></div><span className="status-dot">{needsAttention.length}</span></div>{needsAttention.length ? <div className="player-pulse-list">{needsAttention.map((player) => <Link href={`/players/${player.playerId}`} key={player.playerId}><span className="player-initial">{player.fullName.charAt(0)}</span><div><strong>{player.fullName}</strong><small>{player.absent + player.excused} missed sessions</small></div><b>{formatRate(player.rate)}</b></Link>)}</div> : <div className="compact-empty"><strong>Everyone is on track</strong><p>No players are below the 75% attendance target.</p></div>}</section>
            <section className="card rail-card"><div className="card-header"><div><span className="eyebrow">Consistency</span><h2 className="card-title">Training leaders</h2></div></div><div className="leader-list">{consistencyLeaders.length ? consistencyLeaders.map((player, index) => <Link href={`/players/${player.playerId}`} key={player.playerId}><span>{String(index + 1).padStart(2, "0")}</span><strong>{player.fullName}</strong><b>{formatRate(player.rate)}</b></Link>) : <div className="compact-empty"><p>Attendance leaders will appear after the first session.</p></div>}</div></section>
        </aside></div>
    </div></div>;
}
