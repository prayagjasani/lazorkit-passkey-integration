"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  NotConnectedState,
  BalanceCard,
  InfoBanner,
} from "@/components/dashboard";
import { useSolBalance } from "@/hooks";
import { useUsdcBalance } from "@/features/wallet/hooks/useUsdcBalance";
import { useSwap } from "@/features/swap/hooks";
import toast from "react-hot-toast";

export default function SwapPage() {
  const { wallet, isConnected } = useWallet();
  const { balance: solBalance, loading: solBalanceLoading, refresh: refreshSol } = useSolBalance();
  const { balance: usdcBalance, loading: usdcBalanceLoading, refresh: refreshUsdc } = useUsdcBalance();
  const { swap, getQuote, loading: swapLoading, priceImpact } = useSwap();

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapDirection, setSwapDirection] = useState<"SOL_TO_USDC" | "USDC_TO_SOL">("SOL_TO_USDC");
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Debounced quote fetching
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setQuoteLoading(true);
      const fromToken = swapDirection === "SOL_TO_USDC" ? "SOL" : "USDC";
      const toToken = swapDirection === "SOL_TO_USDC" ? "USDC" : "SOL";
      
      const quote = await getQuote(fromToken, toToken, parseFloat(fromAmount));
      
      if (quote !== null) {
        setToAmount(quote.toFixed(6));
      } else {
        setToAmount("");
      }
      setQuoteLoading(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [fromAmount, swapDirection, getQuote]);

  if (!isConnected || !wallet?.smartWallet) {
    return (
      <NotConnectedState
        title="Swap Tokens"
        message="Please connect your wallet to swap tokens."
        showSetup
      />
    );
  }

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const fromToken = swapDirection === "SOL_TO_USDC" ? "SOL" : "USDC";
    const toToken = swapDirection === "SOL_TO_USDC" ? "USDC" : "SOL";

    const sig = await swap(fromToken, toToken, parseFloat(fromAmount));

    if (sig) {
      setFromAmount("");
      setToAmount("");
      refreshSol();
      refreshUsdc();
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleMaxClick = () => {
    const balance = swapDirection === "SOL_TO_USDC" ? solBalance : usdcBalance;
    if (balance !== null) {
      // Use 99% of balance to account for fees
      const maxAmount = balance * 0.99;
      setFromAmount(maxAmount.toFixed(6));
    }
  };

  const currentBalance = swapDirection === "SOL_TO_USDC" ? solBalance : usdcBalance;
  const balanceLoading = swapDirection === "SOL_TO_USDC" ? solBalanceLoading : usdcBalanceLoading;

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Swap Tokens"
          description="Swap between SOL and USDC using Jupiter Aggregator"
        />

        <BalanceCard
          label={`Available ${swapDirection === "SOL_TO_USDC" ? "SOL" : "USDC"} Balance`}
          balance={currentBalance}
          loading={balanceLoading}
          onRefresh={swapDirection === "SOL_TO_USDC" ? refreshSol : refreshUsdc}
          variant="highlight"
        />

        {/* Swap Form */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Swap Tokens</h2>
            <p className="text-sm text-[#8e8e93]">
              Exchange SOL for USDC or vice versa
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Swap Direction Toggle */}
            <div className="flex gap-2 p-1 bg-[#f2f2f7] rounded-lg">
              <button
                onClick={() => {
                  setSwapDirection("SOL_TO_USDC");
                  setFromAmount("");
                  setToAmount("");
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  swapDirection === "SOL_TO_USDC"
                    ? "bg-white text-[#7454f7] shadow-sm"
                    : "text-[#8e8e93] hover:text-black"
                }`}
              >
                SOL → USDC
              </button>
              <button
                onClick={() => {
                  setSwapDirection("USDC_TO_SOL");
                  setFromAmount("");
                  setToAmount("");
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  swapDirection === "USDC_TO_SOL"
                    ? "bg-white text-[#7454f7] shadow-sm"
                    : "text-[#8e8e93] hover:text-black"
                }`}
              >
                USDC → SOL
              </button>
            </div>

            {/* From Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                From ({swapDirection === "SOL_TO_USDC" ? "SOL" : "USDC"})
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.0"
                  className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black placeholder-[#8e8e93] focus:border-[#7454f7] focus:outline-none focus:ring-1 focus:ring-[#7454f7]"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7454f7] font-medium hover:text-[#5d3dd9]"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center py-2">
              <div className="rounded-full bg-[#f2f2f7] p-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-[#7454f7]"
                >
                  <path
                    d="M10 4v12M10 16l-4-4M10 16l4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* To Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                To ({swapDirection === "SOL_TO_USDC" ? "USDC" : "SOL"})
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={quoteLoading ? "..." : toAmount}
                  readOnly
                  placeholder="0.0"
                  className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black placeholder-[#8e8e93] opacity-60"
                />
                {quoteLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7454f7] border-t-transparent"></div>
                  </div>
                )}
              </div>
              {priceImpact !== null && priceImpact > 0 && (
                <p className="mt-1 text-xs text-[#8e8e93]">
                  Price impact: {priceImpact.toFixed(2)}%
                </p>
              )}
            </div>

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={
                swapLoading ||
                quoteLoading ||
                !fromAmount ||
                !toAmount ||
                parseFloat(fromAmount) <= 0 ||
                (currentBalance !== null && parseFloat(fromAmount) > currentBalance)
              }
              className="w-full"
              size="lg"
            >
              {swapLoading ? "Swapping..." : "Swap"}
            </Button>

            <InfoBanner variant="warning">
              <strong>⚠️ Mainnet Only:</strong> Jupiter Swap API only supports <strong>mainnet</strong>, not devnet/testnet. 
              Swaps will execute on Solana mainnet. Ensure you have mainnet SOL/USDC balances.
            </InfoBanner>
            
            <InfoBanner>
              <strong>Gasless Swap:</strong> All swap transactions are gasless via LazorKit paymaster. 
              Powered by Jupiter Aggregator for best rates.
            </InfoBanner>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
