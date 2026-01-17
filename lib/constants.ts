/**
 * LazorKit Default Configuration
 * 
 * This file contains all the configuration needed to connect to LazorKit services.
 * These values are used throughout the app for wallet initialization and transactions.
 * 
 * WHY CENTRALIZED CONFIG:
 * - Single source of truth for all LazorKit settings
 * - Easy to switch between devnet/mainnet
 * - Easy to update if LazorKit endpoints change
 * - Can be overridden with environment variables if needed
 * 
 * CONFIGURATION OPTIONS:
 * 
 * rpcUrl: Solana RPC endpoint
 *   - Devnet: https://api.devnet.solana.com (free, for testing)
 *   - Mainnet: Use a reliable RPC provider (Helius, QuickNode, Alchemy, etc.)
 *   - NOTE: Public RPCs have rate limits, consider using a paid service for production
 * 
 * portalUrl: LazorKit Portal Service
 *   - This handles passkey creation and wallet management
 *   - Don't change this unless using a custom LazorKit deployment
 *   - The portal coordinates between your app and LazorKit's infrastructure
 * 
 * paymasterConfig: Gasless Transaction Configuration
 *   - paymasterUrl: The paymaster service that covers transaction fees
 *   - Fees are deducted from user's USDC balance automatically
 *   - Devnet: https://kora.devnet.lazorkit.com (for testing)
 *   - Mainnet: Update to mainnet paymaster URL for production
 * 
 * ALTERNATE APPROACHES:
 * - Could use environment variables for different environments
 * - Could have separate config files for devnet/mainnet
 * - Could fetch config from a remote source for easier updates
 */
export const DEFAULT_CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",
  portalUrl: "https://portal.lazor.sh",
  paymasterConfig: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
};

/**
 * Devnet USDC Mint Address
 * 
 * This is the official USDC mint address on Solana Devnet.
 * Used for:
 * - Checking USDC balance
 * - Creating USDC transfer instructions
 * - Paymaster fee payments (fees are paid in USDC)
 * 
 * WHY THIS IS NEEDED:
 * - SPL tokens require the mint address to identify the token
 * - Different networks have different mint addresses
 * - Mainnet USDC has a different address
 * 
 * MAINNET USDC:
 * - Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 * - Update this constant when deploying to mainnet
 * 
 * ALTERNATE TOKENS:
 * - Could support other stablecoins (USDT, etc.)
 * - Could allow users to choose which token to use for fees
 */
export const USDC_MINT = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";