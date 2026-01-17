"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionData } from "@/features/session/services";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface SessionStatusCardProps {
  session: SessionData | null;
  isValid: boolean;
  isExpiringSoon: boolean;
  timeRemaining: number;
}

/**
 * Display session status with visual indicators
 */
export function SessionStatusCard({
  session,
  isValid,
  isExpiringSoon,
  timeRemaining,
}: SessionStatusCardProps) {
  if (!session) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-black">No Active Session</p>
              <p className="text-sm text-[#8e8e93]">Connect your wallet to create a session</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusIcon = isValid
    ? isExpiringSoon
      ? Clock
      : CheckCircle2
    : XCircle;

  const statusColor = isValid
    ? isExpiringSoon
      ? "text-amber-500"
      : "text-green-500"
    : "text-red-500";

  const StatusIcon = statusIcon;

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Session Status</h3>
          <Badge
            className={
              isValid
                ? isExpiringSoon
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {isValid ? (isExpiringSoon ? "Expiring Soon" : "Active") : "Expired"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
          <div className="flex-1">
            <p className="font-medium text-black">
              {isValid ? "Session Active" : "Session Expired"}
            </p>
            <p className="text-sm text-[#8e8e93]">
              {isValid
                ? isExpiringSoon
                  ? "Your session will expire soon"
                  : "Your session is active and valid"
                : "Please reconnect your wallet"}
            </p>
          </div>
        </div>

        {session && (
          <div className="space-y-2 pt-2 border-t border-[#e5e5ea]">
            <div className="flex justify-between text-sm">
              <span className="text-[#8e8e93]">Created:</span>
              <span className="text-black font-mono text-xs">
                {new Date(session.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8e8e93]">Expires:</span>
              <span className="text-black font-mono text-xs">
                {new Date(session.expiresAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8e8e93]">Last Activity:</span>
              <span className="text-black font-mono text-xs">
                {new Date(session.lastActivity).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8e8e93]">Wallet:</span>
              <span className="text-black font-mono text-xs">
                {session.walletAddress.slice(0, 8)}...{session.walletAddress.slice(-8)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

