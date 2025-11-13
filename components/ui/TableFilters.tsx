"use client";

import * as React from "react";
import { Input } from "./input";
import { Button } from "./button-cf";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  type: "text" | "select" | "date" | "dateRange";
  key: string;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface TableFiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

export function TableFilters({
  filters,
  values,
  onChange,
  onClear,
  className,
}: TableFiltersProps) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg", className)}>
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              <Input
                type="text"
                placeholder={filter.placeholder}
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full"
              />
            </div>
          );
        }

        if (filter.type === "select") {
          return (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              <select
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value || undefined)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow-500 focus-visible:ring-offset-2"
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (filter.type === "date") {
          return (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              <Input
                type="date"
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value || undefined)}
                className="w-full"
              />
            </div>
          );
        }

        if (filter.type === "dateRange") {
          return (
            <div key={filter.key} className="flex-1 min-w-[400px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={values[`${filter.key}Start`] || ""}
                  onChange={(e) => onChange(`${filter.key}Start`, e.target.value || undefined)}
                  className="flex-1"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  placeholder="End date"
                  value={values[`${filter.key}End`] || ""}
                  onChange={(e) => onChange(`${filter.key}End`, e.target.value || undefined)}
                  className="flex-1"
                />
              </div>
            </div>
          );
        }

        return null;
      })}

      {hasActiveFilters && (
        <div className="flex items-end">
          <Button variant="ghost" size="sm" onClick={onClear} className="h-10">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

