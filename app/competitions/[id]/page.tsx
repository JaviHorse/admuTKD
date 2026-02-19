import { getCompetitionById } from "@/app/actions/competitions";
import { formatWinRate } from "@/lib/computations";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export default async function CompetitionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const competitionId = String(id || "").trim();
    if (!competitionId) notFound();

    const competition = await getCompetitionById(competitionId);
    if (!competition) notFound();

    const sessionAuth = await auth();
    const isAdmin = sessionAuth?.user?.role === "ADMIN";

    const gold = competition.results.filter((r) => r.medal === "GOLD").length;
    const silver = competition.results.filter((r) => r.medal === "SILVER").length;
    const bronze = competition.results.filter((r) => r.medal === "BRONZE").length;

    return (
        <div>
            <Link href="/competitions" className="back-link">
                ← Back to Competitions
            </Link>

            <div className="page-header">
                <h1 className="page-title">{competition.name}</h1>
                <p className="page-subtitle">
                    {new Date(competition.competitionDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-header">
                    <div className="card-title">Competition Information</div>

                    <div className="flex-center gap-12">
                        {isAdmin && (
                            <Link href={`/competitions/${competitionId}/edit`} className="btn btn-gold btn-sm">
                                Edit
                            </Link>
                        )}
                    </div>
                </div>

                <div className="stat-row">
                    <div className="stat-item">
                        <div className="stat-label">Date</div>
                        <div className="stat-value">{new Date(competition.competitionDate).toLocaleDateString()}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Location</div>
                        <div className="stat-value">{competition.location || "—"}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Medals</div>
                        <div className="stat-value">
                            <span className="medal-gold">🥇{gold}</span>{" "}
                            <span className="medal-silver">🥈{silver}</span>{" "}
                            <span className="medal-bronze">🥉{bronze}</span>
                        </div>
                    </div>
                </div>

                {competition.notes && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                        <div className="stat-label">Notes</div>
                        <div className="text-muted" style={{ marginTop: 4 }}>
                            {competition.notes}
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Results</div>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th className="text-right">Medal</th>
                                <th className="text-right">Wins</th>
                                <th className="text-right">Matches</th>
                                <th className="text-right">Win Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competition.results.length > 0 ? (
                                competition.results.map((result) => {
                                    const medal = String(result.medal || "NONE").toUpperCase();
                                    return (
                                        <tr key={result.id}>
                                            <td>
                                                <Link href={`/players/${result.player.id}`}>{result.player.fullName}</Link>
                                            </td>

                                            <td className="text-right">
                                                <span className={`medal-${medal.toLowerCase()}`}>
                                                    {medal === "GOLD" && "🥇"}
                                                    {medal === "SILVER" && "🥈"}
                                                    {medal === "BRONZE" && "🥉"}
                                                    {medal === "NONE" && "—"}
                                                </span>
                                            </td>

                                            <td className="text-right">{result.wins}</td>
                                            <td className="text-right">{result.matches}</td>
                                            <td className="text-right">
                                                {result.matches > 0 ? formatWinRate(result.wins / result.matches) : "—"}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                        No results recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
