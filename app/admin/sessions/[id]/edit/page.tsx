import { getSessionById } from "@/app/actions/sessions";
import { getCoaches } from "@/app/actions/coaches";
import { notFound } from "next/navigation";
import Link from "next/link";
import SessionForm from "@/components/admin/SessionForm";
import DeleteSessionButton from "@/components/admin/DeleteSessionButton";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSessionById(id);
    const coaches = await getCoaches(true);

    if (!session) {
        notFound();
    }

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Edit Session</h1>
                        <p className="page-subtitle">Update session details or location</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <DeleteSessionButton sessionId={session.id} />
                        <Link href={`/sessions/${session.id}`} className="btn btn-ghost">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card">
                <SessionForm coaches={coaches} initialData={session} />
            </div>
        </div>
    );
}
