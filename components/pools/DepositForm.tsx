"use client";

import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { useDeposit } from "@/hooks/useDeposit";

interface DepositFormProps {
  groupAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  minDeposit: bigint;
  maxDeposit: bigint;
  isActive: boolean;
  hasEnded: boolean;
  yieldDistributed: boolean;
  userAddress?: string;
  onSuccess?: () => void;
}

export default function DepositForm({
  groupAddress,
  tokenAddress,
  minDeposit,
  maxDeposit,
  isActive,
  hasEnded,
  yieldDistributed,
  userAddress,
  onSuccess,
}: DepositFormProps) {
  const [depositAmount, setDepositAmount] = useState("");

  const {
    deposit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    step,
    currentAllowance,
  } = useDeposit(
    groupAddress,
    tokenAddress,
    userAddress as `0x${string}` | undefined,
  );

  useEffect(() => {
    if (isSuccess) {
      toast.success("Deposit successful! 🎉");
      setDepositAmount("");
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    const min = Number(formatUnits(minDeposit, 6));
    const max = Number(formatUnits(maxDeposit, 6));

    if (!depositAmount) {
      toast.error("Please enter an amount");
      return;
    }

    if (amount < min) {
      toast.error(`Minimum deposit is $${min}`);
      return;
    }

    if (amount > max) {
      toast.error(`Maximum deposit is $${max}`);
      return;
    }

    if (!userAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    deposit(depositAmount, 6);
  };

  console.log(depositAmount);

  const isLoading = isPending || isConfirming;
  const minAmount = Number(formatUnits(minDeposit, 6));
  const maxAmount = Number(formatUnits(maxDeposit, 6));
  const amount = parseFloat(depositAmount);
  return (
    <>
      <div className="mb-3 sm:mb-4">
        <label className="block text-[10px] sm:text-xs md:text-sm text-[#7D7C7C] mb-1.5 sm:mb-2">
          Amount (Min: ${minAmount} - Max: ${maxAmount})
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder="Enter amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={!isActive || isLoading}
            step="0.01"
            min="0"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-16 border border-gray-300 rounded-lg text-xs sm:text-sm text-[#252B36] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC000] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500 font-medium">
            USDC
          </div>
        </div>

        {depositAmount && (
          <div className="mt-2 space-y-1">
            {amount < minAmount && (
              <p className="text-[10px] text-red-500">
                ⚠ Below minimum deposit
              </p>
            )}
            {amount > maxAmount && (
              <p className="text-[10px] text-red-500">
                ⚠ Exceeds maximum deposit
              </p>
            )}
            {amount >= minAmount && amount <= maxAmount && (
              <p className="text-[10px] text-green-600">✓ Valid amount</p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleDeposit}
        disabled={!isActive || isLoading || !depositAmount || !userAddress}
        className="w-full py-2.5 sm:py-3 bg-[#FFC000] text-[#252B36] rounded-lg text-xs sm:text-sm font-bold hover:bg-[#FFD14D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {step === "approving" && isPending && (
          <>
            <div className="w-4 h-4 border-2 border-[#252B36] border-t-transparent rounded-full animate-spin" />
            Approve Token Spend...
          </>
        )}
        {step === "approving" && isConfirming && (
          <>
            <div className="w-4 h-4 border-2 border-[#252B36] border-t-transparent rounded-full animate-spin" />
            Confirming Approval...
          </>
        )}
        {step === "depositing" && isPending && (
          <>
            <div className="w-4 h-4 border-2 border-[#252B36] border-t-transparent rounded-full animate-spin" />
            Confirm Deposit...
          </>
        )}
        {step === "depositing" && isConfirming && (
          <>
            <div className="w-4 h-4 border-2 border-[#252B36] border-t-transparent rounded-full animate-spin" />
            Confirming Deposit...
          </>
        )}
        {!isLoading &&
          (hasEnded
            ? "Pool Ended"
            : !userAddress
              ? "Connect Wallet"
              : "Make Deposit")}
      </button>

      {/* Current Allowance Info */}
      {userAddress && currentAllowance > BigInt(0) && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-700">
          Current approval: ${formatUnits(currentAllowance, 6)} USDC
        </div>
      )}

      {!userAddress && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            ℹ Connect your wallet to deposit
          </p>
        </div>
      )}

      {yieldDistributed && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">✓ Yield has been distributed</p>
        </div>
      )}

      {isSuccess && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
          <p className="text-xs text-green-800 font-medium">
            ✓ Deposit successful! Refreshing data...
          </p>
        </div>
      )}
    </>
  );
}
