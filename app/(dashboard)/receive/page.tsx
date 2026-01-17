"use client";

import { useWallet } from "@lazorkit/wallet";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  NotConnectedState,
} from "@/components/dashboard";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ReceivePage() {
  const { wallet, isConnected } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!isConnected || !wallet?.smartWallet) {
    return (
      <NotConnectedState
        title="Receive SPL Tokens"
        message="Please connect your wallet to view your receive address."
        showSetup
      />
    );
  }

  const walletAddress = wallet.smartWallet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Receive SPL Tokens"
          description="Share your wallet address to receive SOL or SPL tokens"
        />

        <Card className="bg-white">
          <CardHeader>
            <h2 className="text-xl font-semibold">Your Wallet Address</h2>
            <p className="text-sm text-[#8e8e93]">
              Scan the QR code or copy the address below
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-[#e5e5ea]">
                <QRCodeSVG
                  value={walletAddress}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Address Display */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#8e8e93]">
                Wallet Address
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg border border-[#e5e5ea] bg-[#f2f2f7]">
                <p className="flex-1 font-mono text-sm break-all">
                  {walletAddress}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-lg border border-[#7454f7]/20 bg-[#7454f7]/5 p-4">
              <p className="text-sm text-[#7454f7]">
                <strong>Note:</strong> This address can receive SOL and any SPL tokens on Solana Devnet. 
                Make sure the sender is using the same network (Devnet).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

