"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface TokenBalanceCardProps {
  title: string;
  subtitle: string;
  balance: number | null;
  loading?: boolean;
  Icon: LucideIcon;
  href?: string;
}

export default function TokenBalanceCard({
  title,
  subtitle,
  balance,
  loading = false,
  Icon,
  href,
}: TokenBalanceCardProps) {
  const displayBalance = loading
    ? "..."
    : balance !== null
    ? balance.toFixed(4)
    : "0.0000";

  const content = (
    <div className="w-full p-4 rounded border-[1px] border-[#e5e5ea] relative overflow-hidden group bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7454f7] to-[#9333ea] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />

      <Icon className="absolute z-10 -top-12 -right-12 text-9xl text-[#f2f2f7] group-hover:text-[#7454f7]/20 group-hover:rotate-12 transition-transform duration-300" />
      <Icon className="mb-2 text-2xl text-[#7454f7] group-hover:text-white transition-colors relative z-10 duration-300" />
      <h3 className="font-medium text-lg text-black group-hover:text-white relative z-10 duration-300">
        {title}
      </h3>
      <p className="text-[#8e8e93] group-hover:text-white/80 relative z-10 duration-300 text-sm mb-1">
        {subtitle}
      </p>
      <p className="text-2xl font-semibold text-[#7454f7] group-hover:text-white relative z-10 duration-300">
        {displayBalance}
      </p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

