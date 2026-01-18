"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { encryptLocal } from "@/lib/utils";
import { SpotlightButton } from "@/components/common/SpotlightButton";
import toast from "react-hot-toast";

/**
 * PasskeySetup Component
 * 
 * This component handles the initial wallet creation using passkey authentication.
 * It's the entry point for users to create a Solana wallet without seed phrases.
 * 
 * HOW IT WORKS:
 * 1. User clicks "Continue with Passkey"
 * 2. Browser prompts for biometric authentication (Face ID, Touch ID, etc.)
 * 3. LazorKit SDK creates a passkey credential and generates a smart wallet
 * 4. The wallet address is returned and can be used immediately
 * 
 * WHY PASSKEYS:
 * - No seed phrases to manage or lose
 * - Hardware-backed security (stored in device secure enclave)
 * - Cross-device access via passkey sync (iCloud Keychain, Google Password Manager)
 * - Better UX - just biometric authentication
 * 
 * ALTERNATE APPROACHES:
 * - You could add email/password as a fallback (not recommended for crypto)
 * - For advanced users, you could offer seed phrase import as an option
 */
export function PasskeySetup({
  onConnected,
}: {
  onConnected: (walletAddress: string) => void;
}) {
  /**
   * useWallet Hook
   * 
   * This is the main hook from LazorKit SDK that provides:
   * - connect(): Initiates passkey creation/wallet connection
   * - isConnected: Boolean indicating if wallet is connected
   * - isConnecting: Boolean for loading state during connection
   * - wallet: Wallet object containing smartWallet address and other info
   * 
   * The hook automatically manages the connection state and provides
   * the smart wallet address once connected.
   */
  const { connect, isConnected, isConnecting, wallet } = useWallet();
  const [error, setError] = useState<string | null>(null);

  /**
   * Auto-trigger onConnected callback when wallet is ready
   * 
   * WHY THIS PATTERN:
   * - The connect() call is async and may take a few seconds
   * - We want to notify the parent component as soon as the wallet is ready
   * - This allows the parent to redirect or update UI immediately
   * 
   * DEPENDENCIES:
   * - isConnected: Changes when connection state changes
   * - wallet?.smartWallet: Changes when wallet address is available
   * - onConnected: Callback function (should be stable via useCallback in parent)
   */
  useEffect(() => {
    if (isConnected && wallet?.smartWallet) {
      onConnected(wallet.smartWallet);
    }
  }, [isConnected, wallet, onConnected]);

  /**
   * Handle Passkey Connection
   * 
   * This function initiates the passkey creation flow. When called:
   * 1. Browser shows biometric prompt (Face ID, Touch ID, Windows Hello)
   * 2. User authenticates with their biometric
   * 3. LazorKit SDK creates a passkey credential
   * 4. A smart wallet is automatically generated on Solana
   * 5. The wallet address is returned
   * 
   * WHY feeMode: "paymaster":
   * - This enables gasless transactions from the start
   * - The wallet creation transaction itself is gasless
   * - All future transactions can be gasless too
   * 
   * CREDENTIAL STORAGE:
   * - We encrypt and store the credentialId locally for session restoration
   * - This allows users to reconnect without re-authenticating
   * - The encryption uses device-specific keys (see lib/utils.ts)
   * 
   * ERROR HANDLING:
   * - NotAllowedError: User cancelled the biometric prompt
   * - PublicKeyCredential: Browser doesn't support WebAuthn (very rare)
   * - Other errors: Network issues, LazorKit service problems, etc.
   */
  async function handleConnect() {
    setError(null);
    try {
      /**
       * Connect with paymaster mode
       * 
       * feeMode: "paymaster" means:
       * - Transaction fees are paid by LazorKit's paymaster
       * - Fees are deducted from user's USDC balance (if available)
       * - User doesn't need SOL for gas fees
       * 
       * ALTERNATE OPTIONS:
       * - feeMode: "user" - User pays fees in SOL (traditional approach)
       * - No feeMode - Defaults to paymaster if configured
       */
      const info = await connect({ feeMode: "paymaster" });
      
      /**
       * Store credential ID for session restoration
       * 
       * WHY STORE THIS:
       * - Allows automatic reconnection on page reload
       * - Users don't need to re-authenticate every time
       * - Encrypted for security (see encryptLocal function)
       * 
       * SECURITY NOTE:
       * - The credentialId alone isn't enough to access the wallet
       * - Still requires biometric authentication (passkey)
       * - Stored encrypted with device-specific keys
       */
      if (info?.credentialId) {
        const encrypted = await encryptLocal(info.credentialId);
        localStorage.setItem("lk_credential", encrypted);
      }
      toast.success("Wallet connected!");
    } catch (e: unknown) {
      const err = e as Error;
      const msg = err?.message || "Passkey connection failed";
      setError(msg);
      
      /**
       * User-friendly error messages
       * 
       * WHY SPECIFIC ERROR HANDLING:
       * - Different errors require different user actions
       * - NotAllowedError: User just needs to try again and approve
       * - PublicKeyCredential: User needs a different browser
       * - Other errors: May be temporary network issues
       */
      if (msg.includes("NotAllowedError")) {
        toast.error("You cancelled the passkey prompt.");
      } else if (msg.includes("PublicKeyCredential")) {
        toast.error("Your browser does not support WebAuthn.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-black text-center">Your Smart Passkey Wallet</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <SpotlightButton
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting" : "Continue"}
          </SpotlightButton>
          <p className="text-xs text-[#8e8e93] text-center">
            Powered by LazorKit
          </p>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {wallet?.smartWallet && (
          <div className="mt-4 p-4 rounded-xl bg-[#7454f7]/10 border border-[#7454f7]/20">
            <p className="text-sm text-[#7454f7] font-semibold">
              Wallet Created
            </p>
            <p className="text-xs text-[#8e8e93] mt-1 font-mono break-all">
              {wallet.smartWallet}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
