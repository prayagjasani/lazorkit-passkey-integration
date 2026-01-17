"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WizardStepProps {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step content */
  children: React.ReactNode;
  /** Current step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Callback when next is clicked */
  onNext: () => void;
  /** Callback when previous is clicked */
  onPrevious: () => void;
  /** Callback when skip is clicked */
  onSkip: () => void;
  /** Whether this is the last step */
  isLast: boolean;
}

/**
 * Individual wizard step component
 */
export function WizardStep({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isLast,
}: WizardStepProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-2xl w-full bg-white">
        <CardContent className="pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-[#8e8e93]">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-[#8e8e93] mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-[#f2f2f7] rounded-full h-2">
              <div
                className="bg-[#7454f7] h-2 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">{children}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={onPrevious}
              disabled={currentStep === 0}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button onClick={onSkip} variant="ghost">
                Skip Tutorial
              </Button>
              <Button onClick={onNext}>
                {isLast ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

