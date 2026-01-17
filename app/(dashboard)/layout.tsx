"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { Home, Send, Download, Zap, FileText, Book, Search, Lock } from "lucide-react";

const navItems = [
  { href: "/manage", label: "Home", icon: Home },
  { href: "/transfer", label: "Send", icon: Send },
  { href: "/receive", label: "Receive", icon: Download },
  { href: "/stake", label: "Stake", icon: Zap },
  { href: "/history", label: "History", icon: FileText },
  { href: "/tutorials", label: "Tutorials", icon: Book },
  { href: "/how-it-works", label: "How It Works", icon: Search },
  { href: "/session-demo", label: "Session", icon: Lock },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f2f2f7]">
      <Sidebar items={navItems} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
