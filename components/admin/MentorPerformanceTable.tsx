"use client";

import * as React from "react";
import { useMentorPerformance } from "@/lib/hooks/useAdmin";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { format } from "date-fns";

export interface MentorPerformanceTableProps {
  className?: string;
}

export function MentorPerformanceTable({ className }: MentorPerformanceTableProps) {
  const [sort, setSort] = React.useState<"sessions" | "rating" | "utilization">("sessions");
  const [minSessions, setMinSessions] = React.useState<number | undefined>();
  const [minRating, setMinRating] = React.useState<number | undefined>();

  const { data, isLoading, error } = useMentorPerformance({
    sort,
    minSessions,
    minRating,
  });

  const handleSort = (key: string) => {
    if (key === "sessions" || key === "rating" || key === "utilization") {
      setSort(key);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "mentorName",
      header: "Mentor",
      accessor: (row) => (
        <Link
          href={`/mentors/${row.mentorId}`}
          className="text-cf-teal-600 hover:text-cf-teal-700 font-medium"
        >
          {row.mentorName}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      accessor: (row) => row.email,
    },
    {
      key: "company",
      header: "Company",
      accessor: (row) => row.company || "—",
    },
    {
      key: "sessionCount",
      header: "Sessions",
      sortable: true,
      accessor: (row) => row.sessionCount,
    },
    {
      key: "averageRating",
      header: "Avg Rating",
      sortable: true,
      accessor: (row) => row.averageRating > 0 ? `${row.averageRating.toFixed(1)} ⭐` : "—",
    },
    {
      key: "utilizationRate",
      header: "Utilization",
      sortable: true,
      accessor: (row) => `${row.utilizationRate.toFixed(1)}%`,
    },
    {
      key: "lastActiveDate",
      header: "Last Active",
      accessor: (row) =>
        row.lastActiveDate ? format(new Date(row.lastActiveDate), "MMM d, yyyy") : "—",
    },
  ];

  if (error) {
    return <div className="text-red-500">Error loading mentor performance: {String(error)}</div>;
  }

  return (
    <div className={className}>
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Sessions
          </label>
          <input
            type="number"
            value={minSessions || ""}
            onChange={(e) =>
              setMinSessions(e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Any"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={minRating || ""}
            onChange={(e) =>
              setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Any"
          />
        </div>
      </div>
      <DataTable
        data={data?.mentors || []}
        columns={columns}
        sortKey={sort}
        sortOrder="desc"
        onSort={handleSort}
        emptyMessage={isLoading ? "Loading..." : "No mentors found"}
      />
      {data?.statistics && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Mentors:</span>{" "}
              <span className="font-semibold">{data.statistics.totalMentors}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Sessions:</span>{" "}
              <span className="font-semibold">{data.statistics.averageSessions.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Rating:</span>{" "}
              <span className="font-semibold">{data.statistics.averageRating.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Utilization:</span>{" "}
              <span className="font-semibold">
                {data.statistics.averageUtilization.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

