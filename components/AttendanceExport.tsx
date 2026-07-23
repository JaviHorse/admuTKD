"use client";

import { useState } from "react";

interface Props {
    schoolYears: Array<{ id: string; name: string }>;
    initialSchoolYearId: string;
}

export default function AttendanceExport({ schoolYears, initialSchoolYearId }: Props) {
    const [reportType, setReportType] = useState<"monthly" | "overall">("monthly");
    const [schoolYearId, setSchoolYearId] = useState(initialSchoolYearId);
    const [month, setMonth] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function exportReport() {
        setMessage("");
        if (!schoolYearId) return setMessage("Please select a school year.");
        if (reportType === "monthly" && !month) return setMessage("Please select a month.");
        setLoading(true);
        try {
            const response = await fetch("/api/reports/attendance/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportType, schoolYearId, ...(reportType === "monthly" ? { month } : {}) }),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => null) as { error?: string } | null;
                throw new Error(result?.error || "The attendance report could not be generated.");
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            const disposition = response.headers.get("Content-Disposition");
            anchor.download = disposition?.match(/filename="([^"]+)"/)?.[1] ?? "ATKD_Attendance_Report.xlsx";
            anchor.href = url;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            setMessage("Your attendance report has been downloaded.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "The attendance report could not be generated.");
        } finally {
            setLoading(false);
        }
    }

    return <section className={`surface attendance-export${loading ? " is-generating" : ""}`} aria-busy={loading}>
        <div className="surface-header">
            <div><h2 className="surface-title">Attendance Export</h2><p className="surface-subtitle">Generate a summarized Excel report for player and coach attendance.</p></div>
            <span className="status-chip status-upcoming">.xlsx</span>
        </div>
        <div className="attendance-export-body">
            <fieldset className="attendance-export-types">
                <legend className="form-label">Report type</legend>
                <label><input type="radio" name="attendanceReportType" checked={reportType === "monthly"} onChange={() => setReportType("monthly")} /><span>Monthly Attendance</span></label>
                <label><input type="radio" name="attendanceReportType" checked={reportType === "overall"} onChange={() => setReportType("overall")} /><span>Overall School Year</span></label>
            </fieldset>
            <div className="attendance-export-fields">
                <div className="form-group">
                    <label className="form-label" htmlFor="attendance-school-year">School year</label>
                    <select id="attendance-school-year" className="form-select" value={schoolYearId} onChange={(event) => setSchoolYearId(event.target.value)}>
                        <option value="">Select a school year</option>
                        {schoolYears.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
                    </select>
                </div>
                {reportType === "monthly" && <div className="form-group">
                    <label className="form-label" htmlFor="attendance-month">Month</label>
                    <input id="attendance-month" className="form-input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                </div>}
            </div>
            <div className="attendance-export-footer">
                <p className={message.includes("downloaded") ? "attendance-export-success" : "form-error"} role="status" aria-live="polite">{message}</p>
                <button type="button" className="btn btn-primary" onClick={exportReport} disabled={loading || !schoolYearId || (reportType === "monthly" && !month)}>
                    {loading ? "Generating…" : "Export attendance"}
                </button>
            </div>
        </div>
        {loading && <div className="attendance-export-loader" role="status" aria-live="polite">
            <div className="attendance-loader-mark" aria-hidden="true"><span>ATKD</span><i /></div>
            <div className="attendance-loader-copy">
                <strong>Preparing your attendance report</strong>
                <span>Summarizing records and formatting the Excel workbook…</span>
                <div className="attendance-loader-track" aria-hidden="true"><i /></div>
            </div>
        </div>}
    </section>;
}
