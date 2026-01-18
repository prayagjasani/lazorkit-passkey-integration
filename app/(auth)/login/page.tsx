"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasskeySetup } from "@/components";
import { Logo } from "@/components";
import { RotatingText } from "@/components/common/RotatingText";

export default function LoginPage() {
  const router = useRouter();

  function handleConnected(walletAddress: string) {
    void walletAddress; // Used implicitly for routing
    router.push("/manage");
  }

  const rotatingWords = [
    "Secure",
    "Fast",
    "Gasless",
    "Simple",
    "Modern",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-[#f2f2f7] to-white">
      {/* Header */}
      <nav className="border-b border-[#e5e5ea] px-6 py-4 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} showText />
          </Link>
          <Link href="/" className="text-sm text-[#8e8e93] hover:text-black">
            Back
          </Link>
        </div>
      </nav>

      {/* Main Content - Split Layout */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Welcome with Rotating Text */}
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-5xl md:text-6xl font-semibold text-black tracking-tight mb-8">
              Welcome to{" "}
              <span className="text-[#7454f7]">LazorKey</span>
            </h1>
            <div className="text-3xl md:text-4xl text-black leading-relaxed">
              Your wallet is now {" "}
              <RotatingText
                words={rotatingWords}
                className="text-[#7454f7] font-semibold"
                duration={1500}
              />{" "}
            </div>
          </div>

          {/* Right Side - Login Box */}
          <div className="space-y-6">
            <PasskeySetup onConnected={handleConnected} />

            {/* Security Note */}
            <div className="rounded-2xl border border-[#7454f7]/20 bg-[#7454f7]/5 p-5">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7454f7] mb-1">
                    Your keys, your control
                  </p>
                  <p className="text-xs text-[#7454f7]/70 leading-relaxed">
                    Private keys are stored securely in your device hardware. 
                    Powered by LazorKit - Your device is your wallet.
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
