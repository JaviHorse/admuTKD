"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SemesterSelector from "./SemesterSelector";

interface PlayersSearchProps {
    semesters: { id: string; name: string }[];
    selectedSemesterId: string;
    initialSearch: string;
    activeOnly: boolean;
}

export default function PlayersSearch({
    semesters,
    selectedSemesterId,
    initialSearch,
    activeOnly,
}: PlayersSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(initialSearch);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearch(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        router.push(`/players?${params.toString()}`);
    }

    function handleActiveToggle(e: React.ChangeEvent<HTMLInputElement>) {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.checked) {
            params.delete("active");
        } else {
            params.set("active", "false");
        }
        router.push(`/players?${params.toString()}`);
    }

    return (
        <div className="filters-row">
            <div className="search-wrap" style={{ flex: 1, maxWidth: 400 }}>
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search players..."
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <SemesterSelector semesters={semesters} selectedId={selectedSemesterId} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                    type="checkbox"
                    checked={activeOnly}
                    onChange={handleActiveToggle}
                    style={{ cursor: "pointer" }}
                />
                <span className="text-sm">Active only</span>
            </label>
        </div>
    );
}

