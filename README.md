# LazorKey

> A production-ready example repository demonstrating LazorKit SDK integration for passkey-based Solana wallets with gasless transactions.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![LazorKit](https://img.shields.io/badge/LazorKit-2.0-purple)](https://docs.lazorkit.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [SDK Installation & Configuration](#sdk-installation--configuration)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Step-by-Step Tutorials](#step-by-step-tutorials)
  - [Tutorial 1: Creating a Passkey-Based Wallet](#tutorial-1-creating-a-passkey-based-wallet)
  - [Tutorial 2: Triggering a Gasless Transaction](#tutorial-2-triggering-a-gasless-transaction)
  - [Tutorial 3: Persisting Sessions Across Devices](#tutorial-3-persisting-sessions-across-devices)
- [Key Integrations](#key-integrations)
- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Resources](#resources)

---

## Overview

**LazorKey** is a comprehensive example repository that demonstrates how to integrate [LazorKit SDK](https://docs.lazorkit.com/) into a Next.js application. This project serves as a practical reference for developers looking to implement:

- **Passkey Authentication** - Biometric wallet creation without seed phrases
- **Gasless Transactions** - Fee-less SOL and USDC transfers using LazorKit's paymaster
- **Session Persistence** - Cross-device wallet access with automatic session management
- **Smart Wallet Integration** - Production-ready patterns for Solana smart wallets

Built with modern best practices, this repository provides clean, well-documented code that can serve as a starter template for your own Solana applications.

---

## Features

### Authentication & Security
- **Passkey-based wallet creation** using WebAuthn (Face ID, Touch ID, Windows Hello)
- **No seed phrases** - Enhanced security through hardware-backed keys
- **Cross-device access** - Access your wallet from any device with passkey support

### Gasless Transactions
- **Zero-fee SOL transfers** powered by LazorKit's paymaster
- **USDC transfers** with automatic gas fee coverage
- **Smart wallet integration** for seamless transaction execution

### Token Management
- **SOL & USDC transfers** with validation and error handling
- **Token swapping** via Jupiter Aggregator (mainnet)
- **SOL staking** with validator delegation
- **Balance tracking** with real-time updates

### Session Management
- **Persistent sessions** across page refreshes
- **Automatic session restoration** on app reload
- **Session expiry handling** with user-friendly warnings
- **Multi-device synchronization** support

### Developer Experience
- **Interactive tutorials** built into the application
- **Educational content** explaining passkeys and gasless transactions
- **Well-commented code** with JSDoc documentation
- **Type-safe** TypeScript implementation

---

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)
- Modern browser with WebAuthn support (Chrome, Safari, Edge, Firefox)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd passpay-web

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## SDK Installation & Configuration

### Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js @solana/spl-token
```

### Step 2: Configure LazorKit Provider

The SDK is configured in `app/providers.tsx`:

```tsx
import { LazorkitProvider } from "@lazorkit/wallet";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://kora.devnet.lazorkit.com",
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

### Step 3: Wrap Your App

In `app/layout.tsx`:

```tsx
import { AppProviders } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

### Configuration Options

All configuration is centralized in `lib/constants.ts`:

```typescript
export const DEFAULT_CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",
  portalUrl: "https://portal.lazor.sh",
  paymasterConfig: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
};
```

**For Mainnet:**
- Update `rpcUrl` to a mainnet RPC endpoint
- Update `paymasterUrl` to mainnet paymaster endpoint
- Ensure you have USDC in your wallet for gasless transactions

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application URL (for metadata and social sharing)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Custom RPC endpoint
# NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### Browser Requirements

- **HTTPS** (required for WebAuthn) - Use `localhost` for development or deploy to a server with SSL
- **WebAuthn Support** - Modern browsers (Chrome 67+, Safari 13+, Edge 18+, Firefox 60+)
- **Biometric Hardware** - For passkey creation (optional, can use device PIN as fallback)

---

## Project Structure

```
passpay-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   └── login/                # Passkey login page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── manage/               # Wallet overview
│   │   ├── transfer/             # Send SOL/USDC
│   │   ├── swap/                 # Token swapping
│   │   ├── stake/                # SOL staking
│   │   ├── receive/              # Receive tokens
│   │   ├── tutorials/            # Interactive tutorials
│   │   ├── how-it-works/         # Educational content
│   │   └── session-demo/         # Session persistence demo
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # LazorKit provider setup
│
├── components/                    # React components
│   ├── common/                   # Shared components
│   │   ├── Logo.tsx             # App logo component
│   │   ├── PasskeySetup.tsx     # Passkey creation UI
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   └── SuccessAnimation.tsx # Success feedback
│   ├── dashboard/               # Dashboard components
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── BalanceCard.tsx      # Balance display
│   │   └── PageHeader.tsx       # Page headers
│   ├── ui/                      # Reusable UI primitives
│   └── tutorials/               # Tutorial components
│
├── features/                     # Feature modules
│   ├── wallet/                   # Wallet hooks
│   │   ├── useSolBalance.ts     # SOL balance hook
│   │   ├── useUsdcBalance.ts    # USDC balance hook
│   │   └── useTransaction.ts   # Transaction execution
│   ├── transfer/                # Transfer functionality
│   │   ├── hooks/
│   │   │   ├── useTransfer.ts  # SOL transfer hook
│   │   │   └── useUsdcTransfer.ts # USDC transfer hook
│   │   └── services/
│   │       └── transfer.service.ts # Transfer logic
│   ├── swap/                    # Token swapping
│   ├── staking/                 # Staking operations
│   └── session/                 # Session management
│       ├── hooks/
│       │   └── useSession.ts    # Session persistence hook
│       └── services/
│           └── session.service.ts # Session storage
│
├── lib/                         # Utilities and services
│   ├── constants.ts             # App constants & config
│   ├── services/                # Service layer
│   │   ├── rpc.ts              # RPC connection
│   │   └── index.ts            # Service exports
│   └── utils/                   # Helper functions
│       ├── utils.ts            # Encryption utilities
│       └── errorHandler.ts     # Error parsing
│
└── public/                      # Static assets
    └── images/
        └── logo.svg            # App logo
```

---

## Step-by-Step Tutorials

### Tutorial 1: Creating a Passkey-Based Wallet

This tutorial demonstrates how to create a Solana wallet using passkey authentication, eliminating the need for seed phrases.

#### Step 1: Set Up the Provider

First, ensure your app is wrapped with `LazorkitProvider`:

```tsx
// app/providers.tsx
import { LazorkitProvider } from "@lazorkit/wallet";

export function AppProviders({ children }) {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://kora.devnet.lazorkit.com",
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

#### Step 2: Create the Passkey Setup Component

```tsx
// components/common/PasskeySetup.tsx
"use client";
import { useWallet } from "@lazorkit/wallet";
import { Button } from "@/components/ui/button";

export function PasskeySetup({ onConnected }) {
  const { connect, isConnected, isConnecting, wallet } = useWallet();

  const handleConnect = async () => {
    try {
      // Connect with passkey authentication
      // This will trigger biometric prompt (Face ID, Touch ID, etc.)
      await connect({ feeMode: "paymaster" });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Auto-call onConnected when wallet is ready
  useEffect(() => {
    if (isConnected && wallet?.smartWallet) {
      onConnected(wallet.smartWallet);
    }
  }, [isConnected, wallet]);

  if (isConnected && wallet?.smartWallet) {
    return (
      <div>
        <p>Wallet connected: {wallet.smartWallet}</p>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Creating wallet..." : "Create Wallet with Passkey"}
    </Button>
  );
}
```

#### Step 3: Use the Component

```tsx
// app/(auth)/login/page.tsx
import { PasskeySetup } from "@/components";

export default function LoginPage() {
  const router = useRouter();

  function handleConnected(walletAddress: string) {
    // Redirect to dashboard after successful connection
    router.push("/manage");
  }

  return (
    <div>
      <h1>Create Your Wallet</h1>
      <PasskeySetup onConnected={handleConnected} />
    </div>
  );
}
```

#### Key Points

- **No seed phrases**: The wallet is created using WebAuthn credentials stored in your device's secure enclave
- **Biometric authentication**: Users authenticate with Face ID, Touch ID, or Windows Hello
- **Automatic smart wallet**: LazorKit automatically creates a smart wallet for gasless transactions
- **Cross-device access**: Users can access the same wallet from multiple devices using passkeys

#### What Happens Behind the Scenes

1. User clicks "Create Wallet"
2. Browser prompts for biometric authentication
3. LazorKit SDK creates a passkey credential
4. A smart wallet is automatically generated on Solana
5. The wallet address is returned and can be used immediately

---

### Tutorial 2: Triggering a Gasless Transaction

This tutorial shows how to send SOL or USDC without paying gas fees, using LazorKit's paymaster system.

#### Step 1: Create the Transfer Hook

```tsx
// features/transfer/hooks/useTransfer.ts
import { useWallet } from "@lazorkit/wallet";
import { useTransaction } from "@/features/wallet/hooks";
import { SystemProgram } from "@solana/web3.js";

export function useTransfer() {
  const { smartWalletPubkey } = useWallet();
  const { execute, loading } = useTransaction();

  const transfer = async (recipient: string, amount: string) => {
    if (!smartWalletPubkey) {
      throw new Error("Wallet not connected");
    }

    // Create transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey(recipient),
      lamports: parseFloat(amount) * 1e9, // Convert SOL to lamports
    });

    // Execute with paymaster (gasless)
    const signature = await execute([instruction], {
      feeMode: "paymaster", // This enables gasless transactions
    });

    return signature;
  };

  return { transfer, loading };
}
```

#### Step 2: Use the Hook in a Component

```tsx
// app/(dashboard)/transfer/page.tsx
"use client";
import { useState } from "react";
import { useTransfer } from "@/features/transfer/hooks";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function TransferPage() {
  const { transfer, loading } = useTransfer();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    try {
      const signature = await transfer(recipient, amount);
      if (signature) {
        toast.success("Transfer successful!");
        // Reset form
        setRecipient("");
        setAmount("");
      }
    } catch (error) {
      toast.error("Transfer failed");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (SOL)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleTransfer} disabled={loading}>
        {loading ? "Sending..." : "Send SOL (Gasless)"}
      </Button>
    </div>
  );
}
```

#### Step 3: USDC Transfer (SPL Token)

For USDC transfers, use the SPL Token program:

```tsx
// features/transfer/hooks/useUsdcTransfer.ts
import { useWallet } from "@lazorkit/wallet";
import { useTransaction } from "@/features/wallet/hooks";
import { createTransferInstruction } from "@solana/spl-token";
import { USDC_MINT } from "@/lib/constants";

export function useUsdcTransfer() {
  const { smartWalletPubkey } = useWallet();
  const { execute, loading } = useTransaction();

  const transfer = async (recipient: string, amount: string) => {
    if (!smartWalletPubkey) {
      throw new Error("Wallet not connected");
    }

    // Get token accounts
    const sourceTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      smartWalletPubkey
    );
    const destTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(recipient)
    );

    // Create USDC transfer instruction
    const instruction = createTransferInstruction(
      sourceTokenAccount,
      destTokenAccount,
      smartWalletPubkey,
      parseFloat(amount) * 1e6, // USDC has 6 decimals
      []
    );

    // Execute with paymaster
    const signature = await execute([instruction], {
      feeMode: "paymaster",
    });

    return signature;
  };

  return { transfer, loading };
}
```

#### Key Points

- **Fee mode**: Set `feeMode: "paymaster"` to enable gasless transactions
- **Automatic fee coverage**: LazorKit's paymaster covers transaction fees using USDC
- **No SOL required**: Users don't need SOL for gas fees
- **Works for both SOL and SPL tokens**: Same pattern applies to any token transfer

#### How Gasless Transactions Work

1. User initiates a transaction with `feeMode: "paymaster"`
2. LazorKit SDK wraps the transaction with paymaster instructions
3. Paymaster pays the transaction fee using USDC from the user's wallet
4. Transaction executes on-chain without requiring SOL for fees
5. User only pays for the transfer amount, not gas fees

---

### Tutorial 3: Persisting Sessions Across Devices

This tutorial demonstrates how to implement session persistence, allowing users to access their wallet across devices and browser sessions.

#### Step 1: Create Session Service

```tsx
// features/session/services/session.service.ts
export interface SessionData {
  walletAddress: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

const SESSION_KEY = "LazorKey_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(walletAddress: string): SessionData {
  const now = Date.now();
  const session: SessionData = {
    walletAddress,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
    lastActivity: now,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): SessionData | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  const session: SessionData = JSON.parse(stored);
  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }

  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function updateLastActivity(): void {
  const session = getSession();
  if (session) {
    session.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}
```

#### Step 2: Create Session Hook

```tsx
// features/session/hooks/useSession.ts
import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  createSession,
  getSession,
  clearSession,
  updateLastActivity,
} from "../services";

export function useSession() {
  const { wallet, connect, isConnected } = useWallet();
  const [session, setSession] = useState<SessionData | null>(null);

  // Restore session on mount
  useEffect(() => {
    const storedSession = getSession();
    if (storedSession && !isConnected) {
      // Attempt to restore wallet connection
      connect({ feeMode: "paymaster" });
      setSession(storedSession);
    }
  }, []);

  // Create session when wallet connects
  useEffect(() => {
    if (isConnected && wallet?.smartWallet && !session) {
      const newSession = createSession(wallet.smartWallet);
      setSession(newSession);
    }
  }, [isConnected, wallet]);

  // Update activity on user interaction
  useEffect(() => {
    const interval = setInterval(() => {
      updateLastActivity();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    clearSession();
    setSession(null);
    // Disconnect wallet
  };

  return { session, logout };
}
```

#### Step 3: Use Session in Components

```tsx
// app/(dashboard)/session-demo/page.tsx
"use client";
import { useSession } from "@/features/session/hooks";
import { SessionTimer } from "@/components/session";

export default function SessionDemoPage() {
  const { session, logout } = useSession();

  if (!session) {
    return <div>No active session</div>;
  }

  return (
    <div>
      <h1>Session Management</h1>
      <p>Wallet: {session.walletAddress}</p>
      <SessionTimer expiresAt={session.expiresAt} />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Key Points

- **localStorage persistence**: Sessions are stored in browser localStorage
- **Automatic restoration**: Sessions are restored on page reload
- **Cross-device support**: Users can access the same wallet from multiple devices
- **Activity tracking**: Last activity is updated to extend session lifetime
- **Expiry handling**: Sessions expire after 24 hours of inactivity

#### How Cross-Device Access Works

1. User creates a wallet on Device A using passkey
2. Passkey is synced to Device B (via iCloud Keychain, Google Password Manager, etc.)
3. User can access the same wallet on Device B using the same passkey
4. Session data is stored locally on each device
5. Wallet state is synchronized through the Solana blockchain

---

## Key Integrations

### LazorKit SDK Features Demonstrated

| Feature | Implementation | Location |
|---------|---------------|----------|
| **Passkey Authentication** | WebAuthn-based wallet creation | `components/common/PasskeySetup.tsx` |
| **Smart Wallet** | Automatic smart wallet creation | `app/providers.tsx` |
| **Gasless Transactions** | Paymaster integration for fee-less transfers | `features/transfer/hooks/useTransfer.ts` |
| **Session Persistence** | localStorage-based session management | `features/session/` |
| **Balance Tracking** | Real-time SOL and USDC balance updates | `features/wallet/hooks/` |
| **Transaction Execution** | Type-safe transaction building and execution | `features/wallet/hooks/useTransaction.ts` |

### Additional Integrations

- **Jupiter Aggregator** - Token swapping (mainnet only)
- **Solana Stake Program** - SOL staking with validator delegation
- **SPL Token Program** - USDC and other token transfers
- **React Hot Toast** - User feedback and notifications
- **Framer Motion** - Smooth animations and transitions

---

## Live Demo

**Live Demo**: [LazorKey](https://prayag-lazorkit-passkey.netlify.app)

The demo is deployed on Solana Devnet and includes:

- Passkey wallet creation
- Gasless SOL and USDC transfers
- Token swapping interface
- SOL staking functionality
- Session persistence demo
- Interactive tutorials

**Note**: For mainnet deployment, update the RPC URL and paymaster configuration in `lib/constants.ts`.

---

## Architecture

### Design Principles

1. **Feature-Based Organization** - Code is organized by feature, not by type
2. **Reusable Hooks** - Business logic is encapsulated in custom hooks
3. **Service Layer** - Blockchain interactions are abstracted in services
4. **Type Safety** - Full TypeScript coverage with strict type checking
5. **Error Handling** - Centralized error parsing and user-friendly messages

### Data Flow

```
User Action
    ↓
React Component
    ↓
Custom Hook (useTransfer, useSession, etc.)
    ↓
Service Layer (transfer.service.ts, session.service.ts)
    ↓
LazorKit SDK / Solana Web3.js
    ↓
Solana Blockchain
```

### State Management

- **Local State** - React hooks (`useState`, `useReducer`)
- **Wallet State** - LazorKit SDK's `useWallet` hook
- **Session State** - localStorage with React hooks
- **Server State** - React Query (optional, not implemented)

---

## Contributing

This repository is maintained as a reference implementation for LazorKit SDK integration. Contributions, suggestions, and improvements are welcome!

### Development Guidelines

1. **Code Style** - Follow existing patterns and TypeScript best practices
2. **Documentation** - Add JSDoc comments for all public functions
3. **Testing** - Test all features on Solana Devnet before submitting
4. **Error Handling** - Use the centralized error handler for consistent UX

---

## Resources

### Official Documentation

- [LazorKit Documentation](https://docs.lazorkit.com/)
- [LazorKit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Solana Documentation](https://docs.solana.com/)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)

### Related Projects

- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Jupiter Aggregator](https://docs.jup.ag/)
- [Next.js Documentation](https://nextjs.org/docs)

### Community

- [LazorKit Telegram](https://t.me/lazorkit)
- [Solana Discord](https://discord.gg/solana)

---

## License

MIT License - feel free to use this code as a starting point for your own projects.

---

**Built with ❤️ for the Solana and LazorKit communities**