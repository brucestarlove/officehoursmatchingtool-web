"use client";

import Image from "next/image";
import Link from "next/link";
import { Target, Building2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { MatchExplanationBadge } from "./MatchExplanationBadge";
import type { Mentee } from "@/types";

interface MenteeCardProps {
  mentee: Mentee;
  matchExplanation?: string;
  onViewClick?: (menteeId: string) => void;
  showMatchReason?: boolean;
}

/**
 * Mentee card component with profile info, goals, and interests
 */
export function MenteeCard({
  mentee,
  matchExplanation,
  onViewClick,
  showMatchReason = false,
}: MenteeCardProps) {
  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick(mentee.id);
    }
  };

  return (
    <Card variant="default" className="flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardContent className="flex-1 p-6">
        {/* Header with photo and basic info */}
        <div className="mb-4 flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            {mentee.profilePhoto ? (
              <Image
                src={mentee.profilePhoto}
                alt={mentee.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cf-teal-100 text-cf-teal-800">
                <span className="text-xl font-semibold">
                  {mentee.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{mentee.name}</h3>
            {mentee.startupStage && (
              <p className="text-sm text-muted-foreground truncate">
                {mentee.startupStage}
              </p>
            )}
          </div>
        </div>

        {/* Match explanation */}
        {showMatchReason && matchExplanation && (
          <div className="mb-4">
            <MatchExplanationBadge explanation={matchExplanation} />
          </div>
        )}

        {/* Bio snippet */}
        {mentee.bio && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {mentee.bio}
          </p>
        )}

        {/* Goals */}
        {mentee.goals && mentee.goals.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Goals</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mentee.goals.slice(0, 3).map((goal, idx) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {goal}
                </Badge>
              ))}
              {mentee.goals.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentee.goals.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {mentee.interests && mentee.interests.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {mentee.interests.slice(0, 3).map((interest, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
            {mentee.interests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentee.interests.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        <Link href={`/mentees/${mentee.id}`} className="flex-1">
          <Button variant="outline" className="w-full" onClick={handleViewClick}>
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

