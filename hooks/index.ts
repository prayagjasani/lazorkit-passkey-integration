/**
 * Hooks Index
 *
 * Re-export all custom hooks for convenient imports.
 * Hooks are now organized by feature but re-exported here for convenience.
 *
 * @example
 * ```tsx
 * import { useSolBalance, useTransfer, useStaking } from '@/hooks';
 * ```
 */

// Wallet feature hooks
export { useSolBalance, useTransaction } from "@/features/wallet/hooks";
export { useUsdcBalance } from "@/features/wallet/hooks/useUsdcBalance";
export { useUsdcTransfer } from "@/features/transfer/hooks/useUsdcTransfer";

// Transfer feature hooks
export { useTransfer } from "@/features/transfer/hooks";

// Session feature hooks
export { useSession } from "@/features/session/hooks";

// Onboarding hook
export { useOnboarding } from "@/hooks/useOnboarding";
