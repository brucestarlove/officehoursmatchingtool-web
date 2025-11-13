/**
 * Session booking confirmation email template
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { SessionDetails } from "./components/SessionDetails";
import { getAppUrl } from "../client";

interface SessionConfirmationProps {
  sessionId: string;
  startTime: string;
  duration: number;
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
  mentorName: string;
  menteeName: string;
  recipientRole: "mentor" | "mentee";
}

export function SessionConfirmation({
  sessionId,
  startTime,
  duration,
  meetingType,
  meetingLink,
  goals,
  mentorName,
  menteeName,
  recipientRole,
}: SessionConfirmationProps) {
  const appUrl = getAppUrl();
  const sessionUrl = `${appUrl}/sessions/${sessionId}`;
  const otherParticipant = recipientRole === "mentor" ? menteeName : mentorName;

  return (
    <EmailLayout preview={`Your session with ${otherParticipant} has been confirmed!`}>
      <Text style={heading}>Session Confirmed!</Text>
      
      <Text style={paragraph}>
        Your session with <strong>{otherParticipant}</strong> has been successfully booked.
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

      <Text style={paragraph}>
        You&apos;ll receive a reminder 24 hours before the session, and another reminder 1 hour before.
      </Text>
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

