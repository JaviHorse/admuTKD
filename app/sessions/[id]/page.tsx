import { getSessionById } from "@/app/actions/sessions";
import { calcTurnout } from "@/lib/computations";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSessionById(id);
    if (!session) notFound();
    const sessionAuth = await auth();
    const isAdmin = sessionAuth?.user.role === "ADMIN";

    const turnout = calcTurnout(session.attendance);
    const present = session.attendance.filter((r) => r.status === "PRESENT").length;
    const late = session.attendance.filter((r) => r.status === "LATE").length;
    const absent = session.attendance.filter((r) => r.status === "ABSENT").length;
    const excused = session.attendance.filter((r) => r.status === "EXCUSED").length;

    return (
        <div>
            <Link href="/sessions" className="back-link">
                ← Back to Sessions
            </Link>

            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Session Details</h1>
                        <p className="page-subtitle">
                            {new Date(session.sessionDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    {isAdmin && (
                        <Link href={`/admin/sessions/${session.id}/attendance`} className="btn btn-primary">
                            Mark Attendance
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 28 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Session Information</div>
                    </div>
                    <div className="stat-row">
                        <div className="stat-item">
                            <div className="stat-label">Type</div>
                            <div className="stat-value">{session.sessionType}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{session.location || "—"}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Turnout</div>
                            <div className="stat-value">{(turnout * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                    {session.notes && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                            <div className="stat-label">Notes</div>
                            <div className="text-muted" style={{ marginTop: 4 }}>
                                {session.notes}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Coaches Present</div>
                    </div>
                    {session.coaches && session.coaches.length > 0 ? (
                        <div>
                            {session.coaches.map((sc) => (
                                <div key={sc.id} style={{ marginBottom: 8 }}>
                                    <Link href={`/coaches/${sc.coach.id}`} style={{ color: "var(--text-primary)" }}>
                                        {sc.coach.fullName}
                                    </Link>
                                    {sc.coach.roleTitle && (
                                        <span className="text-muted" style={{ marginLeft: 8 }}>
                                            ({sc.coach.roleTitle})
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted">No coaches recorded</div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Attendance</div>
                    <div className="stat-row" style={{ gap: 16 }}>
                        <div className="stat-item">
                            <div className="stat-value">{present}</div>
                            <div className="stat-label">Present</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{late}</div>
                            <div className="stat-label">Late</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{absent}</div>
                            <div className="stat-label">Absent</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{excused}</div>
                            <div className="stat-label">Excused</div>
                        </div>
                    </div>
                </div>
                <div className="table-wrap" style={{ marginTop: 16 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Status</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {session.attendance.length > 0 ? (
                                session.attendance.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <Link href={`/players/${record.player.id}`}>
                                                {record.player.fullName}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${record.status.toLowerCase()}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="text-muted">{record.note || "—"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                        No attendance records
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

