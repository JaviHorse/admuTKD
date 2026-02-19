import { getPlayers } from "@/app/actions/players";
import Link from "next/link";
import CreateCompetitionForm from "@/components/admin/CreateCompetitionForm";

export default async function CreateCompetitionPage() {
    const players = await getPlayers(true);

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Create Competition</h1>
                        <p className="page-subtitle">Create a new competition and enter results</p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card">
                <CreateCompetitionForm players={players} />
            </div>
        </div>
    );
}

