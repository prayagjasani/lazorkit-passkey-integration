/**
 * useTransfer Hook
 *
 * Custom hook for gasless SOL transfers with LazorKit.
 * 
 * This hook encapsulates all the logic needed to send SOL gaslessly:
 * - Validates recipient address and amount
 * - Checks user's balance
 * - Creates transfer instruction
 * - Executes transaction with paymaster (gasless)
 * - Handles errors and provides user feedback
 * 
 * KEY FEATURE: Gasless Transactions
 * - Users don't need SOL for gas fees
 * - Paymaster covers fees using user's USDC balance
 * - Makes onboarding much easier (no need to buy SOL first)
 * 
 * USAGE PATTERN:
 * This follows the standard React hook pattern for blockchain operations:
 * 1. Validate inputs
 * 2. Check prerequisites (balance, connection)
 * 3. Create instructions
 * 4. Execute transaction
 * 5. Update UI state
 */

import { useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  createTransferInstruction,
  validateAddress,
  validateAmount,
} from "@/lib/services";
import { useTransaction, useSolBalance } from "@/features/wallet/hooks";
import toast from "react-hot-toast";

interface UseTransferReturn {
  /** Transfer SOL to a recipient */
  transfer: (recipient: string, amount: string) => Promise<string | null>;
  /** Loading state */
  loading: boolean;
  /** Current SOL balance */
  balance: number | null;
  /** Balance loading state */
  balanceLoading: boolean;
  /** Refresh balance */
  refreshBalance: () => Promise<void>;
  /** Last error message */
  error: string | null;
}

/**
 * Hook to transfer SOL gaslessly
 *
 * @example
 * ```tsx
 * const { transfer, loading, balance } = useTransfer();
 *
 * const handleSend = async () => {
 *   const sig = await transfer("recipient-address", "0.1");
 *   if (sig) {
 *     console.log("Transfer complete:", sig);
 *   }
 * };
 * ```
 */
export function useTransfer(): UseTransferReturn {
  const { smartWalletPubkey, isConnected } = useWallet();
  const {
    balance,
    loading: balanceLoading,
    refresh: refreshBalance,
  } = useSolBalance();
  const { execute, loading, error } = useTransaction({
    successMessage: "Transfer successful! 🎉",
  });

  /**
   * Transfer SOL to a recipient
   * 
   * This function handles the complete transfer flow:
   * 1. Validates wallet connection
   * 2. Validates recipient address (must be valid Solana public key)
   * 3. Validates amount (must be positive number)
   * 4. Checks sufficient balance
   * 5. Creates transfer instruction
   * 6. Executes transaction (gasless via paymaster)
   * 7. Refreshes balance on success
   * 
   * WHY VALIDATE EARLY:
   * - Better UX: Catch errors before transaction is sent
   * - Saves user time: No need to wait for blockchain confirmation
   * - Saves gas: Don't send invalid transactions
   * 
   * GASLESS TRANSACTION:
   * - The execute() function automatically uses paymaster mode
   * - User doesn't need SOL for gas fees
   * - Fees are deducted from USDC balance (if available)
   * - If no USDC, transaction will fail with clear error message
   * 
   * @param recipient - Solana wallet address (base58 string)
   * @param amount - Amount in SOL (as string, e.g., "0.1")
   * @returns Transaction signature if successful, null if failed
   * 
   * ALTERNATE APPROACHES:
   * - Could batch multiple transfers in one transaction
   * - Could add memo instruction for transaction notes
   * - Could add retry logic for failed transactions
   */
  const transfer = useCallback(
    async (recipient: string, amount: string): Promise<string | null> => {
      /**
       * Pre-flight checks
       * 
       * WHY CHECK CONNECTION FIRST:
       * - Most common error is forgetting to connect wallet
       * - Better error message than letting it fail later
       * - Saves unnecessary processing
       */
      if (!isConnected || !smartWalletPubkey) {
        toast.error("Please connect your wallet first");
        return null;
      }

      /**
       * Validate recipient address
       * 
       * Solana addresses are base58-encoded public keys (32-44 characters).
       * Invalid addresses will cause transaction to fail, so we validate early.
       * 
       * WHY VALIDATE HERE:
       * - PublicKey constructor throws on invalid addresses
       * - Better to catch and show user-friendly error
       * - Prevents unnecessary transaction creation
       */
      const recipientPubkey = validateAddress(recipient);
      if (!recipientPubkey) {
        toast.error("Invalid recipient address");
        return null;
      }

      /**
       * Validate amount
       * 
       * Amount must be:
       * - A valid number (parseFloat succeeds)
       * - Greater than 0 (can't send 0 or negative)
       * 
       * WHY VALIDATE AMOUNT:
       * - Prevents sending 0 SOL (wasteful transaction)
       * - Prevents negative amounts (invalid)
       * - Better UX than blockchain rejection
       */
      const amountValue = validateAmount(amount, 0);
      if (!amountValue) {
        toast.error("Invalid amount. Must be greater than 0");
        return null;
      }

      /**
       * Check balance
       * 
       * WHY CHECK BALANCE:
       * - Transaction will fail on-chain if insufficient balance
       * - Better UX to check before sending
       * - Saves user time and potential gas fees
       * 
       * NOTE: We check SOL balance, not gas fees
       * - Gas fees are covered by paymaster (USDC)
       * - User only needs SOL for the transfer amount itself
       */
      if (balance !== null && amountValue > balance) {
        toast.error(`Insufficient balance. You have ${balance.toFixed(4)} SOL`);
        return null;
      }

      /**
       * Create transfer instruction
       * 
       * SystemProgram.transfer is the native Solana instruction for SOL transfers.
       * It's the simplest and most efficient way to send SOL.
       * 
       * ALTERNATE OPTIONS:
       * - Could use SPL Token program for wrapped SOL (not recommended)
       * - Could add memo instruction for transaction notes
       * - Could batch with other instructions
       */
      const instruction = createTransferInstruction(
        smartWalletPubkey,
        recipientPubkey,
        amountValue
      );

      /**
       * Execute transaction
       * 
       * The execute() function from useTransaction hook:
       * - Signs transaction with passkey
       * - Sends to LazorKit paymaster
       * - Paymaster wraps transaction and pays fees
       * - Returns transaction signature on success
       * 
       * WHY GASLESS:
       * - feeMode: "paymaster" is set in useTransaction hook
       * - User doesn't need SOL for gas
       * - Makes onboarding much easier
       */
      const sig = await execute([instruction]);

      /**
       * Refresh balance after successful transfer
       * 
       * WHY REFRESH:
       * - Balance changes after transfer
       * - User expects to see updated balance immediately
       * - Prevents stale data in UI
       * 
       * NOTE: This is optimistic - balance might not update instantly
       * - RPC nodes can be slow to reflect changes
       * - Consider showing pending state or retry logic
       */
      if (sig) {
        refreshBalance();
      }

      return sig;
    },
    [isConnected, smartWalletPubkey, balance, execute, refreshBalance]
  );

  return { transfer, loading, balance, balanceLoading, refreshBalance, error };
}
