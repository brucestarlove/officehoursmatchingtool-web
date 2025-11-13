"use client";

import { MentorCard } from "./MentorCard";
import type { Mentor, MatchResponse } from "@/types";

interface MentorGridProps {
  mentors: Mentor[];
  matchExplanations?: MatchResponse["matchExplanations"];
  onBookClick?: (mentorId: string) => void;
  showMatchReasons?: boolean;
  viewMode?: "grid" | "list";
}

/**
 * Grid/list layout for displaying mentor cards
 */
export function MentorGrid({
  mentors,
  matchExplanations = {},
  onBookClick,
  showMatchReasons = false,
  viewMode = "grid",
}: MentorGridProps) {
  if (mentors.length === 0) {
    return null;
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            matchExplanation={matchExplanations[mentor.id]}
            onBookClick={onBookClick}
            showMatchReason={showMatchReasons}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.id}
          mentor={mentor}
          matchExplanation={matchExplanations[mentor.id]}
          onBookClick={onBookClick}
          showMatchReason={showMatchReasons}
        />
      ))}
    </div>
  );
}

