/**
 * Components Index
 *
 * Re-export all components for convenient imports.
 *
 * @example
 * ```tsx
 * import { PasskeySetup } from '@/components';
 * import { PageHeader, BalanceCard } from '@/components/dashboard';
 * import { Button, Card } from '@/components/ui';
 * ```
 */

// Shared components from common/
export { Logo } from "./common/Logo";
export { PasskeySetup } from "./common/PasskeySetup";

// Re-export dashboard components
export * from "./dashboard";
