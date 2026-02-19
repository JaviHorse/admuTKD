import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage team data and settings</p>
            </div>

            <div className="grid-2" style={{ gap: 20 }}>
                <Link href="/admin/semesters" className="card" style={{ textDecoration: "none", display: "block" }}>
                    <div className="card-header">
                        <div className="card-title">🗓️ Manage School Years</div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                        Create and configure school years (e.g. AY 2025-2026)
                    </p>
                </Link>

                <Link href="/admin/players" className="card" style={{ textDecoration: "none", display: "block" }}>
                    <div className="card-header">
                        <div className="card-title">✏️ Manage Players</div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                        Add, edit, and manage player roster
                    </p>
                </Link>

                <Link href="/admin/coaches" className="card" style={{ textDecoration: "none", display: "block" }}>
                    <div className="card-header">
                        <div className="card-title">✏️ Manage Coaches</div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                        Add, edit, and manage coaching staff
                    </p>
                </Link>

                <Link href="/admin/sessions/new" className="card" style={{ textDecoration: "none", display: "block" }}>
                    <div className="card-header">
                        <div className="card-title">➕ Create Session</div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                        Create a new training or practice session
                    </p>
                </Link>

                <Link href="/admin/competitions/new" className="card" style={{ textDecoration: "none", display: "block" }}>
                    <div className="card-header">
                        <div className="card-title">➕ Create Competition</div>
                    </div>
                    <p className="text-muted" style={{ marginTop: 8 }}>
                        Create a new competition and enter results
                    </p>
                </Link>
            </div>
        </div>
    );
}

