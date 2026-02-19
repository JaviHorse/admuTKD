import { getSessionById } from "@/app/actions/sessions";
import { getPlayers } from "@/app/actions/players";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkAttendanceForm from "@/components/admin/MarkAttendanceForm";

export default async function MarkAttendancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSessionById(id);
    if (!session) notFound();

    const players = await getPlayers(true);

    return (
        <div>
            <div className="page-header">
                <div className="flex-between">
                    <div>
                        <h1 className="page-title">Mark Attendance</h1>
                        <p className="page-subtitle">
                            {new Date(session.sessionDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <Link href="/admin" className="btn btn-ghost">
                        ← Back to Admin
                    </Link>
                </div>
            </div>

            <div className="card">
                <MarkAttendanceForm session={session} players={players} />
            </div>
        </div>
    );
}

