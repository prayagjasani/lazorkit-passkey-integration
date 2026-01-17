"use client";

import { useWallet } from "@lazorkit/wallet";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSolBalance, useUsdcBalance } from "@/hooks";
import {
  PageHeader,
  NotConnectedState,
  InfoBanner,
} from "@/components/dashboard";
import TokenBalanceCard from "@/components/dashboard/TokenBalanceCard";
import { GettingStartedWizard } from "@/components/onboarding";
import toast from "react-hot-toast";
import { Copy, Coins, DollarSign, LogOut } from "lucide-react";

const quickActions = [
  {
    href: "/transfer",
    title: "Send Tokens",
    description: "Send SOL or USDC gaslessly to any address",
  },
  {
    href: "/receive",
    title: "Receive SPL Token",
    description: "Get your address to receive funds",
  },
  {
    href: "/stake",
    title: "Stake SOL",
    description: "Delegate SOL to validators and earn rewards",
  },
  {
    href: "https://faucet.solana.com",
    title: "Get Devnet Faucet",
    description: "Get free devnet SOL from the Solana Faucet",
    external: true,
  },
];

export default function ManagePage() {
  const { wallet, isConnected, disconnect } = useWallet();
  const { balance: solBalance, loading: solLoading, refresh: refreshSol } = useSolBalance();
  const { balance: usdcBalance, loading: usdcLoading, refresh: refreshUsdc } = useUsdcBalance();

  if (!isConnected || !wallet?.smartWallet) {
    return (
      <NotConnectedState
        title="Welcome to LazorKey"
        message="Connect your wallet to get started"
        showSetup
      />
    );
  }

  return (
    <>
      <GettingStartedWizard />
      <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Home</h1>
          <p className="text-[#8e8e93]">Manage your Solana wallet and assets</p>
        </div>

        {/* Token Balance Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <TokenBalanceCard
            title="SOL"
            subtitle="Solana"
            balance={solBalance}
            loading={solLoading}
            Icon={Coins}
          />
          <TokenBalanceCard
            title="USDC"
            subtitle="USD Coin"
            balance={usdcBalance}
            loading={usdcLoading}
            Icon={DollarSign}
          />
        </div>

        {/* Wallet Address Card */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#8e8e93] font-medium">Wallet Address</p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await disconnect();
                    toast.success("Wallet disconnected");
                  } catch (err) {
                    toast.error("Failed to disconnect");
                  }
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm text-black">
                {wallet.smartWallet.slice(0, 12)}...{wallet.smartWallet.slice(-12)}
              </p>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(wallet.smartWallet);
                    toast.success("Address copied");
                  } catch (err) {
                    toast.error("Failed to copy");
                  }
                }}
                className="p-1.5 rounded-md text-[#8e8e93] hover:text-[#7454f7] hover:bg-[#7454f7]/10 transition-colors"
                title="Copy address"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#7454f7] animate-pulse"></div>
                <div>
                  <p className="text-xs text-[#8e8e93]">Status</p>
                  <p className="text-sm font-semibold">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-xs text-[#8e8e93]">Network</p>
                  <p className="text-sm font-semibold">Devnet</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-xs text-[#8e8e93]">Mode</p>
                  <p className="text-sm font-semibold">Gasless</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Grid Layout */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const LinkComponent = action.external ? "a" : Link;
              const linkProps = action.external
                ? { href: action.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: action.href };
              
              return (
                <LinkComponent key={action.href} {...linkProps} className="block">
                  <Card className="group bg-white border-2 border-dashed border-[#e5e5ea] rounded-2xl transition-all duration-300 cursor-pointer hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_#7454f7] hover:border-[#7454f7] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-black mb-1 text-sm">{action.title}</h3>
                      <p className="text-xs text-[#8e8e93] leading-tight">{action.description}</p>
                    </CardContent>
                  </Card>
                </LinkComponent>
              );
            })}
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
