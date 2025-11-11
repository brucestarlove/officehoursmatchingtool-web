"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { Card } from "@/components/ui/card-cf";
import type { MatchFilters } from "@/types";

interface FilterSidebarProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  expertiseOptions?: string[];
  industryOptions?: string[];
  stageOptions?: string[];
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * Collapsible filter sidebar for mentor search
 */
export function FilterSidebar({
  filters,
  onFiltersChange,
  expertiseOptions = [],
  industryOptions = [],
  stageOptions = [],
  isOpen = true,
  onToggle,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<MatchFilters>(filters);

  const updateFilter = (key: keyof MatchFilters, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const toggleExpertise = (expertise: string) => {
    const current = localFilters.expertise || [];
    const updated = current.includes(expertise)
      ? current.filter((e) => e !== expertise)
      : [...current, expertise];
    updateFilter("expertise", updated.length > 0 ? updated : undefined);
  };

  const clearFilters = () => {
    const cleared: MatchFilters = {};
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const activeFilterCount =
    (localFilters.expertise?.length || 0) +
    (localFilters.industry ? 1 : 0) +
    (localFilters.stage ? 1 : 0) +
    (localFilters.availability ? 1 : 0);

  const content = (
    <Card variant="default" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Badge variant="accent">{activeFilterCount}</Badge>
        )}
      </div>

      {/* Expertise Areas */}
      {expertiseOptions.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Expertise Areas</label>
          <div className="flex flex-wrap gap-2">
            {expertiseOptions.map((expertise) => (
              <Badge
                key={expertise}
                variant={
                  localFilters.expertise?.includes(expertise) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => toggleExpertise(expertise)}
              >
                {expertise}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Industry */}
      {industryOptions.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Industry</label>
          <select
            value={localFilters.industry || ""}
            onChange={(e) =>
              updateFilter("industry", e.target.value || undefined)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Industries</option>
            {industryOptions.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Startup Stage */}
      {stageOptions.length > 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Startup Stage</label>
          <select
            value={localFilters.stage || ""}
            onChange={(e) => updateFilter("stage", e.target.value || undefined)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Stages</option>
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Availability */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Availability</label>
        <div className="space-y-2">
          {[
            { value: "this-week", label: "This Week" },
            { value: "next-week", label: "Next Week" },
            { value: "anytime", label: "Anytime" },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={localFilters.availability === option.value}
                onChange={(e) =>
                  updateFilter("availability", e.target.value as any)
                }
                className="h-4 w-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Card>
  );

  // Mobile: drawer
  if (onToggle) {
    return (
      <>
        {/* Mobile toggle button */}
        <Button
          variant="outline"
          className="md:hidden"
          onClick={onToggle}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="accent" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={onToggle} />
            <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={onToggle}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {content}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: sidebar
  return <aside className="w-64 flex-shrink-0">{content}</aside>;
}

