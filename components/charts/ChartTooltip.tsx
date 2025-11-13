"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  formatter?: (value: any, name?: string) => [React.ReactNode, string];
  labelFormatter?: (label: any) => React.ReactNode;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[150px]",
        className
      )}
    >
      {label && (
        <div className="font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [value, name] = formatter
            ? formatter(entry.value, entry.name || entry.dataKey)
            : [entry.value, entry.name || entry.dataKey];

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {entry.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                )}
                <span className="text-sm text-gray-600">{name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

