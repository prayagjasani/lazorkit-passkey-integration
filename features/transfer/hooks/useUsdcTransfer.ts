/**
 * useUsdcTransfer Hook
 *
 * Custom hook for gasless USDC transfers with LazorKit.
 * Handles validation, instruction creation, and transaction execution.
 */

import { useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  createUsdcTransferInstruction,
  validateUsdcAmount,
} from "@/features/transfer/services/usdcTransfer.service";
import { validateAddress } from "@/lib/services";
import { useTransaction } from "@/features/wallet/hooks";
import { useUsdcBalance } from "@/features/wallet/hooks/useUsdcBalance";
import toast from "react-hot-toast";

interface UseUsdcTransferReturn {
  /** Transfer USDC to a recipient */
  transfer: (recipient: string, amount: string) => Promise<string | null>;
  /** Loading state */
  loading: boolean;
  /** Current USDC balance */
  balance: number | null;
  /** Balance loading state */
  balanceLoading: boolean;
  /** Refresh balance */
  refreshBalance: () => Promise<void>;
  /** Last error message */
  error: string | null;
}

/**
 * Hook to transfer USDC gaslessly
 *
 * @example
 * ```tsx
 * const { transfer, loading, balance } = useUsdcTransfer();
 *
 * const handleSend = async () => {
 *   const sig = await transfer("recipient-address", "10.5");
 *   if (sig) {
 *     console.log("Transfer complete:", sig);
 *   }
 * };
 * ```
 */
export function useUsdcTransfer(): UseUsdcTransferReturn {
  const { smartWalletPubkey, isConnected } = useWallet();
  const {
    balance,
    loading: balanceLoading,
    refresh: refreshBalance,
  } = useUsdcBalance();
  const { execute, loading, error } = useTransaction({
    successMessage: "USDC transfer successful! 🎉",
  });

  const transfer = useCallback(
    async (recipient: string, amount: string): Promise<string | null> => {
      if (!isConnected || !smartWalletPubkey) {
        toast.error("Please connect your wallet first");
        return null;
      }

      // Validate recipient address
      const recipientPubkey = validateAddress(recipient);
      if (!recipientPubkey) {
        toast.error("Invalid recipient address");
        return null;
      }

      // Validate amount
      const amountValue = validateUsdcAmount(amount, 0);
      if (!amountValue) {
        toast.error("Invalid amount. Must be greater than 0");
        return null;
      }

      // Check balance
      if (balance !== null && amountValue > balance) {
        toast.error(`Insufficient balance. You have ${balance.toFixed(2)} USDC`);
        return null;
      }

      try {
        // smartWalletPubkey is already a PublicKey object, use it directly
        const instruction = await createUsdcTransferInstruction(
          smartWalletPubkey,
          recipientPubkey,
          amountValue
        );

        const sig = await execute([instruction]);

        // Refresh balance after successful transfer
        if (sig) {
          refreshBalance();
        }

        return sig;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create USDC transfer instruction";
        toast.error(message);
        console.error("USDC transfer error:", err);
        return null;
      }
    },
    [isConnected, smartWalletPubkey, balance, execute, refreshBalance]
  );

  return { transfer, loading, balance, balanceLoading, refreshBalance, error };
}

