import { getCoaches } from "@/app/actions/coaches";
import { getPlayers } from "@/app/actions/players";
import Link from "next/link";
import CreateSessionForm from "@/components/admin/CreateSessionForm";

export default async function CreateSessionPage() {
    const coaches = await getCoaches(true);
    const players = await getPlayers(true);

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Create Session</h1>
                        <p className="page-subtitle">Create a new training or practice session</p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card">
                <CreateSessionForm coaches={coaches} players={players} />
            </div>
        </div>
    );
}

