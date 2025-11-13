"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button-cf";
import { exportData } from "@/lib/api/admin";
import { toast } from "sonner";
import type { DateRange } from "./DateRangeSelector";

export interface ExportButtonProps {
  type: "sessions" | "mentors" | "analytics";
  format?: "csv" | "json";
  filters?: Record<string, any>;
  dateRange?: DateRange;
  className?: string;
}

export function ExportButton({
  type,
  format = "csv",
  filters,
  dateRange,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportFilters = {
        ...filters,
        ...(dateRange && {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      };

      const blob = await exportData({
        type,
        format,
        filters: Object.keys(exportFilters).length > 0 ? exportFilters : undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export successful", {
        description: `Your ${type} data has been downloaded.`,
      });
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : "Failed to export data",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export {format.toUpperCase()}
        </>
      )}
    </Button>
  );
}

