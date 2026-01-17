"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { WizardStep } from "./WizardStep";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Wallet, Send, Zap, Book } from "lucide-react";

/**
 * Getting Started Wizard Component
 * 
 * Displays an interactive tutorial overlay for first-time users.
 * Guides them through key features of the application.
 * 
 * Uses localStorage to track completion and only shows once.
 */
export function GettingStartedWizard() {
  const { isCompleted, isLoading, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  // Don't show if already completed or still loading
  if (isLoading || isCompleted) {
    return null;
  }

  const steps = [
    {
      title: "Welcome to LazorKey! 👋",
      description: "Let's take a quick tour of the key features",
      content: (
        <div className="space-y-4">
          <p className="text-[#8e8e93]">
            LazorKey is a demo application showcasing Lazorkit integration. You can create
            a Solana wallet using passkeys (biometric authentication) and send gasless transactions.
          </p>
          <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
            <p className="text-sm text-[#7454f7]">
              <strong>No seed phrases needed!</strong> Your wallet is secured by your device&apos;s
              biometric authentication (Face ID, Touch ID, or Windows Hello).
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Connect Your Wallet",
      description: "Create or access your passkey wallet",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#f2f2f7] rounded-lg">
            <Wallet className="h-8 w-8 text-[#7454f7]" />
            <div>
              <h3 className="font-semibold">Passkey Wallet</h3>
              <p className="text-sm text-[#8e8e93]">
                Click &quot;Connect Wallet&quot; to create a new wallet or access an existing one
                using your biometric authentication.
              </p>
            </div>
          </div>
          <p className="text-sm text-[#8e8e93]">
            Your wallet address is generated from your passkey, so you can access the same wallet
            on any device using the same biometric.
          </p>
        </div>
      ),
    },
    {
      title: "Send Tokens",
      description: "Send SOL or USDC with gasless transactions",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#f2f2f7] rounded-lg">
            <Send className="h-8 w-8 text-[#7454f7]" />
            <div>
              <h3 className="font-semibold">Gasless Transactions</h3>
              <p className="text-sm text-[#8e8e93]">
                Send SOL or USDC without needing SOL for gas fees. The paymaster system
                automatically covers fees using your USDC balance.
              </p>
            </div>
          </div>
          <Link href="/transfer">
            <Button className="w-full">
              Try Sending Tokens
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ),
    },
    {
      title: "Explore Features",
      description: "Discover what you can do with LazorKey",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#f2f2f7] rounded-lg">
              <Zap className="h-6 w-6 text-[#7454f7] mb-2" />
              <h3 className="font-semibold text-sm mb-1">Stake SOL</h3>
              <p className="text-xs text-[#8e8e93]">
                Earn rewards by staking your SOL
              </p>
            </div>
            <div className="p-4 bg-[#f2f2f7] rounded-lg">
              <Book className="h-6 w-6 text-[#7454f7] mb-2" />
              <h3 className="font-semibold text-sm mb-1">Tutorials</h3>
              <p className="text-xs text-[#8e8e93]">
                Learn how to integrate Lazorkit
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/tutorials" className="flex-1">
              <Button variant="outline" className="w-full">
                View Tutorials
              </Button>
            </Link>
            <Link href="/how-it-works" className="flex-1">
              <Button variant="outline" className="w-full">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set! 🎉",
      description: "Start exploring LazorKey",
      content: (
        <div className="space-y-4">
          <p className="text-[#8e8e93]">
            You now know the basics of LazorKey. Feel free to explore all the features,
            check out the tutorials, or dive into how it all works under the hood.
          </p>
          <div className="space-y-2">
            <Link href="/transfer">
              <Button className="w-full">
                Send Your First Transaction
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/tutorials">
              <Button variant="outline" className="w-full">
                Explore Tutorials
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const currentStepData = steps[currentStep];

  return (
    <WizardStep
      title={currentStepData.title}
      description={currentStepData.description}
      currentStep={currentStep}
      totalSteps={steps.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      isLast={currentStep === steps.length - 1}
    >
      {currentStepData.content}
    </WizardStep>
  );
}

