import { requireAdmin } from "@/lib/auth/server";
import { UtilizationDashboard } from "@/components/admin/UtilizationDashboard";

export default async function AdminUtilizationPage() {
  // Require admin access
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Utilization</h1>
        <p className="text-gray-600 mt-1">Track mentor utilization and engagement</p>
      </div>
      <UtilizationDashboard />
    </div>
  );
}

