/**
 * Base email layout component with CF branding
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Link,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with CF branding */}
          <Section style={header}>
            <Text style={logoText}>CF Office Hours</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            {preview && (
              <Text style={previewText}>{preview}</Text>
            )}
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from CF Office Hours Matching Tool.
            </Text>
            <Text style={footerText}>
              <Link href={appUrl} style={footerLink}>
                Visit the platform
              </Link>
              {" • "}
              <Link href={`${appUrl}/profile`} style={footerLink}>
                Manage preferences
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} CF Office Hours. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#faf9f7", // CF beige-50
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "12px",
  overflow: "hidden",
};

const header = {
  backgroundColor: "#00a88c", // CF teal-500
  padding: "32px 24px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "0.5px",
};

const content = {
  padding: "32px 24px",
  backgroundColor: "#ffffff",
};

const previewText = {
  fontSize: "14px",
  color: "#666666",
  marginBottom: "16px",
  fontStyle: "italic",
};

const footer = {
  backgroundColor: "#f5f3f0", // CF beige-100
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#666666",
  margin: "4px 0",
  lineHeight: "1.5",
};

const footerLink = {
  color: "#00a88c", // CF teal-500
  textDecoration: "underline",
};

const footerCopyright = {
  fontSize: "11px",
  color: "#999999",
  marginTop: "16px",
  marginBottom: "0",
};

