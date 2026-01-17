/**
 * RPC Service
 *
 * Handles Solana RPC connections and balance fetching.
 * 
 * This service provides a singleton connection to the Solana network.
 * It's used for reading blockchain data (balances, transactions, etc.)
 * separate from LazorKit's transaction execution.
 * 
 * WHY SEPARATE RPC CONNECTION:
 * - LazorKit handles transactions, but we need RPC for queries
 * - Allows us to fetch balances, transaction history, etc.
 * - Can use different RPC endpoints for different purposes
 * - Singleton pattern prevents creating multiple connections
 * 
 * CONNECTION MODE: "confirmed"
 * - "confirmed" means transaction is confirmed by cluster
 * - Faster than "finalized" but still reliable
 * - Good balance between speed and certainty
 * - For critical operations, use "finalized" instead
 * 
 * ALTERNATE APPROACHES:
 * - Could use multiple connections for different purposes
 * - Could implement connection pooling for high-traffic apps
 * - Could use WebSocket subscriptions for real-time updates
 */

import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { DEFAULT_CONFIG } from "../constants";

/**
 * Singleton connection instance
 * 
 * WHY SINGLETON:
 * - Creating multiple connections is wasteful
 * - Reusing connection is more efficient
 * - Reduces RPC rate limit issues
 * - Connection setup has overhead, so reuse is better
 * 
 * NOTE: This is a module-level variable, so it persists across
 * component re-renders but resets on page reload (which is fine).
 */
let connectionInstance: Connection | null = null;

/**
 * Get or create a connection to the Solana network
 * 
 * This function implements the singleton pattern to ensure we only
 * create one connection instance and reuse it throughout the app.
 * 
 * WHY SINGLETON PATTERN:
 * - Connection creation has overhead
 * - Multiple connections can hit rate limits faster
 * - Reusing connection is more efficient
 * - Connection is stateless, so safe to reuse
 * 
 * CONNECTION CONFIGURATION:
 * - Uses DEFAULT_CONFIG.rpcUrl from constants
 * - "confirmed" commitment level (good balance of speed/reliability)
 * - Can be changed to "finalized" for critical operations
 * 
 * @returns Connection instance to Solana network
 * 
 * ALTERNATE APPROACHES:
 * - Could accept RPC URL as parameter for flexibility
 * - Could implement connection pooling for high-traffic apps
 * - Could add retry logic for connection failures
 */
export function getConnection(): Connection {
  if (!connectionInstance) {
    /**
     * Create new connection
     * 
     * Connection constructor parameters:
     * 1. RPC URL: Where to connect (from config)
     * 2. Commitment level: "confirmed" means transaction is confirmed by cluster
     * 
     * COMMITMENT LEVELS:
     * - "processed": Fastest, but may be rolled back
     * - "confirmed": Good balance (used here)
     * - "finalized": Slowest, but guaranteed final
     */
    connectionInstance = new Connection(DEFAULT_CONFIG.rpcUrl, "confirmed");
  }
  return connectionInstance;
}

/**
 * Fetch SOL balance for a wallet
 * 
 * This function queries the Solana blockchain for a wallet's SOL balance.
 * It's used throughout the app to display balances and validate transfers.
 * 
 * HOW IT WORKS:
 * 1. Gets RPC connection (singleton)
 * 2. Calls getBalance() which queries the blockchain
 * 3. Returns balance in lamports (smallest unit of SOL)
 * 4. Converts to SOL by dividing by LAMPORTS_PER_SOL
 * 
 * WHY CONVERT TO SOL:
 * - Blockchain stores balance in lamports (1 SOL = 1 billion lamports)
 * - Users think in SOL, not lamports
 * - Easier to display and work with
 * 
 * PERFORMANCE NOTE:
 * - RPC calls have latency (network round-trip)
 * - Consider caching balances for better UX
 * - Could use WebSocket subscriptions for real-time updates
 * 
 * @param pubkey - The wallet public key
 * @returns Balance in SOL (as a number)
 * 
 * ALTERNATE APPROACHES:
 * - Could return lamports for precision (avoid floating point issues)
 * - Could add retry logic for failed requests
 * - Could use batch requests for multiple balances
 */
export async function getSolBalance(pubkey: PublicKey): Promise<number> {
  const connection = getConnection();
  /**
   * Get balance from blockchain
   * 
   * getBalance() returns balance in lamports (smallest unit).
   * We convert to SOL for user-friendly display.
   */
  const balance = await connection.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Fetch SOL balance for a wallet address string
 * 
 * Convenience function that accepts a string address instead of PublicKey.
 * Useful when you have an address as a string (e.g., from user input).
 * 
 * WHY THIS WRAPPER:
 * - PublicKey constructor can throw on invalid addresses
 * - This function handles errors gracefully
 * - Returns 0 for invalid addresses (safe default)
 * 
 * ERROR HANDLING:
 * - Invalid addresses return 0 (safe default)
 * - Could throw error instead if you want strict validation
 * - Could return null to distinguish "invalid" from "zero balance"
 * 
 * @param address - The wallet address as string (base58)
 * @returns Balance in SOL, or 0 if address is invalid
 * 
 * ALTERNATE APPROACHES:
 * - Could throw error on invalid address (stricter)
 * - Could return null for invalid addresses (more explicit)
 * - Could validate address first, then fetch balance
 */
export async function getSolBalanceByAddress(address: string): Promise<number> {
  try {
    const pubkey = new PublicKey(address);
    return await getSolBalance(pubkey);
  } catch {
    /**
     * Invalid address - return 0 as safe default
     * 
     * WHY RETURN 0:
     * - Prevents app crashes from invalid addresses
     * - UI can handle 0 balance gracefully
     * - Could be improved to return null or throw error
     */
    return 0;
  }
}

/**
 * Clear any cached connection (for testing/refresh)
 */
export function clearConnectionCache(): void {
  connectionInstance = null;
}
