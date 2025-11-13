"use client";

import Link from "next/link";
import { Calendar, Clock, Video, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUpcomingSessions } from "@/lib/hooks/useSessions";
import type { UpcomingSession } from "@/types";

interface UpcomingSessionsProps {
  limit?: number;
}

/**
 * Display upcoming sessions for dashboard
 */
export function UpcomingSessions({ limit = 5 }: UpcomingSessionsProps) {
  const { data: sessions, isLoading, error } = useUpcomingSessions();

  if (isLoading) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load sessions. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedSessions = sessions?.slice(0, limit) || [];

  if (displayedSessions.length === 0) {
    return (
      <Card variant="default">
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No upcoming sessions scheduled
          </p>
          <Link href="/match">
            <Button variant="default" className="w-full">
              Find a Mentor
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

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

  const nextSession = displayedSessions[0];

  return (
    <div className="space-y-4">
      {/* Next Session - Prominent Card */}
      {nextSession && (
        <Card variant="yellow-border" className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="accent">Next Session</Badge>
            <Link href={`/sessions/${nextSession.id}`}>
              <Button variant="ghost" size="sm">
                View
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {nextSession.mentor?.name || nextSession.mentee?.name || "Session"}
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(nextSession.startTime).date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {formatDateTime(nextSession.startTime).time} ({nextSession.duration} min)
              </span>
            </div>
            {nextSession.meetingType === "video" ? (
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
          {nextSession.goals && (
            <p className="mt-4 text-sm text-muted-foreground">{nextSession.goals}</p>
          )}
        </Card>
      )}

      {/* Other Upcoming Sessions */}
      {displayedSessions.length > 1 && (
        <Card variant="default">
          <CardHeader>
            <CardTitle>More Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedSessions.slice(1).map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {session.mentor?.name || session.mentee?.name || "Session"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(session.startTime).date} at{" "}
                        {formatDateTime(session.startTime).time}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
            {sessions && sessions.length > limit && (
              <Link href="/sessions" className="mt-4 block">
                <Button variant="outline" className="w-full">
                  View All Sessions
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

