/**
 * Session cancellation notification email template
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { SessionDetails } from "./components/SessionDetails";
import { getAppUrl } from "../client";

interface SessionCancelledProps {
  sessionId: string;
  startTime: string;
  duration: number;
  meetingType: "video" | "in-person";
  goals?: string;
  mentorName: string;
  menteeName: string;
  recipientRole: "mentor" | "mentee";
  cancelledBy: "mentor" | "mentee";
}

export function SessionCancelled({
  sessionId,
  startTime,
  duration,
  meetingType,
  goals,
  mentorName,
  menteeName,
  recipientRole,
  cancelledBy,
}: SessionCancelledProps) {
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard`;
  const otherParticipant = recipientRole === "mentor" ? menteeName : mentorName;
  const wasCancelledByMe = cancelledBy === recipientRole;

  return (
    <EmailLayout preview={`Session with ${otherParticipant} has been cancelled`}>
      <Text style={heading}>Session Cancelled</Text>
      
      {wasCancelledByMe ? (
        <Text style={paragraph}>
          You have cancelled your session with <strong>{otherParticipant}</strong>.
        </Text>
      ) : (
        <Text style={paragraph}>
          Your session with <strong>{otherParticipant}</strong> has been cancelled.
        </Text>
      )}

      <Text style={paragraph}>
        <strong>Cancelled session details:</strong>
      </Text>

      <SessionDetails
        startTime={startTime}
        duration={duration}
        meetingType={meetingType}
        goals={goals}
        mentorName={mentorName}
        menteeName={menteeName}
      />

      <Section style={buttonSection}>
        <Button href={dashboardUrl}>
          View Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        If you&apos;d like to book a new session, you can browse available mentors from your dashboard.
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

