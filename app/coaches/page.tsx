import { getCoaches } from "@/app/actions/coaches";
import Link from "next/link";

export default async function CoachesPage() {
    const coaches = await getCoaches();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Coaches</h1>
                <p className="page-subtitle">Team coaching staff</p>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coaches.length > 0 ? (
                            coaches.map((coach) => (
                                <tr key={coach.id} className="clickable">
                                    <td>
                                        <Link href={`/coaches/${coach.id}`}>{coach.fullName}</Link>
                                    </td>
                                    <td>{coach.roleTitle || "—"}</td>
                                    <td>
                                        <span className={`badge ${coach.isActive ? "badge-active" : "badge-inactive"}`}>
                                            {coach.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="empty-state" style={{ padding: "48px" }}>
                                    <div className="empty-state-icon">👨‍🏫</div>
                                    <div className="empty-state-text">No coaches found</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

