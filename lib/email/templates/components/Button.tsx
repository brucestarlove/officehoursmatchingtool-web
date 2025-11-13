/**
 * Email button component with CF styling
 */

import { Button as EmailButton } from "@react-email/components";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <EmailButton
      href={href}
      style={{
        backgroundColor: isPrimary ? "#ffbd00" : "#00a88c", // CF yellow-500 or teal-500
        color: isPrimary ? "#000000" : "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        textDecoration: "none",
        display: "inline-block",
        fontWeight: "600",
        fontSize: "16px",
        textAlign: "center" as const,
        border: "none",
      }}
    >
      {children}
    </EmailButton>
  );
}

