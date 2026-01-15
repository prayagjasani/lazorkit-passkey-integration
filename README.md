# Lazorkit Passkey Guide

Example repository demonstrating Lazorkit SDK integration with passkey authentication and smart-wallet gasless transactions on Solana Devnet.

## Live Demo

**[Try the live demo](https://vivek-passkey-lazorkit.vercel.app)**

The demo runs on Solana Devnet. You can test passkey authentication and transactions (which are gassless) directly in your browser.

## Introduction

This repository provides a working example of how to integrate Lazorkit SDK with passkey authentication and gasless smart wallet transactions. It demonstrates:

- Passkey-based authentication using WebAuthn (Face ID, Touch ID, Windows Hello)
- Smart wallet creation and management via Lazorkit SDK


**Target Audience**: Solana developers learning passkey integration

**What you'll learn**: Passkey auth, smart wallets, and about Gasless transactions

## How Transactions Work

This example uses **Lazorkit's hosted paymaster and signing portal**.

- **Fee sponsorship** - This demo uses Lazorkit's paymaster to sponsor transaction fees (gasless experience). Fee sponsorship is optional - developers can choose to sponsor fees, have users pay with SOL, or allow users to pay with tokens like USDC.
- **No backend setup** - Everything works client-side with Lazorkit SDK
- **Zero configuration** - Just install the SDK and start using `signAndSendTransaction`

In this demo, transactions are sponsored by Lazorkit's paymaster service (`https://kora.devnet.lazorkit.com`) and signed via Lazorkit's portal (`https://portal.lazor.sh`).

When you call `signAndSendTransaction` from the Lazorkit SDK, it:
1. Sends the transaction to paymaster for fee sponsorship (if configured)
2. Opens Lazorkit's portal for passkey-based transaction signing
3. Submits the fully signed transaction to Solana Devnet
4. Returns the transaction signature

> **Note**: Fee sponsorship is optional. Without paymaster configuration, users pay standard Solana network fees with their own SOL.

## Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser with WebAuthn support (Chrome, Firefox, Safari, Edge)
- Basic familiarity with React and TypeScript

## Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd passkey-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser and test**
   - Navigate to `http://localhost:3000`
   - Click "Continue" to sign in with passkey
   - Complete biometric authentication (Face ID, Touch ID, or Windows Hello)
   - Your smart wallet will be created automatically
   - Play around, Get some SOL from the [faucet](https://faucet.solana.com).

> **Note**: For local development, you can only sign transaction, if you are on HTTPS. For testing, try using ngrok.

## Architecture Overview

The application consists of:

- **Frontend Components**: React components handling UI, passkey authentication, and transaction initiation
- **Lazorkit SDK**: Client-side library managing passkey credentials, smart wallet operations, and transactions

This demo uses Lazorkit's infrastructure.
- **Paymaster**: Sponsors transaction fees (use this for testing on devnet `https://kora.devnet.lazorkit.com`)
- **Portal**: Handles passkey-based transaction signing, you can also set up your own portal (use this if you don't want to create your own portal `https://portal.lazor.sh`)

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Tutorials

This repository includes two step-by-step tutorials:

- **[Tutorial 1: Setting Up Passkey Authentication](docs/tutorial-1-passkey-auth.md)**
  - Installing Lazorkit SDK (`@lazorkit/wallet`)
  - Configuring Lazorkit provider
  - Implementing passkey authentication flow
  - Handling authentication errors

- **[Tutorial 2: Implementing Gasless Transactions](docs/tutorial-2-gasless-tx.md)**
  - Building Solana transaction instructions
  - About using `signAndSendTransaction` 
  - Handling SOL and SPL token transfers
  - Error handling and transaction responses

## Limitations of this Demo

- **Devnet-only**: All transactions are on Solana Devnet (can be configured for mainnet)
- **Single-device**: Passkeys are device-bound; no cross-device wallet access
- **No production security**: This is a demo repository, not production-ready

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com/)
- [Lazorkit GitHub Repository](https://github.com/lazor-kit/lazor-kit)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)