"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const data = [
  { name: "Week 1", patients: 120 },
  { name: "Week 2", patients: 180 },
  { name: "Week 3", patients: 240 },
  { name: "Week 4", patients: 320 }
];

export function PatientGrowthChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="patients"
            stroke="#5B9CFF"
            strokeWidth={2}
            dot={{ r: 3, fill: "#9EE6FF" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
