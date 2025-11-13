"use client";

import * as React from "react";
import { useAnalytics } from "@/lib/hooks/useAdmin";
import { MetricsCard } from "./MetricsCard";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { PieChart } from "@/components/charts/PieChart";
import { DateRangeSelector, type DateRange } from "./DateRangeSelector";
import { SessionsTable } from "./SessionsTable";
import { MentorPerformanceTable } from "./MentorPerformanceTable";
import { ExportButton } from "./ExportButton";
import { Users, Calendar, Star, TrendingUp } from "lucide-react";

export interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    // Default to this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  });

  const { data, isLoading, error } = useAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    groupBy: "day",
  });

  if (error) {
    return <div className="text-red-500">Error loading analytics: {String(error)}</div>;
  }

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (!data) {
    return <div>No analytics data available</div>;
  }

  // Calculate trend for sessions this month vs last month
  const sessionsTrend =
    data.metrics.sessionsLastMonth > 0
      ? ((data.metrics.sessionsThisMonth - data.metrics.sessionsLastMonth) /
          data.metrics.sessionsLastMonth) *
        100
      : 0;

  // Prepare chart data
  const sessionsOverTimeData = data.trends.sessionsOverTime.map((item) => ({
    date: item.date,
    value: item.value,
  }));

  const utilizationData = data.trends.utilizationByMentor.slice(0, 10).map((m) => ({
    name: m.mentorName,
    value: m.utilizationRate,
  }));

  const feedbackData = data.trends.feedbackDistribution.map((item) => ({
    name: `${item.rating} Star${item.rating !== 1 ? "s" : ""}`,
    value: item.percentage,
    count: item.count,
  }));

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform health metrics and trends</p>
        </div>
        <ExportButton
          type="analytics"
          format="csv"
          dateRange={dateRange}
        />
      </div>

      <div className="mb-6">
        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          syncWithUrl
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricsCard
          title="Total Sessions"
          value={data.metrics.totalSessions}
          trend={{
            value: sessionsTrend,
            label: "vs last month",
          }}
          icon={<Calendar className="h-5 w-5" />}
        />
        <MetricsCard
          title="Utilization Rate"
          value={`${data.metrics.utilizationRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricsCard
          title="Average Feedback"
          value={`${data.metrics.averageFeedback.toFixed(1)} ⭐`}
          icon={<Star className="h-5 w-5" />}
        />
        <MetricsCard
          title="Active Users"
          value={`${data.metrics.activeMentors}M / ${data.metrics.activeMentees}E`}
          description={`${data.metrics.activeMentors} mentors, ${data.metrics.activeMentees} mentees`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LineChart
          data={sessionsOverTimeData}
          series={[{ dataKey: "value", name: "Sessions", color: "#00a88c" }]}
          title="Sessions Over Time"
          height={300}
        />
        <BarChart
          data={utilizationData}
          dataKey="value"
          name="Utilization Rate"
          title="Top 10 Mentors by Utilization"
          height={300}
        />
      </div>

      <div className="mb-6">
        <PieChart
          data={feedbackData}
          dataKey="value"
          nameKey="name"
          title="Feedback Distribution"
          height={300}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          <SessionsTable />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Mentor Performance</h2>
          <MentorPerformanceTable />
        </div>
      </div>
    </div>
  );
}

