import {
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import { useState } from "react";
import { parseUnits } from "viem";
import abi from "@/constant/abi.json";
import { toast } from "sonner";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`;

export interface SavingsGroupFormData {
  name: string;
  yieldAdapter: `0x${string}`;
  token: `0x${string}`;
  startTime: Date;
  duration: number;
  winnersCount: number;
  minDeposit: string;
  maxDeposit: string;
  minMembers: number;
  maxMembers: number;
  totalexpectedDepositPerUser: string;
  totalDepositGoal: string;
  imageUri: string;
  additionalInfo: string;
}

export function useCreateGroup() {
  const [createdGroupAddress, setCreatedGroupAddress] = useState<`0x${string}` | null>(null);

  const {
    data: hash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess,
    data: receipt 
  } = useWaitForTransactionReceipt({
    hash,
  });

  if (isSuccess && receipt && !createdGroupAddress) {
    if (receipt.logs && receipt.logs.length > 0) {
      console.log("Transaction successful:", receipt);
      toast.success("Savings group created successfully!");
    }
  }

  const createGroup = async (
    formData: SavingsGroupFormData,
    tokenDecimals: number = 6, 
  ) => {
    try {
      const startTimestamp = Math.floor(formData.startTime.getTime() / 1000);
      const durationInSeconds = formData.duration * 24 * 60 * 60;

      const minDeposit = parseUnits(formData.minDeposit, tokenDecimals);
      const maxDeposit = parseUnits(formData.maxDeposit, tokenDecimals);
      const expectedDepositPerUser = parseUnits(
        formData.totalexpectedDepositPerUser,
        tokenDecimals,
      );
      const depositGoal = parseUnits(formData.totalDepositGoal, tokenDecimals);

      const additionalInfoBytes = formData.additionalInfo
        ? (`0x${Buffer.from(formData.additionalInfo).toString("hex")}` as `0x${string}`)
        : "0x";

      const yieldInfo = {
        name: formData.name,
        yieldAdapter: formData.yieldAdapter,
        token: formData.token,
        startTime: BigInt(startTimestamp),
        duration: BigInt(durationInSeconds),
        winnersCount: BigInt(formData.winnersCount),
        minDeposit,
        maxDeposit,
        minMembers: BigInt(formData.minMembers),
        maxMembers: BigInt(formData.maxMembers),
        totalexpectedDepositPerUser: expectedDepositPerUser,
        totalDepositGoal: depositGoal,
        uri: formData.imageUri,
        additionalInfo: additionalInfoBytes,
      };

      writeContract({
        address: contractAddress,
        abi,
        functionName: "createGroupSingleYieldAdapter",
        args: [yieldInfo],
      });
      
      toast.info("Please confirm the transaction in your wallet");
    } catch (error) {
      console.error("Error creating savings group:", error);
      toast.error("Failed to create savings group");
      throw error;
    }
  };

  return {
    createGroup,
    isWriting,
    isConfirming,
    isSuccess,
    error: writeError,
    txHash: hash,
    createdGroupAddress,
  };
}