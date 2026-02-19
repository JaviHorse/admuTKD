"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSemester, updateSemester, deleteSemester } from "@/app/actions/semesters";

interface SemesterFormProps {
    semester?: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    };
}

export default function SemesterForm({ semester }: SemesterFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [name, setName] = useState(semester?.name || "");
    const [startDate, setStartDate] = useState(
        semester ? new Date(semester.startDate).toISOString().split("T")[0] : ""
    );
    const [endDate, setEndDate] = useState(
        semester ? new Date(semester.endDate).toISOString().split("T")[0] : ""
    );
    const [isActive, setIsActive] = useState(semester?.isActive ?? false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (semester) {
                await updateSemester(semester.id, {
                    name,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive,
                });
                setIsEditing(false);
            } else {
                await createSemester({
                    name,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive,
                });
                setName("");
                setStartDate("");
                setEndDate("");
                setIsActive(false);
            }
            router.refresh();
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!semester || !confirm("Are you sure you want to delete this school year?")) return;
        setIsDeleting(true);
        try {
            await deleteSemester(semester.id);
            router.refresh();
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    }

    if (semester && !isEditing) {
        return (
            <div className="flex gap-8">
                <button className="btn btn-sm btn-ghost" onClick={() => setIsEditing(true)}>
                    Edit
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. AY 2025-2026, Sem 1, Sem 2"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Active</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 8 }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ cursor: "pointer" }}
                        />
                        <span className="text-sm">Mark as active school year</span>
                    </label>
                </div>
                <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="flex gap-8">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : semester ? "Update" : "Create"}
                </button>
                {semester && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            setIsEditing(false);
                            setName(semester.name);
                            setStartDate(new Date(semester.startDate).toISOString().split("T")[0]);
                            setEndDate(new Date(semester.endDate).toISOString().split("T")[0]);
                            setIsActive(semester.isActive);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

