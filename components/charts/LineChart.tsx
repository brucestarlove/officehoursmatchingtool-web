"use client";

import * as React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";

export interface LineChartData {
  date: string;
  value: number;
  label?: string;
  [key: string]: any;
}

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
}

export interface LineChartProps {
  data: LineChartData[];
  series: LineChartSeries[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

const CF_COLORS = {
  teal: "#00a88c",
  yellow: "#ffbd00",
  green: "#4caf50",
  red: "#f44336",
};

export function LineChart({
  data,
  series,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  const defaultColors = [CF_COLORS.teal, CF_COLORS.yellow, CF_COLORS.green, CF_COLORS.red];

  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: "#6b7280" }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: "#6b7280" }}
          />
          <ChartTooltip />
          {showLegend && <Legend />}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color || defaultColors[index % defaultColors.length]}
              strokeWidth={s.strokeWidth || 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

