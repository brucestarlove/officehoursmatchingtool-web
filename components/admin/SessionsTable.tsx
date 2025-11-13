"use client";

import * as React from "react";
import { useAdminSessions } from "@/lib/hooks/useAdmin";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { TableFilters, type FilterConfig } from "@/components/ui/TableFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/badge-cf";
import { format } from "date-fns";
import Link from "next/link";

export interface SessionsTableProps {
  className?: string;
}

export function SessionsTable({ className }: SessionsTableProps) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(25);
  const [sort, setSort] = React.useState("date");
  const [order, setOrder] = React.useState<"asc" | "desc">("desc");
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const { data, isLoading, error } = useAdminSessions({
    page,
    limit,
    sort,
    order,
    ...filters,
  });

  const handleSort = (key: string) => {
    if (sort === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(key);
      setOrder("desc");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value === undefined || value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      setPage(1); // Reset to first page on filter change
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const filterConfigs: FilterConfig[] = [
    {
      type: "select",
      key: "status",
      label: "Status",
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
        { value: "rescheduled", label: "Rescheduled" },
      ],
    },
    {
      type: "text",
      key: "mentorId",
      label: "Mentor ID",
      placeholder: "Enter mentor ID",
    },
    {
      type: "text",
      key: "menteeId",
      label: "Mentee ID",
      placeholder: "Enter mentee ID",
    },
    {
      type: "dateRange",
      key: "date",
      label: "Date Range",
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      case "scheduled":
        return "default";
      default:
        return "secondary";
    }
  };

  const columns: Column<any>[] = [
    {
      key: "startTime",
      header: "Date",
      sortable: true,
      accessor: (row) => format(new Date(row.startTime), "MMM d, yyyy h:mm a"),
    },
    {
      key: "mentor",
      header: "Mentor",
      accessor: (row) => row.mentor?.name || "Unknown",
    },
    {
      key: "mentee",
      header: "Mentee",
      accessor: (row) => row.mentee?.name || "Unknown",
    },
    {
      key: "duration",
      header: "Duration",
      accessor: (row) => `${row.duration} min`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      accessor: (row) => row.rating ? `${row.rating.toFixed(1)} ⭐` : "—",
    },
  ];

  if (error) {
    return <div className="text-red-500">Error loading sessions: {String(error)}</div>;
  }

  return (
    <div className={className}>
      <TableFilters
        filters={filterConfigs}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        className="mb-4"
      />
      <DataTable
        data={data?.sessions || []}
        columns={columns}
        sortKey={sort}
        sortOrder={order}
        onSort={handleSort}
        onRowClick={(row) => {
          window.location.href = `/sessions/${row.id}`;
        }}
        emptyMessage={isLoading ? "Loading..." : "No sessions found"}
      />
      {data && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          className="mt-4"
        />
      )}
    </div>
  );
}

