'use client';

/**
 * Send Modal Component
 * Allows user to send SOL or any SPL token
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import { CryptoLogo } from './WalletDashboard';

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
}

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number | null;
  tokenBalances: TokenBalance[];
}

type SelectedAsset = { type: 'SOL' } | { type: 'TOKEN'; token: TokenBalance };

export default function SendModal({ isOpen, onClose, balance, tokenBalances }: SendModalProps) {
  const { smartWalletPubkey, isConnected, signAndSendTransaction } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset>({ type: 'SOL' });
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const selectedTokenBalance = selectedAsset.type === 'TOKEN' ? selectedAsset.token.balance : null;
  const selectedAssetDisplay = selectedAsset.type === 'SOL' ? 'SOL' : (selectedAsset.token.symbol || 'Token');

  useEffect(() => {
    if (!isOpen) {
      setRecipient('');
      setAmount('');
      setSelectedAsset({ type: 'SOL' });
      setError(null);
      setSuccess(null);
      setRecipientError(null);
    }
  }, [isOpen]);

  const validateAddress = (address: string): boolean => {
    if (!address.trim()) {
      setRecipientError('Recipient address is required');
      return false;
    }
    try {
      new PublicKey(address);
      setRecipientError(null);
      return true;
    } catch {
      setRecipientError('Invalid Solana address');
      return false;
    }
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value);
    if (value.trim()) {
      validateAddress(value);
    } else {
      setRecipientError(null);
    }
  };

  const handleMaxClick = () => {
    if (selectedAsset.type === 'SOL' && balance !== null) {
      setAmount(balance.toFixed(4));
    } else if (selectedAsset.type === 'TOKEN' && selectedAsset.token.balance !== null) {
      const decimals = selectedAsset.token.decimals;
      setAmount(selectedAsset.token.balance.toFixed(decimals > 6 ? 6 : decimals));
    }
  };

  const handleSend = async () => {
    if (!isConnected || !smartWalletPubkey) {
      setError('Wallet not connected');
      return;
    }

    if (!validateAddress(recipient)) {
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Validate balance
    const amountNum = parseFloat(amount);
    if (selectedAsset.type === 'SOL') {
      if (balance !== null && amountNum > balance) {
        setError('Insufficient balance');
        return;
      }
    } else {
      if (selectedAsset.token.balance !== null && amountNum > selectedAsset.token.balance) {
        setError('Insufficient balance');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const recipientPubkey = new PublicKey(recipient);
      const fromPubkey = smartWalletPubkey;
      let instructions: any[] = [];

      if (selectedAsset.type === 'SOL') {
        const amountLamports = amountNum * LAMPORTS_PER_SOL;
        instructions = [
          SystemProgram.transfer({
            fromPubkey: fromPubkey,
            toPubkey: recipientPubkey,
            lamports: amountLamports,
          })
        ];
      } else {
        // Token transfer
        const token = selectedAsset.token;
        const mintPubkey = new PublicKey(token.mint);
        const decimals = token.decimals;
        
        // Convert amount to token's smallest unit (considering decimals)
        const amountInSmallestUnit = BigInt(Math.floor(amountNum * Math.pow(10, decimals)));

        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        // CRITICAL: allowOwnerOffCurve must be true for smart wallets (PDAs are off-curve)
        const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromPubkey, true);
        const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey, false);

        try {
          await getAccount(connection, toTokenAccount, 'confirmed');
        } catch (err: any) {
          if (err.name === 'TokenAccountNotFoundError' || err.code === 'InvalidAccountData' || err.message?.includes('InvalidAccountData')) {
            instructions.push(
              createAssociatedTokenAccountInstruction(
                fromPubkey,
                toTokenAccount,
                recipientPubkey,
                mintPubkey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              )
            );
          } else {
            throw err;
          }
        }

        instructions.push(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromPubkey,
            amountInSmallestUnit,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      const signature = await signAndSendTransaction({
        instructions: instructions,
      });

      if (!signature) {
        throw new Error('Transaction failed: No signature returned');
      }

      setSuccess(signature);
      setRecipient('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentBalance = selectedAsset.type === 'SOL' ? balance : selectedTokenBalance;
  const isFormValid = recipient.trim() && !recipientError && amount.trim() && parseFloat(amount) > 0 && (currentBalance === null || parseFloat(amount) <= currentBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Send</h2>
            <p className="text-sm text-gray-500 mt-1">Gasless transaction · Devnet</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Asset Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset</label>
            <div className="flex flex-wrap gap-2">
              {/* SOL Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAsset({ type: 'SOL' });
                  setAmount('');
                }}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedAsset.type === 'SOL'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
                <span className="text-sm font-medium">SOL</span>
              </button>
              
              {/* Token Options */}
              {tokenBalances.map((token) => (
                <button
                  key={token.mint}
                  type="button"
                  onClick={() => {
                    setSelectedAsset({ type: 'TOKEN', token });
                    setAmount('');
                  }}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedAsset.type === 'TOKEN' && selectedAsset.token.mint === token.mint
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {token.symbol ? (
                    <CryptoLogo symbol={token.symbol} size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                  )}
                  <span className="text-sm font-medium">
                    {token.symbol || token.mint.slice(0, 4) + '...'}
                  </span>
                </button>
              ))}
            </div>
            {currentBalance !== null && (
              <p className="mt-2 text-xs text-gray-500">
                Balance: {currentBalance.toFixed(selectedAsset.type === 'SOL' ? 4 : (selectedAsset.type === 'TOKEN' ? Math.min(selectedAsset.token.decimals, 6) : 4))} {selectedAssetDisplay}
              </p>
            )}
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipient}
                onChange={(e) => handleRecipientChange(e.target.value)}
                placeholder="Solana address"
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  recipientError ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  handleRecipientChange(text);
                }}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Paste
              </button>
            </div>
            {recipientError && (
              <p className="mt-1 text-sm text-red-600">{recipientError}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {selectedAssetDisplay}
                </span>
              </div>
              {currentBalance !== null && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Max
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Transaction sent</span>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${success}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on Explorer
              </a>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!isFormValid || loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Processing...' : `Send ${selectedAssetDisplay}`}
          </button>
        </div>
      </div>
    </div>
  );
}
