"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  /** Balance label */
  label?: string;
  /** Balance amount in SOL */
  balance: number | null;
  /** Whether balance is loading */
  loading?: boolean;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Variant style */
  variant?: "default" | "highlight";
  /** Token symbol (default: SOL) */
  token?: "SOL" | "USDC";
}

/**
 * Reusable balance display card with refresh button
 *
 * @example
 * ```tsx
 * <BalanceCard
 *   label="Available Balance"
 *   balance={4.5}
 *   loading={false}
 *   onRefresh={refreshBalance}
 *   variant="highlight"
 * />
 * ```
 */
export function BalanceCard({
  label = "Available Balance",
  balance,
  loading = false,
  onRefresh,
  variant = "default",
  token = "SOL",
}: BalanceCardProps) {
  const borderColor =
    variant === "highlight" ? "border-[#7454f7]/20" : "border-[#7454f7]/30";
  const bgColor = variant === "highlight" ? "bg-[#7454f7]/5" : "bg-[#7454f7]/5";

  return (
    <Card className={`mb-6 ${borderColor} ${bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#8e8e93] font-medium">{label}</p>
            <p className="text-2xl font-semibold">
              {loading ? (
                <span className="text-[#8e8e93]">Loading...</span>
              ) : (
                <span className="text-[#7454f7]">
                  {balance?.toFixed(token === "USDC" ? 2 : 4) ?? "0"} {token}
                </span>
              )}
            </p>
          </div>
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
