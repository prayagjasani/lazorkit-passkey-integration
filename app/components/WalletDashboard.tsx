'use client';

/**
 * Wallet Dashboard Component
 * Main wallet interface after authentication
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
  name?: string;
}

// Common token mints on Devnet (add more as needed)
const KNOWN_TOKENS: { [mint: string]: { symbol: string; name: string } } = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
  'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr': { symbol: 'USDC', name: 'USD Coin' }, // Devnet USDC
};

/**
 * Crypto Logo Component
 * Displays cryptocurrency logos using LogoKit API
 */
interface CryptoLogoProps {
  symbol: string;
  size?: number;
  className?: string;
  fallback?: 'monogram' | 'monogram-light' | '404';
}

export function CryptoLogo({ 
  symbol, 
  size = 40, 
  className = '',
  fallback = 'monogram-light'
}: CryptoLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // LogoKit API token - uses environment variable or default key
  const apiToken = process.env.NEXT_PUBLIC_LOGOKIT_TOKEN || 'pk_fr2d881ac7d746e85acb17';
  
  // Build the URL - token is optional (free tier works without it)
  const logoUrl = apiToken 
    ? `https://img.logokit.com/crypto/${symbol}?token=${apiToken}&size=${size}&fallback=${fallback}`
    : `https://img.logokit.com/crypto/${symbol}?size=${size}&fallback=${fallback}`;

  if (imageError) {
    // Fallback to a simple colored circle if image fails to load
    const gradientColors: { [key: string]: string } = {
      'SOL': 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
      'USDC': 'linear-gradient(135deg, #2775CA 0%, #1EA0F1 100%)',
    };
    const gradient = gradientColors[symbol] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    return (
      <div 
        className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        style={{ 
          width: size, 
          height: size,
          background: gradient,
          fontSize: `${size * 0.35}px`
        }}
      >
        {symbol.slice(0, 3)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${symbol} logo`}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
    />
  );
}

export default function WalletDashboard() {
  const { smartWalletPubkey, isConnected, disconnect } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isConnected || !smartWalletPubkey) {
      setBalance(null);
      setTokenBalances([]);
      setInitialLoading(true);
      setTokensLoading(true);
      return;
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.diadata.org/v1/assetQuotation/Solana/0x0000000000000000000000000000000000000000');
        if (response.ok) {
          const data = await response.json();
          setSolPrice(data.Price || null);
        }
      } catch (err) {
        console.error('Failed to fetch SOL price:', err);
      }
    };

    const fetchBalance = async (isInitial = false) => {
      try {
        const balanceLamports = await connection.getBalance(smartWalletPubkey);
        setBalance(balanceLamports / LAMPORTS_PER_SOL);
        if (isInitial) {
          setInitialLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        if (isInitial) {
          setInitialLoading(false);
        }
      }
    };

    const fetchTokenBalances = async (isInitial = false) => {
      try {
        const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
          smartWalletPubkey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        const tokens: TokenBalance[] = parsedTokenAccounts.value
          .map((accountInfo) => {
            const parsedInfo = accountInfo.account.data.parsed.info;
            const mint = parsedInfo.mint;
            const tokenAmount = parsedInfo.tokenAmount;
            
            // Only include tokens with non-zero balance
            if (tokenAmount.uiAmount === 0) {
              return null;
            }

            const knownToken = KNOWN_TOKENS[mint];
            return {
              mint,
              balance: tokenAmount.uiAmount || 0,
              decimals: tokenAmount.decimals,
              symbol: knownToken?.symbol,
              name: knownToken?.name,
            } as TokenBalance;
          })
          .filter((token): token is TokenBalance => token !== null)
          .sort((a, b) => {
            // Sort known tokens first, then by balance
            if (a.symbol && !b.symbol) return -1;
            if (!a.symbol && b.symbol) return 1;
            return b.balance - a.balance;
          });

        setTokenBalances(tokens);
        if (isInitial) {
          setTokensLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch token balances:', err);
        if (isInitial) {
          setTokensLoading(false);
        }
      }
    };

    // Initial load with loading state
    fetchBalance(true);
    fetchTokenBalances(true);
    fetchSolPrice();
    
    // Background refreshes without loading state
    const balanceInterval = setInterval(() => fetchBalance(false), 5000);
    const tokensInterval = setInterval(() => fetchTokenBalances(false), 10000);
    const priceInterval = setInterval(() => fetchSolPrice(), 60000); // Refresh price every minute
    
    return () => {
      clearInterval(balanceInterval);
      clearInterval(tokensInterval);
      clearInterval(priceInterval);
    };
  }, [isConnected, smartWalletPubkey]);

  const handleCopyAddress = async () => {
    if (!smartWalletPubkey) return;
    
    try {
      await navigator.clipboard.writeText(smartWalletPubkey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-6)}`;
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!isConnected || !smartWalletPubkey) {
    return null;
  }

  const addressString = smartWalletPubkey.toString();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Wallet Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">My Smart Wallet</h2>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-600">
                  {truncateAddress(addressString)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your balance</p>
                {initialLoading && balance === null ? (
                  <p className="text-2xl font-semibold text-gray-900">Loading...</p>
                ) : balance !== null ? (
                  <>
                    <p className="text-2xl font-semibold text-gray-900">
                      {balance.toFixed(4)} SOL
                    </p>
                    {solPrice !== null && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatUSD(balance * solPrice)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Devnet</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setSendModalOpen(true)}
            className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Send</span>
            </div>
          </button>
          
          <button
            onClick={() => setReceiveModalOpen(true)}
            className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Receive</span>
            </div>
          </button>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
          <div className="space-y-3">
            {/* SOL Asset */}
            <button
              onClick={() => setSendModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CryptoLogo symbol="SOL" size={40} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">SOL</p>
                  <p className="text-xs text-gray-500">Solana</p>
                </div>
              </div>
              <div className="text-right">
                {initialLoading && balance === null ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : balance !== null ? (
                  <>
                    <p className="font-medium text-gray-900">{balance.toFixed(4)}</p>
                    {solPrice !== null && (
                      <p className="text-xs text-gray-500">{formatUSD(balance * solPrice)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
            </button>

            {/* SPL Tokens */}
            {tokensLoading && tokenBalances.length === 0 ? (
              <div className="w-full flex items-center justify-center p-3">
                <p className="text-sm text-gray-500">Loading tokens...</p>
              </div>
            ) : tokenBalances.length > 0 ? (
              tokenBalances.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => setSendModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {token.symbol ? (
                      <CryptoLogo symbol={token.symbol} size={40} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xs">
                        {token.mint.slice(0, 2)}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {token.symbol || truncateAddress(token.mint)}
                      </p>
                      {token.name && (
                        <p className="text-xs text-gray-900">{token.name}</p>
                      )}
                      {!token.symbol && (
                        <p className="text-xs text-gray-400 font-mono">
                          {truncateAddress(token.mint)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {token.balance.toFixed(token.decimals > 6 ? 6 : token.decimals)}
                    </p>
                    {/* Token USD values would require token price APIs */}
                    {/* For now, only SOL shows USD value */}
                  </div>
                </button>
              ))
            ) : (
              <div className="w-full flex items-center justify-center p-3">
                <p className="text-sm text-gray-500">No other tokens found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        balance={balance}
        tokenBalances={tokenBalances}
      />
      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        address={addressString}
      />
    </div>
  );
}

