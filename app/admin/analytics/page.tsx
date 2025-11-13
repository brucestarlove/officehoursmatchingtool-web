import { requireAdmin } from "@/lib/auth/server";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default async function AdminAnalyticsPage() {
  // Require admin access
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard />
    </div>
  );
}

