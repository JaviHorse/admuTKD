import { getUaapDate, setUaapDate } from "@/app/actions/settings";
import Link from "next/link";

export default async function AdminSettingsPage() {
    const currentDate = await getUaapDate();

    async function saveDate(formData: FormData) {
        "use server";
        const date = formData.get("uaapDate") as string | null;
        await setUaapDate(date || null);
    }

    // Format date for the datetime-local input (YYYY-MM-DDTHH:mm)
    const inputValue = currentDate
        ? new Date(currentDate).toISOString().slice(0, 16)
        : "";

    return (
        <div>
            <Link href="/admin" className="back-link">
                ← Back to Admin
            </Link>

            <div className="page-header">
                <h1 className="page-title">⚙️ Settings</h1>
                <p className="page-subtitle">Configure app-wide settings</p>
            </div>

            <div className="card" style={{ maxWidth: 520 }}>
                <div className="card-header">
                    <div className="card-title">🏆 UAAP Event Date</div>
                </div>
                <p className="text-muted" style={{ marginBottom: 20, fontSize: 13 }}>
                    Set the UAAP event date to display a live countdown timer on the
                    dashboard. Leave blank to hide the countdown.
                </p>

                <form action={saveDate}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="uaapDate">
                            Event Date &amp; Time
                        </label>
                        <input
                            id="uaapDate"
                            name="uaapDate"
                            type="datetime-local"
                            className="form-input"
                            defaultValue={inputValue}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="submit" className="btn btn-gold">
                            💾 Save Date
                        </button>
                        {currentDate && (
                            <button
                                type="submit"
                                name="uaapDate"
                                value=""
                                className="btn btn-ghost"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {currentDate && (
                    <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(245,166,35,0.08)", borderRadius: 10, border: "1px solid rgba(245,166,35,0.2)" }}>
                        <span style={{ fontSize: 12, color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Currently set to
                        </span>
                        <div style={{ marginTop: 4, color: "var(--text-primary)", fontSize: 14, fontWeight: 600 }}>
                            {new Date(currentDate).toLocaleString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
