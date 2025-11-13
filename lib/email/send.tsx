/**
 * Email sending helper functions
 * Convenience functions for sending specific email types
 */

import * as React from "react";
import { sendEmail } from "./client";
import { SessionConfirmation } from "./templates/SessionConfirmation";
import { SessionReminder } from "./templates/SessionReminder";
import { SessionRescheduled } from "./templates/SessionRescheduled";
import { SessionCancelled } from "./templates/SessionCancelled";
import type { Session } from "@/types";

/**
 * Send session booking confirmation emails to both mentor and mentee
 */
export async function sendSessionConfirmationEmails(session: Session): Promise<void> {
  if (!session.mentor || !session.mentee) {
    return;
  }

  const promises = [];

  // Send to mentor
  if (session.mentor.email) {
    promises.push(
      sendEmail({
        to: session.mentor.email,
        subject: `Session Confirmed: Meeting with ${session.mentee.name}`,
        react: (
          <SessionConfirmation
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentor"
          />
        ),
      })
    );
  }

  // Send to mentee
  if (session.mentee.email) {
    promises.push(
      sendEmail({
        to: session.mentee.email,
        subject: `Session Confirmed: Meeting with ${session.mentor.name}`,
        react: (
          <SessionConfirmation
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentee"
          />
        ),
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Send session reminder emails to both mentor and mentee
 */
export async function sendSessionReminderEmails(
  session: Session,
  hoursUntil: 24 | 1
): Promise<void> {
  if (!session.mentor || !session.mentee) {
    return;
  }

  const promises = [];

  // Send to mentor
  if (session.mentor.email) {
    promises.push(
      sendEmail({
        to: session.mentor.email,
        subject: `Reminder: Session with ${session.mentee.name} in ${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}`,
        react: (
          <SessionReminder
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentor"
            hoursUntil={hoursUntil}
          />
        ),
      })
    );
  }

  // Send to mentee
  if (session.mentee.email) {
    promises.push(
      sendEmail({
        to: session.mentee.email,
        subject: `Reminder: Session with ${session.mentor.name} in ${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}`,
        react: (
          <SessionReminder
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentee"
            hoursUntil={hoursUntil}
          />
        ),
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Send session rescheduled emails to both mentor and mentee
 */
export async function sendSessionRescheduledEmails(
  session: Session,
  oldStartTime?: string
): Promise<void> {
  if (!session.mentor || !session.mentee) {
    return;
  }

  const promises = [];

  // Send to mentor
  if (session.mentor.email) {
    promises.push(
      sendEmail({
        to: session.mentor.email,
        subject: `Session Rescheduled: Meeting with ${session.mentee.name}`,
        react: (
          <SessionRescheduled
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor!.name}
            menteeName={session.mentee.name}
            recipientRole="mentor"
            oldStartTime={oldStartTime}
          />
        ),
      })
    );
  }

  // Send to mentee
  if (session.mentee.email) {
    promises.push(
      sendEmail({
        to: session.mentee.email,
        subject: `Session Rescheduled: Meeting with ${session.mentor.name}`,
        react: (
          <SessionRescheduled
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            meetingLink={session.meetingLink}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentee"
            oldStartTime={oldStartTime}
          />
        ),
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Send session cancellation emails to both mentor and mentee
 */
export async function sendSessionCancelledEmails(
  session: Session,
  cancelledBy: "mentor" | "mentee"
): Promise<void> {
  if (!session.mentor || !session.mentee) {
    return;
  }

  const promises = [];

  // Send to mentor
  if (session.mentor.email) {
    promises.push(
      sendEmail({
        to: session.mentor.email,
        subject: `Session Cancelled: Meeting with ${session.mentee.name}`,
        react: (
          <SessionCancelled
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentor"
            cancelledBy={cancelledBy}
          />
        ),
      })
    );
  }

  // Send to mentee
  if (session.mentee.email) {
    promises.push(
      sendEmail({
        to: session.mentee.email,
        subject: `Session Cancelled: Meeting with ${session.mentor.name}`,
        react: (
          <SessionCancelled
            sessionId={session.id}
            startTime={session.startTime}
            duration={session.duration}
            meetingType={session.meetingType}
            goals={session.goals}
            mentorName={session.mentor.name}
            menteeName={session.mentee.name}
            recipientRole="mentee"
            cancelledBy={cancelledBy}
          />
        ),
      })
    );
  }

  await Promise.allSettled(promises);
}

