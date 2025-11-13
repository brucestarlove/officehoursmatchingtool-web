"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./button-cf";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (rowId: string, selected: boolean) => void;
  getRowId?: (row: T) => string;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortKey,
  sortOrder,
  onSort,
  onRowClick,
  selectedRows,
  onRowSelect,
  getRowId,
  className,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleRowSelect = (e: React.MouseEvent, row: T) => {
    e.stopPropagation();
    if (onRowSelect && getRowId) {
      const rowId = getRowId(row);
      onRowSelect(rowId, !selectedRows?.has(rowId));
    }
  };

  return (
    <div className={cn("rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {onRowSelect && getRowId && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows?.size === data.length && data.length > 0}
                    onChange={(e) => {
                      data.forEach((row) => {
                        if (onRowSelect && getRowId) {
                          onRowSelect(getRowId(row), e.target.checked);
                        }
                      });
                    }}
                    className="rounded border-gray-300 text-cf-teal-500 focus:ring-cf-teal-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      <span className="flex items-center gap-2">
                        {column.header}
                        {sortKey === column.key ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    </Button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onRowSelect ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId ? getRowId(row) : String(index);
                const isSelected = selectedRows?.has(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => handleRowClick(row)}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      isSelected && "bg-cf-teal-50",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {onRowSelect && getRowId && (
                      <td className="px-4 py-3" onClick={handleRowSelect}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onRowSelect(rowId, e.target.checked);
                          }}
                          className="rounded border-gray-300 text-cf-teal-500 focus:ring-cf-teal-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3 text-sm text-gray-900", column.className)}
                      >
                        {column.accessor
                          ? column.accessor(row)
                          : (row[column.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

