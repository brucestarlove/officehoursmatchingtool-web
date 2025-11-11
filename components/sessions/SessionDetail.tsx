"use client";

import { useState } from "react";
import { Calendar, Clock, Video, MapPin, User, Mail, X, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRescheduleSession, useCancelSession } from "@/lib/hooks/useSessions";
import type { Session } from "@/types";

interface SessionDetailProps {
  session: Session;
  onReschedule?: () => void;
}

/**
 * Full session detail page component
 */
export function SessionDetail({ session, onReschedule }: SessionDetailProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const rescheduleMutation = useRescheduleSession();
  const cancelMutation = useCancelSession();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(session.id);
      setShowCancelConfirm(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Details</h1>
          <div className="mt-2">{getStatusBadge()}</div>
        </div>
        {session.status === "scheduled" && (
          <div className="flex gap-2">
            {onReschedule && (
              <Button variant="outline" onClick={onReschedule}>
                <Edit className="mr-2 h-4 w-4" />
                Reschedule
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Session Info */}
      <Card variant="default" className="p-6">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(session.startTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">{session.duration} minutes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {session.meetingType === "video" ? (
              <Video className="h-5 w-5 text-muted-foreground" />
            ) : (
              <MapPin className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Meeting Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {session.meetingType}
              </p>
              {session.meetingLink && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-cf-teal-600 hover:underline"
                >
                  {session.meetingLink}
                </a>
              )}
            </div>
          </div>

          {session.goals && (
            <div>
              <p className="font-medium">Session Goals</p>
              <p className="mt-1 text-sm text-muted-foreground">{session.goals}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      <div className="grid gap-6 md:grid-cols-2">
        {session.mentor && (
          <Card variant="default" className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{session.mentor.name}</p>
              {session.mentor.title && (
                <p className="text-sm text-muted-foreground">{session.mentor.title}</p>
              )}
              {session.mentor.company && (
                <p className="text-sm text-muted-foreground">{session.mentor.company}</p>
              )}
            </CardContent>
          </Card>
        )}

        {session.mentee && (
          <Card variant="default" className="p-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mentee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{session.mentee.name}</p>
              {session.mentee.email && (
                <p className="text-sm text-muted-foreground">{session.mentee.email}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Join Meeting Button (if video and upcoming) */}
      {session.status === "scheduled" &&
        session.meetingType === "video" &&
        session.meetingLink && (
          <Card variant="yellow-border" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ready to join?</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to join the video call
                </p>
              </div>
              <Button variant="default" asChild>
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join Meeting
                </a>
              </Button>
            </div>
          </Card>
        )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card variant="default" className="w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold">Cancel Session</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to cancel this session? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Session
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Session"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

