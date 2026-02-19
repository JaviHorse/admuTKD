"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface AttendanceTrendData {
    date: string;
    attendance: number;
}

interface AttendanceBreakdown {
    present: number;
    late: number;
    absent: number;
    excused: number;
}

interface DashboardChartsProps {
    attendanceTrend: AttendanceTrendData[];
    breakdown: AttendanceBreakdown;
}

export default function DashboardCharts({ attendanceTrend, breakdown }: DashboardChartsProps) {
    const breakdownData = [
        { name: "Present", value: breakdown.present, fill: "#22c55e" },
        { name: "Late", value: breakdown.late, fill: "#f59e0b" },
        { name: "Absent", value: breakdown.absent, fill: "#ef4444" },
        { name: "Excused", value: breakdown.excused, fill: "#94a3b8" },
    ];

    return (
        <div className="grid-2" style={{ marginBottom: 28 }}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Attendance Trend</div>
                </div>

                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceTrend}>
                            <defs>
                                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2f7dff" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#2f7dff" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" />

                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.45)"
                                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                stroke="rgba(255,255,255,0.45)"
                                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                                formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Attendance"]}
                                contentStyle={{
                                    background: "rgba(10,16,32,0.95)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "12px",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                                    color: "white",
                                }}
                                labelStyle={{
                                    fontWeight: 700,
                                    marginBottom: 6,
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="attendance"
                                stroke="url(#attendanceGradient)"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "#0b0f19",
                                }}
                                activeDot={{
                                    r: 6,
                                    stroke: "#2f7dff",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Attendance Breakdown</div>
                </div>

                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={breakdownData}>
                            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" />

                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.45)"
                                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                stroke="rgba(255,255,255,0.45)"
                                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                                contentStyle={{
                                    background: "rgba(10,16,32,0.95)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "12px",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                                    color: "white",
                                }}
                                labelStyle={{
                                    fontWeight: 700,
                                    marginBottom: 6,
                                }}
                            />

                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {breakdownData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
