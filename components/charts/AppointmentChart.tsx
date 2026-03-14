"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const data = [
  { name: "Mon", visits: 42 },
  { name: "Tue", visits: 56 },
  { name: "Wed", visits: 49 },
  { name: "Thu", visits: 62 },
  { name: "Fri", visits: 70 },
  { name: "Sat", visits: 31 },
  { name: "Sun", visits: 24 }
];

export function AppointmentChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          <Bar dataKey="visits" fill="#9EE6FF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
