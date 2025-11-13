"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Label } from "@/components/ui/label";
import { RatingStars } from "./RatingStars";
import { OutcomeTagSelector } from "./OutcomeTagSelector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { logger } from "@/lib/utils/logger";
import type { FeedbackSubmission } from "@/types";

interface FeedbackFormProps {
  onSubmit: (data: FeedbackSubmission) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<FeedbackSubmission>;
  className?: string;
}

const MAX_COMMENT_LENGTH = 500;

/**
 * Main feedback form component
 * Integrates RatingStars and OutcomeTagSelector
 * Includes comment textarea with character count and validation
 */
export function FeedbackForm({
  onSubmit,
  isLoading = false,
  initialData,
  className,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [comment, setComment] = useState<string>(initialData?.comment || "");
  const [outcomeTags, setOutcomeTags] = useState<string[]>(
    initialData?.outcomeTags || []
  );
  const [errors, setErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};
    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (comment.length > MAX_COMMENT_LENGTH) {
      newErrors.comment = `Comment must be ${MAX_COMMENT_LENGTH} characters or less`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        rating,
        comment: comment.trim() || undefined,
        outcomeTags: outcomeTags.length > 0 ? outcomeTags : undefined,
      });
    } catch (error) {
      // Error handling is done by parent component
      logger.error("Feedback submission error", error);
    }
  };

  return (
    <Card variant="default" className={className}>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Rating Section */}
        <div>
          <Label htmlFor="rating" className="mb-3 block text-base font-semibold">
            How would you rate this session? *
          </Label>
          <RatingStars
            value={rating}
            onChange={setRating}
            size="lg"
            className="justify-center md:justify-start"
          />
          {errors.rating && (
            <p className="mt-2 text-sm text-cf-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <Label htmlFor="comment" className="mb-2 block text-base font-semibold">
            Additional Comments
          </Label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience or any specific feedback..."
            rows={5}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cf-teal-500 focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {comment.length} / {MAX_COMMENT_LENGTH} characters
            </p>
            {errors.comment && (
              <p className="text-xs text-cf-red-600">{errors.comment}</p>
            )}
          </div>
        </div>

        {/* Outcome Tags Section */}
        <div>
          <Label className="mb-2 block text-base font-semibold">
            What did you get out of this session?
          </Label>
          <p className="mb-3 text-sm text-gray-600">
            Select all that apply or add your own tags
          </p>
          <OutcomeTagSelector
            selectedTags={outcomeTags}
            onChange={setOutcomeTags}
            maxTags={10}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="default"
            disabled={isLoading || rating === 0}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
