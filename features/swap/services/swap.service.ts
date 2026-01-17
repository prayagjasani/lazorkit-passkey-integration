/**
 * Swap Service
 *
 * Handles token swaps using Jupiter Aggregator API.
 * 
 * IMPORTANT: Jupiter Swap API only supports MAINNET, not devnet/testnet.
 * Even if your app is configured for devnet, swaps will execute on mainnet.
 * 
 * Supports SOL <-> USDC swaps on Solana mainnet.
 */

import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { USDC_MINT } from "@/lib/constants";

// Jupiter API endpoints (Lite - free version)
// NOTE: Jupiter only supports mainnet, not devnet/testnet
const JUPITER_QUOTE_API = "https://lite-api.jup.ag/swap/v1/quote";
const JUPITER_SWAP_API = "https://lite-api.jup.ag/swap/v1/swap";

// Mainnet USDC mint (Jupiter uses mainnet)
const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Native SOL mint (wrapped SOL)
export const SOL_MINT = "So11111111111111111111111111111111111111112";

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: any[];
}

export interface SwapResponse {
  swapTransaction: string;
}

/**
 * Get mint address for token
 * NOTE: Jupiter only works on mainnet, so we use mainnet mints
 */
export function getMintAddress(token: "SOL" | "USDC"): string {
  // Jupiter only supports mainnet, so use mainnet mints
  if (token === "SOL") {
    return SOL_MINT; // SOL mint is the same on all networks
  }
  // Use mainnet USDC mint for Jupiter swaps
  return MAINNET_USDC_MINT;
}

/**
 * Get swap quote from Jupiter
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount in human-readable format (e.g., 1.5 SOL)
 * @param slippageBps - Slippage in basis points (default 50 = 0.5%)
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50
): Promise<SwapQuote | null> {
  try {
    // Convert amount to raw units
    // SOL has 9 decimals, USDC has 6 decimals
    const inputDecimals = inputMint === SOL_MINT ? 9 : 6;
    const amountInRaw = Math.floor(amount * Math.pow(10, inputDecimals));

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountInRaw.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: "false",
    });

    const response = await fetch(`${JUPITER_QUOTE_API}?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jupiter quote error:", errorText);
      throw new Error(`Failed to fetch swap quote: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.outAmount) {
      throw new Error("Invalid quote response from Jupiter");
    }

    return {
      inputMint: data.inputMint,
      outputMint: data.outputMint,
      inAmount: data.inAmount,
      outAmount: data.outAmount,
      priceImpactPct: parseFloat(data.priceImpactPct || "0"),
      routePlan: data.routePlan || [],
    };
  } catch (error) {
    console.error("Error getting swap quote:", error);
    return null;
  }
}

/**
 * Get swap transaction from Jupiter
 * @param userPublicKey - User's wallet public key
 * @param quote - Swap quote from getSwapQuote
 * @param wrapUnwrapSOL - Whether to wrap/unwrap SOL (default true)
 */
export async function getSwapTransaction(
  userPublicKey: PublicKey,
  quote: SwapQuote,
  wrapUnwrapSOL: boolean = true
): Promise<string | null> {
  try {
    const response = await fetch(JUPITER_SWAP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey.toString(),
        wrapUnwrapSOL,
        // Optimize for transaction landing (per Jupiter docs)
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh",
          },
        },
        // Use legacy transaction for LazorKit compatibility
        asLegacyTransaction: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Jupiter swap error:", errorText);
      throw new Error(`Failed to get swap transaction: ${response.statusText}`);
    }

    const data: SwapResponse = await response.json();

    if (!data || !data.swapTransaction) {
      const errorMessage = (data as any)?.error || "Invalid swap transaction response from Jupiter";
      throw new Error(errorMessage);
    }

    return data.swapTransaction;
  } catch (error) {
    console.error("Error getting swap transaction:", error);
    return null;
  }
}

/**
 * Deserialize swap transaction from base64
 * @param transactionBase64 - Base64 encoded transaction
 * @param isLegacy - Whether the transaction is legacy (true) or versioned (false)
 */
export function deserializeSwapTransaction(
  transactionBase64: string,
  isLegacy: boolean = true
): Transaction | VersionedTransaction {
  // Use global Buffer (polyfilled in providers.tsx) or create from base64
  const transactionBuffer = typeof Buffer !== "undefined" 
    ? Buffer.from(transactionBase64, "base64")
    : Uint8Array.from(atob(transactionBase64), c => c.charCodeAt(0));
  
  if (isLegacy) {
    return Transaction.from(transactionBuffer);
  }
  return VersionedTransaction.deserialize(transactionBuffer);
}

/**
 * Convert output amount to human-readable format
 * @param outAmount - Raw output amount as string
 * @param outputToken - Output token type
 */
export function formatOutputAmount(
  outAmount: string,
  outputToken: "SOL" | "USDC"
): number {
  const decimals = outputToken === "SOL" ? 9 : 6;
  return parseInt(outAmount) / Math.pow(10, decimals);
}

