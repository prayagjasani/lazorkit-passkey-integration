"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasskeySetup } from "@/components";
import { Logo } from "@/components";

export default function LoginPage() {
  const router = useRouter();

  function handleConnected(walletAddress: string) {
    void walletAddress; // Used implicitly for routing
    router.push("/manage");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-[#f2f2f7] to-white">
      {/* Header */}
      <nav className="border-b border-[#e5e5ea] px-6 py-4 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} showText />
          </Link>
          <Link href="/" className="text-sm text-[#8e8e93] hover:text-black">
            ← Back
          </Link>
        </div>
      </nav>

      {/* Main Content - Split Layout */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-black tracking-tight mb-4">
                Welcome to
                <br />
                <span className="text-[#7454f7]">LazorKey</span>
              </h1>
              <p className="text-lg text-[#8e8e93] leading-relaxed">
                Create your Solana wallet in seconds using your device&apos;s biometric authentication. 
                No passwords, no seed phrases.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-[#7454f7] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-black">Biometric Security</p>
                  <p className="text-sm text-[#8e8e93]">Face ID, Touch ID, or Windows Hello</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-[#7454f7] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-black">Zero Gas Fees</p>
                  <p className="text-sm text-[#8e8e93]">All transactions are gasless</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-[#7454f7] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-black">Instant Setup</p>
                  <p className="text-sm text-[#8e8e93]">Get started in under 30 seconds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Passkey Setup */}
          <div className="space-y-4">
            <PasskeySetup onConnected={handleConnected} />

            {/* Security Note */}
            <div className="rounded-2xl border border-[#7454f7]/20 bg-[#7454f7]/5 p-5">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7454f7] mb-1">
                    Your keys, your control
                  </p>
                  <p className="text-xs text-[#7454f7]/70 leading-relaxed">
                    Private keys are stored securely in your device&apos;s hardware. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
