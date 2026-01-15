# Tutorial 1: Setting Up Passkey Authentication with Lazorkit

This tutorial guides you through integrating Lazorkit SDK for passkey-based authentication in a Next.js application.

## Objective

Learn how to:
- Install and configure Lazorkit SDK (`@lazorkit/wallet`)
- Implement passkey registration and authentication flow
- Access smart wallet address after authentication
- Handle authentication errors and edge cases

## Prerequisites

- Next.js application set up
- Basic understanding of React hooks
- Modern browser with WebAuthn support

## Step 1: Install Lazorkit SDK

Install the Lazorkit wallet package:

```bash
npm install @lazorkit/wallet
```

You'll also need Solana Web3.js:

```bash
npm install @solana/web3.js
```

## Step 2: Create Lazorkit Provider

Create a provider component (`app/providers.tsx`) to configure and wrap your application:

```tsx
'use client';

import React, { useEffect } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { Buffer } from 'buffer';

const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: process.env.NEXT_PUBLIC_LAZORKIT_PORTAL_URL || 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Buffer polyfill for browser
    if (typeof window !== 'undefined') {
      if (!window.Buffer) {
        (window as any).Buffer = Buffer;
      }
      if (typeof (window as any).global === 'undefined') {
        (window as any).global = window;
      }
    }
  }, []);

  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.rpcUrl}
      portalUrl={LAZORKIT_CONFIG.portalUrl}
      paymasterConfig={LAZORKIT_CONFIG.paymasterConfig}
    >
      {children}
    </LazorkitProvider>
  );
}
```

Then wrap your app in `app/layout.tsx`:

```tsx
import { AppProviders } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

The provider initializes the Lazorkit SDK and makes it available to all child components.

## Step 3: Use the useWallet Hook

In any component, use the `useWallet` hook to access the SDK:

```tsx
'use client';

import { useWallet } from '@lazorkit/wallet';

export default function MyComponent() {
  const { 
    smartWalletPubkey, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect 
  } = useWallet();
  
  // smartWalletPubkey: PublicKey of the smart wallet
  // isConnected: boolean indicating if user is authenticated
  // isConnecting: boolean indicating if connection is in progress
  // connect: function to trigger passkey authentication
  // disconnect: function to disconnect the wallet
}
```

## Step 4: Implement Passkey Authentication

The `connect()` function handles both registration (first time) and login (subsequent times):

```tsx
const handleConnect = async () => {
  try {
    await connect();
    // Connection successful - wallet is now available via useWallet hook
  } catch (error) {
    console.error('Authentication failed:', error);
    // Handle error
  }
};
```

The browser will prompt the user for biometric authentication (Face ID, Touch ID, or Windows Hello).

## Step 5: Access Smart Wallet Address

After successful authentication, the wallet address is available via the `useWallet` hook:

```tsx
const { smartWalletPubkey, isConnected } = useWallet();

if (isConnected && smartWalletPubkey) {
  console.log('Wallet address:', smartWalletPubkey.toString());
}
```

The smart wallet address is provided by the Lazorkit SDK after authentication.

## Step 6: Handle Browser Compatibility

Check if WebAuthn is supported before attempting authentication:

```tsx
function isWebAuthnSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    typeof navigator.credentials.create !== 'undefined'
  );
}
```

Display an appropriate message if WebAuthn is not supported.

## Step 7: Complete Example

Here's a complete example of a passkey authentication component:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { isWebAuthnSupported } from '@/app/lib/lazorkit';

export default function PasskeyAuth() {
  const { 
    isConnected, 
    isConnecting, 
    connect
  } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebAuthnSupported(isWebAuthnSupported());
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (webAuthnSupported === null) {
    return <div>Checking browser support...</div>;
  }

  if (!webAuthnSupported) {
    return (
      <div>
        <p>WebAuthn is not supported in this browser. Please use a modern browser.</p>
      </div>
    );
  }

  if (isConnected) {
    return <div>Authenticated! Wallet is ready.</div>;
  }

  return (
    <div>
      <h1>Sign in with Passkey</h1>
      <p>No wallet. No seed phrase.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button 
        onClick={handleContinue}
        disabled={loading || isConnecting}
      >
        {loading || isConnecting ? 'Processing...' : 'Continue'}
      </button>
      <p>Uses Face ID / Touch ID / Windows Hello</p>
    </div>
  );
}
```

## Error Handling

Handle common errors:

- **User cancellation**: User cancels the biometric prompt
- **No credentials**: User tries to connect without having registered first (first time will register automatically)
- **Network errors**: Network issues during authentication
- **Browser not supported**: WebAuthn not available in the browser

Always provide user-friendly error messages.

## How It Works

1. **Provider Setup**: The `LazorkitProvider` initializes the SDK with configuration
2. **Connect Call**: When `connect()` is called, it triggers passkey authentication
3. **Biometric Prompt**: The browser prompts for biometric authentication
4. **Wallet Creation/Login**: Lazorkit SDK creates a new wallet (first time) or logs in (subsequent times)
5. **State Update**: The `useWallet` hook updates with wallet information

## Complete Example

See `app/components/PasskeyAuth.tsx` for a complete implementation example.

## Next Steps

After implementing passkey authentication, proceed to [Tutorial 2: Implementing Transactions with Optional Fee Sponsorship](tutorial-2-gasless-tx.md) to learn how to build and submit transactions with optional fee sponsorship.
