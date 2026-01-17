"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface TutorialStepperProps {
  steps: Step[];
  tutorialId?: string;
  onComplete?: () => void;
}

/**
 * Stepper component for multi-step tutorials
 */
export function TutorialStepper({ steps, tutorialId, onComplete }: TutorialStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark tutorial as completed in localStorage
      if (tutorialId) {
        const completedTutorials = JSON.parse(
          localStorage.getItem("LazorKey_completed_tutorials") || "[]"
        );
        if (!completedTutorials.includes(tutorialId)) {
          completedTutorials.push(tutorialId);
          localStorage.setItem(
            "LazorKey_completed_tutorials",
            JSON.stringify(completedTutorials)
          );
        }
      }
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const markStepComplete = () => {
    setCompletedSteps(new Set([...completedSteps, currentStep]));
  };

  const isStepComplete = (index: number) => completedSteps.has(index);
  const isCurrentStep = (index: number) => index === currentStep;

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => handleStepClick(index)}
              className="flex flex-col items-center flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isStepComplete(index)
                    ? "bg-green-500 text-white"
                    : isCurrentStep(index)
                    ? "bg-[#7454f7] text-white"
                    : "bg-[#f2f2f7] text-[#8e8e93]"
                }`}
              >
                {isStepComplete(index) ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <p
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  isCurrentStep(index) ? "font-medium text-black" : "text-[#8e8e93]"
                }`}
              >
                {step.title}
              </p>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  isStepComplete(index) ? "bg-green-500" : "bg-[#e5e5ea]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg border border-[#e5e5ea] p-6 min-h-[400px]">
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <div className="flex gap-4">
          <Button 
            onClick={markStepComplete} 
            variant="secondary"
            className="hover:bg-green-500 hover:text-white transition-colors"
          >
            Mark Complete
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

