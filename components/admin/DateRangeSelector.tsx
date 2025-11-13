"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button-cf";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DateRangePreset = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  className?: string;
  syncWithUrl?: boolean;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  custom: "Custom",
};

function getPresetRange(preset: DateRangePreset): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };

    case "thisWeek": {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      return {
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }

    case "thisMonth": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }

    case "lastMonth": {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: startOfLastMonth.toISOString().split("T")[0],
        endDate: endOfLastMonth.toISOString().split("T")[0],
      };
    }

    default:
      return {
        startDate: "",
        endDate: "",
      };
  }
}

export function DateRangeSelector({
  value,
  onChange,
  presets = ["today", "thisWeek", "thisMonth", "lastMonth", "custom"],
  className,
  syncWithUrl = false,
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<DateRangePreset | null>(null);
  const [isCustom, setIsCustom] = React.useState(false);

  React.useEffect(() => {
    if (syncWithUrl && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const startDate = params.get("startDate");
      const endDate = params.get("endDate");
      if (startDate && endDate) {
        onChange({ startDate, endDate });
      }
    }
  }, [syncWithUrl, onChange]);

  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setIsCustom(true);
      setSelectedPreset(null);
    } else {
      setIsCustom(false);
      setSelectedPreset(preset);
      const range = getPresetRange(preset);
      onChange(range);

      if (syncWithUrl && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("startDate", range.startDate);
        url.searchParams.set("endDate", range.endDate);
        window.history.pushState({}, "", url.toString());
      }
    }
  };

  const handleCustomDateChange = (field: "startDate" | "endDate", date: string) => {
    const newRange = { ...value, [field]: date };
    onChange(newRange);

    if (syncWithUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("startDate", newRange.startDate);
      url.searchParams.set("endDate", newRange.endDate);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleClear = () => {
    const defaultRange = getPresetRange("thisMonth");
    onChange(defaultRange);
    setSelectedPreset(null);
    setIsCustom(false);

    if (syncWithUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("startDate");
      url.searchParams.delete("endDate");
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={selectedPreset === preset ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset)}
          >
            {PRESET_LABELS[preset]}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {(isCustom || selectedPreset === null) && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Input
            type="date"
            value={value.startDate}
            onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
            className="w-auto"
          />
          <span className="text-gray-500">to</span>
          <Input
            type="date"
            value={value.endDate}
            onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}

