/**
 * USDC Transfer Service
 *
 * Handles gasless USDC (SPL token) transfers with LazorKit.
 * 
 * This service is different from SOL transfers because USDC is an SPL token,
 * not native Solana currency. SPL tokens require:
 * - Associated Token Accounts (ATAs) for each wallet
 * - SPL Token Program instructions (not SystemProgram)
 * - Different decimal handling (USDC has 6 decimals, SOL has 9)
 * 
 * KEY CONCEPTS:
 * - SPL Tokens: Tokens built on Solana's SPL Token standard
 * - Associated Token Account (ATA): Each wallet has a token account per token
 * - Token Program: The program that handles token transfers
 * - Decimals: USDC has 6 decimals (1 USDC = 1,000,000 micro-USDC)
 * 
 * WHY SEPARATE FROM SOL TRANSFERS:
 * - Different instruction types (SPL Token vs SystemProgram)
 * - Different account structure (token accounts vs native accounts)
 * - Different decimal precision (6 vs 9)
 * - More complex (requires ATA derivation)
 */

import {
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { USDC_MINT } from "@/lib/constants";

/**
 * Create a USDC transfer instruction
 *
 * This function creates the instruction needed to transfer USDC tokens.
 * Unlike SOL transfers, USDC transfers require:
 * 1. Finding/creating Associated Token Accounts (ATAs) for both wallets
 * 2. Using SPL Token Program instructions
 * 3. Converting amount to smallest unit (micro-USDC)
 * 
 * HOW IT WORKS:
 * 1. Derive ATA addresses for sender and recipient
 * 2. Convert USDC amount to micro-USDC (6 decimals)
 * 3. Create transfer instruction using SPL Token Program
 * 4. Return instruction to be executed with LazorKit
 * 
 * ASSOCIATED TOKEN ACCOUNTS (ATAs):
 * - Each wallet needs a token account for each token type
 * - ATAs are derived deterministically from wallet + mint address
 * - If ATA doesn't exist, it must be created first (separate instruction)
 * - This function assumes ATAs exist (creation handled elsewhere if needed)
 * 
 * DECIMAL CONVERSION:
 * - USDC has 6 decimals (1 USDC = 1,000,000 micro-USDC)
 * - We multiply by 1,000,000 to convert to smallest unit
 * - Use Math.floor to avoid floating point precision issues
 * 
 * @param fromPubkey - Sender's wallet public key (from LazorKit)
 * @param toPubkey - Recipient's wallet public key
 * @param amountUsdc - Amount in USDC (human-readable, e.g., 10.5)
 * @returns Transaction instruction for USDC transfer
 * 
 * ALTERNATE APPROACHES:
 * - Could check if ATAs exist and create them if needed
 * - Could support other SPL tokens (not just USDC)
 * - Could batch multiple token transfers in one transaction
 * 
 * @example
 * ```ts
 * const instruction = await createUsdcTransferInstruction(
 *   senderPubkey,
 *   recipientPubkey,
 *   10.5 // 10.5 USDC
 * );
 * await signAndSendTransaction({ instructions: [instruction] });
 * ```
 */
export async function createUsdcTransferInstruction(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amountUsdc: number
): Promise<TransactionInstruction> {
  const mintPublicKey = new PublicKey(USDC_MINT);

  // Ensure fromPubkey is a valid PublicKey instance
  // Handle both PublicKey objects and string addresses
  let fromPubkeyInstance: PublicKey;
  try {
    if (fromPubkey instanceof PublicKey) {
      fromPubkeyInstance = fromPubkey;
    } else if (typeof fromPubkey === "string") {
      fromPubkeyInstance = new PublicKey(fromPubkey);
    } else {
      // If it has a toBase58 method, it's likely a PublicKey-like object
      fromPubkeyInstance = new PublicKey((fromPubkey as any).toBase58?.() || String(fromPubkey));
    }
  } catch (error) {
    throw new Error(`Invalid sender public key: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // Ensure toPubkey is a valid PublicKey instance
  let toPubkeyInstance: PublicKey;
  try {
    if (toPubkey instanceof PublicKey) {
      toPubkeyInstance = toPubkey;
    } else if (typeof toPubkey === "string") {
      toPubkeyInstance = new PublicKey(toPubkey);
    } else {
      toPubkeyInstance = new PublicKey((toPubkey as any).toBase58?.() || String(toPubkey));
    }
  } catch (error) {
    throw new Error(`Invalid recipient public key: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  /**
   * Get Associated Token Account addresses
   * 
   * WHY WE NEED ATAs:
   * - SPL tokens are stored in token accounts, not wallet accounts
   * - Each wallet has a separate token account for each token type
   * - ATAs are derived deterministically (same inputs = same address)
   * - If ATA doesn't exist, tokens can't be received
   * 
   * DERIVATION:
   * - ATA address = PDA derived from (wallet, token mint, token program)
   * - getAssociatedTokenAddress() handles this derivation
   * - Returns the same address every time (deterministic)
   * 
   * NOTE ON ALLOW_OWNER_OFF_CURVE:
   * - LazorKit smart wallets are PDAs (Program Derived Addresses) which are off-curve
   * - Must set allowOwnerOffCurve: true to work with smart wallets
   * - Regular wallets are on-curve, but this flag works for both
   * 
   * NOTE: This function doesn't create the ATA, just gets the address.
   * If the ATA doesn't exist, the transfer will fail.
   * Consider adding ATA creation instruction if needed.
   */
  const fromTokenAccount = await getAssociatedTokenAddress(
    mintPublicKey, // USDC mint address
    fromPubkeyInstance, // Sender's wallet (LazorKit smart wallet is a PDA/off-curve)
    true // allowOwnerOffCurve - true because smart wallets are PDAs
  );

  // For recipient, check if it's off-curve (could be another smart wallet)
  // Set allowOwnerOffCurve to true to handle both cases
  const toTokenAccount = await getAssociatedTokenAddress(
    mintPublicKey, // USDC mint address
    toPubkeyInstance, // Recipient's wallet
    true // allowOwnerOffCurve - true to support both regular wallets and PDAs
  );

  /**
   * Convert USDC amount to smallest unit
   * 
   * WHY CONVERSION:
   * - Blockchain stores amounts in smallest units (micro-USDC)
   * - USDC has 6 decimals (1 USDC = 1,000,000 micro-USDC)
   * - Users think in USDC, blockchain thinks in micro-USDC
   * 
   * WHY Math.floor:
   * - Prevents floating point precision issues
   * - Ensures we don't send fractional micro-USDC
   * - More predictable behavior
   * 
   * EXAMPLE:
   * - 10.5 USDC = 10,500,000 micro-USDC
   * - 0.1 USDC = 100,000 micro-USDC
   * - 1 USDC = 1,000,000 micro-USDC
   */
  const amountInSmallestUnit = Math.floor(amountUsdc * 1_000_000);

  /**
   * Create SPL Token transfer instruction
   * 
   * This is the actual instruction that will be executed on-chain.
   * It tells the SPL Token Program to transfer tokens from one
   * token account to another.
   * 
   * PARAMETERS:
   * - fromTokenAccount: Source token account (sender's USDC account)
   * - toTokenAccount: Destination token account (recipient's USDC account)
   * - fromPubkey: Owner of source account (signer)
   * - amountInSmallestUnit: Amount in micro-USDC
   * - []: Multi-signers (empty for single-signer transactions)
   * - TOKEN_PROGRAM_ID: The SPL Token Program ID
   * 
   * GASLESS EXECUTION:
   * - This instruction is executed with LazorKit's paymaster
   * - Fees are paid in USDC (deducted from user's balance)
   * - User doesn't need SOL for gas fees
   */
  return createTransferInstruction(
    fromTokenAccount, // source
    toTokenAccount, // destination
    fromPubkeyInstance, // owner
    amountInSmallestUnit, // amount in smallest unit (micro-USDC)
    [], // multiSigners
    TOKEN_PROGRAM_ID // token program
  );
}

/**
 * Validate USDC amount
 * @param amount - Amount string to validate
 * @param minAmount - Minimum amount (default 0)
 * @returns Parsed amount or null if invalid
 */
export function validateUsdcAmount(
  amount: string,
  minAmount: number = 0
): number | null {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= minAmount) {
    return null;
  }
  return parsed;
}

