import { Card } from "@/components/ui/card-cf";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton loading state for mentor profile page
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card variant="default" className="p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <Skeleton variant="circular" className="h-32 w-32 flex-shrink-0" />

          {/* Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-5 w-36 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-28 mx-auto md:mx-0" />
            </div>

            {/* Social Links */}
            <div className="flex gap-4 justify-center md:justify-start">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      <Card variant="default" className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Expertise Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
      </Card>

      {/* Availability Calendar */}
      <Card variant="default" className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>

      {/* Reviews Section */}
      <Card variant="default" className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


