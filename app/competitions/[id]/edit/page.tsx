import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    getCompetitionById,
    updateCompetition,
    upsertCompetitionResults,
    deleteCompetitionResult,
    type Medal,
} from "@/app/actions/competitions";
import { prisma } from "@/lib/db";

async function saveCompetitionAndResults(competitionId: string, formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const competitionDateRaw = String(formData.get("competitionDate") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!competitionId || !name) return;

    const competitionDate = competitionDateRaw ? new Date(competitionDateRaw) : new Date();

    await updateCompetition(competitionId, {
        name,
        competitionDate,
        location: location || undefined,
        notes: notes || undefined,
    });

    const playerIdsRaw = formData.getAll("playerIds");
    const playerIds = playerIdsRaw.map((v) => String(v)).filter(Boolean);

    const selected: Array<{
        playerId: string;
        medal: Medal;
        wins: number;
        matches: number;
        notes?: string;
    }> = [];

    const toDelete: Array<{ competitionId: string; playerId: string }> = [];

    for (const playerId of playerIds) {
        const include = formData.get(`include_${playerId}`) === "on";

        const medalRaw = String(formData.get(`medal_${playerId}`) || "NONE").trim().toUpperCase();
        const winsRaw = String(formData.get(`wins_${playerId}`) || "0").trim();
        const matchesRaw = String(formData.get(`matches_${playerId}`) || "0").trim();
        const resultNotes = String(formData.get(`rnotes_${playerId}`) || "").trim();

        const medal: Medal =
            medalRaw === "GOLD" || medalRaw === "SILVER" || medalRaw === "BRONZE" || medalRaw === "NONE"
                ? (medalRaw as Medal)
                : "NONE";

        const wins = Number.isFinite(Number(winsRaw)) ? Math.max(0, parseInt(winsRaw, 10) || 0) : 0;
        const matches = Number.isFinite(Number(matchesRaw)) ? Math.max(0, parseInt(matchesRaw, 10) || 0) : 0;

        if (include) {
            selected.push({
                playerId,
                medal,
                wins,
                matches,
                notes: resultNotes || undefined,
            });
        } else {
            const hadExisting = formData.get(`had_${playerId}`) === "1";
            if (hadExisting) {
                toDelete.push({ competitionId, playerId });
            }
        }
    }

    for (const d of toDelete) {
        await deleteCompetitionResult(d.competitionId, d.playerId);
    }

    await upsertCompetitionResults(competitionId, selected);

    redirect(`/competitions/${competitionId}`);
}

function toDateInputValue(date: Date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default async function EditCompetitionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const competitionId = String(id || "").trim();
    if (!competitionId) notFound();

    const competition = await getCompetitionById(competitionId);
    if (!competition) notFound();

    const players = await prisma.player.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
    });

    const resultsByPlayerId = new Map<string, any>();
    for (const r of competition.results || []) {
        resultsByPlayerId.set(r.playerId, r);
    }

    const defaultDate = toDateInputValue(new Date(competition.competitionDate));
    const action = saveCompetitionAndResults.bind(null, competitionId);

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: 16 }}>
                <Link href={`/competitions/${competitionId}`} className="back-link" style={{ marginBottom: 0 }}>
                    ← Back to Competition
                </Link>

                <div className="flex-center gap-12">
                    <Link href={`/competitions/${competitionId}`} className="btn btn-ghost">
                        Cancel
                    </Link>
                    <button form="edit-competition-form" type="submit" className="btn btn-gold">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="page-header">
                <h1 className="page-title">Edit Competition</h1>
                <p className="page-subtitle">Update competition info and edit medals / results</p>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div className="card-title">Competition Details</div>
                </div>

                <form id="edit-competition-form" action={action}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Competition Name</label>
                            <input
                                name="name"
                                className="form-input"
                                defaultValue={competition.name}
                                placeholder="e.g., UAAP Taekwondo Championships"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input
                                name="competitionDate"
                                type="date"
                                className="form-input"
                                defaultValue={defaultDate}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Location</label>
                            <input
                                name="location"
                                className="form-input"
                                defaultValue={competition.location || ""}
                                placeholder="e.g., ADMU Gym"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Notes</label>
                            <textarea
                                name="notes"
                                className="form-textarea"
                                defaultValue={competition.notes || ""}
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="card-header" style={{ marginBottom: 10 }}>
                        <div className="card-title">Medals / Results</div>
                        <div className="text-muted text-sm">
                            Tick “Include” to save/update that player’s result. Untick to remove.
                        </div>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 90 }}>Include</th>
                                    <th>Player</th>
                                    <th className="text-right" style={{ width: 160 }}>
                                        Medal
                                    </th>
                                    <th className="text-right" style={{ width: 120 }}>
                                        Wins
                                    </th>
                                    <th className="text-right" style={{ width: 120 }}>
                                        Matches
                                    </th>
                                    <th style={{ width: 260 }}>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.length > 0 ? (
                                    players.map((player) => {
                                        const existing = resultsByPlayerId.get(player.id);
                                        const existingMedal = (existing?.medal as Medal) || "NONE";
                                        const existingWins = typeof existing?.wins === "number" ? existing.wins : 0;
                                        const existingMatches =
                                            typeof existing?.matches === "number" ? existing.matches : 0;
                                        const existingNotes = existing?.notes || "";

                                        const checkedByDefault = Boolean(existing);

                                        return (
                                            <tr key={player.id}>
                                                <td>
                                                    <input type="hidden" name="playerIds" value={player.id} />
                                                    <input
                                                        type="hidden"
                                                        name={`had_${player.id}`}
                                                        value={existing ? "1" : "0"}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        name={`include_${player.id}`}
                                                        defaultChecked={checkedByDefault}
                                                    />
                                                </td>

                                                <td>{player.fullName}</td>

                                                <td className="text-right">
                                                    <select
                                                        name={`medal_${player.id}`}
                                                        className="form-select"
                                                        defaultValue={existingMedal}
                                                    >
                                                        <option value="NONE">None</option>
                                                        <option value="BRONZE">Bronze</option>
                                                        <option value="SILVER">Silver</option>
                                                        <option value="GOLD">Gold</option>
                                                    </select>
                                                </td>

                                                <td className="text-right">
                                                    <input
                                                        name={`wins_${player.id}`}
                                                        type="number"
                                                        min={0}
                                                        className="form-input"
                                                        defaultValue={existingWins}
                                                        style={{ width: "100%", textAlign: "right" }}
                                                    />
                                                </td>

                                                <td className="text-right">
                                                    <input
                                                        name={`matches_${player.id}`}
                                                        type="number"
                                                        min={0}
                                                        className="form-input"
                                                        defaultValue={existingMatches}
                                                        style={{ width: "100%", textAlign: "right" }}
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        name={`rnotes_${player.id}`}
                                                        className="form-input"
                                                        defaultValue={existingNotes}
                                                        placeholder="Optional result notes..."
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-muted" style={{ textAlign: "center", padding: "24px" }}>
                                            No active players found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="divider" />

                    <div className="flex-between">
                        <div className="text-muted text-sm">
                            Tip: If someone didn’t join the competition, untick “Include” to remove their record.
                        </div>
                        <div className="flex-center gap-12">
                            <Link href={`/competitions/${competitionId}`} className="btn btn-ghost">
                                Cancel
                            </Link>
                            <button type="submit" className="btn btn-gold">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
