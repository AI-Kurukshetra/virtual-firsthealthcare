"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const data = [
  { name: "Jan", revenue: 120000 },
  { name: "Feb", revenue: 142000 },
  { name: "Mar", revenue: 180000 },
  { name: "Apr", revenue: 210000 },
  { name: "May", revenue: 240000 },
  { name: "Jun", revenue: 280000 }
];

export function RevenueChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B9CFF" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#5B9CFF" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
          <YAxis stroke="rgba(255,255,255,0.3)" />
          <Tooltip
            contentStyle={{
              background: "rgba(17,17,24,0.9)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white"
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#5B9CFF"
            fill="url(#revenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
