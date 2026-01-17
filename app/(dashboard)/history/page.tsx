"use client";

import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageHeader,
  NotConnectedState,
} from "@/components/dashboard";
import { ExternalLink } from "lucide-react";

export default function HistoryPage() {
  const { wallet, isConnected } = useWallet();

  if (!isConnected || !wallet?.smartWallet) {
    return (
      <NotConnectedState
        title="Transaction History"
        message="Please connect your wallet to view transaction history."
        showSetup
      />
    );
  }

  const solscanUrl = `https://solscan.io/account/${wallet.smartWallet}?cluster=devnet`;

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Transaction History"
          description="View your transaction history on Solana Explorer"
        />

        <Card className="bg-white">
          <CardContent className="pt-6 text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">View on Solscan Explorer</h2>
              <p className="text-sm text-[#8e8e93] mb-6">
                To view your complete transaction history, please visit Solscan Explorer. 
                You can see all your transactions, including sender, receiver, amounts, and timestamps.
              </p>
              <a
                href={solscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#7454f7] text-white font-medium hover:bg-[#5d3dd9] transition-colors"
              >
                Open Solscan Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="mt-6 pt-6 border-t border-[#e5e5ea]">
                <p className="text-xs text-[#8e8e93] mb-2">Your Wallet Address:</p>
                <p className="text-xs font-mono text-black bg-[#f2f2f7] p-2 rounded">
                  {wallet.smartWallet}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
