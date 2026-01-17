/**
 * useTransaction Hook
 *
 * This is the core hook for executing gasless transactions with LazorKit.
 * It wraps LazorKit's signAndSendTransaction with additional features:
 * - Loading state management
 * - Error parsing and user-friendly messages
 * - Toast notifications for user feedback
 * - Automatic paymaster integration
 * 
 * KEY FEATURE: Gasless Transactions
 * - All transactions use paymaster mode by default
 * - Fees are paid in USDC (deducted from user's balance)
 * - User doesn't need SOL for gas fees
 * - Makes onboarding much easier
 * 
 * HOW IT WORKS:
 * 1. Receives array of TransactionInstructions
 * 2. Signs transaction with user's passkey (biometric prompt)
 * 3. Sends to LazorKit paymaster service
 * 4. Paymaster wraps transaction and pays fees
 * 5. Transaction executes on Solana blockchain
 * 6. Returns signature for tracking
 * 
 * WHY THIS ABSTRACTION:
 * - Consistent error handling across all transactions
 * - Centralized loading state management
 * - User-friendly error messages
 * - Easy to add retry logic, analytics, etc.
 */

import { useState, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { TransactionInstruction } from "@solana/web3.js";
import toast from "react-hot-toast";

interface UseTransactionOptions {
  /** Toast message while waiting for passkey approval */
  loadingMessage?: string;
  /** Toast message on success */
  successMessage?: string;
}

interface UseTransactionReturn {
  /** Execute the transaction with given instructions */
  execute: (instructions: TransactionInstruction[]) => Promise<string | null>;
  /** Loading state */
  loading: boolean;
  /** Last transaction signature */
  signature: string | null;
  /** Last error message */
  error: string | null;
}

/**
 * Parse and handle transaction errors with user-friendly messages
 * 
 * WHY THIS FUNCTION EXISTS:
 * - Blockchain errors are often technical and cryptic
 * - Users need actionable feedback, not raw error messages
 * - Different error types require different user actions
 * 
 * ERROR CATEGORIES:
 * - Authentication errors (cancelled passkey, signing failed)
 * - Balance errors (insufficient funds)
 * - Network errors (timeout, rate limits)
 * - Transaction errors (too large, invalid)
 * 
 * ALTERNATE APPROACH:
 * - Could use a more sophisticated error parsing library
 * - Could integrate with error tracking service (Sentry, etc.)
 * - Could provide error codes for programmatic handling
 * 
 * @param error - The error object or message to parse
 * @returns User-friendly error message string
 */
function parseTransactionError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (
    errorMessage.includes("NotAllowedError") ||
    errorMessage.includes("cancelled") ||
    errorMessage.includes("canceled")
  ) {
    return "You cancelled the passkey prompt. Please try again and approve when prompted.";
  }

  if (errorMessage.includes("Signing failed")) {
    return "Signing failed. Please ensure you're using HTTPS and your device supports passkeys.";
  }

  if (
    errorMessage.includes("insufficient") ||
    errorMessage.includes("Insufficient")
  ) {
    return "Insufficient balance. For gasless transactions, ensure you have USDC in your wallet.";
  }

  if (errorMessage.includes("Transaction too large")) {
    return "Transaction exceeds size limit. Try breaking it into smaller transactions or contact support.";
  }

  if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return "Request timed out. The network might be slow. Please try again.";
  }

  if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  return errorMessage || "Transaction failed. Please check your connection and try again.";
}

/**
 * Hook to execute gasless transactions
 *
 * @example
 * ```tsx
 * const { execute, loading } = useTransaction({
 *   successMessage: "Transfer complete! 🎉"
 * });
 *
 * const handleSend = async () => {
 *   const instruction = createTransferInstruction(...);
 *   const sig = await execute([instruction]);
 *   if (sig) {
 *     // Transaction succeeded
 *   }
 * };
 * ```
 */
export function useTransaction(
  options: UseTransactionOptions = {}
): UseTransactionReturn {
  const {
    loadingMessage = "Approve with your passkey...",
    successMessage = "Transaction successful! 🎉",
  } = options;

  const { signAndSendTransaction, isConnected, smartWalletPubkey } =
    useWallet();

  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (instructions: TransactionInstruction[]): Promise<string | null> => {
      if (!isConnected || !smartWalletPubkey) {
        toast.error("Please connect your wallet first");
        return null;
      }

      if (instructions.length === 0) {
        toast.error("No instructions provided");
        return null;
      }

      setLoading(true);
      setError(null);
      const toastId = toast.loading(loadingMessage);

      try {
        /**
         * Execute transaction with LazorKit SDK
         * 
         * signAndSendTransaction is the core function from LazorKit SDK that:
         * 1. Prompts user for biometric authentication (passkey)
         * 2. Signs the transaction with user's private key
         * 3. Sends to LazorKit paymaster service
         * 4. Paymaster wraps transaction and pays fees in USDC
         * 5. Transaction is broadcast to Solana network
         * 6. Returns transaction signature
         * 
         * WHY feeToken: "USDC":
         * - This enables gasless transactions
         * - Paymaster pays fees using user's USDC balance
         * - User doesn't need SOL for gas fees
         * - Makes onboarding much easier (no need to buy SOL first)
         * 
         * ALTERNATE OPTIONS:
         * - feeToken: "SOL" - User pays fees in SOL (traditional approach)
         * - No feeToken - Defaults to paymaster if configured
         * 
         * TRANSACTION FLOW:
         * 1. User clicks "Send" button
         * 2. Browser shows biometric prompt (Face ID, Touch ID, etc.)
         * 3. User authenticates
         * 4. Transaction is signed and sent
         * 5. Paymaster wraps and pays fees
         * 6. Transaction executes on-chain
         * 7. Signature is returned
         */
        const sig = await signAndSendTransaction({
          instructions,
          transactionOptions: {
            feeToken: "USDC", // Gasless - paymaster covers fees
          },
        });

        toast.dismiss(toastId);
        toast.success(successMessage);
        setSignature(sig);
        return sig;
      } catch (err) {
        toast.dismiss(toastId);
        const message = parseTransactionError(err);
        setError(message);
        toast.error(message);
        console.error("Transaction failed:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isConnected,
      smartWalletPubkey,
      signAndSendTransaction,
      loadingMessage,
      successMessage,
    ]
  );

  return { execute, loading, signature, error };
}
