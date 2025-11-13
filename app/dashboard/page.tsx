"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { UpcomingSessions } from "@/components/dashboard/UpcomingSessions";
import { MentorSuggestions } from "@/components/dashboard/MentorSuggestions";
import { MenteeSuggestions } from "@/components/dashboard/MenteeSuggestions";
import {
  SessionsThisMonthCard,
  AverageRatingCard,
  UtilizationRateCard,
} from "@/components/dashboard/StatsCard";
import { ProfileSidebar } from "@/components/dashboard/ProfileSidebar";
import Link from "next/link";
import { useSessions } from "@/lib/hooks/useSessions";
import { AlertCircle } from "lucide-react";

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
  
  // Check if user has created their profile (mentor/mentee record)
  const hasProfile = !!user?.profile;

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

        {/* Alert Banner - Profile Required */}
        {!isAdmin && !hasProfile && (
          <Card variant="yellow-border" className="p-4">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-cf-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-cf-yellow-900 mb-1">
                  Complete Your Profile to Get Started
                </h3>
                <p className="text-sm text-cf-yellow-800 mb-3">
                  Your profile is essential for using the platform. Create your {user?.role === "mentor" ? "mentor" : "mentee"} profile to start {user?.role === "mentor" ? "mentoring" : "finding mentors"} and booking sessions.
                </p>
                <Link href="/profile">
                  <Button variant="default" size="sm">
                    Create Your Profile!
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards - Mentor Only (show only if profile exists) */}
        {user?.role === "mentor" && hasProfile && (
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
          {!isAdmin && (
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Sessions - Only show if profile exists */}
              {hasProfile && <UpcomingSessions limit={5} />}
              
              {/* Mentor Suggestions - Mentee Only, show even without profile but with message */}
              {user?.role === "mentee" && <MentorSuggestions limit={3} hasProfile={hasProfile} />}
              
              {/* Mentee Suggestions - Mentor Only, show even without profile but with message */}
              {user?.role === "mentor" && <MenteeSuggestions limit={3} hasProfile={hasProfile} />}
            </div>
          )}

          {/* Right Column - Profile & Quick Actions */}
          <div className={`space-y-6 ${isAdmin ? "lg:col-span-3" : ""}`}>
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

            {/* Quick Actions - Hidden for Admin */}
            {!isAdmin && (
              <Card variant="default" className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  {user?.role === "mentee" && (
                    <Link href={hasProfile ? "/match" : "/profile"}>
                      <Button 
                        variant={hasProfile ? "default" : "secondary"} 
                        className="w-full"
                        disabled={!hasProfile}
                      >
                        {hasProfile ? "Find a Mentor" : "Create Profile to Find Mentors"}
                      </Button>
                    </Link>
                  )}
                  {user?.role === "mentor" && (
                    <Link href={hasProfile ? "/mentor/availability" : "/profile"}>
                      <Button 
                        variant={hasProfile ? "secondary" : "default"} 
                        className="w-full"
                        disabled={!hasProfile}
                      >
                        {hasProfile ? "Update Availability" : "Create Profile to Set Availability"}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
