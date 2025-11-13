"use client";

import * as React from "react";
import { useUtilization } from "@/lib/hooks/useAdmin";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { MetricsCard } from "./MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";
import { AlertCircle } from "lucide-react";

export interface UtilizationDashboardProps {
  className?: string;
}

export function UtilizationDashboard({ className }: UtilizationDashboardProps) {
  const { data, isLoading, error } = useUtilization();

  if (error) {
    return <div className="text-red-500">Error loading utilization data: {String(error)}</div>;
  }

  if (isLoading) {
    return <div>Loading utilization data...</div>;
  }

  if (!data) {
    return <div>No utilization data available</div>;
  }

  // Prepare data for charts
  const utilizationChartData = data.utilizationByMentor
    .slice(0, 10) // Top 10 mentors
    .map((m) => ({
      name: m.mentorName,
      value: m.utilizationRate,
    }));

  const trendData = data.utilizationTrends.map((t) => ({
    date: t.date,
    value: t.value,
  }));

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricsCard
          title="Overall Utilization"
          value={`${data.overallUtilizationRate.toFixed(1)}%`}
          description={`${data.totalBookedHours.toFixed(1)}h / ${data.totalAvailableHours.toFixed(1)}h`}
        />
        <MetricsCard
          title="High Utilization Mentors"
          value={data.engagementDistribution.high}
          description="≥70% utilization"
        />
        <MetricsCard
          title="Low Utilization Alerts"
          value={data.lowUtilizationAlerts.length}
          description="<20% utilization"
        />
      </div>

      {data.lowUtilizationAlerts.length > 0 && (
        <Card variant="beige" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-cf-yellow-500" />
              Low Utilization Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowUtilizationAlerts.map((alert) => (
                <div
                  key={alert.mentorId}
                  className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                >
                  <span className="font-medium">{alert.mentorName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {alert.utilizationRate.toFixed(1)}% utilization
                    </span>
                    <span className="text-sm text-gray-600">
                      {alert.sessionCount} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.recommendations.length > 0 && (
        <Card variant="beige" className="mb-6">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart
          data={utilizationChartData}
          dataKey="value"
          name="Utilization Rate"
          title="Top 10 Mentors by Utilization"
          height={400}
        />
        <LineChart
          data={trendData}
          series={[{ dataKey: "value", name: "Sessions", color: "#00a88c" }]}
          title="Utilization Trends Over Time"
          height={400}
        />
      </div>

      <Card variant="beige">
        <CardHeader>
          <CardTitle>Utilization Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.engagementDistribution.high}
              </div>
              <div className="text-sm text-gray-600">High (≥70%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.engagementDistribution.medium}
              </div>
              <div className="text-sm text-gray-600">Medium (20-70%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.engagementDistribution.low}
              </div>
              <div className="text-sm text-gray-600">Low (<20%)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

