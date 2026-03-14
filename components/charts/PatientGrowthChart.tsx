"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const fallbackData = [
  { name: "Week 1", patients: 120 },
  { name: "Week 2", patients: 180 },
  { name: "Week 3", patients: 240 },
  { name: "Week 4", patients: 320 }
];

type PatientGrowthChartProps = {
  data?: { name: string; patients: number }[];
};

export function PatientGrowthChart({ data = fallbackData }: PatientGrowthChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" stroke="hsl(var(--border))" />
          <YAxis stroke="hsl(var(--border))" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))"
            }}
          />
          <Line
            type="monotone"
            dataKey="patients"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--accent))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
