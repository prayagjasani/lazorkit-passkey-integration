"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b border-[#e5e5ea] px-6 py-5 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Logo size={32} showText />
        </div>
      </nav>

      {/* Features Section */}
      <main className="mx-auto max-w-7xl">
        <FeaturesSection />
      </main>
    </div>
  );
}