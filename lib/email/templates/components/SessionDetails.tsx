/**
 * Session details component for email templates
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { formatEmailDateTime, formatDuration } from "../../client";

interface SessionDetailsProps {
  startTime: string;
  duration: number;
  meetingType: "video" | "in-person";
  meetingLink?: string;
  goals?: string;
  mentorName?: string;
  menteeName?: string;
}

export function SessionDetails({
  startTime,
  duration,
  meetingType,
  meetingLink,
  goals,
  mentorName,
  menteeName,
}: SessionDetailsProps) {
  return (
    <Section style={detailsSection}>
      {/* Date & Time */}
      <Section style={detailRow}>
        <Text style={detailLabel}>Date & Time</Text>
        <Text style={detailValue}>{formatEmailDateTime(startTime)}</Text>
      </Section>

      {/* Duration */}
      <Section style={detailRow}>
        <Text style={detailLabel}>Duration</Text>
        <Text style={detailValue}>{formatDuration(duration)}</Text>
      </Section>

      {/* Meeting Type */}
      <Section style={detailRow}>
        <Text style={detailLabel}>Meeting Type</Text>
        <Text style={detailValue}>
          {meetingType === "video" ? "Video Call" : "In-Person"}
        </Text>
      </Section>

      {/* Meeting Link */}
      {meetingLink && meetingType === "video" && (
        <Section style={detailRow}>
          <Text style={detailLabel}>Meeting Link</Text>
          <Text style={detailValue}>
            <a href={meetingLink} style={linkStyle}>
              {meetingLink}
            </a>
          </Text>
        </Section>
      )}

      {/* Participants */}
      {mentorName && (
        <Section style={detailRow}>
          <Text style={detailLabel}>Mentor</Text>
          <Text style={detailValue}>{mentorName}</Text>
        </Section>
      )}

      {menteeName && (
        <Section style={detailRow}>
          <Text style={detailLabel}>Mentee</Text>
          <Text style={detailValue}>{menteeName}</Text>
        </Section>
      )}

      {/* Goals */}
      {goals && (
        <Section style={detailRow}>
          <Text style={detailLabel}>Session Goals</Text>
          <Text style={detailValue}>{goals}</Text>
        </Section>
      )}
    </Section>
  );
}

const detailsSection = {
  backgroundColor: "#faf9f7", // CF beige-50
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const detailRow = {
  marginBottom: "16px",
};

const detailLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const detailValue = {
  fontSize: "16px",
  color: "#000000",
  margin: "0",
  lineHeight: "1.5",
};

const linkStyle = {
  color: "#00a88c", // CF teal-500
  textDecoration: "underline",
};

