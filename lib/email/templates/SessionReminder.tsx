/**
 * Session reminder email template (24h or 1h before)
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { SessionDetails } from "./components/SessionDetails";
import { getAppUrl } from "../client";

interface SessionReminderProps {
  sessionId: string;
  startTime: string;
  duration: number;
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
  mentorName: string;
  menteeName: string;
  recipientRole: "mentor" | "mentee";
  hoursUntil: number; // 24 or 1
}

export function SessionReminder({
  sessionId,
  startTime,
  duration,
  meetingType,
  meetingLink,
  goals,
  mentorName,
  menteeName,
  recipientRole,
  hoursUntil,
}: SessionReminderProps) {
  const appUrl = getAppUrl();
  const sessionUrl = `${appUrl}/sessions/${sessionId}`;
  const otherParticipant = recipientRole === "mentor" ? menteeName : mentorName;
  const timeText = hoursUntil === 24 ? "24 hours" : "1 hour";

  return (
    <EmailLayout preview={`Reminder: Your session with ${otherParticipant} starts in ${timeText}`}>
      <Text style={heading}>Session Reminder</Text>
      
      <Text style={paragraph}>
        This is a reminder that your session with <strong>{otherParticipant}</strong> starts in <strong>{timeText}</strong>.
      </Text>

      <SessionDetails
        startTime={startTime}
        duration={duration}
        meetingType={meetingType}
        meetingLink={meetingLink}
        goals={goals}
        mentorName={mentorName}
        menteeName={menteeName}
      />

      <Section style={buttonSection}>
        <Button href={sessionUrl}>
          View Session Details
        </Button>
      </Section>

      {meetingType === "video" && meetingLink && (
        <Section style={buttonSection}>
          <Button href={meetingLink} variant="secondary">
            Join Meeting
          </Button>
        </Section>
      )}

      {hoursUntil === 1 && (
        <Text style={urgentText}>
          ⏰ Your session starts in 1 hour. Please make sure you&apos;re ready to join!
        </Text>
      )}
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#000000",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "16px",
  color: "#333333",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const urgentText = {
  fontSize: "16px",
  color: "#ffbd00", // CF yellow-500
  fontWeight: "600",
  backgroundColor: "#fff9e6", // CF yellow-50
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0 0 0",
  textAlign: "center" as const,
};

