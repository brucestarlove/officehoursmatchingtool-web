"use client";

import { SearchX } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";

interface EmptyStateProps {
  message?: string;
  onClearFilters?: () => void;
}

/**
 * Empty state when no mentors are found
 */
export function EmptyState({
  message = "No mentors found. Try adjusting your filters.",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <Card variant="beige" className="py-12 text-center">
      <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No Results</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onClearFilters && (
        <Button
          variant="outline"
          className="mt-6"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </Card>
  );
}

