import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { SessionProvider } from "@/lib/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CF Office Hours Matching Tool",
  description: "AI-Powered Mentor-Mentee Matching Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interDisplay.variable} font-sans`}>
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-right" />
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

