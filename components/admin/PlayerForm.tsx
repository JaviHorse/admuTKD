"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlayer, updatePlayer, deletePlayer } from "@/app/actions/players";

interface PlayerFormProps {
    player?: {
        id: string;
        fullName: string;
        isActive: boolean;
    };
}

export default function PlayerForm({ player }: PlayerFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [fullName, setFullName] = useState(player?.fullName || "");
    const [isActive, setIsActive] = useState(player?.isActive ?? true);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (player) {
                await updatePlayer(player.id, { fullName, isActive });
                setIsEditing(false);
            } else {
                await createPlayer({ fullName, isActive });
                setFullName("");
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
        if (!player || !confirm("Are you sure you want to delete this player?")) return;
        setIsDeleting(true);
        try {
            await deletePlayer(player.id);
            router.refresh();
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    }

    if (player && !isEditing) {
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
                        placeholder="Player name"
                        required
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
                    {loading ? "Saving..." : player ? "Update" : "Create"}
                </button>
                {player && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            setIsEditing(false);
                            setFullName(player.fullName);
                            setIsActive(player.isActive);
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

