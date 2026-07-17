import { getUaapDate, setUaapDate, isTrainingCancelled, setTrainingCancelled } from "@/app/actions/settings";
import { getScheduledTrainingDay } from "@/lib/trainingSchedule";
import Link from "next/link";

export default async function AdminSettingsPage() {
    const scheduledTraining = getScheduledTrainingDay();
    const [currentDate, trainingCancelled] = await Promise.all([getUaapDate(), isTrainingCancelled(scheduledTraining.dateKey)]);

    async function saveDate(formData: FormData) {
        "use server";
        const date = formData.get("uaapDate") as string | null;
        await setUaapDate(date || null);
    }

    async function saveTrainingStatus(formData: FormData) {
        "use server";
        const dateKey = String(formData.get("trainingDate") || "");
        await setTrainingCancelled(dateKey, formData.get("trainingCancelled") === "on");
    }

    const inputValue = currentDate ? new Date(currentDate).toISOString().slice(0, 16) : "";
    const trainingLabel = scheduledTraining.date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", weekday: "long", month: "long", day: "numeric", year: "numeric" });

    return <div>
        <div className="profile-breadcrumb"><Link href="/admin">Management</Link><span>/</span><strong>Team Settings</strong></div>
        <header className="compact-page-header"><div><span className="eyebrow">Administration</span><h1>Team Settings</h1><p>Control the regular training schedule and team-wide events.</p></div></header>
        <div className="settings-grid">
            <section className="surface settings-card"><div className="surface-header"><div><span className="eyebrow">Monday–Saturday</span><h2 className="surface-title">Automatic training schedule</h2></div><span className={`status-chip ${trainingCancelled ? "status-absent" : "status-active"}`}>{trainingCancelled ? "Cancelled" : "Scheduled"}</span></div><div className="settings-card-body"><div className="scheduled-day"><div className="scheduled-day-date"><b>{scheduledTraining.date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", day: "2-digit" })}</b><span>{scheduledTraining.date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", month: "short" })}</span></div><div><span>Next scheduled training</span><strong>{trainingLabel}</strong><p>The dashboard automatically advances to Monday when the current day is Sunday.</p></div></div><form action={saveTrainingStatus} className="training-toggle-form"><input type="hidden" name="trainingDate" value={scheduledTraining.dateKey} /><label className="setting-toggle"><span><strong>Training cancelled</strong><small>Turn this on to show viewers that this scheduled training day will not proceed.</small></span><input type="checkbox" name="trainingCancelled" defaultChecked={trainingCancelled} /><i aria-hidden="true" /></label><button type="submit" className="btn btn-primary">Save training status</button></form></div></section>
            <section className="surface settings-card"><div className="surface-header"><div><span className="eyebrow">Competition countdown</span><h2 className="surface-title">UAAP event date</h2></div>{currentDate && <span className="status-chip status-upcoming">Active</span>}</div><div className="settings-card-body"><p className="surface-subtitle settings-description">Set the UAAP event date to display a live countdown on the dashboard. Leave it blank to hide the countdown.</p><form action={saveDate}><div className="form-group"><label className="form-label" htmlFor="uaapDate">Event date and time</label><input id="uaapDate" name="uaapDate" type="datetime-local" className="form-input" defaultValue={inputValue} /></div><div className="page-header-actions"><button type="submit" className="btn btn-primary">Save event date</button>{currentDate && <button type="submit" name="uaapDate" value="" className="btn btn-ghost">Clear</button>}</div></form>{currentDate && <div className="current-setting"><span>Currently scheduled</span><strong>{new Date(currentDate).toLocaleString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</strong></div>}</div></section>
        </div>
    </div>;
}
