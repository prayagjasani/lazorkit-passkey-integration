"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  NotConnectedState,
  InfoBanner,
} from "@/components/dashboard";
import { useSession } from "@/features/session/hooks";
import { SessionStatusCard, SessionTimer } from "@/components/session";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

export default function SessionDemoPage() {
  const { isConnected, wallet } = useWallet();
  const {
    session,
    isValid,
    isExpiringSoon,
    timeRemaining,
    createNewSession,
    endSession,
    extendCurrentSession,
    refresh,
  } = useSession({
    autoRestore: true,
    autoSync: true,
  });

  const [localStorageData, setLocalStorageData] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  // Refresh session data when component mounts or when navigating back
  useEffect(() => {
    // Refresh immediately when component mounts to restore from localStorage
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not when refresh changes

  // Update localStorage viewer
  useEffect(() => {
    const updateLocalStorage = () => {
      const sessionData = localStorage.getItem("LazorKey_session");
      const lastActivity = localStorage.getItem("LazorKey_last_activity");
      const preferences = localStorage.getItem("LazorKey_user_preferences");

      setLocalStorageData(
        JSON.stringify(
          {
            session: sessionData ? JSON.parse(sessionData) : null,
            lastActivity,
            preferences: preferences ? JSON.parse(preferences) : null,
          },
          null,
          2
        )
      );
    };

    updateLocalStorage();
    const interval = setInterval(updateLocalStorage, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected || !wallet?.smartWallet) {
    return (
      <NotConnectedState
        title="Session Persistence Demo"
        message="Please connect your wallet to see session persistence in action."
        showSetup
      />
    );
  }

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleExtendSession = () => {
    const extended = extendCurrentSession(24 * 60 * 60 * 1000); // Extend by 24 hours
    if (extended) {
      toast.success("Session extended by 24 hours!");
      refresh();
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session?")) {
      endSession(false);
      toast.success("Session ended");
      refresh();
    }
  };

  const walletUrl = `${window.location.origin}/login?wallet=${wallet.smartWallet}`;

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Session Persistence Demo"
          description="See how your session persists across page refreshes and devices"
        />

        {/* Session Status */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <SessionStatusCard
            session={session}
            isValid={isValid}
            isExpiringSoon={isExpiringSoon}
            timeRemaining={timeRemaining}
          />
          <SessionTimer timeRemaining={timeRemaining} isExpiringSoon={isExpiringSoon} />
        </div>

        {/* Actions */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Session Actions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleRefreshPage} variant="secondary">
                Refresh Page (Test Persistence)
              </Button>
              <Button onClick={handleExtendSession} disabled={!isValid}>
                Extend Session (+24h)
              </Button>
              <Button onClick={handleEndSession} variant="destructive" disabled={!session}>
                End Session
              </Button>
              <Button onClick={refresh} variant="outline">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Device Testing */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Test on Another Device</h2>
            <p className="text-sm text-[#8e8e93] mt-1">
              Use the same passkey on a different device to access the same wallet
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#8e8e93] mb-2">Your Wallet Address:</p>
              <p className="text-sm font-mono bg-[#f2f2f7] p-3 rounded break-all">
                {wallet.smartWallet}
              </p>
            </div>
            <div>
              <Button onClick={() => setShowQR(!showQR)} variant="outline" className="mb-3">
                {showQR ? "Hide" : "Show"} QR Code
              </Button>
              {showQR && (
                <div className="flex justify-center p-4 bg-white rounded-lg border border-[#e5e5ea]">
                  <QRCodeSVG value={walletUrl} size={200} />
                </div>
              )}
            </div>
            <InfoBanner>
              <strong>How it works:</strong> Scan this QR code on another device, or visit the login page
              and use the same passkey. Your session will be restored automatically because it&apos;s
              tied to your wallet address, not your device.
            </InfoBanner>
          </CardContent>
        </Card>

        {/* LocalStorage Viewer */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Session Data (LocalStorage)</h2>
            <p className="text-sm text-[#8e8e93] mt-1">
              This is what gets stored in your browser&apos;s localStorage
            </p>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-[#f2f2f7] p-4 rounded-lg overflow-auto max-h-64 font-mono">
              {localStorageData || "No session data"}
            </pre>
            <p className="text-xs text-[#8e8e93] mt-2">
              This data persists across page refreshes and browser restarts.
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">How Session Persistence Works</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Session Creation</h3>
              <p className="text-sm text-[#8e8e93]">
                When you connect your wallet, a session is automatically created and stored in
                localStorage. This session includes your wallet address and expiry time.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Page Refresh</h3>
              <p className="text-sm text-[#8e8e93]">
                Click &quot;Refresh Page&quot; above. Notice how your session persists - you don&apos;t
                need to reconnect your wallet. The session data is restored from localStorage.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. Different Devices</h3>
              <p className="text-sm text-[#8e8e93]">
                On another device, use the same passkey to access your wallet. The session will
                be created fresh, but you&apos;ll have access to the same wallet because passkeys
                are tied to your biometric identity, not the device.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">4. Session Expiry</h3>
              <p className="text-sm text-[#8e8e93]">
                Sessions expire after 24 hours of inactivity. You can extend them manually or
                they&apos;ll auto-extend when you use the app. When expired, you&apos;ll need to
                reconnect with your passkey.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

