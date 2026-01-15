'use client';

/**
 * Receive Modal Component
 * Displays wallet address for receiving funds
 */

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
}

export default function ReceiveModal({ isOpen, onClose, address }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (!isOpen || !address) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Receive</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-mono text-sm text-gray-900 break-all">{address}</p>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {copied ? 'Copied!' : 'Copy address'}
          </button>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <QRCodeSVG value={address} size={200} />
            </div>
          </div>

          {/* Network Label */}
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Solana Devnet
            </span>
          </div>

          {/* Optional Note */}
          <p className="text-center text-sm text-gray-500">
            Share this address to receive tokens on SOL chain
          </p>
        </div>
      </div>
    </div>
  );
}

