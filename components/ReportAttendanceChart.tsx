"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export default function ReportAttendanceChart({ data }: { data: { name: string; rate: number }[] }) {
    return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 18, right: 22 }}>
        <CartesianGrid stroke="#e7ecf3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: "#7a889b", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={112} tick={{ fill: "#40516a", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Attendance"]} contentStyle={{ background: "white", border: "1px solid #dfe6ef", borderRadius: 10, fontSize: 11 }} />
        <ReferenceLine x={75} stroke="#d49a10" strokeDasharray="4 4" label={{ value: "75% target", fill: "#9b710c", fontSize: 9, position: "insideTopRight" }} />
        <Bar dataKey="rate" radius={[0, 5, 5, 0]} barSize={12}>{data.map((item) => <Cell key={item.name} fill={item.rate < 75 ? "#e06a5c" : "#1873d3"} />)}</Bar>
    </BarChart></ResponsiveContainer>;
}
