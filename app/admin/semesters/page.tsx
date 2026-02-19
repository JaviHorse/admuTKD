import { getSemesters } from "@/app/actions/semesters";
import Link from "next/link";
import SemesterForm from "@/components/admin/SemesterForm";

export default async function ManageSemestersPage() {
    const semesters = await getSemesters();

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Manage School Years</h1>
                        <p className="page-subtitle">Configure school year date ranges</p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-header">
                    <div className="card-title">Create New School Year</div>
                </div>
                <SemesterForm />
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Existing School Years</div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesters.length > 0 ? (
                                semesters.map((semester) => (
                                    <tr key={semester.id}>
                                        <td>{semester.name}</td>
                                        <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${semester.isActive ? "badge-active" : "badge-inactive"}`}>
                                                {semester.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <SemesterForm semester={semester} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                        No school years created yet
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

