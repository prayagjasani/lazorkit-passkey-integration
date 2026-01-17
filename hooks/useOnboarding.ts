"use client";

import { useState, useEffect } from "react";

const ONBOARDING_STORAGE_KEY = "LazorKey_onboarding_completed";

/**
 * Hook to manage onboarding wizard state
 * 
 * Tracks whether the user has completed the getting started wizard
 * and provides methods to mark it as complete or reset it.
 */
export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding was completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
    setIsCompleted(completed);
    setIsLoading(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsCompleted(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsCompleted(false);
  };

  return {
    isCompleted,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}

