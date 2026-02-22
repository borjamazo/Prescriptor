"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HorizontalBarItem {
  name: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: HorizontalBarItem[];
  color?: string;
  label?: string;
  height?: number;
}

export function HorizontalBarChart({
  data,
  color = "#6366f1",
  label = "Usos",
  height = 300,
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
          }}
          cursor={{ fill: "#f1f5f9" }}
        />
        <Bar
          dataKey="value"
          name={label}
          fill={color}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
