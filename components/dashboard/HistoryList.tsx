"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getExplorerUrl } from "@/lib/services";

interface HistoryItem {
  /** Primary display text */
  primary: string;
  /** Secondary text (optional) */
  secondary?: string;
  /** Transaction signature */
  signature: string;
  /** Timestamp */
  timestamp: Date;
}

interface HistoryListProps {
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** List of history items */
  items: HistoryItem[];
  /** Custom render for primary text */
  renderPrimary?: (item: HistoryItem) => React.ReactNode;
}

/**
 * Reusable transaction history list component
 *
 * @example
 * ```tsx
 * <HistoryList
 *   title="Recent Transfers"
 *   items={history.map(tx => ({
 *     primary: `${tx.amount} SOL → ${truncateAddress(tx.recipient)}`,
 *     signature: tx.signature,
 *     timestamp: tx.timestamp,
 *   }))}
 * />
 * ```
 */
export function HistoryList({
  title,
  subtitle,
  items,
  renderPrimary,
}: HistoryListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 bg-white">
      <CardHeader>
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        {subtitle && <p className="text-sm text-[#8e8e93]">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] p-3"
            >
              <div>
                <p className="text-sm font-medium text-black">
                  {renderPrimary ? renderPrimary(item) : item.primary}
                </p>
                {item.secondary && (
                  <p className="text-xs text-[#8e8e93]">{item.secondary}</p>
                )}
                <p className="text-xs text-[#8e8e93]">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <a
                href={getExplorerUrl(item.signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#7454f7] hover:text-[#7454f7]/80"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
