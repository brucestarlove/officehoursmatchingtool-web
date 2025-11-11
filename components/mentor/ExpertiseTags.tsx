"use client";

import { Badge } from "@/components/ui/badge-cf";

interface ExpertiseTagsProps {
  expertise: string[];
  className?: string;
}

/**
 * Display expertise areas as a tag cloud
 */
export function ExpertiseTags({ expertise, className }: ExpertiseTagsProps) {
  if (!expertise || expertise.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className || ""}`}>
      {expertise.map((exp) => (
        <Badge key={exp} variant="default" className="text-sm">
          {exp}
        </Badge>
      ))}
    </div>
  );
}

