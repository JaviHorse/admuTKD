import { getCoachById } from "@/app/actions/coaches";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getSessionsInSemester } from "@/lib/computations";
import { calcTurnout } from "@/lib/computations";
import SemesterSelector from "@/components/SemesterSelector";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CoachProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ semesterId?: string }>;
}) {
    const { id } = await params;
    const { semesterId } = await searchParams;
    const coach = await getCoachById(id);
    if (!coach) notFound();

    const semesters = await getSemesters();
    const activeSemester = await getActiveSemester();
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;

    // Get sessions where this coach was present in the selected semester
    const semesterSessions = selectedSemesterId
        ? await getSessionsInSemester(selectedSemesterId)
        : [];
    const coachSessions = selectedSemesterId
        ? coach.sessions
            .filter((sc) => {
                const sessionDate = new Date(sc.session.sessionDate);
                const semester = semesters.find((s) => s.id === selectedSemesterId);
                if (!semester) return false;
                return (
                    sessionDate >= new Date(semester.startDate) &&
                    sessionDate <= new Date(semester.endDate)
                );
            })
            .map((sc) => sc.session)
        : coach.sessions.map((sc) => sc.session);

    // Calculate attendance rate for sessions where coach was present
    const totalRecords = coachSessions.reduce(
        (sum, session) => sum + (session.attendance?.length || 0),
        0
    );
    const presentRecords = coachSessions.reduce(
        (sum, session) =>
            sum + (session.attendance?.filter((r: any) => r.status === "PRESENT").length || 0),
        0
    );
    const attendanceRate = totalRecords > 0 ? presentRecords / totalRecords : 0;

    return (
        <div>
            <Link href="/coaches" className="back-link">
                ← Back to Coaches
            </Link>

            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">{coach.fullName}</h1>
                        <p className="page-subtitle">
                            {coach.roleTitle && <span>{coach.roleTitle}</span>}
                            <span className={`badge ${coach.isActive ? "badge-active" : "badge-inactive"}`} style={{ marginLeft: 8 }}>
                                {coach.isActive ? "Active" : "Inactive"}
                            </span>
                        </p>
                    </div>
                    {semesters.length > 0 && (
                        <SemesterSelector semesters={semesters} selectedId={selectedSemesterId || ""} />
                    )}
                </div>
            </div>

            {selectedSemesterId ? (
                <>
                    <div className="card" style={{ marginBottom: 28 }}>
                        <div className="card-header">
                            <div className="card-title">Coach Impact</div>
                        </div>
                        <div className="stat-row">
                            <div className="stat-item">
                                <div className="stat-value">{(attendanceRate * 100).toFixed(1)}%</div>
                                <div className="stat-label">Attendance Rate (Sessions Present)</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{coachSessions.length}</div>
                                <div className="stat-label">Sessions Attended</div>
                            </div>
                        </div>
                    </div>

                    {coachSessions.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Sessions</div>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Location</th>
                                            <th className="text-right">Turnout %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coachSessions
                                            .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                                            .map((session: any) => {
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
                                                        <td className="text-right">{(turnout * 100).toFixed(1)}%</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="card">
                    <div className="empty-state" style={{ padding: "48px" }}>
                        <div className="empty-state-icon">📅</div>
                        <div className="empty-state-text">Select a school year to view statistics</div>
                    </div>
                </div>
            )}
        </div>
    );
}

