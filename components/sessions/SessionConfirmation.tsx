"use client";

import { CheckCircle2, Calendar, Download, Mail } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import Link from "next/link";
import type { Session, Mentor } from "@/types";

interface SessionConfirmationProps {
  session: Session;
  mentor?: Mentor;
  calendarEventUrl?: string;
}

/**
 * Confirmation step showing success message and next steps
 */
export function SessionConfirmation({
  session,
  mentor,
  calendarEventUrl,
}: SessionConfirmationProps) {
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

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card variant="yellow-border" className="p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-cf-green-600" />
        <h2 className="mt-4 text-2xl font-bold">Session Booked Successfully!</h2>
        <p className="mt-2 text-muted-foreground">
          Your session has been confirmed. You&apos;ll receive a confirmation email shortly.
        </p>
      </Card>

      {/* Session Details */}
      <Card variant="default" className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Session Details</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(session.startTime)}
              </p>
            </div>
          </div>

          {mentor && (
            <div>
              <p className="font-medium">Mentor</p>
              <p className="text-sm text-muted-foreground">{mentor.name}</p>
            </div>
          )}

          <div>
            <p className="font-medium">Duration</p>
            <p className="text-sm text-muted-foreground">{session.duration} minutes</p>
          </div>

          <div>
            <p className="font-medium">Meeting Type</p>
            <p className="text-sm text-muted-foreground capitalize">
              {session.meetingType}
            </p>
          </div>

          {session.meetingLink && (
            <div>
              <p className="font-medium">Meeting Link</p>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cf-teal-600 hover:underline"
              >
                {session.meetingLink}
              </a>
            </div>
          )}

          {session.goals && (
            <div>
              <p className="font-medium">Session Goals</p>
              <p className="text-sm text-muted-foreground">{session.goals}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {calendarEventUrl && (
          <Button variant="outline" className="flex-1" asChild>
            <a href={calendarEventUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download Calendar Invite
            </a>
          </Button>
        )}

        <Button variant="default" className="flex-1" asChild>
          <Link href={`/sessions/${session.id}`}>
            View Session Details
          </Link>
        </Button>
      </div>

      {/* Email Confirmation Notice */}
      <Card variant="beige" className="p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Confirmation Email Sent</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your email for session details and calendar invite.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

