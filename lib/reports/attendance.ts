import { prisma } from "@/lib/db";

export type AttendanceReportType = "monthly" | "overall";
export interface AttendanceExportFilters { reportType: AttendanceReportType; schoolYearId: string; month?: string }
export interface PlayerAttendanceSummary { name: string; sessionsPresent: number; sessionsAbsent: number; attendanceRate: number }
export interface CoachAttendanceSummary { name: string; numberOfSessions: number; averageWeeklyAttendance: number; averageMonthlyAttendance: number }
export interface AttendanceReportData {
    schoolYearName: string; reportType: AttendanceReportType; month?: string;
    players: PlayerAttendanceSummary[]; coaches: CoachAttendanceSummary[];
}

const MANILA_OFFSET = "+08:00";

function monthRange(month: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
    const [year, monthNumber] = month.split("-").map(Number);
    const nextYear = monthNumber === 12 ? year + 1 : year;
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    return {
        start: new Date(`${year}-${String(monthNumber).padStart(2, "0")}-01T00:00:00${MANILA_OFFSET}`),
        endExclusive: new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00${MANILA_OFFSET}`),
    };
}

function manilaDateParts(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
    return { year: get("year"), month: get("month"), day: get("day"), weekday: get("weekday") };
}

function activePeriodKeys(dates: Date[]) {
    const months = new Set<string>();
    const weeks = new Set<string>();
    for (const date of dates) {
        const parts = manilaDateParts(date);
        months.add(`${parts.year}-${parts.month}`);
        const localNoon = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00${MANILA_OFFSET}`);
        const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
        localNoon.setUTCDate(localNoon.getUTCDate() - (weekday === 0 ? 6 : weekday - 1));
        const monday = manilaDateParts(localNoon);
        weeks.add(`${monday.year}-${monday.month}-${monday.day}`);
    }
    return { activeWeeks: weeks.size, activeMonths: months.size };
}

export async function buildAttendanceReportData(filters: AttendanceExportFilters): Promise<AttendanceReportData> {
    const schoolYear = await prisma.semester.findUnique({ where: { id: filters.schoolYearId } });
    if (!schoolYear) throw new Error("SCHOOL_YEAR_NOT_FOUND");
    let start = schoolYear.startDate;
    let endExclusive = new Date(schoolYear.endDate.getTime() + 1);
    if (filters.reportType === "monthly") {
        const range = filters.month ? monthRange(filters.month) : null;
        if (!range) throw new Error("INVALID_MONTH");
        start = new Date(Math.max(start.getTime(), range.start.getTime()));
        endExclusive = new Date(Math.min(endExclusive.getTime(), range.endExclusive.getTime()));
        if (start >= endExclusive) throw new Error("MONTH_OUTSIDE_SCHOOL_YEAR");
    }
    endExclusive = new Date(Math.min(endExclusive.getTime(), Date.now() + 1));
    const sessions = await prisma.session.findMany({
        where: { sessionDate: { gte: start, lt: endExclusive } },
        select: {
            sessionDate: true,
            attendance: { select: { playerId: true, status: true } },
            coaches: { select: { coachId: true } },
        },
        orderBy: { sessionDate: "asc" },
    });
    if (!sessions.length) throw new Error("NO_ELIGIBLE_SESSIONS");

    const [players, coaches] = await Promise.all([
        prisma.player.findMany({ where: { isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
        prisma.coach.findMany({ where: { isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
    ]);
    const playerTotals = new Map<string, { present: number; absent: number; counted: number }>();
    const coachTotals = new Map<string, number>();
    for (const session of sessions) {
        for (const record of session.attendance) {
            const total = playerTotals.get(record.playerId) ?? { present: 0, absent: 0, counted: 0 };
            total.counted++;
            if (record.status === "PRESENT") total.present++;
            if (record.status === "ABSENT") total.absent++;
            playerTotals.set(record.playerId, total);
        }
        for (const assignment of session.coaches) coachTotals.set(assignment.coachId, (coachTotals.get(assignment.coachId) ?? 0) + 1);
    }
    const periods = activePeriodKeys(sessions.map((session) => session.sessionDate));
    return {
        schoolYearName: schoolYear.name, reportType: filters.reportType, month: filters.month,
        players: players.map((player) => {
            const total = playerTotals.get(player.id) ?? { present: 0, absent: 0, counted: 0 };
            return { name: player.fullName.trim() || "Unnamed player", sessionsPresent: total.present, sessionsAbsent: total.absent, attendanceRate: total.counted ? total.present / total.counted : 0 };
        }),
        coaches: coaches.map((coach) => {
            const count = coachTotals.get(coach.id) ?? 0;
            return {
                name: coach.fullName.trim() || "Unnamed coach", numberOfSessions: count,
                averageWeeklyAttendance: periods.activeWeeks ? count / periods.activeWeeks : 0,
                averageMonthlyAttendance: filters.reportType === "monthly" ? count : periods.activeMonths ? count / periods.activeMonths : 0,
            };
        }),
    };
}

export function validateAttendanceFilters(value: unknown): AttendanceExportFilters | null {
    if (!value || typeof value !== "object") return null;
    const input = value as Record<string, unknown>;
    if (input.reportType !== "monthly" && input.reportType !== "overall") return null;
    if (typeof input.schoolYearId !== "string" || !input.schoolYearId.trim()) return null;
    if (input.reportType === "monthly" && (typeof input.month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(input.month))) return null;
    return { reportType: input.reportType, schoolYearId: input.schoolYearId, ...(input.reportType === "monthly" ? { month: input.month as string } : {}) };
}
