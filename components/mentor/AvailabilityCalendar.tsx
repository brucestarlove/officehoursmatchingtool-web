"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card-cf";
import { Button } from "@/components/ui/button-cf";
import { Badge } from "@/components/ui/badge-cf";
import type { TimeSlot } from "@/types";

interface AvailabilityCalendarProps {
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  timezone: string;
  onSlotSelect?: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
  onBookClick?: () => void;
}

/**
 * Calendar widget for displaying and selecting available time slots
 */
export function AvailabilityCalendar({
  availableSlots,
  bookedSlots,
  timezone,
  onSlotSelect,
  selectedSlot,
  onBookClick,
}: AvailabilityCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card variant="default" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Availability</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{timezone}</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={viewMode === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("month")}
        >
          Month
        </Button>
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("week")}
        >
          Week
        </Button>
      </div>

      {/* Book Session Button - Below Month/Week buttons */}
      {onBookClick && (
        <div className="mb-4">
          <Button variant="default" size="sm" onClick={onBookClick}>
            Book Session
          </Button>
        </div>
      )}

      {/* Available Slots List */}
      {availableSlots.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No available slots at this time
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, slots]) => (
            <div key={date}>
              <h4 className="mb-2 text-sm font-medium">{formatDate(date)}</h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startTime === slot.startTime;
                  const isBooked = bookedSlots.some(
                    (b) => b.startTime === slot.startTime
                  );

                  return (
                    <button
                      key={slot.startTime}
                      onClick={() => !isBooked && onSlotSelect?.(slot)}
                      disabled={isBooked}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-cf-yellow-500 bg-cf-yellow-50"
                          : isBooked
                          ? "border-gray-200 bg-gray-50 opacity-50"
                          : "border-gray-200 bg-white hover:border-cf-teal-500 hover:bg-cf-teal-50"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(slot.startTime)}</span>
                      </div>
                      {isBooked ? (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Booked
                        </Badge>
                      ) : (
                        <Badge variant="accent" className="mt-1 text-xs">
                          Available
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Session Button - Bottom of section */}
      {onBookClick && (
        <div className="mt-6 flex justify-center">
          <Button variant="default" size="lg" onClick={onBookClick}>
            Book Session
          </Button>
        </div>
      )}
    </Card>
  );
}

