"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";
import type { Review } from "@/types";

interface FeedbackCardProps {
  review: Review;
  className?: string;
}

/**
 * Display feedback card showing rating, comment, tags, and date
 * Used in ReviewsSection
 */
export function FeedbackCard({ review, className }: FeedbackCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-cf-yellow-500 text-cf-yellow-500"
                : "fill-gray-200 text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card variant="default" className={className}>
      <div className="space-y-3 p-4">
        {/* Header with rating and date */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {renderStars(review.rating)}
            {review.menteeName && (
              <span className="text-sm font-medium text-gray-900">
                {review.menteeName}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-gray-700">{review.comment}</p>
        )}

        {/* Outcome Tags */}
        {review.outcomeTags && review.outcomeTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.outcomeTags.map((tag) => (
              <Badge key={tag} variant="default" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}


