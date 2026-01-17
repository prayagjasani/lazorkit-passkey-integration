/**
 * useSwap Hook
 *
 * Custom hook for executing token swaps via Jupiter Aggregator.
 * Handles quotes, transaction creation, and execution.
 */

import { useState, useCallback, useRef } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useTransaction } from "@/features/wallet/hooks";
import { useSolBalance } from "@/hooks";
import { useUsdcBalance } from "@/features/wallet/hooks/useUsdcBalance";
import {
  getSwapQuote,
  getSwapTransaction,
  deserializeSwapTransaction,
  formatOutputAmount,
  getMintAddress,
} from "@/features/swap/services";
import toast from "react-hot-toast";

interface UseSwapReturn {
  /** Execute a swap */
  swap: (
    fromToken: "SOL" | "USDC",
    toToken: "SOL" | "USDC",
    amount: number
  ) => Promise<string | null>;
  /** Get swap quote (output amount) */
  getQuote: (
    fromToken: "SOL" | "USDC",
    toToken: "SOL" | "USDC",
    amount: number
  ) => Promise<number | null>;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Price impact percentage */
  priceImpact: number | null;
}

export function useSwap(): UseSwapReturn {
  const { smartWalletPubkey, isConnected, signAndSendTransaction } = useWallet();
  const { balance: solBalance, refresh: refreshSol } = useSolBalance();
  const { balance: usdcBalance, refresh: refreshUsdc } = useUsdcBalance();
  const { execute, loading: transactionLoading } = useTransaction({
    successMessage: "Swap successful!",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const quoteCacheRef = useRef<{ key: string; quote: number; timestamp: number } | null>(null);

  const getQuote = useCallback(
    async (
      fromToken: "SOL" | "USDC",
      toToken: "SOL" | "USDC",
      amount: number
    ): Promise<number | null> => {
      if (!amount || amount <= 0) {
        setPriceImpact(null);
        return null;
      }

      // Check cache (valid for 5 seconds)
      const cacheKey = `${fromToken}-${toToken}-${amount}`;
      if (
        quoteCacheRef.current &&
        quoteCacheRef.current.key === cacheKey &&
        Date.now() - quoteCacheRef.current.timestamp < 5000
      ) {
        return quoteCacheRef.current.quote;
      }

      try {
        const inputMint = getMintAddress(fromToken);
        const outputMint = getMintAddress(toToken);

        const quote = await getSwapQuote(inputMint, outputMint, amount);

        if (!quote) {
          setPriceImpact(null);
          return null;
        }

        const outputAmount = formatOutputAmount(quote.outAmount, toToken);
        setPriceImpact(quote.priceImpactPct);

        // Cache the quote
        quoteCacheRef.current = {
          key: cacheKey,
          quote: outputAmount,
          timestamp: Date.now(),
        };

        return outputAmount;
      } catch (err) {
        console.error("Error getting quote:", err);
        setPriceImpact(null);
        return null;
      }
    },
    []
  );

  const swap = useCallback(
    async (
      fromToken: "SOL" | "USDC",
      toToken: "SOL" | "USDC",
      amount: number
    ): Promise<string | null> => {
      if (!isConnected || !smartWalletPubkey) {
        toast.error("Please connect your wallet first");
        return null;
      }

      // Validate balance
      const balance = fromToken === "SOL" ? solBalance : usdcBalance;
      if (balance === null || amount > balance) {
        toast.error(`Insufficient ${fromToken} balance`);
        return null;
      }

      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Get swap quote
        const inputMint = getMintAddress(fromToken);
        const outputMint = getMintAddress(toToken);

        const quote = await getSwapQuote(inputMint, outputMint, amount);

        if (!quote) {
          throw new Error("Failed to get swap quote. Please try again.");
        }

        // Check price impact (warn if > 5%)
        if (quote.priceImpactPct > 5) {
          const proceed = window.confirm(
            `High price impact detected (${quote.priceImpactPct.toFixed(2)}%). Continue?`
          );
          if (!proceed) {
            setLoading(false);
            return null;
          }
        }

        // Get swap transaction
        const userPublicKey = new PublicKey(smartWalletPubkey);
        const swapTransactionBase64 = await getSwapTransaction(
          userPublicKey,
          quote,
          true // wrapUnwrapSOL
        );

        if (!swapTransactionBase64) {
          throw new Error("Failed to create swap transaction. Please try again.");
        }

        // Deserialize the legacy transaction
        const swapTransaction = deserializeSwapTransaction(
          swapTransactionBase64,
          true
        ) as Transaction;

        // Extract instructions from the transaction
        const instructions = swapTransaction.instructions;

        if (instructions.length === 0) {
          throw new Error("No instructions found in swap transaction");
        }

        toast.dismiss();
        toast.loading("Executing swap...");

        // Execute the swap using LazorKit's transaction system
        const signature = await execute(instructions);

        if (signature) {
          // Refresh balances after successful swap
          refreshSol();
          refreshUsdc();
          setLoading(false);
          return signature;
        }

        setLoading(false);
        return null;

      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Swap failed. Please try again.";
        setError(message);
        toast.error(message);
        console.error("Swap error:", err);
        setLoading(false);
        return null;
      }
    },
    [
      isConnected,
      smartWalletPubkey,
      solBalance,
      usdcBalance,
      signAndSendTransaction,
    ]
  );

  return {
    swap,
    getQuote,
    loading: loading || transactionLoading,
    error,
    priceImpact,
  };
}

