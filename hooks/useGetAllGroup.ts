import { useReadContract } from "wagmi";
import abi from "@/constant/abi.json";

export interface GroupInfo {
  group: `0x${string}`;
  owner: `0x${string}`;
  name: string;
  uri: string;
  totalDepositGoal: bigint;
  additionalInfo: `0x${string}`;
}

export function useGetAllGroups() {
  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getAllGroups",
    args: [],
    query: {
      staleTime: 10_000,
      refetchInterval: 15_000,
    },
  });

  const allGroups = (data as GroupInfo[]) || [];

  const groups = allGroups.filter(
    (group) =>
      group.group !== "0x0000000000000000000000000000000000000000" &&
      group.name !== "",
  );

  return {
    groups,
    hasGroups: groups.length > 0,
    groupCount: groups.length,
    isLoading,
    error,
    refetch,
  };
}
