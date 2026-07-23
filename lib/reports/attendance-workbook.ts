import ExcelJS from "exceljs";
import type { AttendanceReportData } from "./attendance";

function styleSheet(sheet: ExcelJS.Worksheet, widths: number[], percentageColumn?: number) {
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: "A1", to: `D${Math.max(1, sheet.rowCount)}` };
    sheet.columns.forEach((column, index) => {
        column.width = widths[index];
        column.alignment = { vertical: "middle", horizontal: index === 0 ? "left" : "right" };
    });
    sheet.getRow(1).height = 24;
    sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B397D" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
    });
    sheet.eachRow((row) => row.eachCell((cell) => {
        const side = { style: "thin" as const, color: { argb: "FFD7E1ED" } };
        cell.border = { top: side, left: side, bottom: side, right: side };
    }));
    if (percentageColumn) sheet.getColumn(percentageColumn).numFmt = "0.00%";
}

export async function createAttendanceWorkbook(data: AttendanceReportData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ADMU Taekwondo Performance Hub";
    workbook.created = new Date();
    const players = workbook.addWorksheet("Players");
    players.addRow(["Name", "Sessions Present", "Sessions Absent", "Attendance Rate"]);
    data.players.forEach((row) => players.addRow([row.name, row.sessionsPresent, row.sessionsAbsent, row.attendanceRate]));
    styleSheet(players, [34, 20, 20, 20], 4);
    const coaches = workbook.addWorksheet("Coaches");
    coaches.addRow(["Name", "Number of Sessions", "Avg Weekly Attendance", "Avg Monthly Attendance"]);
    data.coaches.forEach((row) => coaches.addRow([row.name, row.numberOfSessions, row.averageWeeklyAttendance, row.averageMonthlyAttendance]));
    styleSheet(coaches, [34, 20, 23, 24]);
    coaches.getColumn(3).numFmt = "0.00";
    coaches.getColumn(4).numFmt = "0.00";
    return workbook.xlsx.writeBuffer();
}

export function attendanceFilename(data: AttendanceReportData) {
    const safeSchoolYear = data.schoolYearName.replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
    if (data.reportType === "monthly" && data.month) {
        const [year, month] = data.month.split("-").map(Number);
        const label = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
        return `ATKD_Attendance_Monthly_${label}_${year}.xlsx`;
    }
    return `ATKD_Attendance_Overall_SY_${safeSchoolYear || "School-Year"}.xlsx`;
}
