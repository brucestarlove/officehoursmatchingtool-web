import { requireAdmin } from "@/lib/auth/server";
import { SessionsTable } from "@/components/admin/SessionsTable";
import { ExportButton } from "@/components/admin/ExportButton";

export default async function AdminSessionsPage() {
  // Require admin access
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-1">View and manage all sessions</p>
        </div>
        <ExportButton type="sessions" format="csv" />
      </div>
      <SessionsTable />
    </div>
  );
}

