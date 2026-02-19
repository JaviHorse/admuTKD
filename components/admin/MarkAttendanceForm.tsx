"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAttendance } from "@/app/actions/sessions";

interface MarkAttendanceFormProps {
    session: {
        id: string;
        attendance: Array<{
            id: string;
            playerId: string;
            status: string;
            note?: string | null;
        }>;
    };
    players: Array<{ id: string; fullName: string }>;
}

export default function MarkAttendanceForm({ session, players }: MarkAttendanceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<
        Array<{ playerId: string; status: string; note: string }>
    >(() => {
        // Initialize with existing records or default to ABSENT
        return players.map((player) => {
            const existing = session.attendance.find((r) => r.playerId === player.id);
            return {
                playerId: player.id,
                status: existing?.status || "ABSENT",
                note: existing?.note || "",
            };
        });
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await markAttendance(session.id, records);
            router.push("/sessions");
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
            setLoading(false);
        }
    }

    function updateRecord(playerId: string, field: "status" | "note", value: string) {
        setRecords((prev) =>
            prev.map((r) => (r.playerId === playerId ? { ...r, [field]: value } : r))
        );
    }

    function markAll(status: string) {
        setRecords((prev) => prev.map((r) => ({ ...r, status })));
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="card-title">Attendance Records</div>
                <div className="flex gap-8">
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => markAll("PRESENT")}
                    >
                        Mark All Present
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => markAll("ABSENT")}
                    >
                        Clear All
                    </button>
                </div>
            </div>
            <div className="table-wrap" style={{ marginBottom: 16 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Status</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => {
                            const player = players.find((p) => p.id === record.playerId);
                            return (
                                <tr key={record.playerId}>
                                    <td>{player?.fullName}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            style={{ width: "auto", minWidth: 120 }}
                                            value={record.status}
                                            onChange={(e) =>
                                                updateRecord(record.playerId, "status", e.target.value)
                                            }
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="LATE">Late</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="EXCUSED">Excused</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ width: "100%", minWidth: 200 }}
                                            value={record.note}
                                            onChange={(e) =>
                                                updateRecord(record.playerId, "note", e.target.value)
                                            }
                                            placeholder="Optional note"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Attendance"}
            </button>
        </form>
    );
}

