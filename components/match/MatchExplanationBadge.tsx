"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge-cf";
import { cn } from "@/lib/utils";

interface MatchExplanationBadgeProps {
  explanation: string;
  className?: string;
  maxLength?: number; // Truncate at this length, show expandable tooltip
}

/**
 * Badge showing why a mentor was matched
 * Expandable tooltip on click/hover for full explanation
 */
export function MatchExplanationBadge({
  explanation,
  className,
  maxLength = 60,
}: MatchExplanationBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = explanation.length > maxLength;
  const displayText = shouldTruncate && !isExpanded
    ? `${explanation.substring(0, maxLength)}...`
    : explanation;

  if (!shouldTruncate) {
    // Simple badge if no truncation needed
    return (
      <Badge
        variant="accent"
        className={cn("flex items-center gap-1.5", className)}
      >
        <Info className="h-3 w-3" />
        <span className="text-xs">{explanation}</span>
      </Badge>
    );
  }

  return (
    <div className="relative">
      <Badge
        variant="accent"
        className={cn(
          "flex cursor-pointer items-center gap-1.5 transition-colors hover:bg-cf-yellow-200",
          className
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        role="button"
        tabIndex={0}
        aria-label="Match explanation - click to expand"
      >
        <Info className="h-3 w-3" />
        <span className="text-xs">{displayText}</span>
        {shouldTruncate && (
          <span className="ml-1">
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </span>
        )}
      </Badge>

      {/* Expanded tooltip */}
      {isExpanded && (
        <div
          className="absolute left-0 top-full z-50 mt-2 max-w-xs rounded-lg border-2 border-cf-teal-200 bg-white p-3 shadow-lg"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="mb-1 flex items-center gap-2">
            <Info className="h-4 w-4 text-cf-teal-600" />
            <span className="text-sm font-semibold text-gray-900">
              Why this mentor?
            </span>
          </div>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}

