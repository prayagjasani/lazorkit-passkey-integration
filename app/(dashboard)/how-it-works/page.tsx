"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PageHeader,
  NotConnectedState,
} from "@/components/dashboard";
import { useWallet } from "@lazorkit/wallet";
import { ExplanationCard, FlowDiagram } from "@/components/education";

export default function HowItWorksPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <NotConnectedState
        title="How It Works"
        message="Connect your wallet to explore how Lazorkit works."
        showSetup
      />
    );
  }

  const passkeyFlow = [
    {
      title: "User Initiates Login",
      description: "User clicks 'Continue with Passkey' button",
    },
    {
      title: "Browser Prompts Biometric",
      description: "Device requests Face ID, Touch ID, or Windows Hello",
    },
    {
      title: "WebAuthn Creates Credential",
      description: "Browser generates a cryptographic key pair using WebAuthn API",
    },
    {
      title: "Private Key Stored Securely",
      description: "Private key is stored in device's secure enclave (TPM/secure element)",
    },
    {
      title: "Public Key Sent to Lazorkit",
      description: "Public key is registered with Lazorkit to create your smart wallet",
    },
    {
      title: "Wallet Created",
      description: "Your Solana wallet address is generated and ready to use",
    },
  ];

  const gaslessFlow = [
    {
      title: "User Initiates Transaction",
      description: "User wants to send SOL or USDC",
    },
    {
      title: "Transaction Instructions Created",
      description: "App creates Solana transaction instructions",
    },
    {
      title: "Lazorkit Paymaster Intercepts",
      description: "Paymaster detects transaction and prepares to cover fees",
    },
    {
      title: "User Signs with Passkey",
      description: "User approves transaction using biometric authentication",
    },
    {
      title: "Paymaster Pays Gas Fees",
      description: "Paymaster uses USDC from your wallet to pay transaction fees",
    },
    {
      title: "Transaction Executed",
      description: "Transaction is sent to Solana network without requiring SOL for gas",
    },
  ];

  const paymasterFlow = [
    {
      title: "Smart Wallet Created",
      description: "Lazorkit creates a smart contract wallet for you",
    },
    {
      title: "USDC Balance Required",
      description: "You need USDC in your wallet for the paymaster to use",
    },
    {
      title: "Transaction Request",
      description: "When you send a transaction, it's routed through the paymaster",
    },
    {
      title: "Fee Calculation",
      description: "Paymaster calculates the gas fee in USDC",
    },
    {
      title: "Fee Deduction",
      description: "Gas fee is automatically deducted from your USDC balance",
    },
    {
      title: "Transaction Success",
      description: "Your transaction completes without needing SOL for gas",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="How It Works"
          description="Learn how Lazorkit makes Solana wallets secure and gasless"
        />

        {/* Passkeys Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Passkey Authentication</h2>
          <FlowDiagram steps={passkeyFlow} title="How Passkeys Work" />
        </div>

        <ExplanationCard title="What are Passkeys?" defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-sm text-[#8e8e93]">
              Passkeys are a modern authentication method that uses your device&apos;s built-in
              biometric security (Face ID, Touch ID, Windows Hello) instead of passwords or seed phrases.
            </p>
            <div>
              <h4 className="font-medium mb-2">Key Benefits:</h4>
              <ul className="list-disc list-inside text-sm text-[#8e8e93] space-y-1">
                <li>No seed phrases to remember or lose</li>
                <li>Private keys never leave your device</li>
                <li>Protected by hardware security (TPM/secure element)</li>
                <li>Works across devices with the same biometric</li>
                <li>Resistant to phishing attacks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Technical Details:</h4>
              <p className="text-sm text-[#8e8e93]">
                Passkeys use the WebAuthn (Web Authentication) standard. When you create a passkey,
                your device generates a cryptographic key pair. The private key stays securely in your
                device&apos;s hardware, while the public key is sent to Lazorkit to create your wallet.
                Every transaction requires your biometric approval, ensuring maximum security.
              </p>
            </div>
          </div>
        </ExplanationCard>

        {/* Gasless Transactions Section */}
        <div className="mb-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Gasless Transactions</h2>
          <FlowDiagram steps={gaslessFlow} title="How Gasless Transactions Work" />
        </div>

        <ExplanationCard title="How Can Transactions Be Gasless?" defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-sm text-[#8e8e93]">
              Traditional Solana transactions require SOL to pay for gas fees. Lazorkit&apos;s
              paymaster system allows you to pay fees in USDC instead, and the paymaster handles
              the SOL payment automatically.
            </p>
            <div>
              <h4 className="font-medium mb-2">How It Works:</h4>
              <ul className="list-disc list-inside text-sm text-[#8e8e93] space-y-1">
                <li>You initiate a transaction (send SOL, stake, etc.)</li>
                <li>Lazorkit&apos;s paymaster intercepts the transaction</li>
                <li>Paymaster calculates the gas fee in USDC</li>
                <li>Fee is deducted from your USDC balance</li>
                <li>Paymaster pays the SOL gas fee on your behalf</li>
                <li>Transaction executes successfully</li>
              </ul>
            </div>
            <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
              <p className="text-sm text-[#7454f7]">
                <strong>Note:</strong> You still need USDC in your wallet for the paymaster to use.
                The paymaster doesn&apos;t require you to have SOL, which makes onboarding much easier.
              </p>
            </div>
          </div>
        </ExplanationCard>

        {/* Paymaster System Section */}
        <div className="mb-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Paymaster System</h2>
          <FlowDiagram steps={paymasterFlow} title="Paymaster Flow" />
        </div>

        <ExplanationCard title="Understanding the Paymaster" defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-sm text-[#8e8e93]">
              The paymaster is a smart contract system that acts as an intermediary for your transactions.
              It allows you to pay gas fees in USDC instead of requiring SOL.
            </p>
            <div>
              <h4 className="font-medium mb-2">Smart Contract Wallet:</h4>
              <p className="text-sm text-[#8e8e93]">
                Lazorkit creates a smart contract wallet (also called a &quot;smart wallet&quot;) for you.
                This is different from a traditional Solana wallet because it&apos;s controlled by a program
                that can execute complex logic, like paying fees in different tokens.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fee Payment Process:</h4>
              <ol className="list-decimal list-inside text-sm text-[#8e8e93] space-y-1">
                <li>You have USDC in your smart wallet</li>
                <li>You initiate a transaction (e.g., send 1 SOL)</li>
                <li>The paymaster calculates: &quot;This transaction costs 0.000005 SOL in fees&quot;</li>
                <li>Paymaster converts: &quot;That&apos;s equivalent to $0.001 USDC&quot;</li>
                <li>Paymaster deducts $0.001 USDC from your balance</li>
                <li>Paymaster pays 0.000005 SOL to the network</li>
                <li>Your transaction executes successfully</li>
              </ol>
            </div>
            <div className="bg-[#7454f7]/5 border border-[#7454f7]/20 rounded-lg p-4">
              <p className="text-sm text-[#7454f7]">
                <strong>Security:</strong> The paymaster only has permission to deduct fees. It cannot
                access your funds or execute unauthorized transactions. You still control your wallet
                completely through your passkey.
              </p>
            </div>
          </div>
        </ExplanationCard>

        {/* Session Persistence Section */}
        <div className="mb-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Session Persistence</h2>
        </div>

        <ExplanationCard title="How Sessions Work Across Devices" defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-sm text-[#8e8e93]">
              Sessions allow you to stay connected to your wallet without re-authenticating every time.
              Sessions are stored locally in your browser and persist across page refreshes.
            </p>
            <div>
              <h4 className="font-medium mb-2">Session Storage:</h4>
              <p className="text-sm text-[#8e8e93]">
                When you connect your wallet, a session is created and stored in your browser&apos;s
                localStorage. This session includes your wallet address, creation time, and expiry time.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cross-Device Access:</h4>
              <p className="text-sm text-[#8e8e93]">
                Because passkeys are tied to your biometric identity (not your device), you can use
                the same passkey on multiple devices. Each device will have its own session, but they
                all access the same wallet address.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Session Expiry:</h4>
              <p className="text-sm text-[#8e8e93]">
                Sessions expire after 24 hours of inactivity for security. You can extend them manually
                or they&apos;ll auto-extend when you use the app. When a session expires, you&apos;ll need
                to reconnect with your passkey.
              </p>
            </div>
          </div>
        </ExplanationCard>

        {/* Resources */}
        <Card className="bg-white mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Learn More</h3>
            <div className="space-y-2">
              <a
                href="https://docs.lazorkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#7454f7] hover:text-[#5d3dd9]"
              >
                → Lazorkit Documentation
              </a>
              <a
                href="https://webauthn.guide"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#7454f7] hover:text-[#5d3dd9]"
              >
                → WebAuthn Guide
              </a>
              <a
                href="https://docs.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#7454f7] hover:text-[#5d3dd9]"
              >
                → Solana Documentation
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

