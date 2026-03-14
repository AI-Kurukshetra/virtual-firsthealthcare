"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const fallbackData = [
  { name: "Jan", revenue: 120000 },
  { name: "Feb", revenue: 142000 },
  { name: "Mar", revenue: 180000 },
  { name: "Apr", revenue: 210000 },
  { name: "May", revenue: 240000 },
  { name: "Jun", revenue: 280000 }
];

type RevenueChartProps = {
  data?: { name: string; revenue: number }[];
};

export function RevenueChart({ data = fallbackData }: RevenueChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            fill="url(#revenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
