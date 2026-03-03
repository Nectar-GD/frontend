import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";
import { parseUnits, decodeEventLog } from "viem";
import nectarFactoryAbi from "@/constant/abi.json";
import { toast } from "sonner";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`;

// Matches INectarPool.EnrollmentWindow enum
export enum EnrollmentWindow {
  Standard = 0, // first 50% of cycles
  Strict = 1,   // first 25% of cycles
  Fixed = 2,    // cycle 1 only
}

// Matches INectarPool.DistributionMode enum
export enum DistributionMode {
  Equal = 0,
  Weighted = 1,    // 50/30/20 tiers
  GrandPrize = 2,  // single winner takes all
}

// Contribution frequency mapped to cycleDuration in seconds
export enum ContributionFrequency {
  Daily = 86400,     // 1 day
  Weekly = 604800,   // 7 days
  Monthly = 2592000, // 30 days
}

export interface CreatePoolFormData {
  token: `0x${string}`;
  targetAmount: string;
  maxMembers: number;
  totalCycles: number;
  winnersCount: number;
  frequency: ContributionFrequency;
  requiresIdentity: boolean;
  enrollmentWindow: EnrollmentWindow;
  distributionMode: DistributionMode;
}

interface PoolCreatedArgs {
  pool: `0x${string}`;
  creator: `0x${string}`;
  token: `0x${string}`;
  targetAmount: bigint;
  maxMembers: number;
  totalCycles: number;
}

export function useCreatePool() {
  const [createdPoolAddress, setCreatedPoolAddress] =
    useState<`0x${string}` | null>(null);

  const {
    data: hash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  // Extract deployed pool address from PoolCreated event log
  useEffect(() => {
    if (isSuccess && receipt && !createdPoolAddress) {
      try {
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: nectarFactoryAbi,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "PoolCreated") {
              const args = decoded.args as unknown as PoolCreatedArgs;
              setCreatedPoolAddress(args.pool);
              toast.success(
                `Pool created at ${args.pool.slice(0, 6)}...${args.pool.slice(-4)}`
              );
              return;
            }
          } catch {
            // Not a matching event, continue to next log
            continue;
          }
        }
        toast.success("Pool created successfully!");
      } catch {
        toast.success("Pool created successfully!");
      }
    }
  }, [isSuccess, receipt, createdPoolAddress]);

  const createPool = (
    formData: CreatePoolFormData,
    tokenDecimals: number = 6
  ) => {
    try {
      const targetAmount = parseUnits(formData.targetAmount, tokenDecimals);

      // Build PoolConfig struct matching the contract
      const config = {
        token: formData.token,
        targetAmount,
        maxMembers: formData.maxMembers,
        totalCycles: formData.totalCycles,
        winnersCount: formData.winnersCount,
        cycleDuration: formData.frequency as number,
        requiresIdentity: formData.requiresIdentity,
        enrollmentWindow: formData.enrollmentWindow,
        distributionMode: formData.distributionMode,
      };

      writeContract({
        address: FACTORY_ADDRESS,
        abi: nectarFactoryAbi,
        functionName: "createPool",
        args: [config],
      });

      toast.info("Please confirm the transaction in your wallet");
    } catch (error) {
      console.error("Error creating pool:", error);
      toast.error("Failed to create pool");
      throw error;
    }
  };

  const reset = () => {
    setCreatedPoolAddress(null);
  };

  return {
    createPool,
    isWriting,
    isConfirming,
    isSuccess,
    error: writeError,
    txHash: hash,
    createdPoolAddress,
    reset,
  };
}