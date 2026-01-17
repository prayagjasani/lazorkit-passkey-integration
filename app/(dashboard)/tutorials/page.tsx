"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  NotConnectedState,
} from "@/components/dashboard";
import { useWallet } from "@lazorkit/wallet";
import { TutorialStepper, CodeExample, TutorialCard } from "@/components/tutorials";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function TutorialsPage() {
  const { isConnected } = useWallet();
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  // Load completed tutorials from localStorage
  useEffect(() => {
    const completed = JSON.parse(
      localStorage.getItem("LazorKey_completed_tutorials") || "[]"
    );
    setCompletedTutorials(completed);
  }, [selectedTutorial]); // Reload when tutorial selection changes

  const passkeyTutorialSteps = [
    {
      id: "1",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Creating Your First Passkey Wallet</h3>
          <p className="text-[#8e8e93]">
            In this tutorial, you&apos;ll learn how to create a Solana wallet using passkeys
            (biometric authentication) instead of seed phrases. This is the foundation of
            Lazorkit integration.
          </p>
          <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
            <p className="text-sm text-[#7454f7]">
              <strong>What you&apos;ll learn:</strong> How to integrate Lazorkit&apos;s wallet
              provider, create passkey-based wallets, and handle authentication flows.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "2",
      title: "Setup",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Installation & Setup</h3>
          <p className="text-[#8e8e93]">
            First, install Lazorkit SDK and set up the wallet provider in your Next.js app.
          </p>
          <CodeExample
            code={`// Install Lazorkit
npm install @lazorkit/wallet @lazorkit/paymaster

// Or with yarn
yarn add @lazorkit/wallet @lazorkit/paymaster`}
            title="Step 1: Install Dependencies"
          />
          <CodeExample
            code={`// app/providers.tsx
"use client";

import { LazorKitProvider } from "@lazorkit/wallet";
import { PaymasterProvider } from "@lazorkit/paymaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazorKitProvider
      network="devnet"
      apiKey={process.env.NEXT_PUBLIC_LAZORKIT_API_KEY}
    >
      <PaymasterProvider>
        {children}
      </PaymasterProvider>
    </LazorKitProvider>
  );
}`}
            title="Step 2: Wrap Your App with Providers"
          />
        </div>
      ),
    },
    {
      id: "3",
      title: "Connection",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Connecting the Wallet</h3>
          <p className="text-[#8e8e93]">
            Use the <code className="bg-[#f2f2f7] px-1 rounded">useWallet</code> hook to
            connect and manage wallet state.
          </p>
          <CodeExample
            code={`// components/WalletConnect.tsx
"use client";

import { useWallet } from "@lazorkit/wallet";
import { Button } from "@/components/ui/button";

export function WalletConnect() {
  const { connect, disconnect, isConnected, wallet } = useWallet();

  if (isConnected && wallet?.smartWallet) {
    return (
      <div>
        <p>Connected: {wallet.smartWallet}</p>
        <Button onClick={disconnect}>Disconnect</Button>
      </div>
    );
  }

  return (
    <Button onClick={connect}>
      Connect Wallet
    </Button>
  );
}`}
            title="Step 3: Create Connection Component"
          />
          <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
            <p className="text-sm text-[#7454f7]">
              <strong>Try it:</strong> When you click &quot;Connect Wallet&quot;, your browser
              will prompt for biometric authentication (Face ID, Touch ID, or Windows Hello).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "4",
      title: "Complete",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">You&apos;re Done! 🎉</h3>
          <p className="text-[#8e8e93]">
            You&apos;ve successfully learned how to create a passkey-based wallet with Lazorkit.
            Your wallet is now ready to use!
          </p>
          <div className="space-y-2">
            <Link href="/transfer">
              <Button className="w-full">
                Try Sending a Transaction
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const gaslessTutorialSteps = [
    {
      id: "1",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Sending Your First Gasless Transaction</h3>
          <p className="text-[#8e8e93]">
            Learn how to send transactions without needing SOL for gas fees. Lazorkit&apos;s
            paymaster system allows you to pay fees in USDC instead.
          </p>
          <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
            <p className="text-sm text-[#7454f7]">
              <strong>Prerequisites:</strong> You need USDC in your wallet for the paymaster
              to use. Get some from the Devnet Faucet if needed.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "2",
      title: "Transaction Hook",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Using the useTransaction Hook</h3>
          <p className="text-[#8e8e93]">
            The <code className="bg-[#f2f2f7] px-1 rounded">useTransaction</code> hook handles
            all the complexity of creating and sending gasless transactions.
          </p>
          <CodeExample
            code={`// features/wallet/hooks/useTransaction.ts
import { useWallet } from "@lazorkit/wallet";
import { TransactionInstruction } from "@solana/web3.js";

export function useTransaction() {
  const { signAndSendTransaction, isConnected } = useWallet();

  const execute = async (instructions: TransactionInstruction[]) => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    // The paymaster automatically handles fee payment in USDC
    const signature = await signAndSendTransaction({
      instructions,
      transactionOptions: {
        feeToken: "USDC", // This enables gasless transactions
      },
    });

    return signature;
  };

  return { execute };
}`}
            title="Step 1: Create Transaction Hook"
          />
        </div>
      ),
    },
    {
      id: "3",
      title: "Send SOL",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Sending SOL</h3>
          <p className="text-[#8e8e93]">
            Create a transfer instruction and execute it using the transaction hook.
          </p>
          <CodeExample
            code={`// Example: Send SOL
import { SystemProgram } from "@solana/web3.js";
import { useTransaction } from "@/features/wallet/hooks";
import { PublicKey } from "@solana/web3.js";

function SendSOL() {
  const { execute, loading } = useTransaction();
  const recipient = new PublicKey("..."); // Recipient address
  const amount = 0.1; // SOL amount

  const handleSend = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: wallet.smartWallet,
      toPubkey: recipient,
      lamports: amount * 1e9, // Convert to lamports
    });

    const signature = await execute([instruction]);
    if (signature) {
      toast.success("Transaction sent successfully!");
    }
  };

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? "Sending..." : "Send SOL"}
    </button>
  );
}`}
            title="Step 2: Create Transfer Function"
          />
        </div>
      ),
    },
    {
      id: "4",
      title: "Complete",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Transaction Complete! 🎉</h3>
          <p className="text-[#8e8e93]">
            You&apos;ve successfully sent a gasless transaction! Notice that you didn&apos;t need
            SOL - the paymaster handled the fees using your USDC balance.
          </p>
          <div className="space-y-2">
            <Link href="/transfer">
              <Button className="w-full">
                Try It Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full">
                Learn About Paymaster
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const sessionTutorialSteps = [
    {
      id: "1",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Understanding Session Persistence</h3>
          <p className="text-[#8e8e93]">
            Learn how sessions work in Lazorkit and how they persist across page refreshes
            and devices.
          </p>
        </div>
      ),
    },
    {
      id: "2",
      title: "Session Hook",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Using the useSession Hook</h3>
          <CodeExample
            code={`// features/session/hooks/useSession.ts
import { useWallet } from "@lazorkit/wallet";
import { useEffect, useState } from "react";

export function useSession() {
  const { isConnected, wallet } = useWallet();
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isConnected && wallet?.smartWallet) {
      // Load session from localStorage
      const stored = localStorage.getItem("LazorKey_session");
      if (stored) {
        setSession(JSON.parse(stored));
      } else {
        // Create new session
        const newSession = {
          walletAddress: wallet.smartWallet,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        localStorage.setItem("LazorKey_session", JSON.stringify(newSession));
        setSession(newSession);
      }
    }
  }, [isConnected, wallet]);

  return { session };
}`}
            title="Step 1: Session Management"
          />
        </div>
      ),
    },
    {
      id: "3",
      title: "Persistence",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Testing Persistence</h3>
          <p className="text-[#8e8e93]">
            Sessions are stored in localStorage, so they persist across page refreshes.
            Try refreshing the page - your session should remain active!
          </p>
          <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
            <p className="text-sm text-[#7454f7]">
              <strong>Try it:</strong> Visit the Session Demo page and click &quot;Refresh Page&quot;
              to see your session persist.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "4",
      title: "Complete",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Session Management Complete! 🎉</h3>
          <p className="text-[#8e8e93]">
            You now understand how sessions work in Lazorkit. Sessions make the user experience
            seamless by avoiding repeated passkey prompts.
          </p>
          <Link href="/session-demo">
            <Button className="w-full">
              Try Session Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const tutorials = [
    {
      id: "passkey-wallet",
      title: "Creating Your First Passkey Wallet",
      description: "Learn how to integrate Lazorkit and create a wallet using biometric authentication",
      duration: "5 min",
      difficulty: "Beginner" as const,
      steps: passkeyTutorialSteps,
    },
    {
      id: "gasless-transactions",
      title: "Sending Your First Gasless Transaction",
      description: "Send transactions without needing SOL for gas fees using the paymaster system",
      duration: "7 min",
      difficulty: "Intermediate" as const,
      steps: gaslessTutorialSteps,
    },
    {
      id: "session-persistence",
      title: "Understanding Session Persistence",
      description: "Learn how sessions work and persist across page refreshes and devices",
      duration: "5 min",
      difficulty: "Beginner" as const,
      steps: sessionTutorialSteps,
    },
  ];

  if (selectedTutorial) {
    const tutorial = tutorials.find((t) => t.id === selectedTutorial);
    if (!tutorial) return null;

    return (
      <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedTutorial(null)}
            className="mb-4"
          >
            ← Back to Tutorials
          </Button>
          <TutorialStepper
            steps={tutorial.steps}
            tutorialId={tutorial.id}
            onComplete={() => {
              toast.success("Tutorial completed!");
              // Reload completed tutorials
              const completed = JSON.parse(
                localStorage.getItem("LazorKey_completed_tutorials") || "[]"
              );
              setCompletedTutorials(completed);
              setSelectedTutorial(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Interactive Tutorials"
          description="Step-by-step guides to help you integrate Lazorkit in your projects"
        />

        {!isConnected && (
          <Card className="bg-white mb-6">
            <CardContent className="pt-6">
              <NotConnectedState
                title="Connect to Start Learning"
                message="Connect your wallet to access interactive tutorials"
                showSetup
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              title={tutorial.title}
              description={tutorial.description}
              duration={tutorial.duration}
              difficulty={tutorial.difficulty}
              href="#"
              completed={completedTutorials.includes(tutorial.id)}
              onClick={(e) => {
                e.preventDefault();
                setSelectedTutorial(tutorial.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

