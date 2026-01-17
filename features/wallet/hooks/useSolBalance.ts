/**
 * useSolBalance Hook
 *
 * Custom hook for fetching and managing SOL balance.
 * 
 * This hook provides a simple interface for displaying and refreshing
 * a user's SOL balance. It handles:
 * - Automatic fetching when wallet connects
 * - Loading states for better UX
 * - Error handling with user-friendly messages
 * - Manual refresh capability
 * 
 * WHY THIS HOOK:
 * - Balance fetching is a common operation throughout the app
 * - Centralizes balance logic in one place
 * - Provides consistent loading/error states
 * - Easy to use in any component
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Balance is fetched once on mount (not continuously)
 * - Manual refresh available for real-time updates
 * - Could be improved with WebSocket subscriptions for live updates
 * - Consider caching with TTL for high-frequency components
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { getSolBalance } from "@/lib/services/rpc";

interface UseSolBalanceOptions {
  /** Auto-fetch on mount when connected */
  autoFetch?: boolean;
}

interface UseSolBalanceReturn {
  /** Current SOL balance (null if not fetched) */
  balance: number | null;
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually refresh the balance */
  refresh: () => Promise<void>;
}

/**
 * Hook to manage SOL balance fetching
 *
 * @example
 * ```tsx
 * const { balance, loading, refresh } = useSolBalance();
 *
 * return (
 *   <div>
 *     {loading ? "Loading..." : `${balance?.toFixed(4)} SOL`}
 *     <button onClick={refresh}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export function useSolBalance(
  options: UseSolBalanceOptions = {}
): UseSolBalanceReturn {
  const { autoFetch = true } = options;
  const { smartWalletPubkey, isConnected } = useWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  /**
   * Refresh balance from blockchain
   * 
   * This function queries the Solana blockchain for the current SOL balance.
   * It's called automatically on mount and can be called manually for updates.
   * 
   * WHY ASYNC:
   * - RPC calls have network latency
   * - Need to handle loading states
   * - Errors can occur (network issues, RPC down, etc.)
   * 
   * ERROR HANDLING:
   * - Catches all errors and sets error state
   * - Logs error for debugging
   * - Doesn't crash the app
   * - User can retry by calling refresh() again
   * 
   * ALTERNATE APPROACHES:
   * - Could add retry logic for failed requests
   * - Could cache balance with TTL
   * - Could use WebSocket for real-time updates
   */
  const refresh = useCallback(async () => {
    if (!smartWalletPubkey) return;

    setLoading(true);
    setError(null);

    try {
      const bal = await getSolBalance(smartWalletPubkey);
      setBalance(bal);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(message);
      console.error("Error fetching balance:", err);
    } finally {
      setLoading(false);
    }
  }, [smartWalletPubkey]);

  /**
   * Auto-fetch balance when wallet connects
   * 
   * WHY AUTO-FETCH:
   * - Users expect to see balance immediately after connecting
   * - Better UX than requiring manual refresh
   * - Most components need balance data right away
   * 
   * WHY hasFetchedRef:
   * - Prevents multiple fetches on re-renders
   * - useRef persists across renders but doesn't trigger re-renders
   * - More efficient than useState for this use case
   * 
   * DEPENDENCIES:
   * - autoFetch: Option to disable auto-fetch if needed
   * - isConnected: Only fetch when wallet is connected
   * - smartWalletPubkey: Need wallet address to fetch balance
   * - refresh: The function to call (memoized with useCallback)
   */
  useEffect(() => {
    if (
      autoFetch &&
      isConnected &&
      smartWalletPubkey &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [autoFetch, isConnected, smartWalletPubkey, refresh]);

  /**
   * Reset balance when wallet disconnects
   * 
   * WHY RESET:
   * - Balance is wallet-specific, shouldn't persist after disconnect
   * - Prevents showing stale balance from previous session
   * - Clear state for better UX
   * 
   * WHY RESET hasFetchedRef:
   * - Allows auto-fetch to work again on next connection
   * - Ensures fresh data on reconnect
   */
  useEffect(() => {
    if (!isConnected) {
      setBalance(null);
      hasFetchedRef.current = false;
    }
  }, [isConnected]);

  return { balance, loading, error, refresh };
}
