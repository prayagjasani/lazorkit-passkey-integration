'use client';

/**
 * Main application page
 * Conditionally renders pre-auth screen or wallet dashboard
 */

import { useWallet } from '@lazorkit/wallet';
import PasskeyAuth from './components/PasskeyAuth';
import WalletDashboard from './components/WalletDashboard';

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <>
      {isConnected ? <WalletDashboard /> : <PasskeyAuth />}
    </>
  );
}
