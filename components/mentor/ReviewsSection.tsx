"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import type { Review } from "@/types";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Reviews and ratings section for mentor profile
 */
export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
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

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="mt-4 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-8 text-sm">{rating}</span>
                <Star className="h-3 w-3 fill-cf-yellow-500 text-cf-yellow-500" />
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-cf-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">
                  {count}
                </span>
              </div>
            ))}
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
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  {review.menteeName && (
                    <span className="text-sm font-medium">{review.menteeName}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}
              {review.outcomeTags && review.outcomeTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {review.outcomeTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-cf-teal-100 px-2 py-0.5 text-xs text-cf-teal-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {reviews.length > 3 && (
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
          )}
        </div>
      )}
    </Card>
  );
}

