# Tutorial 2: Implementing Gasless Transactions

This tutorial demonstrates how to implement gasless transactions using Lazorkit SDK's paymaster service.

## Objective

Learn how to:
- Build Solana transaction instructions
- Use Lazorkit SDK's `signAndSendTransaction`
- Understand how Lazorkit's paymaster can sponsor transaction fees
- Handle transaction responses and errors

## Prerequisites

- Next.js application with passkey authentication implemented (see [Tutorial 1](tutorial-1-passkey-auth.md))
- Lazorkit SDK configured and working
- Understanding of Solana transactions

## Overview

Lazorkit SDK provides a simple way to send transactions using `signAndSendTransaction`. When you configure a paymaster, you can sponsor transaction fees. When you call this method:

1. The transaction is sent to configured paymaster for fee sponsorship (if paymaster is configured)
2. Lazorkit's portal opens for passkey-based transaction signing
3. The fully signed transaction is submitted to Solana
4. The transaction signature is returned

**No custom backend or relayer required** - everything is handled by Lazorkit's infrastructure when paymaster is configured.

## Step 1: Access the Wallet Hook

The `useWallet` hook provides the `signAndSendTransaction` method:

```typescript
import { useWallet } from '@lazorkit/wallet';

function MyComponent() {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
  
  // ... rest of component
}
```

## Step 2: Build Transaction Instructions

Build Solana transaction instructions using `@solana/web3.js`:

### SOL Transfer

```typescript
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const recipientPubkey = new PublicKey('8e3AgZD88uVuvq6A4GU5VNQFmeNN2ZP3KkKZWBxJVVS7');
const amountLamports = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

const instruction = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey, // Your smart wallet address
  toPubkey: recipientPubkey,
  lamports: amountLamports,
});

const instructions = [instruction];
```

### SPL Token Transfer

```typescript
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { Connection } from '@solana/web3.js';

const mintPubkey = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGkZwyTDt1v'); // USDC on Devnet
const recipientPubkey = new PublicKey('8e3AgZD88uVuvq6A4GU5VNQFmeNN2ZP3KkKZWBxJVVS7');
const amount = BigInt(1000000); // 1 USDC (6 decimals)

const fromTokenAccount = await getAssociatedTokenAddress(
  mintPubkey, 
  smartWalletPubkey, 
  true  // allowOwnerOffCurve: REQUIRED for smart wallets (PDAs are off-curve)
);
const toTokenAccount = await getAssociatedTokenAddress(
  mintPubkey, 
  recipientPubkey, 
  false  // Regular wallet addresses are on-curve
);

const instructions = [];

// Check if recipient token account exists, create if needed
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
try {
  await getAccount(connection, toTokenAccount, 'confirmed');
} catch (err: any) {
  if (err.name === 'TokenAccountNotFoundError' || err.code === 'InvalidAccountData') {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        smartWalletPubkey, // payer
        toTokenAccount,
        recipientPubkey,
        mintPubkey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }
}

// Add transfer instruction
instructions.push(
  createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    smartWalletPubkey,
    amount,
    [],
    TOKEN_PROGRAM_ID
  )
);
```

**⚠️ Important: Smart Wallet Compatibility**

The third parameter `allowOwnerOffCurve: true` is **required** for Lazorkit smart wallets when getting the sender's token account address:

- **Why?** Lazorkit smart wallets use Program Derived Addresses, which are deterministic addresses generated using seeds
- **The issue:** PDAs are intentionally "off the ed25519 curve" (not valid elliptic curve points)
- **The fix:** Setting `allowOwnerOffCurve: true` tells the SDK to allow these off-curve addresses

Without this parameter set to `true` for the smart wallet's token account, token transfers will fail. For recipient addresses (which may be regular wallets), you can use `false` as shown above.

## Step 3: Send Transaction with Lazorkit SDK

Call `signAndSendTransaction` with your instructions:

```typescript
try {
  const signature = await signAndSendTransaction({
    instructions: instructions,
  });
  
  if (!signature) {
    throw new Error('Transaction failed: No signature returned');
  }
  
  // Success!
  console.log('Transaction signature:', signature);
  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  console.log('View transaction:', explorerUrl);
  
} catch (error) {
  console.error('Transaction error:', error);
  // Handle error
}
```

## Step 4: Complete Example

Here's a complete example of a transaction form component:

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';

export default function TransactionForm() {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !smartWalletPubkey) {
      setError('Please authenticate first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      const recipientPubkey = new PublicKey(recipient);
      const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      
      if (isNaN(amountLamports) || amountLamports <= 0) {
        throw new Error('Invalid amount');
      }

      // Build instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: recipientPubkey,
        lamports: amountLamports,
      });

      // Send transaction using Lazorkit SDK
      // Fees are sponsored by Lazorkit's paymaster (if configured - fee sponsorship is optional)
      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });
      
      if (!signature) {
        throw new Error('Transaction failed: No signature returned');
      }

      // Success!
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      setSuccess(`Transaction successful! View on Explorer: ${explorerUrl}`);
      
      // Clear form
      setRecipient('');
      setAmount('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <p>Please authenticate first</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
        required
      />
      <input
        type="number"
        step="any"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (SOL)"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Send SOL'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}
```

## How It Works

1. **Instruction Building**: You build standard Solana transaction instructions
2. **Fee Sponsorship (Optional)**: When you call `signAndSendTransaction` with paymaster configured, Lazorkit SDK sends the transaction to Lazorkit's paymaster (`https://kora.devnet.lazorkit.com`) for optional fee sponsorship
3. **Transaction Signing**: Lazorkit SDK opens the signing portal (`https://portal.lazor.sh`) which prompts for passkey authentication
4. **Submission**: After signing, the transaction is automatically submitted to Solana
5. **Result**: The transaction signature is returned to your code

## Network Configuration

### Devnet Configuration (Default)

The example configuration in `app/providers.tsx` is set up for Solana Devnet:

```typescript
const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};
```

This configuration uses Lazorkit's hosted paymaster service for Devnet, which is perfect for development and testing.

### Mainnet Configuration

For Solana Mainnet, you'll typically need to run your own Kora paymaster node. Kora is an open-source fee abstraction layer that enables gasless transactions by sponsoring SOL fees while accepting payment in SPL tokens.

**Option 1: Self-Hosted Kora Node (Recommended for Production)**

To use your own Kora node on mainnet, update your configuration:

```typescript
const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.mainnet-beta.solana.com', // Mainnet RPC endpoint
  portalUrl: 'https://portal.lazor.sh',
  paymasterConfig: {
    paymasterUrl: 'https://your-kora-node.com', // Your self-hosted Kora node URL
  },
};
```

**Setting up your own Kora node:**

1. **Install Kora CLI**: Install the [kora-cli crate](https://crates.io/crates/kora-cli) or build from source
2. **Configure your node**: Create a `kora.toml` configuration file with validation rules, allowed tokens/programs, and fee policies
3. **Set up signers**: Configure Solana keypair(s) for signing transactions as the fee payer
4. **Deploy**: Deploy your Kora node (Docker, Railway, or your preferred platform)
5. **Maintain SOL balance**: Ensure your node has sufficient SOL to cover network fees

For detailed setup instructions, see the [Kora Node Operator Guide](https://github.com/lazor-kit/kora/blob/main/docs/operators/README.md) and [Kora Documentation](https://github.com/lazor-kit/kora/blob/main/docs/README.md).

**Important considerations for Mainnet:**

1. **Fee Management**: On mainnet, transaction fees are paid with real SOL. Ensure your Kora node has sufficient SOL balance to sponsor transactions. You can configure your node to accept payment in SPL tokens (USDC, BONK, etc.) to offset costs.

2. **Security Configuration**: Configure validation rules in `kora.toml` to whitelist allowed programs, tokens, and accounts. Set up rate limiting and monitoring to prevent abuse.

3. **RPC Endpoint**: Consider using a reliable RPC provider (like Helius, QuickNode, or Alchemy) instead of the public Solana RPC endpoint for better performance and reliability in production.

4. **Monitoring**: Set up monitoring for your Kora node to track SOL balance, transaction volume, security events, and operational metrics.

**Option 2: Check for Hosted Services**

You can also check with other providers if they offer hosted mainnet paymaster services. If available, you would configure your paymaster URL accordingly.

## Next Steps

- Review the complete implementation in `app/components/TransactionForm.tsx`
- Experiment with SPL token transfers
- Test on Solana Devnet
- Check transactions on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)