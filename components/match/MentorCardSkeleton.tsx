import { Card } from "@/components/ui/card-cf";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge-cf";

/**
 * Skeleton loading state for mentor card
 */
export function MentorCardSkeleton() {
  return (
    <Card variant="default" className="p-6">
      <div className="flex gap-4">
        {/* Avatar */}
        <Skeleton variant="circular" className="h-16 w-16 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Name and Title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}


