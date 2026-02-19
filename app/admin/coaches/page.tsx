import { getCoaches } from "@/app/actions/coaches";
import Link from "next/link";
import CoachForm from "@/components/admin/CoachForm";

export default async function ManageCoachesPage() {
    const coaches = await getCoaches();

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Manage Coaches</h1>
                        <p className="page-subtitle">Add, edit, and manage coaching staff</p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-header">
                    <div className="card-title">Add New Coach</div>
                </div>
                <CoachForm />
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Coaches</div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coaches.length > 0 ? (
                                coaches.map((coach) => (
                                    <tr key={coach.id}>
                                        <td>{coach.fullName}</td>
                                        <td>{coach.roleTitle || "—"}</td>
                                        <td>
                                            <span className={`badge ${coach.isActive ? "badge-active" : "badge-inactive"}`}>
                                                {coach.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <CoachForm coach={coach} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                        No coaches added yet
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

