/**
 * Email service client using Resend
 * Handles email sending, template rendering, and error handling
 */

import { Resend } from "resend";
import { render } from "@react-email/render";
import { logger } from "@/lib/utils/logger";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn("RESEND_API_KEY not configured, skipping email send", {
        to: options.to,
        subject: options.subject,
      });
      return;
    }

    // Render React email component to HTML
    const html = await render(options.react);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: options.from || FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html,
    });

    if (error) {
      logger.error("Failed to send email", error, {
        to: options.to,
        subject: options.subject,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.info("Email sent successfully", {
      emailId: data?.id,
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error("Error sending email", error, {
      to: options.to,
      subject: options.subject,
    });
    // Don't throw - email failures shouldn't break the app
    // Log error but allow the request to continue
  }
}

/**
 * Get the base app URL for email links
 */
export function getAppUrl(): string {
  return APP_URL;
}

/**
 * Format date/time for email display
 */
export function formatEmailDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format duration for email display
 */
export function formatDuration(minutes: number): string {
  if (minutes === 30) return "30 minutes";
  if (minutes === 60) return "1 hour";
  return `${minutes} minutes`;
}

