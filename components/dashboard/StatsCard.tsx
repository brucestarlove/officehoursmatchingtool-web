"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { TrendingUp, Users, Star, Calendar } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: "default" | "teal-border" | "yellow-border" | "beige";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Statistics display card for dashboard
 */
export function StatsCard({
  title,
  value,
  icon,
  variant = "default",
  trend,
}: StatsCardProps) {
  return (
    <Card variant={variant}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon || <Calendar className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className={`mt-1 flex items-center text-xs ${
            trend.isPositive ? "text-cf-green-600" : "text-red-600"
          }`}>
            <TrendingUp className={`mr-1 h-3 w-3 ${!trend.isPositive ? "rotate-180" : ""}`} />
            <span>
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured stat cards
export function SessionsThisMonthCard({ count }: { count: number }) {
  return (
    <StatsCard
      title="Sessions This Month"
      value={count}
      icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      variant="default"
    />
  );
}

export function AverageRatingCard({ rating }: { rating: number }) {
  return (
    <StatsCard
      title="Average Rating"
      value={rating.toFixed(1)}
      icon={<Star className="h-4 w-4 text-muted-foreground" />}
      variant="yellow-border"
    />
  );
}

export function UtilizationRateCard({ rate }: { rate: number }) {
  return (
    <StatsCard
      title="Utilization Rate"
      value={`${rate}%`}
      icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      variant="teal-border"
    />
  );
}

