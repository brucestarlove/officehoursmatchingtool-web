"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge-cf";

interface MatchExplanationBadgeProps {
  explanation: string;
  className?: string;
}

/**
 * Badge showing why a mentor was matched
 */
export function MatchExplanationBadge({
  explanation,
  className,
}: MatchExplanationBadgeProps) {
  return (
    <Badge
      variant="accent"
      className={`flex items-center gap-1.5 ${className || ""}`}
    >
      <Info className="h-3 w-3" />
      <span className="text-xs">{explanation}</span>
    </Badge>
  );
}

