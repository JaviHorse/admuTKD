"use client";

import { useState } from "react";
import { deleteCompetition } from "@/app/actions/competitions";

interface DeleteCompetitionButtonProps {
    competitionId: string;
}

export default function DeleteCompetitionButton({ competitionId }: DeleteCompetitionButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this competition? All associated results will also be deleted. This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCompetition(competitionId);
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
            title="Delete Competition"
        >
            {isDeleting ? "…" : "Delete"}
        </button>
    );
}
