'use client';

/**
 * Lazorkit Provider Setup
 * Configures Lazorkit SDK for the application
 */

import React, { useEffect } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { Buffer } from 'buffer';

const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Buffer and global polyfills for browser
    if (typeof window !== 'undefined') {
      // Buffer polyfill
      if (!window.Buffer) {
        (window as any).Buffer = Buffer;
      }
      
      // Global polyfill (required by some Node.js modules in browser)
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

