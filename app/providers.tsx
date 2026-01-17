"use client";
import React, { useEffect } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";
import { DEFAULT_CONFIG } from "@/lib/constants";
import { Toaster } from "react-hot-toast";

/**
 * AppProviders Component
 * 
 * This is the root provider component that wraps the entire application with
 * LazorKit SDK context. It's essential for enabling passkey authentication
 * and gasless transactions throughout the app.
 * 
 * WHY THIS IS NEEDED:
 * - LazorKit SDK requires a provider to manage wallet state globally
 * - The provider initializes the connection to LazorKit's portal service
 * - It configures the paymaster for gasless transactions
 * 
 * ALTERNATE APPROACHES:
 * - You could configure different providers for different routes if needed
 * - For multi-chain support, you'd need separate providers per chain
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  /**
   * Buffer Polyfill Setup
   * 
   * Solana Web3.js and other blockchain libraries expect Node.js globals like
   * Buffer, which aren't available in browsers by default. This polyfill
   * ensures compatibility.
   * 
   * WHY DYNAMIC IMPORT:
   * - Next.js Turbopack can crash if Buffer is imported statically
   * - Dynamic import allows graceful fallback if the package isn't available
   * - Most Solana libraries have their own fallbacks, so this is a safety net
   * 
   * ALTERNATE OPTIONS:
   * - Use a bundler plugin to inject Buffer automatically
   * - Use a different polyfill library if needed
   */
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Buffer) {
      (async () => {
        try {
          const bufferModule = await import("buffer");
          window.Buffer = bufferModule.Buffer;
        } catch (error) {
          // Graceful degradation - most Solana libraries handle missing Buffer
          console.warn("Buffer polyfill not available, some features may not work");
        }
      })();
    }
  }, []);

  /**
   * LazorKit Provider Configuration
   * 
   * rpcUrl: Solana RPC endpoint for blockchain interactions
   *   - Devnet: https://api.devnet.solana.com (free, for testing)
   *   - Mainnet: Use a reliable RPC provider (Helius, QuickNode, etc.)
   * 
   * portalUrl: LazorKit's portal service URL
   *   - This handles passkey creation and wallet management
   *   - Don't change this unless using a custom LazorKit deployment
   * 
   * paymasterConfig: Configuration for gasless transactions
   *   - paymasterUrl: The paymaster service that covers transaction fees
   *   - Fees are deducted from user's USDC balance automatically
   *   - For mainnet, update to mainnet paymaster URL
   */
  return (
    <LazorkitProvider
      rpcUrl={DEFAULT_CONFIG.rpcUrl}
      portalUrl={DEFAULT_CONFIG.portalUrl}
      paymasterConfig={DEFAULT_CONFIG.paymasterConfig}
    >
      {children}
      <Toaster position="top-right" />
    </LazorkitProvider>
  );
}
