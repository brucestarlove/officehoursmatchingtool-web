"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, List, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { SearchBar } from "@/components/match/SearchBar";
import { FilterSidebar } from "@/components/match/FilterSidebar";
import { MentorGrid } from "@/components/match/MentorGrid";
import { EmptyState } from "@/components/match/EmptyState";
import { Button } from "@/components/ui/button-cf";
import { useMatchMentors } from "@/lib/hooks/useMentors";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { MatchFilters } from "@/types";

// Mock options - these would come from API in production
const EXPERTISE_OPTIONS = [
  "Fundraising",
  "Product Development",
  "Marketing",
  "Sales",
  "Operations",
  "Legal",
  "Finance",
  "HR",
  "Technology",
  "Design",
];

const INDUSTRY_OPTIONS = [
  "SaaS",
  "E-commerce",
  "Healthcare",
  "Fintech",
  "EdTech",
  "Consumer",
  "Enterprise",
  "Hardware",
];

const STAGE_OPTIONS = [
  "Idea",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B+",
  "Growth",
];

export default function MatchPage() {
  return (
    <ProtectedRoute>
      <MatchPageContent />
    </ProtectedRoute>
  );
}

function MatchPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MatchFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  // Only search if query or filters are provided
  const shouldSearch = searchQuery.trim().length > 0 || Object.keys(filters).length > 0;

  const {
    data: matchData,
    isLoading,
    error,
  } = useMatchMentors({
    query: searchQuery,
    filters,
  });

  const handleBookClick = (mentorId: string) => {
    router.push(`/sessions/book?mentorId=${mentorId}`);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold uppercase">
          Find a Mentor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search for mentors who can help with your goals
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="What do you need help with?"
          autoFocus
        />
      </div>

      {/* Filters and Results */}
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          expertiseOptions={EXPERTISE_OPTIONS}
          industryOptions={INDUSTRY_OPTIONS}
          stageOptions={STAGE_OPTIONS}
          isOpen={filterSidebarOpen}
          onToggle={() => setFilterSidebarOpen(!filterSidebarOpen)}
        />

        {/* Results */}
        <div className="flex-1">
          {/* Results Header */}
          {shouldSearch && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                {isLoading ? (
                  <span className="text-sm text-muted-foreground">Searching...</span>
                ) : matchData ? (
                  <span className="text-sm text-muted-foreground">
                    {matchData.totalCount} mentor{matchData.totalCount !== 1 ? "s" : ""} found
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              Failed to load mentors. Please try again.
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && matchData && (
            <>
              {matchData.mentors.length > 0 ? (
                <MentorGrid
                  mentors={matchData.mentors}
                  matchExplanations={matchData.matchExplanations}
                  onBookClick={handleBookClick}
                  showMatchReasons={true}
                  viewMode={viewMode}
                />
              ) : (
                <EmptyState onClearFilters={handleClearFilters} />
              )}
            </>
          )}

          {/* Initial State */}
          {!shouldSearch && !isLoading && (
            <EmptyState
              message="Start typing to search for mentors, or use the filters to browse."
              onClearFilters={undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

