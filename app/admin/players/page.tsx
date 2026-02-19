import { getPlayers } from "@/app/actions/players";
import Link from "next/link";
import PlayerForm from "@/components/admin/PlayerForm";

export default async function ManagePlayersPage() {
    const players = await getPlayers();

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Manage Players</h1>
                        <p className="page-subtitle">Add, edit, and manage player roster</p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <div className="card-header">
                    <div className="card-title">Add New Player</div>
                </div>
                <PlayerForm />
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Players</div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.length > 0 ? (
                                players.map((player) => (
                                    <tr key={player.id}>
                                        <td>{player.fullName}</td>
                                        <td>
                                            <span className={`badge ${player.isActive ? "badge-active" : "badge-inactive"}`}>
                                                {player.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <PlayerForm player={player} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                        No players added yet
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

