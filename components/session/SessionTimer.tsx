"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SessionTimerProps {
  timeRemaining: number; // in milliseconds
  isExpiringSoon: boolean;
}

/**
 * Countdown timer component for session expiry
 * 
 * Displays time remaining in a human-readable format
 * and changes color when expiring soon.
 */
export function SessionTimer({ timeRemaining, isExpiringSoon }: SessionTimerProps) {
  const [displayTime, setDisplayTime] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRemainingRef = useRef<number>(timeRemaining);
  const lastDisplayRef = useRef<string>("");

  // Update ref when prop changes (but don't trigger re-render)
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeRemaining <= 0) {
      setDisplayTime("Expired");
      lastDisplayRef.current = "Expired";
      return;
    }

    const formatTime = (ms: number): string => {
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((ms % (1000 * 60)) / 1000);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    const updateDisplay = () => {
      const current = timeRemainingRef.current;
      
      if (current <= 0) {
        const expired = "Expired";
        if (lastDisplayRef.current !== expired) {
          setDisplayTime(expired);
          lastDisplayRef.current = expired;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const newDisplay = formatTime(current);
      
      // Only update if the display time actually changed
      if (lastDisplayRef.current !== newDisplay) {
        setDisplayTime(newDisplay);
        lastDisplayRef.current = newDisplay;
      }

      // Decrement the ref for next iteration
      timeRemainingRef.current = Math.max(0, current - 1000);
    };

    // Initial update
    const initialDisplay = formatTime(timeRemaining);
    setDisplayTime(initialDisplay);
    lastDisplayRef.current = initialDisplay;

    // Set up interval
    intervalRef.current = setInterval(updateDisplay, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Only re-run when timeRemaining changes by more than 1 second
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(timeRemaining / 1000)]);

  const progress = timeRemaining > 0 ? (timeRemaining / (24 * 60 * 60 * 1000)) * 100 : 0;

  return (
    <Card className={`bg-white ${isExpiringSoon ? "border-amber-300" : ""}`}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#8e8e93]">Time Remaining</p>
            <p
              className={`text-2xl font-bold ${
                isExpiringSoon ? "text-amber-600" : "text-[#7454f7]"
              }`}
            >
              {displayTime}
            </p>
          </div>
          <div className="w-full bg-[#f2f2f7] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isExpiringSoon ? "bg-amber-500" : "bg-[#7454f7]"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          {isExpiringSoon && (
            <p className="text-xs text-amber-600">
              Your session will expire soon. Consider extending it.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
