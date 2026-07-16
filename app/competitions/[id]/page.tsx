import { getCompetitionById } from "@/app/actions/competitions";
import { formatWinRate } from "@/lib/computations";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const competitionId = String(id || "").trim();
    if (!competitionId) notFound();
    const [competition, sessionAuth] = await Promise.all([getCompetitionById(competitionId), auth()]);
    if (!competition) notFound();
    const isAdmin = sessionAuth?.user?.role === "ADMIN";
    const medals = { gold: competition.results.filter((result) => result.medal === "GOLD").length, silver: competition.results.filter((result) => result.medal === "SILVER").length, bronze: competition.results.filter((result) => result.medal === "BRONZE").length };
    const wins = competition.results.reduce((sum, result) => sum + result.wins, 0);
    const matches = competition.results.reduce((sum, result) => sum + result.matches, 0);
    const topPerformer = [...competition.results].sort((a, b) => b.wins - a.wins || b.matches - a.matches)[0];

    return <div>
        <Link href="/competitions" className="back-link">← Competitions</Link>
        <header className="compact-page-header"><div><span className="eyebrow">Competition summary</span><h1>{competition.name}</h1><p><strong>{new Date(competition.competitionDate).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</strong> · {competition.location || "Venue TBA"}</p></div>{isAdmin && <Link href={`/competitions/${competitionId}/edit`} className="btn btn-primary">Edit results</Link>}</header>
        <section className="metric-grid"><div className="metric-card accent"><span className="metric-label">Team win rate</span><strong className="metric-value">{matches ? formatWinRate(wins / matches) : "—"}</strong><span className="metric-note">{wins} wins across {matches} matches</span></div><div className="metric-card"><span className="metric-label">Delegates</span><strong className="metric-value">{competition.results.length}</strong><span className="metric-note">athletes with results</span></div><div className="metric-card"><span className="metric-label">Medal haul</span><strong className="metric-value">{medals.gold + medals.silver + medals.bronze}</strong><span className="metric-note">🥇 {medals.gold} · 🥈 {medals.silver} · 🥉 {medals.bronze}</span></div><div className="metric-card"><span className="metric-label">Top performer</span><strong className="metric-value" style={{ fontSize: 18 }}>{topPerformer?.player.fullName || "No results"}</strong><span className="metric-note">{topPerformer ? `${topPerformer.wins} recorded wins` : "Results pending"}</span></div></section>
        {competition.notes && <section className="surface" style={{ padding: 18, marginBottom: 18 }}><span className="eyebrow">Post-event notes</span><p>{competition.notes}</p></section>}
        <section className="surface"><div className="surface-header"><div><h2 className="surface-title">Delegate results</h2><p className="surface-subtitle">Individual records and medal contribution</p></div><span className="status-chip status-completed">{competition.results.length} delegates</span></div><div className="table-wrap" style={{ border: 0, boxShadow: "none" }}><table><thead><tr><th>Athlete</th><th>Medal</th><th>Record</th><th>Win rate</th><th>Result details</th><th /></tr></thead><tbody>{competition.results.length ? competition.results.map((result) => {
            const losses = Math.max(0, result.matches - result.wins);
            const medal = result.medal === "GOLD" ? "🥇 Gold" : result.medal === "SILVER" ? "🥈 Silver" : result.medal === "BRONZE" ? "🥉 Bronze" : "—";
            return <tr key={result.id}><td><Link className="table-link" href={`/players/${result.player.id}`}><span className="avatar-initial">{result.player.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>{result.player.fullName}</Link></td><td><span className={result.medal === "NONE" ? "status-chip status-neutral" : "record-main"}>{medal}</span></td><td><span className="record-main">{result.wins}–{losses}</span><span className="record-sub">{result.matches} matches</span></td><td>{result.matches ? formatWinRate(result.wins / result.matches) : "—"}</td><td className="text-muted">{result.notes || "No notes"}</td><td><Link className="row-chevron" href={`/players/${result.player.id}`}>›</Link></td></tr>;
        }) : <tr><td colSpan={6} className="empty-state" style={{ padding: 38 }}>No delegate results recorded.</td></tr>}</tbody></table></div></section>
    </div>;
}
