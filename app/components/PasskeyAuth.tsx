'use client';

/**
 * Passkey Authentication Component
 * Clean pre-auth screen with single centered card
 */

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
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!webAuthnSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800 text-center">
              WebAuthn is not supported in this browser. Please use a modern browser
              that supports passkeys (Chrome, Firefox, Safari, or Edge).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Sign in with Passkey
          </h1>
          
          <p className="text-gray-600 mb-8">
            No wallet. No seed phrase.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={loading || isConnecting}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading || isConnecting ? 'Processing...' : 'Continue'}
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Uses Face ID / Touch ID / Windows Hello
          </p>
        </div>
      </div>
    </div>
  );
}
