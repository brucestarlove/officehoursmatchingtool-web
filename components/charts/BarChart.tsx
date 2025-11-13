"use client";

import * as React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import { ChartTooltip } from "./ChartTooltip";

export interface BarChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface BarChartProps {
  data: BarChartData[];
  dataKey: string;
  name: string;
  title?: string;
  description?: string;
  height?: number;
  horizontal?: boolean;
  color?: string | ((value: number) => string);
  showGrid?: boolean;
  showLegend?: boolean;
  onBarClick?: (data: BarChartData) => void;
  className?: string;
}

const CF_COLORS = {
  teal: "#00a88c",
  yellow: "#ffbd00",
  green: "#4caf50",
  red: "#f44336",
};

function getColorForValue(value: number, thresholds?: { high: number; medium: number }): string {
  const defaultThresholds = { high: 70, medium: 20 };
  const thresh = thresholds || defaultThresholds;

  if (value >= thresh.high) {
    return CF_COLORS.green;
  } else if (value >= thresh.medium) {
    return CF_COLORS.yellow;
  } else {
    return CF_COLORS.red;
  }
}

export function BarChart({
  data,
  dataKey,
  name,
  title,
  description,
  height = 300,
  horizontal = true,
  color,
  showGrid = true,
  showLegend = false,
  onBarClick,
  className,
}: BarChartProps) {
  const getBarColor = (entry: BarChartData) => {
    if (typeof color === "function") {
      return color(entry.value);
    }
    if (typeof color === "string") {
      return color;
    }
    return getColorForValue(entry.value);
  };

  return (
    <ChartContainer title={title} description={description} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {horizontal ? (
            <>
              <XAxis type="number" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                width={150}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 12 }} />
            </>
          )}
          <ChartTooltip />
          {showLegend && <Legend />}
          <Bar
            dataKey={dataKey}
            name={name}
            fill={CF_COLORS.teal}
            onClick={onBarClick ? (_, entry: any) => onBarClick(entry as BarChartData) : undefined}
            cursor={onBarClick ? "pointer" : "default"}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

