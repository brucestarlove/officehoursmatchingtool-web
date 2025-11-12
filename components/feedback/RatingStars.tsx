"use client";

import { useState, useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Interactive star rating component (1-5 stars)
 * Supports hover states, click handlers, and keyboard navigation
 * Uses CF yellow star styling
 */
export function RatingStars({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
  className,
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const displayRating = hoveredRating ?? value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, rating: number) => {
    if (readonly) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(rating);
    } else if (event.key === "ArrowRight" && rating < 5) {
      event.preventDefault();
      const nextStar = containerRef.current?.querySelector(
        `[data-rating="${rating + 1}"]`
      ) as HTMLElement;
      nextStar?.focus();
    } else if (event.key === "ArrowLeft" && rating > 1) {
      event.preventDefault();
      const prevStar = containerRef.current?.querySelector(
        `[data-rating="${rating - 1}"]`
      ) as HTMLElement;
      prevStar?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("flex items-center gap-1", className)}
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Rating: ${value} out of 5 stars` : "Rating"}
      aria-valuenow={readonly ? value : undefined}
      aria-valuemin={readonly ? 1 : undefined}
      aria-valuemax={readonly ? 5 : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        const isInteractive = !readonly && onChange;

        return (
          <button
            key={star}
            type="button"
            data-rating={star}
            className={cn(
              "transition-all focus:outline-none focus:ring-2 focus:ring-cf-yellow-500 focus:ring-offset-2 rounded",
              isInteractive && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => isInteractive && setHoveredRating(star)}
            onMouseLeave={() => isInteractive && setHoveredRating(null)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            tabIndex={isInteractive ? 0 : -1}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-cf-yellow-500 text-cf-yellow-500"
                  : "fill-gray-200 text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}


