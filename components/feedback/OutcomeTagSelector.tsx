"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge-cf";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OutcomeTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  predefinedTags?: string[];
  maxTags?: number;
  className?: string;
}

const DEFAULT_PREDEFINED_TAGS = [
  "Got funding advice",
  "Networked",
  "Technical help",
  "Product strategy",
  "Marketing advice",
  "Legal guidance",
  "Business model",
  "Team building",
];

/**
 * Multi-select tag component with predefined tags and custom tag input
 * Uses CF badge styling
 */
export function OutcomeTagSelector({
  selectedTags,
  onChange,
  predefinedTags = DEFAULT_PREDEFINED_TAGS,
  maxTags = 10,
  className,
}: OutcomeTagSelectorProps) {
  const [customTagInput, setCustomTagInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag]);
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTagInput.trim();
    if (
      trimmedTag &&
      !selectedTags.includes(trimmedTag) &&
      selectedTags.length < maxTags
    ) {
      onChange([...selectedTags, trimmedTag]);
      setCustomTagInput("");
      setShowCustomInput(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    } else if (e.key === "Escape") {
      setShowCustomInput(false);
      setCustomTagInput("");
    }
  };

  const availablePredefinedTags = predefinedTags.filter(
    (tag) => !selectedTags.includes(tag)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="flex items-center gap-1.5 pr-1.5"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="rounded-full p-0.5 hover:bg-cf-teal-200 focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Predefined Tags */}
      {availablePredefinedTags.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select outcomes:
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePredefinedTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-cf-teal-50 hover:border-cf-teal-300"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Tag Input */}
      {selectedTags.length < maxTags && (
        <div>
          {showCustomInput ? (
            <div className="flex gap-2">
              <Input
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter custom tag..."
                className="flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
                className="rounded-md bg-cf-teal-500 px-4 py-2 text-white hover:bg-cf-teal-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomTagInput("");
                }}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-cf-teal-300 hover:bg-cf-teal-50 hover:text-cf-teal-700 focus:outline-none focus:ring-2 focus:ring-cf-teal-500"
            >
              <Plus className="h-4 w-4" />
              Add custom tag
            </button>
          )}
        </div>
      )}

      {selectedTags.length >= maxTags && (
        <p className="text-xs text-gray-500">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  );
}


