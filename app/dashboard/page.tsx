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
import { ProfileSidebar } from "@/components/dashboard/ProfileSidebar";
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

  // Check if user is admin or PM
  const isAdmin = user?.role === "admin" || user?.role === "pm";

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

        {/* Admin Quick Links - Prominent Section */}
        {isAdmin && (
          <Card variant="teal-border" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-cf-teal-700">Admin Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor platform health and manage sessions
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/admin/analytics">
                <Card variant="beige" className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    View platform metrics, trends, and feedback distribution
                  </p>
                </Card>
              </Link>
              <Link href="/admin/sessions">
                <Card variant="beige" className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <h3 className="font-semibold text-gray-900 mb-2">Sessions</h3>
                  <p className="text-sm text-gray-600">
                    Manage all sessions, filter, sort, and export data
                  </p>
                </Card>
              </Link>
              <Link href="/admin/utilization">
                <Card variant="beige" className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <h3 className="font-semibold text-gray-900 mb-2">Utilization</h3>
                  <p className="text-sm text-gray-600">
                    Track mentor utilization rates and engagement
                  </p>
                </Card>
              </Link>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingSessions limit={5} />
            
            {/* Mentor Suggestions - Mentee Only */}
            {user?.role === "mentee" && <MentorSuggestions limit={3} />}
          </div>

          {/* Right Column - Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Sidebar */}
            <ProfileSidebar />

            {/* Admin Navigation */}
            {isAdmin && (
              <Card variant="teal-border" className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-cf-teal-700">Admin Tools</h3>
                <div className="space-y-2">
                  <Link href="/admin/analytics">
                    <Button variant="secondary" className="w-full">
                      Analytics Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/sessions">
                    <Button variant="secondary" className="w-full">
                      Session Management
                    </Button>
                  </Link>
                  <Link href="/admin/utilization">
                    <Button variant="secondary" className="w-full">
                      Mentor Utilization
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
