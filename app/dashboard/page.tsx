"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card variant="default">
            <h3 className="mb-2 text-lg font-semibold">Your Profile</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {user?.role === "mentor"
                ? "Manage your mentor profile and availability"
                : "Complete your mentee profile to get better matches"}
            </p>
            <Link href="/profile">
              <Button variant="secondary" className="w-full">
                View Profile
              </Button>
            </Link>
          </Card>

          {user?.role === "mentee" && (
            <Card variant="yellow-border">
              <h3 className="mb-2 text-lg font-semibold">Find a Mentor</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Search for mentors who can help with your goals
              </p>
              <Link href="/match">
                <Button variant="default" className="w-full">
                  Search Mentors
                </Button>
              </Link>
            </Card>
          )}

          {user?.role === "mentor" && (
            <Card variant="teal-border">
              <h3 className="mb-2 text-lg font-semibold">Availability</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Set your availability for office hours
              </p>
              <Link href="/mentor/availability">
                <Button variant="secondary" className="w-full">
                  Manage Availability
                </Button>
              </Link>
            </Card>
          )}

          <Card variant="beige">
            <h3 className="mb-2 text-lg font-semibold">Sessions</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              View your upcoming and past sessions
            </p>
            <Link href="/sessions">
              <Button variant="outline" className="w-full">
                View Sessions
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

