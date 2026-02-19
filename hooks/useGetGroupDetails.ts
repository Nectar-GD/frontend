import { useReadContracts } from "wagmi";
import groupAbi from "@/constant/deposit.json"; 
import { Abi } from "viem";

const abi = groupAbi as Abi;

export interface GroupDetails {
  // Basic Info
  startTime: number;
  endTime: number;
  minDeposit: bigint;
  maxDeposit: bigint;
  minMembers: number;
  maxMembers: number;
  winnersCount: number;
  totalDepositGoal: bigint;
  totalexpectedDepositPerUser: bigint;
  
  // Status Info
  memberCount: number;
  totalDeposited: bigint;
  pendingProfit: bigint;
  yieldDistributed: boolean;
  winnersCountActual: number;
  
  // Addresses
  token: `0x${string}`;
  yieldAdapter: `0x${string}`;
  
  // Members & Winners
  members: `0x${string}`[];
  winners: `0x${string}`[];
  
  // User-specific (if userAddress provided)
  isUserEligible?: boolean;
  isUserWinner?: boolean;
}

export function useGetGroupDetails(
  groupAddress?: `0x${string}`,
  userAddress?: `0x${string}`
) {
  const enabled = !!groupAddress;

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: enabled
      ? [
          // Basic Info
          {
            address: groupAddress,
            abi,
            functionName: "startTime",
          },
          {
            address: groupAddress,
            abi,
            functionName: "endTime",
          },
          {
            address: groupAddress,
            abi,
            functionName: "minDeposit",
          },
          {
            address: groupAddress,
            abi,
            functionName: "maxDeposit",
          },
          {
            address: groupAddress,
            abi,
            functionName: "minMembers",
          },
          {
            address: groupAddress,
            abi,
            functionName: "maxMembers",
          },
          {
            address: groupAddress,
            abi,
            functionName: "winnersCount",
          },
          {
            address: groupAddress,
            abi,
            functionName: "totalDepositGoal",
          },
          {
            address: groupAddress,
            abi,
            functionName: "totalexpectedDepositPerUser",
          },
          
          // Status Info
          {
            address: groupAddress,
            abi,
            functionName: "memberCount",
          },
          {
            address: groupAddress,
            abi,
            functionName: "totalDeposited",
          },
          {
            address: groupAddress,
            abi,
            functionName: "pendingProfit",
          },
          {
            address: groupAddress,
            abi,
            functionName: "yieldDistributed",
          },
          {
            address: groupAddress,
            abi,
            functionName: "winnersCountActual",
          },
          
          // Addresses
          {
            address: groupAddress,
            abi,
            functionName: "token",
          },
          {
            address: groupAddress,
            abi,
            functionName: "yieldAdapter",
          },
          
          // Members & Winners
          {
            address: groupAddress,
            abi,
            functionName: "getMembers",
          },
          {
            address: groupAddress,
            abi,
            functionName: "getWinners",
          },
          
          // User-specific (only if userAddress provided)
          ...(userAddress
            ? [
                {
                  address: groupAddress,
                  abi,
                  functionName: "isEligible",
                  args: [userAddress],
                },
                {
                  address: groupAddress,
                  abi,
                  functionName: "isWinner",
                  args: [userAddress],
                },
              ]
            : []),
        ]
      : [],
    query: {
      enabled,
      staleTime: 30_000,
      refetchInterval: 60_000, // Auto-refresh every 60 seconds
    },
  });

  if (!enabled || !data) {
    return {
      groupDetails: null,
      isLoading,
      error,
      refetch,
    };
  }

  // Parse the results
  let index = 0;
  
  const groupDetails: GroupDetails = {
    // Basic Info
    startTime: Number(data[index++]?.result || 0),
    endTime: Number(data[index++]?.result || 0),
    minDeposit: (data[index++]?.result as bigint) || 0n,
    maxDeposit: (data[index++]?.result as bigint) || 0n,
    minMembers: Number(data[index++]?.result || 0),
    maxMembers: Number(data[index++]?.result || 0),
    winnersCount: Number(data[index++]?.result || 0),
    totalDepositGoal: (data[index++]?.result as bigint) || 0n,
    totalexpectedDepositPerUser: (data[index++]?.result as bigint) || 0n,
    
    // Status Info
    memberCount: Number(data[index++]?.result || 0),
    totalDeposited: (data[index++]?.result as bigint) || 0n,
    pendingProfit: (data[index++]?.result as bigint) || 0n,
    yieldDistributed: (data[index++]?.result as boolean) || false,
    winnersCountActual: Number(data[index++]?.result || 0),
    
    token: (data[index++]?.result as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    yieldAdapter: (data[index++]?.result as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    
    members: (data[index++]?.result as `0x${string}`[]) || [],
    winners: (data[index++]?.result as `0x${string}`[]) || [],
  
    ...(userAddress ? {
      isUserEligible: (data[index++]?.result as boolean) || false,
      isUserWinner: (data[index++]?.result as boolean) || false,
    } : {}),
  };

  return {
    groupDetails,
    isLoading,
    error,
    refetch,
  };
}