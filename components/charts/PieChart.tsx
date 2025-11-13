"use client";

import * as React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";

export interface PieChartData {
  name: string;
  value: number;
  count?: number;
  percentage?: number;
}

export interface PieChartProps {
  data: PieChartData[];
  dataKey?: string;
  nameKey?: string;
  title?: string;
  description?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showPercentage?: boolean;
  className?: string;
}

const CF_COLORS = [
  "#00a88c", // teal
  "#ffbd00", // yellow
  "#4caf50", // green
  "#f44336", // red
  "#2196f3", // blue
  "#9c27b0", // purple
];

const DEFAULT_COLORS = [
  "#00a88c",
  "#ffbd00",
  "#4caf50",
  "#f44336",
  "#2196f3",
  "#9c27b0",
];

export function PieChart({
  data,
  dataKey = "value",
  nameKey = "name",
  title,
  description,
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  showPercentage = true,
  className,
}: PieChartProps) {
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (!showPercentage || percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value} ({entry.payload.count || entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          {showLegend && <Legend content={renderLegend} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

