import { auth } from "@/auth";
import { buildAttendanceReportData, validateAttendanceFilters } from "@/lib/reports/attendance";
import { attendanceFilename, createAttendanceWorkbook } from "@/lib/reports/attendance-workbook";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);
    if (!session?.user && !cookieStore.has("guest_access")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const filters = validateAttendanceFilters(await request.json());
        if (!filters) return Response.json({ error: "Please complete all required report filters." }, { status: 400 });
        const data = await buildAttendanceReportData(filters);
        const buffer = await createAttendanceWorkbook(data);
        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${attendanceFilename(data)}"`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("Attendance export failed", error);
        const code = error instanceof Error ? error.message : "";
        const known: Record<string, [number, string]> = {
            NO_ELIGIBLE_SESSIONS: [404, "No eligible attendance sessions were found for the selected period."],
            SCHOOL_YEAR_NOT_FOUND: [404, "The selected school year could not be found."],
            MONTH_OUTSIDE_SCHOOL_YEAR: [400, "The selected month is outside this school year."],
            INVALID_MONTH: [400, "Please select a valid month."],
        };
        const [status, message] = known[code] ?? [500, "The attendance report could not be generated. Please try again."];
        return Response.json({ error: message }, { status });
    }
}
