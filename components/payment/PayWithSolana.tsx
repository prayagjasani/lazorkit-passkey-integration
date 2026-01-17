"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransfer } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface PayWithSolanaProps {
  /** Payment amount in SOL */
  amount: number;
  /** Payment description */
  description?: string;
  /** Merchant/recipient address */
  merchantAddress?: string;
  /** Callback when payment succeeds */
  onSuccess?: (signature: string) => void;
  /** Callback when payment fails */
  onError?: (error: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Pay with Solana Widget
 *
 * A reusable payment widget that can be embedded anywhere.
 * Demonstrates gasless payments using LazorKit.
 *
 * @example
 * ```tsx
 * <PayWithSolana
 *   amount={0.1}
 *   description="Premium Subscription"
 *   merchantAddress="merchant-wallet-address"
 *   onSuccess={(sig) => console.log("Paid:", sig)}
 * />
 * ```
 */
export function PayWithSolana({
  amount,
  description = "Payment",
  merchantAddress,
  onSuccess,
  onError,
  className = "",
}: PayWithSolanaProps) {
  const { isConnected, wallet, connect } = useWallet();
  const { transfer, loading, balance } = useTransfer();
  const [copied, setCopied] = useState(false);

  // Use provided merchant address or default
  const recipient = merchantAddress || "55czFRi1njMSE7eJyDLx1R5yS1Bi5GiL2Ek4F1cZPLFx";

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (balance !== null && amount > balance) {
      const errorMsg = `Insufficient balance. You have ${balance.toFixed(4)} SOL`;
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const signature = await transfer(recipient, amount.toString());

    if (signature) {
      onSuccess?.(signature);
      toast.success("Payment successful! 🎉");
    } else {
      const errorMsg = "Payment failed. Please try again.";
      onError?.(errorMsg);
    }
  };

  const copyAddress = () => {
    if (wallet?.smartWallet) {
      navigator.clipboard.writeText(wallet.smartWallet);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className={`bg-white ${className}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black">Pay with Solana</h3>
              <p className="text-sm text-[#8e8e93] mt-1">{description}</p>
            </div>
            <Badge className="bg-[#7454f7] text-white">Gasless</Badge>
          </div>

          {/* Amount */}
          <div className="rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] p-4">
            <p className="text-sm text-[#8e8e93] mb-1">Amount</p>
            <p className="text-2xl font-semibold text-black">{amount} SOL</p>
          </div>

          {/* Wallet Info */}
          {isConnected && wallet?.smartWallet && (
            <div className="rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#8e8e93] mb-1">Your Wallet</p>
                  <p className="text-sm font-mono text-black">
                    {wallet.smartWallet.slice(0, 8)}...{wallet.smartWallet.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-2 rounded-lg hover:bg-[#e5e5ea] transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[#7454f7]" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#8e8e93]" />
                  )}
                </button>
              </div>
              {balance !== null && (
                <p className="text-xs text-[#8e8e93] mt-2">
                  Balance: {balance.toFixed(4)} SOL
                </p>
              )}
            </div>
          )}

          {/* Payment Button */}
          {!isConnected ? (
            <Button onClick={() => connect()} className="w-full" size="lg">
              Connect Wallet to Pay
            </Button>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={loading || (balance !== null && amount > balance)}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Pay ${amount} SOL`}
            </Button>
          )}

          {/* Info */}
          <p className="text-xs text-center text-[#8e8e93]">
            Powered by LazorKit • No gas fees required
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

