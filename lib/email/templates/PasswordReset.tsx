/**
 * Password reset code email template
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { Button } from "./components/Button";
import { getAppUrl } from "../client";

interface PasswordResetProps {
  code: string;
  email: string;
  expiresInMinutes?: number;
}

export function PasswordReset({
  code,
  email,
  expiresInMinutes = 15,
}: PasswordResetProps) {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/forgot-password`;

  return (
    <EmailLayout preview={`Your password reset code is ${code}`}>
      <Text style={heading}>Password Reset Request</Text>
      
      <Text style={paragraph}>
        We received a request to reset your password for your CF Office Hours account.
      </Text>

      <Text style={paragraph}>
        Use the code below to reset your password:
      </Text>

      {/* Code Display */}
      <Section style={codeSection}>
        <Text style={codeText}>{code}</Text>
      </Section>

      <Text style={paragraph}>
        This code will expire in <strong>{expiresInMinutes} minutes</strong>.
      </Text>

      <Section style={buttonSection}>
        <Button href={resetUrl}>
          Go to Reset Page
        </Button>
      </Section>

      <Text style={warningText}>
        If you didn&apos;t request this password reset, please ignore this email. Your password will remain unchanged.
      </Text>

      <Text style={paragraph}>
        For security reasons, never share this code with anyone. CF Office Hours staff will never ask for your reset code.
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

const codeSection = {
  backgroundColor: "#f5f3f0", // CF beige-100
  border: "2px solid #00a88c", // CF teal-500
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const codeText = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#00a88c", // CF teal-500
  letterSpacing: "4px",
  margin: "0",
  fontFamily: "monospace",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  color: "#666666",
  backgroundColor: "#fff9e6", // CF yellow-50
  borderLeft: "4px solid #ffbd00", // CF yellow-500
  padding: "12px 16px",
  borderRadius: "4px",
  margin: "24px 0",
  lineHeight: "1.5",
};

