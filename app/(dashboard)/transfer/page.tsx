"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransfer } from "@/hooks";
import { useUsdcTransfer } from "@/features/transfer/hooks/useUsdcTransfer";
import {
  PageHeader,
  NotConnectedState,
  BalanceCard,
  InfoBanner,
  HistoryList,
} from "@/components/dashboard";
import { truncateAddress } from "@/lib/services";
import { SuccessAnimation } from "@/components/common";

interface TransferHistory {
  recipient: string;
  amount: string;
  signature: string;
  timestamp: Date;
  token: "SOL" | "USDC";
}

export default function TransferPage() {
  const { isConnected } = useWallet();
  const [tokenType, setTokenType] = useState<"SOL" | "USDC">("SOL");
  
  // SOL transfer hook
  const {
    transfer: transferSol,
    loading: solLoading,
    balance: solBalance,
    balanceLoading: solBalanceLoading,
    refreshBalance: refreshSol,
  } = useTransfer();

  // USDC transfer hook
  const {
    transfer: transferUsdc,
    loading: usdcLoading,
    balance: usdcBalance,
    balanceLoading: usdcBalanceLoading,
    refreshBalance: refreshUsdc,
  } = useUsdcTransfer();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<TransferHistory[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const loading = tokenType === "SOL" ? solLoading : usdcLoading;
  const balance = tokenType === "SOL" ? solBalance : usdcBalance;
  const balanceLoading = tokenType === "SOL" ? solBalanceLoading : usdcBalanceLoading;
  const refreshBalance = tokenType === "SOL" ? refreshSol : refreshUsdc;

  const handleTransfer = async () => {
    let signature: string | null = null;

    if (tokenType === "SOL") {
      signature = await transferSol(recipient, amount);
    } else {
      signature = await transferUsdc(recipient, amount);
    }

    if (signature) {
      setHistory((prev) => [
        { recipient, amount, signature, timestamp: new Date(), token: tokenType },
        ...prev,
      ]);
      setRecipient("");
      setAmount("");
      setShowSuccess(true);
    }
  };

  if (!isConnected) {
    return (
      <NotConnectedState
        title="Send Tokens"
        message="Please connect your wallet to send tokens."
      />
    );
  }

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        message={`${tokenType} sent successfully!`}
        onComplete={() => setShowSuccess(false)}
      />
      <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Send Tokens"
          description="Send SOL or USDC without gas fees using LazorKit Paymaster"
        />

        <BalanceCard
          label="Available Balance"
          balance={balance}
          loading={balanceLoading}
          onRefresh={refreshBalance}
          variant="highlight"
          token={tokenType}
        />

        {/* Transfer Form */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Send {tokenType}</h2>
                <p className="text-sm text-[#8e8e93]">
                  Gas fees paid by LazorKit Paymaster
                </p>
              </div>
              {/* Token Type Toggle */}
              <div className="flex gap-2 p-1 bg-[#f2f2f7] rounded-lg">
                <button
                  onClick={() => {
                    setTokenType("SOL");
                    setAmount("");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    tokenType === "SOL"
                      ? "bg-white text-[#7454f7] shadow-sm"
                      : "text-[#8e8e93] hover:text-black"
                  }`}
                >
                  SOL
                </button>
                <button
                  onClick={() => {
                    setTokenType("USDC");
                    setAmount("");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    tokenType === "USDC"
                      ? "bg-white text-[#7454f7] shadow-sm"
                      : "text-[#8e8e93] hover:text-black"
                  }`}
                >
                  USDC
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter Solana address..."
                className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black placeholder-[#8e8e93] focus:border-[#7454f7] focus:outline-none focus:ring-1 focus:ring-[#7454f7]"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                Amount ({tokenType})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step={tokenType === "SOL" ? "0.001" : "0.01"}
                min="0"
                className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black placeholder-[#8e8e93] focus:border-[#7454f7] focus:outline-none focus:ring-1 focus:ring-[#7454f7]"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleTransfer}
              disabled={loading || !recipient || !amount}
              className="w-full"
              size="lg"
            >
              {loading ? "Sending..." : `Send ${tokenType} without gas fees`}
            </Button>

            <InfoBanner>
              <strong>Gasless Transaction:</strong> You don&apos;t need SOL for
              gas fees. LazorKit&apos;s paymaster will cover the transaction
              fee{tokenType === "USDC" && " using your USDC balance"}.
            </InfoBanner>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <HistoryList
          title="Recent Transfers"
          items={history.map((tx) => ({
            primary: `${tx.amount} ${tx.token} → ${truncateAddress(tx.recipient)}`,
            signature: tx.signature,
            timestamp: tx.timestamp,
          }))}
        />
      </div>
    </div>
    </>
  );
}
