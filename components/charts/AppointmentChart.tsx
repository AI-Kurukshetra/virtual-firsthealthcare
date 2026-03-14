"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const fallbackData = [
  { name: "Mon", visits: 42 },
  { name: "Tue", visits: 56 },
  { name: "Wed", visits: 49 },
  { name: "Thu", visits: 62 },
  { name: "Fri", visits: 70 },
  { name: "Sat", visits: 31 },
  { name: "Sun", visits: 24 }
];

type AppointmentChartProps = {
  data?: { name: string; visits: number }[];
};

export function AppointmentChart({ data = fallbackData }: AppointmentChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          <Bar dataKey="visits" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
