"use client";

import { useState } from "react";
import { deleteSession } from "@/app/actions/sessions";

interface DeleteSessionButtonProps {
    sessionId: string;
}

export default function DeleteSessionButton({ sessionId }: DeleteSessionButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteSession(sessionId);
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-sm btn-danger"
            title="Delete Session"
        >
            {isDeleting ? "…" : "Delete"}
        </button>
    );
}
