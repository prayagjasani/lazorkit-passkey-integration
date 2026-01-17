"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useWallet } from "@lazorkit/wallet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStaking } from "@/features/staking/hooks";
import {
  PageHeader,
  NotConnectedState,
  BalanceCard,
  InfoBanner,
} from "@/components/dashboard";
import { truncateAddress } from "@/lib/services";
import { SuccessAnimation } from "@/components/common";

// Popular devnet validators
const DEVNET_VALIDATORS = [
  {
    name: "Solana Foundation",
    voteAccount: "dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92",
    commission: "0%",
  },
  {
    name: "Devnet Validator 1",
    voteAccount: "5D1fNXzvv5NjV1ysLjirC4WY92RNsVH18vjmcszZd8on",
    commission: "5%",
  },
  {
    name: "Devnet Validator 2",
    voteAccount: "dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV",
    commission: "5%",
  },
];

export default function StakePage() {
  const { isConnected } = useWallet();
  const {
    stake,
    staking,
    balance,
    stakeAccounts,
    loading,
    refresh,
  } = useStaking();

  const [stakeAccountsError, setStakeAccountsError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [selectedValidator, setSelectedValidator] = useState(
    DEVNET_VALIDATORS[0].voteAccount
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Only fetch once on mount, not on every render
  useEffect(() => {
    if (isConnected) {
      // Add a small delay to avoid immediate requests
      const timeoutId = setTimeout(() => {
        refresh();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected]); // Remove refresh from dependencies to prevent re-fetching

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const signature = await stake(amount, selectedValidator);

    if (signature) {
      setAmount("");
      setShowSuccess(true);
      // Refresh after a delay to avoid immediate rate limits
      setTimeout(() => {
        refresh();
      }, 2000);
    }
  };

  const handleRefreshStakes = async () => {
    setStakeAccountsError(null);
    try {
      await refresh();
    } catch (err) {
      setStakeAccountsError("Rate limited. Please try again in a moment.");
    }
  };

  if (!isConnected) {
    return (
      <NotConnectedState
        title="Stake SOL"
        message="Please connect your wallet to stake SOL."
        showSetup
      />
    );
  }

  const totalStaked =
    stakeAccounts.reduce((sum, account) => sum + account.lamports / 1e9, 0) || 0;

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        message="SOL staked successfully!"
        onComplete={() => setShowSuccess(false)}
      />
      <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Stake SOL"
          description="Delegate SOL to validators and earn rewards"
        />

        <BalanceCard
          label="Available Balance"
          balance={balance}
          loading={loading}
          onRefresh={refresh}
          variant="highlight"
        />

        {totalStaked > 0 && (
          <Card className="bg-white mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8e8e93] mb-1">Total Staked</p>
                  <p className="text-2xl font-semibold">{totalStaked.toFixed(4)} SOL</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#8e8e93] mb-1">Active Stakes</p>
                  <p className="text-2xl font-semibold">{stakeAccounts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staking Form */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Delegate SOL</h2>
            <p className="text-sm text-[#8e8e93]">
              Choose a validator and stake your SOL
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validator Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                Select Validator
              </label>
              <select
                value={selectedValidator}
                onChange={(e) => setSelectedValidator(e.target.value)}
                className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black focus:border-[#7454f7] focus:outline-none focus:ring-1 focus:ring-[#7454f7]"
              >
                {DEVNET_VALIDATORS.map((validator) => (
                  <option key={validator.voteAccount} value={validator.voteAccount}>
                    {validator.name} ({validator.commission} commission)
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8e8e93]">
                Amount to Stake (SOL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.1"
                min="1"
                className="w-full rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] px-4 py-3 text-black placeholder-[#8e8e93] focus:border-[#7454f7] focus:outline-none focus:ring-1 focus:ring-[#7454f7]"
              />
              <p className="mt-1 text-xs text-[#8e8e93]">
                Minimum stake: 1 SOL
              </p>
            </div>

            {/* Stake Button */}
            <Button
              onClick={handleStake}
              disabled={staking || !amount || parseFloat(amount) < 1}
              className="w-full"
              size="lg"
            >
              {staking ? "Staking..." : "Stake SOL"}
            </Button>

            <InfoBanner>
              <strong>Gasless Staking:</strong> Staking transactions are gasless via LazorKit paymaster. 
              Your SOL will be delegated to the selected validator and you&apos;ll start earning rewards.
            </InfoBanner>
            
            <InfoBanner variant="warning">
              <strong>Note:</strong> Stake account fetching is rate-limited by the Solana RPC. 
              If you see errors, wait a moment and use the Refresh button.
            </InfoBanner>
          </CardContent>
        </Card>

        {/* Stake Accounts List */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Stakes</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefreshStakes}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
            <CardContent>
              {stakeAccountsError && (
                <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">{stakeAccountsError}</p>
                </div>
              )}
              {stakeAccounts.length === 0 && !loading && !stakeAccountsError && (
                <p className="text-center text-sm text-[#8e8e93] py-8">
                  No active stakes. Start staking to see your accounts here.
                </p>
              )}
              {stakeAccounts.length > 0 && (
                <div className="space-y-3">
                  {stakeAccounts.map((account, index) => (
                  <div
                    key={account.address}
                    className="flex items-center justify-between rounded-lg border border-[#e5e5ea] bg-[#f2f2f7] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-black">
                        Stake Account #{index + 1}
                      </p>
                      <p className="text-xs text-[#8e8e93] font-mono mt-1">
                        {truncateAddress(account.address)}
                      </p>
                      <p className="text-xs text-[#8e8e93] mt-1">
                        Validator: {truncateAddress(account.validator || "None")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-black">
                        {(account.lamports / 1e9).toFixed(4)} SOL
                      </p>
                      <p className="text-xs text-[#8e8e93]">
                        {account.state || "Active"}
                      </p>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
    </>
  );
}

