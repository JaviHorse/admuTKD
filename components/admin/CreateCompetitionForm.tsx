"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompetition, upsertCompetitionResults, type Medal } from "@/app/actions/competitions";

interface CreateCompetitionFormProps {
    players: Array<{ id: string; fullName: string }>;
}

export default function CreateCompetitionForm({ players }: CreateCompetitionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [competitionDate, setCompetitionDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [results, setResults] = useState<
        Array<{ playerId: string; medal: Medal; wins: number; matches: number; notes: string }>
    >(
        players.map((player) => ({
            playerId: player.id,
            medal: "NONE",
            wins: 0,
            matches: 0,
            notes: "",
        }))
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const competition = await createCompetition({
                name,
                competitionDate: new Date(competitionDate),
                location: location || undefined,
                notes: notes || undefined,
            });

            // Filter out players with no results (NONE medal, 0 wins, 0 matches)
            const validResults = results.filter(
                (r) => r.medal !== "NONE" || r.wins > 0 || r.matches > 0
            );

            if (validResults.length > 0) {
                await upsertCompetitionResults(
                    competition.id,
                    validResults.map((r) => ({
                        playerId: r.playerId,
                        medal: r.medal,
                        wins: r.wins,
                        matches: r.matches,
                        notes: r.notes || undefined,
                    }))
                );
            }

            router.push(`/competitions/${competition.id}`);
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
            setLoading(false);
        }
    }

    function updateResult(playerId: string, field: string, value: string | number) {
        setResults((prev) =>
            prev.map((r) => (r.playerId === playerId ? { ...r, [field]: value } : r))
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="form-group">
                    <label className="form-label">Competition Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Competition name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Competition Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={competitionDate}
                        onChange={(e) => setCompetitionDate(e.target.value)}
                        required
                    />
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
                <label className="form-label">Notes</label>
                <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes about this competition"
                />
            </div>

            <div className="card-header" style={{ marginBottom: 16 }}>
                <div className="card-title">Results</div>
            </div>
            <div className="table-wrap" style={{ marginBottom: 16 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Medal</th>
                            <th>Wins</th>
                            <th>Matches</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result) => {
                            const player = players.find((p) => p.id === result.playerId);
                            return (
                                <tr key={result.playerId}>
                                    <td>{player?.fullName}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            style={{ width: "auto", minWidth: 120 }}
                                            value={result.medal}
                                            onChange={(e) =>
                                                updateResult(result.playerId, "medal", e.target.value)
                                            }
                                        >
                                            <option value="NONE">None</option>
                                            <option value="GOLD">Gold</option>
                                            <option value="SILVER">Silver</option>
                                            <option value="BRONZE">Bronze</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ width: 80 }}
                                            min="0"
                                            value={result.wins}
                                            onChange={(e) =>
                                                updateResult(
                                                    result.playerId,
                                                    "wins",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ width: 80 }}
                                            min="0"
                                            value={result.matches}
                                            onChange={(e) =>
                                                updateResult(
                                                    result.playerId,
                                                    "matches",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ width: "100%", minWidth: 150 }}
                                            value={result.notes}
                                            onChange={(e) =>
                                                updateResult(result.playerId, "notes", e.target.value)
                                            }
                                            placeholder="Optional"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Competition"}
            </button>
        </form>
    );
}

