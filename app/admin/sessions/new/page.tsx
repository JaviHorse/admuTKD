import { getCoaches } from "@/app/actions/coaches";
import Link from "next/link";
import SessionForm from "@/components/admin/SessionForm";

export default async function CreateSessionPage() {
    const coaches = await getCoaches(true);

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
                <SessionForm coaches={coaches} />
            </div>
        </div>
    );
}

