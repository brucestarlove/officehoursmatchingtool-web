"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button-cf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-cf";
import { cn } from "@/lib/utils";

export interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onExport?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  onExport,
  isLoading,
  error,
}: ChartContainerProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    // Default export to PNG
    if (chartRef.current) {
      // Simple export - in production, use html2canvas or similar
      const svg = chartRef.current.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `${title || "chart"}-${Date.now()}.png`;
          link.href = pngUrl;
          link.click();
          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    }
  };

  return (
    <Card variant="beige" className={cn("w-full", className)}>
      {(title || onExport) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {onExport && (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div ref={chartRef} className="w-full">
          {error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cf-teal-500"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  );
}

