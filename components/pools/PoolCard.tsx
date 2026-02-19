"use client";

import Image from "next/image";
import Link from "next/link";
import { formatUnits } from "viem";
import { decodeAdditionalInfo, convertIpfsUrl } from "@/utils/helper";
import { useGetGroupDetails } from "@/hooks/useGetGroupDetails";
import { useAppKitAccount } from "@reown/appkit/react";

interface PoolCardProps {
  group: `0x${string}`;
  name: string;
  uri: string;
  totalDepositGoal: bigint;
  additionalInfo: `0x${string}`;
  owner: `0x${string}`;
}

export default function PoolCard({
  group,
  name,
  uri,
  totalDepositGoal,
  additionalInfo,
  owner,
}: PoolCardProps) {
  const { address: userAddress } = useAppKitAccount();
  
  const { groupDetails, isLoading } = useGetGroupDetails(group, userAddress as `0x${string}`);

  const description = decodeAdditionalInfo(additionalInfo);
  const imageUrl = convertIpfsUrl(uri);
  const goalInUSDC = formatUnits(totalDepositGoal, 6);

  return (
    <div className="w-full lg:w-[22%] md:w-[22%] rounded-xl border border-[#252B36]/20">
      <Link href={`/pools/${group}`} className="group block hover:text-center">
        <div className="relative h-40 lg:h-44 w-full overflow-hidden rounded-bl-[70px] rounded-tr-xl rounded-tl-xl">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          
          <div className="absolute inset-0 flex flex-col justify-center px-6 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-center">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : groupDetails ? (
              <>
                <div className="my-4">
                  <p className="text-[#7D7C7C] text-[12px] mb-1">Balance</p>
                  <span className="font-bold text-gray-900 text-[16px]">
                    ${formatUnits(groupDetails.totalDeposited, 6)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-[#7D7C7C] text-[12px] mb-1">Winner count</p>
                  <p className="text-[#252B36] font-semibold text-[16px]">
                    {groupDetails.winnersCountActual} / {groupDetails.winnersCount}
                  </p>
                </div>

                <div>
                  <p className="text-[#7D7C7C] text-[12px] mb-1">Members</p>
                  <p className="text-[#252B36] font-semibold text-[16px]">
                    {groupDetails.memberCount} / {groupDetails.maxMembers}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-red-500">Failed to load</p>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 w-full">
          <h3 className="font-bold text-[18px] text-[#252B36] mb-2 sm:mb-3">
            {name}
          </h3>

          <p className="text-[#7D7C7C] text-[13px] mb-3 sm:mb-4 text-justify line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 w-full">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-[12px]">Target:</span>
              <span className="font-bold text-gray-900 text-[14px]">
                ${goalInUSDC}
              </span>
            </div>

            <Image
              src="/triangleImage.png"
              alt="Triangle"
              width={30}
              height={30}
              className="w-5 h-5 sm:w-3 sm:h-3"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}