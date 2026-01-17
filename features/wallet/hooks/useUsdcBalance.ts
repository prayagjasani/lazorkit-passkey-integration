/**
 * useUsdcBalance Hook
 *
 * Custom hook for fetching and managing USDC balance.
 * 
 * This hook is similar to useSolBalance but for USDC tokens.
 * USDC is an SPL token, so fetching balance is more complex:
 * - Need to find the token account (not the wallet account)
 * - Need to parse token account data
 * - Need to handle decimals (USDC has 6 decimals)
 * 
 * WHY SEPARATE FROM SOL BALANCE:
 * - Different data structure (token account vs native account)
 * - Different RPC methods (getParsedTokenAccountsByOwner vs getBalance)
 * - Different decimal handling (6 vs 9 decimals)
 * - More complex (requires finding token account first)
 * 
 * KEY DIFFERENCES FROM SOL:
 * - SOL is stored in wallet's native account
 * - USDC is stored in a separate token account (ATA)
 * - Token accounts must be found/created before receiving tokens
 * - Balance is in token units, not lamports
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getMint } from "@solana/spl-token";
import { getConnection } from "@/lib/services/rpc";
import { USDC_MINT } from "@/lib/constants";

interface UseUsdcBalanceReturn {
  balance: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUsdcBalance(): UseUsdcBalanceReturn {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  /**
   * Refresh USDC balance from blockchain
   * 
   * This function queries the Solana blockchain for USDC token balance.
   * Unlike SOL, USDC is stored in a token account, so we need to:
   * 1. Find the token account for this wallet and USDC mint
   * 2. Parse the token account data
   * 3. Extract the balance (already in human-readable format)
   * 
   * WHY getParsedTokenAccountsByOwner:
   * - Returns token accounts in parsed format (easier to work with)
   * - Filters by mint address (only USDC accounts)
   * - Handles decimals automatically (returns uiAmount)
   * 
   * WHY CHECK FOR EMPTY:
   * - If wallet has never received USDC, token account might not exist
   * - Setting balance to 0 is correct (no USDC = 0 balance)
   * - Token account is created automatically on first USDC receipt
   * 
   * TOKEN ACCOUNT STRUCTURE:
   * - Each wallet can have multiple token accounts (one per token type)
   * - USDC token account stores USDC balance
   * - Account is created automatically when first USDC is received
   * - Account persists even if balance goes to 0
   * 
   * ALTERNATE APPROACHES:
   * - Could use getAssociatedTokenAddress + getAccount (more explicit)
   * - Could handle multiple token accounts (if wallet has multiple)
   * - Could add retry logic for failed requests
   */
  const refresh = useCallback(async () => {
    if (!smartWalletPubkey) return;

    setLoading(true);
    setError(null);

    try {
      const connection = getConnection();
      const mintPublicKey = new PublicKey(USDC_MINT);
      const walletPublicKey = smartWalletPubkey;

      /**
       * Get token accounts for this wallet and USDC mint
       * 
       * This RPC call returns all token accounts owned by the wallet
       * that match the USDC mint address. Usually there's only one.
       * 
       * WHY PARSED:
       * - Parsed format is easier to work with
       * - Automatically handles decimals
       * - Returns uiAmount (human-readable amount)
       * 
       * ALTERNATE:
       * - Could use getTokenAccountsByOwner (raw format, more work)
       * - Could use getAccount after deriving ATA address
       */
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { mint: mintPublicKey }
      );

      /**
       * Handle case where token account doesn't exist
       * 
       * WHY SET TO 0:
       * - No token account = no USDC = 0 balance
       * - This is the correct behavior
       * - Token account will be created on first USDC receipt
       */
      if (tokenAccounts.value.length === 0) {
        setBalance(0);
        return;
      }

      /**
       * Extract balance from token account
       * 
       * WHY FIRST ACCOUNT:
       * - Usually there's only one USDC token account per wallet
       * - If multiple exist (rare), first one is typically the main one
       * - Could be improved to find the "correct" account if needed
       * 
       * uiAmount:
       * - Already in human-readable format (e.g., 10.5 USDC)
       * - Decimals are already handled (6 decimals for USDC)
       * - No need to divide by decimals
       */
      const tokenAccount = tokenAccounts.value[0];
      const amount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;

      setBalance(amount || 0);
    } catch (err) {
      /**
       * Error handling
       * 
       * WHY SET TO 0 ON ERROR:
       * - Better UX than showing null or error state
       * - User can retry by calling refresh()
       * - Most errors are temporary (network issues)
       * 
       * ALTERNATE:
       * - Could show error state instead
       * - Could retry automatically
       * - Could cache last known balance
       */
      const message =
        err instanceof Error ? err.message : "Failed to fetch USDC balance";
      setError(message);
      console.error("Error fetching USDC balance:", err);
      setBalance(0); // Set to 0 on error
    } finally {
      setLoading(false);
    }
  }, [smartWalletPubkey]);

  // Auto-fetch on mount when connected
  useEffect(() => {
    if (isConnected && smartWalletPubkey && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [isConnected, smartWalletPubkey, refresh]);

  // Reset when disconnected
  useEffect(() => {
    if (!isConnected) {
      setBalance(null);
      hasFetchedRef.current = false;
    }
  }, [isConnected]);

  return { balance, loading, error, refresh };
}

