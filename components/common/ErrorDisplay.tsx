"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseError, getErrorColor, getErrorBgColor, ErrorInfo } from "@/lib/utils/errorHandler";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ErrorDisplayProps {
  /** The error to display */
  error: unknown;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Custom title */
  title?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Enhanced error display component with recovery suggestions
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   error={transactionError}
 *   onRetry={() => handleRetry()}
 *   showRetry={true}
 * />
 * ```
 */
export function ErrorDisplay({
  error,
  onRetry,
  title = "Something went wrong",
  showRetry = true,
  className = "",
}: ErrorDisplayProps) {
  const errorInfo: ErrorInfo = parseError(error);
  const textColor = getErrorColor(errorInfo.category);
  const bgColor = getErrorBgColor(errorInfo.category);

  return (
    <Card className={`${bgColor} border ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className={`h-5 w-5 ${textColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${textColor} mb-1`}>{title}</h3>
            <p className="text-sm text-black mb-2">{errorInfo.message}</p>
            {errorInfo.recovery && (
              <p className="text-xs text-[#8e8e93] mb-3">{errorInfo.recovery}</p>
            )}
            <div className="flex items-center gap-2">
              {showRetry && errorInfo.retryable && onRetry && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
              {errorInfo.docsLink && (
                <Link href={errorInfo.docsLink} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    Learn More
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

