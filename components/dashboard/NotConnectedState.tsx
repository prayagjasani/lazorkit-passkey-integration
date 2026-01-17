"use client";

import { PasskeySetup } from "@/components";

interface NotConnectedStateProps {
  /** Page title to display */
  title: string;
  /** Message to show the user */
  message?: string;
  /** Whether to show the passkey setup component */
  showSetup?: boolean;
}

/**
 * Consistent "not connected" state for dashboard pages
 *
 * @example
 * ```tsx
 * if (!isConnected) {
 *   return (
 *     <NotConnectedState
 *       title="Transfer SOL"
 *       message="Please connect your wallet to send SOL."
 *     />
 *   );
 * }
 * ```
 */
export function NotConnectedState({
  title,
  message = "Please connect your wallet to continue.",
  showSetup = false,
}: NotConnectedStateProps) {
  return (
    <div className="min-h-screen bg-[#f2f2f7] p-8 text-black">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-[#8e8e93]">{message}</p>
        {showSetup && (
          <div className="mt-8">
            <PasskeySetup onConnected={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
