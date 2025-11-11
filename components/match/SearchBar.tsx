"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  debounceMs?: number;
}

/**
 * Large, prominent search input with debouncing and recent searches
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "What do you need help with?",
  autoFocus = true,
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localValue, debounceMs, onChange]);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSearch = (searchValue: string) => {
    if (searchValue.trim()) {
      // Add to recent searches (max 5)
      const updated = [
        searchValue.trim(),
        ...recentSearches.filter((s) => s !== searchValue.trim()),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
    setLocalValue(searchValue);
    setShowRecent(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            setShowRecent(true);
          }}
          onFocus={() => setShowRecent(true)}
          onBlur={() => {
            // Delay to allow clicking on recent searches
            setTimeout(() => setShowRecent(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(localValue);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-14 pl-12 pr-4 text-lg"
        />
      </div>

      {/* Recent searches dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow-lg">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Recent Searches
            </p>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearch(search)}
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

