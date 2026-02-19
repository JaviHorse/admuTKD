"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
    type: "player" | "coach" | "session" | "competition";
    id: string;
    name: string;
    subtitle?: string;
}

interface GlobalSearchProps {
    onResultClick?: () => void;
}

export default function GlobalSearch({ onResultClick }: GlobalSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
                setIsOpen(data.results && data.results.length > 0);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(search, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    function handleResultClick(result: SearchResult) {
        let path = "";
        if (result.type === "player") path = `/players/${result.id}`;
        else if (result.type === "coach") path = `/coaches/${result.id}`;
        else if (result.type === "session") path = `/sessions/${result.id}`;
        else if (result.type === "competition") path = `/competitions/${result.id}`;

        if (path) {
            router.push(path);
            setQuery("");
            setIsOpen(false);
            if (onResultClick) onResultClick();
        }
    }

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
            <div className="search-wrap">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search players, coaches, sessions, competitions..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && results.length > 0) {
                            handleResultClick(results[0]);
                        }
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onBlur={() => {
                        // Delay to allow click on results
                        setTimeout(() => setIsOpen(false), 200);
                    }}
                />
            </div>
            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-sm)",
                        boxShadow: "var(--shadow)",
                        zIndex: 1000,
                        maxHeight: 400,
                        overflowY: "auto",
                    }}
                >
                    {loading ? (
                        <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)" }}>
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        results.map((result) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                type="button"
                                onMouseDown={(e) => {
                                    // Use onMouseDown to trigger before onBlur
                                    e.preventDefault();
                                    handleResultClick(result);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    textAlign: "left",
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: "1px solid var(--border)",
                                    color: "var(--text-primary)",
                                    cursor: "pointer",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--bg-card-hover)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>
                                        {result.type === "player" && "🥋"}
                                        {result.type === "coach" && "👨‍🏫"}
                                        {result.type === "session" && "📅"}
                                        {result.type === "competition" && "🏆"}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{result.name}</div>
                                        {result.subtitle && (
                                            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                                                {result.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            textTransform: "uppercase",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {result.type}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div style={{ padding: 16, textAlign: "center", color: "var(--text-secondary)" }}>
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

