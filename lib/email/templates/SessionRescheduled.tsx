/**
 * Session rescheduled notification email template
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { SessionDetails } from "./components/SessionDetails";
import { getAppUrl } from "../client";

interface SessionRescheduledProps {
  sessionId: string;
  startTime: string;
  duration: number;
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
  mentorName: string;
  menteeName: string;
  recipientRole: "mentor" | "mentee";
  oldStartTime?: string;
}

export function SessionRescheduled({
  sessionId,
  startTime,
  duration,
  meetingType,
  meetingLink,
  goals,
  mentorName,
  menteeName,
  recipientRole,
  oldStartTime,
}: SessionRescheduledProps) {
  const appUrl = getAppUrl();
  const sessionUrl = `${appUrl}/sessions/${sessionId}`;
  const otherParticipant = recipientRole === "mentor" ? menteeName : mentorName;

  return (
    <EmailLayout preview={`Your session with ${otherParticipant} has been rescheduled`}>
      <Text style={heading}>Session Rescheduled</Text>
      
      <Text style={paragraph}>
        Your session with <strong>{otherParticipant}</strong> has been rescheduled to a new time.
      </Text>

      {oldStartTime && (
        <Section style={infoBox}>
          <Text style={infoLabel}>Previous Time</Text>
          <Text style={infoValue}>
            {new Date(oldStartTime).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </Section>
      )}

      <Text style={paragraph}>
        <strong>New session details:</strong>
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
          View Updated Session
        </Button>
      </Section>

      {meetingType === "video" && meetingLink && (
        <Section style={buttonSection}>
          <Button href={meetingLink} variant="secondary">
            Join Meeting
          </Button>
        </Section>
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

const infoBox = {
  backgroundColor: "#fff9e6", // CF yellow-50
  borderLeft: "4px solid #ffbd00", // CF yellow-500
  padding: "16px",
  margin: "16px 0",
  borderRadius: "4px",
};

const infoLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const infoValue = {
  fontSize: "16px",
  color: "#000000",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

