import { getCompetitions } from "@/app/actions/competitions";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";

export default async function CompetitionsPage({ searchParams }: { searchParams: Promise<{ semesterId?: string }> }) {
    const { semesterId } = await searchParams;
    const [semesters, activeSemester] = await Promise.all([getSemesters(), getActiveSemester()]);
    const selectedSemesterId = String(semesterId || activeSemester?.id || semesters[0]?.id || "").trim();
    const competitions = selectedSemesterId ? await getCompetitions(selectedSemesterId) : await getCompetitions();
    const stats = competitions.reduce((summary, competition) => {
        competition.results.forEach((result) => {
            if (result.medal === "GOLD") summary.gold++;
            if (result.medal === "SILVER") summary.silver++;
            if (result.medal === "BRONZE") summary.bronze++;
            summary.wins += result.wins || 0;
            summary.matches += result.matches || 0;
        });
        return summary;
    }, { gold: 0, silver: 0, bronze: 0, wins: 0, matches: 0 });
    const bestCompetition = [...competitions].sort((a, b) => b.results.filter((result) => result.medal !== "NONE").length - a.results.filter((result) => result.medal !== "NONE").length)[0];
    const now = new Date();

    return <div>
        <header className="compact-page-header"><div><span className="eyebrow">Season campaign</span><h1>Competitions</h1><p><strong>{competitions.length} events</strong> · Results and team performance</p></div><div className="page-header-actions">{semesters.length > 0 && <SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />}</div></header>
        <section className="metric-grid">
            <div className="metric-card accent"><span className="metric-label">Competitions joined</span><strong className="metric-value">{competitions.length}</strong><span className="metric-note">this school year</span></div>
            <div className="metric-card"><span className="metric-label">Total medals</span><strong className="metric-value">{stats.gold + stats.silver + stats.bronze}</strong><span className="metric-note">🥇 {stats.gold} · 🥈 {stats.silver} · 🥉 {stats.bronze}</span></div>
            <div className="metric-card"><span className="metric-label">Team win rate</span><strong className="metric-value">{stats.matches ? `${Math.round(stats.wins / stats.matches * 100)}%` : "—"}</strong><span className="metric-note">{stats.wins} wins across {stats.matches} matches</span></div>
            <div className="metric-card"><span className="metric-label">Best performance</span><strong className="metric-value" style={{ fontSize: 17 }}>{bestCompetition?.name || "No results yet"}</strong><span className="metric-note">highest medal total</span></div>
        </section>
        {competitions.length ? <section className="competition-timeline">{competitions.map((competition) => {
            const gold = competition.results.filter((result) => result.medal === "GOLD").length;
            const silver = competition.results.filter((result) => result.medal === "SILVER").length;
            const bronze = competition.results.filter((result) => result.medal === "BRONZE").length;
            const wins = competition.results.reduce((sum, result) => sum + (result.wins || 0), 0);
            const matches = competition.results.reduce((sum, result) => sum + (result.matches || 0), 0);
            const upcoming = new Date(competition.competitionDate) > now;
            return <Link href={`/competitions/${competition.id}`} className="competition-card surface" key={competition.id}><div className="competition-card-head"><div><h2>{competition.name}</h2><p className="competition-meta">{new Date(competition.competitionDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} · {competition.location || "Venue TBA"}</p></div><span className={`status-chip ${upcoming ? "status-upcoming" : "status-completed"}`}>{upcoming ? "Upcoming" : "Completed"}</span></div><div className="competition-results"><div><b>🥇 {gold}</b><span>Gold</span></div><div><b>🥈 {silver}</b><span>Silver</span></div><div><b>🥉 {bronze}</b><span>Bronze</span></div></div><div className="competition-card-footer"><span>{competition.results.length} delegates · {matches} matches</span><strong>{matches ? `${Math.round(wins / matches * 100)}% win rate` : "Results pending"} ›</strong></div></Link>;
        })}</section> : <div className="empty-state surface"><div className="empty-state-icon">🏆</div><div className="empty-state-text">No competitions scheduled</div><p className="empty-state-subtext">The next team event will appear here.</p></div>}
    </div>;
}
