"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DonutDataPoint {
  label: string;
  value: number;
}

interface DonutChartProps {
  data: DonutDataPoint[];
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];

export function DonutChart({
  data,
  height = 280,
  colors = DEFAULT_COLORS,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
