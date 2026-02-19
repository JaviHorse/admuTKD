"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions/sessions";

interface CreateSessionFormProps {
    coaches: Array<{ id: string; fullName: string }>;
}

export default function CreateSessionForm({ coaches }: CreateSessionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sessionDate, setSessionDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [sessionType, setSessionType] = useState("Practice");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!sessionDate) {
            alert("Please select a valid session date.");
            return;
        }
        setLoading(true);
        try {
            const dateObj = new Date(sessionDate);
            if (isNaN(dateObj.getTime())) {
                alert("The selected date is invalid.");
                setLoading(false);
                return;
            }

            const session = await createSession({
                sessionDate: dateObj,
                sessionType,
                location: location || undefined,
                notes: notes || undefined,
                coachIds: selectedCoaches,
            });
            router.push(`/admin/sessions/${session.id}/attendance`);
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
            setLoading(false);
        }
    }

    function toggleCoach(coachId: string) {
        setSelectedCoaches((prev) =>
            prev.includes(coachId)
                ? prev.filter((id) => id !== coachId)
                : [...prev, coachId]
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                    <label className="form-label">Session Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Session Type</label>
                    <select
                        className="form-select"
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                    >
                        <option value="Practice">Practice</option>
                        <option value="Training">Training</option>
                        <option value="Sparring">Sparring</option>
                        <option value="Conditioning">Conditioning</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                        type="text"
                        className="form-input"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Optional"
                    />
                </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Coaches Present</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {coaches.map((coach) => (
                        <label
                            key={coach.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                                padding: "6px 12px",
                                background: selectedCoaches.includes(coach.id)
                                    ? "var(--bg-card-hover)"
                                    : "var(--bg-secondary)",
                                border: "1px solid var(--border-light)",
                                borderRadius: "6px",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedCoaches.includes(coach.id)}
                                onChange={() => toggleCoach(coach.id)}
                                style={{ cursor: "pointer" }}
                            />
                            <span className="text-sm">{coach.fullName}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Notes</label>
                <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes about this session"
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Session & Mark Attendance"}
            </button>
        </form>
    );
}

