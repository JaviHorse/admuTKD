import { getSessions } from "@/app/actions/sessions";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { calcTurnout } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import DeleteSessionButton from "@/components/admin/DeleteSessionButton";
import Link from "next/link";
import { auth } from "@/auth";

export default async function SessionsPage({
    searchParams,
}: {
    searchParams: Promise<{ semesterId?: string }>;
}) {
    const session_auth = await auth();
    const isAdmin = session_auth?.user?.role === "ADMIN";
    const { semesterId } = await searchParams;
    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;

    const sessions = selectedSemesterId
        ? await getSessions(selectedSemesterId)
        : await getSessions();

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Sessions</h1>
                        <p className="page-subtitle">Training and practice sessions</p>
                    </div>
                    {semesters.length > 0 && (
                        <SemesterSelector semesters={semesters} selectedId={selectedSemesterId || ""} />
                    )}
                </div>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Coaches</th>
                            <th className="text-right">Turnout %</th>
                            {isAdmin && <th className="text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.length > 0 ? (
                            sessions.map((session) => {
                                const turnout = calcTurnout(session.attendance || []);
                                return (
                                    <tr key={session.id} className="clickable">
                                        <td>
                                            <Link href={`/sessions/${session.id}`}>
                                                {new Date(session.sessionDate).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </Link>
                                        </td>
                                        <td>{session.sessionType}</td>
                                        <td>{session.location || "—"}</td>
                                        <td>
                                            {session.coaches && session.coaches.length > 0
                                                ? session.coaches.map((sc: any) => sc.coach.fullName).join(", ")
                                                : "—"}
                                        </td>
                                        <td className="text-right">{(turnout * 100).toFixed(1)}%</td>
                                        {isAdmin && (
                                            <td className="text-right">
                                                <DeleteSessionButton sessionId={session.id} />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="empty-state" style={{ padding: "48px" }}>
                                    <div className="empty-state-icon">📅</div>
                                    <div className="empty-state-text">No sessions found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

