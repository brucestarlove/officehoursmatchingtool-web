"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { MentorSuggestions } from "@/components/dashboard/MentorSuggestions";
import {
  SessionsThisMonthCard,
  AverageRatingCard,
  UtilizationRateCard,
} from "@/components/dashboard/StatsCard";
import Link from "next/link";
import { useSessions } from "@/lib/hooks/useSessions";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, signOut, isSigningOut } = useAuth();
  const { data: sessionsData } = useSessions({ status: "upcoming" });

  // Calculate stats (mock for now - would come from API)
  const sessionsThisMonth = sessionsData?.sessions.length || 0;
  const averageRating = user?.role === "mentor" ? 4.8 : undefined;
  const utilizationRate = user?.role === "mentor" ? 75 : undefined;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold uppercase">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="h-fit"
          >
            {isSigningOut ? "Logging out..." : "Logout"}
          </Button>
        </div>

        {/* Stats Cards - Mentor Only */}
        {user?.role === "mentor" && (
          <div className="grid gap-6 md:grid-cols-3">
            <SessionsThisMonthCard count={sessionsThisMonth} />
            {averageRating !== undefined && (
              <AverageRatingCard rating={averageRating} />
            )}
            {utilizationRate !== undefined && (
              <UtilizationRateCard rate={utilizationRate} />
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Upcoming Sessions */}
          <div className="lg:col-span-2">
            <UpcomingSessions limit={5} />
          </div>

          {/* Right Column - Quick Actions & Suggestions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="default" className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                {user?.role === "mentee" && (
                  <Link href="/match">
                    <Button variant="default" className="w-full">
                      Find a Mentor
                    </Button>
                  </Link>
                )}
                {user?.role === "mentor" && (
                  <Link href="/mentor/availability">
                    <Button variant="secondary" className="w-full">
                      Update Availability
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Mentor Suggestions - Mentee Only */}
            {user?.role === "mentee" && <MentorSuggestions limit={3} />}
          </div>
        </div>
      </div>
    </div>
  );
}

