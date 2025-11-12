"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import type { Review, MentorStats } from "@/types";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
  stats?: MentorStats; // Optional stats for past session topics
}

/**
 * Reviews and ratings section for mentor profile
 */
export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
  stats,
}: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-cf-yellow-500 text-cf-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
        : 0,
  }));

  return (
    <Card variant="default" className="p-6">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Reviews</h3>
        {averageRating !== undefined && reviewCount !== undefined && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviewCount} review{reviewCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Rating Distribution Chart */}
        {reviews.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              Rating Distribution
            </h4>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-8 text-sm font-medium">{rating}</span>
                <Star className="h-3 w-3 fill-cf-yellow-500 text-cf-yellow-500" />
                <div className="flex-1">
                  <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cf-yellow-400 to-cf-yellow-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs font-medium text-gray-600">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Past Session Topics */}
        {stats && stats.pastSessionTopics && stats.pastSessionTopics.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              Common Session Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.pastSessionTopics.slice(0, 8).map((topic, index) => (
                <Badge
                  key={topic}
                  variant="default"
                  className="text-xs"
                >
                  {topic}
                </Badge>
              ))}
              {stats.pastSessionTopics.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{stats.pastSessionTopics.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}

          {reviews.length > 3 && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show All Reviews ({reviews.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

