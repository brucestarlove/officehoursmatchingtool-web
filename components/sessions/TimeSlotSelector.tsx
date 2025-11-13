"use client";

import { Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import type { TimeSlot } from "@/types";

interface TimeSlotSelectorProps {
  availableSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  duration: number; // minutes
  onDurationChange: (duration: number) => void;
  timezone: string;
}

/**
 * Time slot selector component for booking flow
 */
export function TimeSlotSelector({
  availableSlots,
  selectedSlot,
  onSlotSelect,
  duration,
  onDurationChange,
  timezone,
}: TimeSlotSelectorProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter slots by duration
  const filteredSlots = availableSlots.filter((slot) => slot.duration >= duration);

  // Group slots by date
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="space-y-6">
      {/* Duration Selector */}
      <Card variant="default" className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Session Duration</h3>
        <div className="flex gap-2">
          {[30, 60].map((dur) => (
            <Button
              key={dur}
              variant={duration === dur ? "default" : "outline"}
              onClick={() => onDurationChange(dur)}
            >
              {dur} minutes
            </Button>
          ))}
        </div>
      </Card>

      {/* Calendar Widget */}
      <Card variant="default" className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select a Time</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{timezone}</span>
          </div>
        </div>

        {filteredSlots.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No available slots for {duration} minutes at this time
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date}>
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  {formatDate(date)}
                </h4>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;

                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => onSlotSelect(slot)}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? "border-cf-yellow-500 bg-cf-yellow-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-cf-teal-500 hover:bg-cf-teal-50"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(slot.startTime)}</span>
                        </div>
                        <Badge variant="accent" className="mt-1 text-xs">
                          Available
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

