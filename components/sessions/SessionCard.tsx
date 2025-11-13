"use client";

import Link from "next/link";
import { Calendar, Clock, Video, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import type { Session } from "@/types";

interface SessionCardProps {
  session: Session;
  showActions?: boolean;
  onReschedule?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

/**
 * Compact session card component
 */
export function SessionCard({
  session,
  showActions = false,
  onReschedule,
  onCancel,
}: SessionCardProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case "scheduled":
        return <Badge variant="accent">Upcoming</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "rescheduled":
        return <Badge variant="outline">Rescheduled</Badge>;
      default:
        return null;
    }
  };

  const dateTime = formatDateTime(session.startTime);

  return (
    <Card variant="default" className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {getStatusBadge()}
              {session.meetingType === "video" && session.meetingLink && (
                <Badge variant="outline">Video</Badge>
              )}
            </div>

            <h3 className="mb-2 text-lg font-semibold">
              {session.mentor?.name || session.mentee?.name || "Session"}
            </h3>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{dateTime.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {dateTime.time} ({session.duration} min)
                </span>
              </div>
              {session.meetingType === "video" ? (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>In-Person</span>
                </div>
              )}
            </div>

            {session.goals && (
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {session.goals}
              </p>
            )}
          </div>

          <Link href={`/sessions/${session.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Actions */}
        {showActions && session.status === "scheduled" && (
          <div className="mt-4 flex gap-2 border-t pt-4">
            {onReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(session.id)}
                className="flex-1"
              >
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(session.id)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

