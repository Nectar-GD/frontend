"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import groupAbi from "@/constant/deposit.json";
import type { Abi } from "viem";
import { useState, useEffect } from "react";

const abi = groupAbi as Abi;

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export function useDeposit(
  groupAddress?: `0x${string}`,
  tokenAddress?: `0x${string}`,
  userAddress?: `0x${string}`
) {
  const [pendingAmount, setPendingAmount] = useState<bigint | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "depositing">("idle");

  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { data: depositHash, writeContract: writeDeposit, isPending: isDepositPending, error: depositError } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: userAddress && groupAddress ? [userAddress, groupAddress] : undefined,
    query: {
      enabled: !!userAddress && !!groupAddress && !!tokenAddress,
    },
  });

  const currentAllowance = (allowanceData as bigint) || BigInt(0);

  useEffect(() => {
    if (isApproveSuccess && pendingAmount && groupAddress) {
      console.log("✅ Approval successful, proceeding to deposit:", pendingAmount.toString());
      toast.success("Approval successful! Proceeding to deposit...");
      setStep("depositing");

      setTimeout(() => {
        try {
          console.log("Calling deposit:", { groupAddress, amount: pendingAmount.toString() });
          writeDeposit({
            address: groupAddress,
            abi,
            functionName: "deposit",
            args: [pendingAmount],
          });
        } catch (error: any) {
          console.error("❌ Deposit writeContract error:", error);
          toast.error("Deposit failed: " + error.message);
          setStep("idle");
          setPendingAmount(null);
        }
      }, 500);
    }
  }, [isApproveSuccess, pendingAmount, groupAddress, writeDeposit]);

  useEffect(() => {
    if (approveError) {
      console.error("❌ Approval error:", approveError);
      toast.error("Approval failed: " + (approveError.message || "Unknown error"));
      setStep("idle");
      setPendingAmount(null);
    }
  }, [approveError]);

  useEffect(() => {
    if (depositError) {
      console.error("❌ Deposit error:", depositError);
      toast.error("Deposit failed: " + (depositError.message || "Unknown error"));
      setStep("idle");
      setPendingAmount(null);
    }
  }, [depositError]);

  useEffect(() => {
    if (isDepositSuccess) {
      console.log("✅ Deposit successful!");
      setStep("idle");
      setPendingAmount(null);
    }
  }, [isDepositSuccess]);

  const deposit = async (amount: string, decimals: number = 6) => {
    if (!groupAddress) {
      toast.error("Group address is required");
      console.error("Missing groupAddress");
      return;
    }

    if (!tokenAddress) {
      toast.error("Token address is required");
      console.error("Missing tokenAddress");
      return;
    }

    if (!userAddress) {
      toast.error("Please connect your wallet");
      console.error("Missing userAddress");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountInWei = parseUnits(amount, decimals);
      setPendingAmount(amountInWei);

      console.log("💰 Deposit requested:", {
        amount,
        amountInWei: amountInWei.toString(),
        groupAddress,
        tokenAddress,
        userAddress,
      });

      const { data: latestAllowance } = await refetchAllowance();
      const allowance = (latestAllowance as bigint) || BigInt(0);

      console.log("🔍 Current allowance:", allowance.toString(), "Needed:", amountInWei.toString());

      if (allowance < amountInWei) {
        console.log("⚠️ Insufficient allowance, requesting approval...");
        toast.info("Step 1/2: Requesting token approval...");
        setStep("approving");

        writeApprove({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [groupAddress, amountInWei],
        });
      } else {
        console.log("✅ Sufficient allowance, proceeding directly to deposit");
        toast.info("Sufficient allowance detected. Proceeding to deposit...");
        setStep("depositing");

        writeDeposit({
          address: groupAddress,
          abi,
          functionName: "deposit",
          args: [amountInWei],
        });
      }
    } catch (error: any) {
      console.error("❌ Deposit initiation error:", error);
      toast.error(error.message || "Failed to initiate deposit");
      setStep("idle");
      setPendingAmount(null);
    }
  };

  const isPending = isApprovePending || isDepositPending;
  const isConfirming = isApproveConfirming || isDepositConfirming;

  return {
    deposit,
    approveHash,
    depositHash,
    isPending,
    isConfirming,
    isSuccess: isDepositSuccess,
    error: approveError || depositError,
    step,
    currentAllowance,
  };
}