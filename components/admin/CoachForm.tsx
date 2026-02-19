"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoach, updateCoach, deleteCoach } from "@/app/actions/coaches";

interface CoachFormProps {
    coach?: {
        id: string;
        fullName: string;
        roleTitle?: string | null;
        isActive: boolean;
    };
}

export default function CoachForm({ coach }: CoachFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [fullName, setFullName] = useState(coach?.fullName || "");
    const [roleTitle, setRoleTitle] = useState(coach?.roleTitle || "");
    const [isActive, setIsActive] = useState(coach?.isActive ?? true);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (coach) {
                await updateCoach(coach.id, { fullName, roleTitle: roleTitle || undefined, isActive });
                setIsEditing(false);
            } else {
                await createCoach({ fullName, roleTitle: roleTitle || undefined, isActive });
                setFullName("");
                setRoleTitle("");
                setIsActive(true);
            }
            router.refresh();
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!coach || !confirm("Are you sure you want to delete this coach?")) return;
        setIsDeleting(true);
        try {
            await deleteCoach(coach.id);
            router.refresh();
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    }

    if (coach && !isEditing) {
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
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Coach name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Role Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        placeholder="Head Coach, Assistant, etc."
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 8 }}>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ cursor: "pointer" }}
                        />
                        <span className="text-sm">Active</span>
                    </label>
                </div>
            </div>
            <div className="flex gap-8">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : coach ? "Update" : "Create"}
                </button>
                {coach && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            setIsEditing(false);
                            setFullName(coach.fullName);
                            setRoleTitle(coach.roleTitle || "");
                            setIsActive(coach.isActive);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

