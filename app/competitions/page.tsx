import { getCompetitions } from "@/app/actions/competitions";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";
import { auth } from "@/auth";
import DeleteCompetitionButton from "@/components/admin/DeleteCompetitionButton";

export default async function CompetitionsPage({
    searchParams,
}: {
    searchParams: Promise<{ semesterId?: string }>;
}) {
    const sessionAuth = await auth();
    const isAdmin = sessionAuth?.user?.role === "ADMIN";
    const { semesterId } = await searchParams;
    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();

    const selectedSemesterId =
        (semesterId ? String(semesterId).trim() : "") ||
        (activeSemester?.id ? String(activeSemester.id).trim() : "") ||
        (semesters?.[0]?.id ? String(semesters[0].id).trim() : "");

    const competitions = selectedSemesterId ? await getCompetitions(selectedSemesterId) : await getCompetitions();

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Competitions</h1>
                        <p className="page-subtitle">Competition results and statistics</p>
                    </div>

                    <div className="flex-center gap-12">
                        {semesters.length > 0 && (
                            <SemesterSelector semesters={semesters} selectedId={selectedSemesterId || ""} />
                        )}
                        {isAdmin && (
                            <Link href="/admin/new-competition" className="btn btn-primary">
                                Create
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Competition</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th className="text-right">Medals</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitions.length > 0 ? (
                            competitions.map((comp) => {
                                const gold = comp.results?.filter((r) => r.medal === "GOLD").length || 0;
                                const silver = comp.results?.filter((r) => r.medal === "SILVER").length || 0;
                                const bronze = comp.results?.filter((r) => r.medal === "BRONZE").length || 0;

                                return (
                                    <tr key={comp.id}>
                                        <td>
                                            <Link href={`/competitions/${comp.id}`}>{comp.name}</Link>
                                        </td>
                                        <td>
                                            {new Date(comp.competitionDate).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>{comp.location || "—"}</td>
                                        <td className="text-right">
                                            <span className="medal-gold">🥇{gold}</span>{" "}
                                            <span className="medal-silver">🥈{silver}</span>{" "}
                                            <span className="medal-bronze">🥉{bronze}</span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex-center" style={{ justifyContent: "flex-end", gap: 8 }}>
                                                <Link href={`/competitions/${comp.id}`} className="btn btn-ghost btn-sm">
                                                    View
                                                </Link>
                                                {isAdmin && (
                                                    <Link href={`/competitions/${comp.id}/edit`} className="btn btn-gold btn-sm">
                                                        Edit
                                                    </Link>
                                                )}
                                                {isAdmin && (
                                                    <DeleteCompetitionButton competitionId={comp.id} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="empty-state" style={{ padding: "48px" }}>
                                    <div className="empty-state-icon">🏆</div>
                                    <div className="empty-state-text">No competitions found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
