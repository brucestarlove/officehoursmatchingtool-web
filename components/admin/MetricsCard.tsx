"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { cn } from "@/lib/utils";

export interface MetricsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  sparkline?: Array<{ date: string; value: number }>;
}

export function MetricsCard({
  title,
  value,
  trend,
  description,
  icon,
  className,
  sparkline,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "text-gray-600";
    if (trend.value > 0) return "text-green-600";
    if (trend.value < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card variant="beige" className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && <div className="text-cf-teal-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs", getTrendColor())}>
            {getTrendIcon()}
            <span>
              {trend.value > 0 ? "+" : ""}
              {trend.value.toFixed(1)}% {trend.label}
            </span>
          </div>
        )}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-4 h-12">
            {/* Simple sparkline visualization */}
            <svg width="100%" height="48" className="overflow-visible">
              <polyline
                points={sparkline
                  .map((point, index) => {
                    const x = (index / (sparkline.length - 1)) * 100;
                    const maxValue = Math.max(...sparkline.map((p) => p.value));
                    const y = 48 - (point.value / maxValue) * 40;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#00a88c"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

