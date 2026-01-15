/**
 * Lazorkit SDK initialization and configuration
 * 
 * Note: The SDK is initialized via the LazorkitProvider in app/providers.tsx
 * This file exports helper functions for WebAuthn support checking
 */

/**
 * Helper function to check if WebAuthn is supported
 */
export function isWebAuthnSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    typeof navigator.credentials.create !== 'undefined'
  );
}

