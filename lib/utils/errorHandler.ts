/**
 * Centralized Error Handling Utilities
 *
 * Provides consistent error parsing, formatting, and recovery suggestions
 * for Lazorkit-related errors and Solana transaction errors.
 */

export interface ErrorInfo {
  /** User-friendly error message */
  message: string;
  /** Suggested recovery action */
  recovery?: string;
  /** Error category for styling */
  category: "user" | "network" | "transaction" | "auth" | "unknown";
  /** Whether the error is retryable */
  retryable: boolean;
  /** Link to relevant documentation */
  docsLink?: string;
}

/**
 * Parse and categorize errors from various sources
 */
export function parseError(error: unknown): ErrorInfo {
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  // Passkey/Authentication errors
  if (
    errorMessage.includes("NotAllowedError") ||
    errorMessage.includes("cancelled") ||
    errorMessage.includes("canceled")
  ) {
    return {
      message: "You cancelled the passkey prompt.",
      recovery: "Please try again and approve the passkey prompt when it appears.",
      category: "auth",
      retryable: true,
      docsLink: "https://docs.lazorkit.com/guides/passkey-authentication",
    };
  }

  if (errorMessage.includes("PublicKeyCredential") || errorMessage.includes("WebAuthn")) {
    return {
      message: "Your browser doesn't support WebAuthn passkeys.",
      recovery: "Please use a modern browser like Chrome, Safari, or Edge.",
      category: "auth",
      retryable: false,
      docsLink: "https://docs.lazorkit.com/getting-started/browser-support",
    };
  }

  if (errorMessage.includes("Signing failed")) {
    return {
      message: "Signing failed. Please ensure you're using HTTPS.",
      recovery: "This app requires HTTPS for security. Make sure you're accessing it via a secure connection.",
      category: "auth",
      retryable: true,
    };
  }

  // Transaction errors
  if (
    errorMessage.includes("insufficient") ||
    errorMessage.includes("Insufficient")
  ) {
    return {
      message: "Insufficient balance for this transaction.",
      recovery: "Check your balance and ensure you have enough tokens. For gasless transactions, you need USDC in your wallet.",
      category: "transaction",
      retryable: false,
    };
  }

  if (errorMessage.includes("Transaction too large")) {
    return {
      message: "Transaction exceeds size limit.",
      recovery: "This is a known limitation. Try breaking the transaction into smaller parts or contact support.",
      category: "transaction",
      retryable: true,
      docsLink: "https://docs.lazorkit.com/troubleshooting/transaction-size",
    };
  }

  if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return {
      message: "Request timed out.",
      recovery: "The network might be slow. Please try again in a moment.",
      category: "network",
      retryable: true,
    };
  }

  // Network errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return {
      message: "Network connection error.",
      recovery: "Check your internet connection and try again.",
      category: "network",
      retryable: true,
    };
  }

  if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
    return {
      message: "Too many requests. Please wait a moment.",
      recovery: "The RPC endpoint is rate-limited. Please wait a few seconds and try again.",
      category: "network",
      retryable: true,
    };
  }

  // RPC errors
  if (errorMessage.includes("RPC") || errorMessage.includes("rpc")) {
    return {
      message: "RPC connection error.",
      recovery: "The Solana network might be experiencing issues. Please try again later.",
      category: "network",
      retryable: true,
    };
  }

  // Default/unknown errors
  return {
    message: errorMessage || "An unexpected error occurred.",
    recovery: "Please try again. If the problem persists, check the console for details.",
    category: "unknown",
    retryable: true,
  };
}

/**
 * Get error display color based on category
 */
export function getErrorColor(category: ErrorInfo["category"]): string {
  switch (category) {
    case "auth":
      return "text-amber-600";
    case "network":
      return "text-blue-600";
    case "transaction":
      return "text-red-600";
    case "unknown":
    default:
      return "text-gray-600";
  }
}

/**
 * Get error background color based on category
 */
export function getErrorBgColor(category: ErrorInfo["category"]): string {
  switch (category) {
    case "auth":
      return "bg-amber-50 border-amber-200";
    case "network":
      return "bg-blue-50 border-blue-200";
    case "transaction":
      return "bg-red-50 border-red-200";
    case "unknown":
    default:
      return "bg-gray-50 border-gray-200";
  }
}

