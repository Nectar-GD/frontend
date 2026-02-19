"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";
import { useGetGroupDetails } from "@/hooks/useGetGroupDetails";
import { useGetAllGroups } from "@/hooks/useGetAllGroup";
import { formatUnits } from "viem";
import { decodeAdditionalInfo } from "@/utils/helper";
import LoadingSpinner from "@/components/Loaders/LoadingSpinner";
import YieldChart from "@/components/pools/YieldChart";
import DepositForm from "@/components/pools/DepositForm";

export default function PoolDetails() {
  const params = useParams();
  const groupAddress = params.id as `0x${string}`;
  const { address } = useAppKitAccount();

  const [currentPage, setCurrentPage] = useState(1);
  const userAddress = address as `0x${string}` | undefined;

  const { groupDetails, isLoading, error, refetch } = useGetGroupDetails(
    groupAddress,
    userAddress
  );

  const { groups } = useGetAllGroups();
  const groupBasicInfo = groups.find((g) => g.group === groupAddress);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !groupDetails || !groupBasicInfo) {
    return (
      <div className="text-red-500 p-4">
        Error loading pool details: {error?.message || "Pool not found"}
      </div>
    );
  }

  const description = decodeAdditionalInfo(groupBasicInfo.additionalInfo);

  const targetAmount = Number(formatUnits(groupDetails.totalDepositGoal, 6));
  const currentBalance = Number(formatUnits(groupDetails.totalDeposited, 6));
  const amountLeft = targetAmount - currentBalance;
  const progress = targetAmount > 0 ? (currentBalance / targetAmount) * 100 : 0;

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = groupDetails.endTime - now;
  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60));
  const isActive = now >= groupDetails.startTime && now < groupDetails.endTime;
  const hasEnded = now >= groupDetails.endTime;

  const startDate = new Date(groupDetails.startTime * 1000).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  const endDate = new Date(groupDetails.endTime * 1000).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const membersPerPage = 5;
  const totalPages = Math.ceil(groupDetails.members.length / membersPerPage);
  const paginatedMembers = groupDetails.members.slice(
    (currentPage - 1) * membersPerPage,
    currentPage * membersPerPage,
  );

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <main className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#252B36] mb-1">
              Explore Pools
            </h1>
            <p className="text-xs sm:text-sm text-[#7D7C7C]">
              See who's saving together.
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            {hasEnded && (
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#C5C2C2] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-400 transition-colors">
                Withdraw
              </button>
            )}
            {isActive && (
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FFC000] text-[#252B36] rounded-lg text-xs sm:text-sm font-bold hover:bg-[#FFD14D] transition-colors">
                Swap Tokens
              </button>
            )}
          </div>
        </div>
        <div className="flex mb-6 justify-between lg:flex-row md:flex-row flex-col">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:w-[28%] md:w-[28%] w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#252B36] mb-1">
              {groupBasicInfo.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-[#7D7C7C] mb-4 sm:mb-6">
              Owner: {groupBasicInfo.owner.slice(0, 6)}...
              {groupBasicInfo.owner.slice(-4)}
            </p>

            <div className="text-xs sm:text-sm text-[#7D7C7C] leading-relaxed">
              <p>{description || "No description available"}</p>

              {groupDetails.isUserEligible && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-800 font-medium">
                    ✓ You're eligible for this pool
                  </p>
                </div>
              )}

              {groupDetails.isUserWinner && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-medium">
                    🎉 You won this pool!
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:w-[28%] md:w-[28%] w-full ">
            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#252B36] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/users.png"
                    alt="users"
                    width={12}
                    height={12}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-[#252B36]">
                    {groupDetails.memberCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#7D7C7C]">
                    Members
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-[#7D7C7C]">
                <span>Max: {groupDetails.maxMembers}</span>
                <span>
                  Left: {groupDetails.maxMembers - groupDetails.memberCount}
                </span>
              </div>
            </div>

            {/* Winners Section */}
            <div>
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#252B36] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/harvestIcon.png"
                    alt="Icon"
                    width={12}
                    height={12}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-[#252B36]">
                    {groupDetails.winnersCountActual}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#7D7C7C]">
                    Winners
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs text-[#7D7C7C]">
                <span>
                  Harvest: {groupDetails.winnersCountActual}/
                  {groupDetails.winnersCount}
                </span>
                <span>
                  Planters:{" "}
                  {groupDetails.memberCount - groupDetails.winnersCountActual}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:w-[40%] md:w-[40%] w-full">
            {/* Time Info */}
            <div className="flex items-start justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="text-[10px] sm:text-xs text-[#7D7C7C] pr-2">
                <p className="mb-1">Start time: {startDate}</p>
                <p>
                  {hasEnded ? `Ended: ${endDate}` : `${daysLeft} Days Left`}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#252B36] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

            {/* Amount Cards */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="bg-[#252B36] p-2 sm:p-3 text-center rounded">
                <p className="text-white text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1">
                  ${targetAmount.toLocaleString()}
                </p>
                <p className="text-gray-400 text-[8px] sm:text-[10px]">
                  Target
                </p>
              </div>
              <div className="p-2 sm:p-3 text-center border border-gray-200 rounded">
                <p className="text-[#252B36] text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1">
                  ${currentBalance.toLocaleString()}
                </p>
                <p className="text-[#7D7C7C] text-[8px] sm:text-[10px]">
                  Current Balance
                </p>
              </div>
              <div className="p-2 sm:p-3 text-center border border-gray-200 rounded">
                <p className="text-[#252B36] text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1">
                  ${amountLeft.toLocaleString()}
                </p>
                <p className="text-[#7D7C7C] text-[8px] sm:text-[10px]">
                  Amount Left
                </p>
              </div>
            </div>

            {/* Deposit Limits */}
            <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-[9px] sm:text-[10px] text-[#7D7C7C]">
              <span>
                Max-user Deposit: ${formatUnits(groupDetails.maxDeposit, 6)}
              </span>
              <span>
                Min-user Deposit: ${formatUnits(groupDetails.minDeposit, 6)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#7D7C7C]">Progress</span>
                <span className="font-medium text-[#252B36]">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#FFC000] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex mb-6 justify-between lg:flex-row md:flex-row flex-col">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 pb-3 sm:pb-4 lg:w-[58%] md:w-[58%] w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 gap-2 sm:gap-0">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#252B36] mb-1.5 sm:mb-2">
                  Yield Performance
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Image
                    src="/triangleImage.png"
                    alt="Triangle"
                    width={12}
                    height={12}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                  />
                  <span className="text-[10px] sm:text-xs text-[#7D7C7C]">
                    Adapter: {groupDetails.yieldAdapter.slice(0, 6)}...
                    {groupDetails.yieldAdapter.slice(-4)}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-bold text-[#252B36] mb-1.5 sm:mb-2">
                  Total Deposits: ${formatUnits(groupDetails.totalDeposited, 6)}
                </p>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-[#252B36]">
                      Deposits: ${formatUnits(groupDetails.totalDeposited, 6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-[#252B36]">
                      Yield: ${formatUnits(groupDetails.pendingProfit, 6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Chart */}
            <div className="relative h-48 sm:h-56 md:h-64">
              <YieldChart
                startTime={groupDetails.startTime}
                endTime={groupDetails.endTime}
                totalDeposited={groupDetails.totalDeposited}
                pendingProfit={groupDetails.pendingProfit}
                decimals={6}
              />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 pb-3 sm:pb-4 lg:w-[40%] md:w-[40%] w-full my-4 lg:my-0 md:my-0">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#252B36] mb-3 sm:mb-4">
              Deposit
            </h3>
            <DepositForm
              groupAddress={groupAddress}
              tokenAddress={groupDetails.token}
              minDeposit={groupDetails.minDeposit}
              maxDeposit={groupDetails.maxDeposit}
              isActive={isActive}
              hasEnded={hasEnded}
              yieldDistributed={groupDetails.yieldDistributed}
              userAddress={userAddress}
              onSuccess={refetch}
            />
          </div>
        </div>
        <div className="overflow-hidden border border-gray-200 rounded-xl">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#252B36]">
              Members ({groupDetails.memberCount})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-[#252B36]">
                    #
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-[#252B36]">
                    User&apos;s Address
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-[#252B36]">
                    Expected Deposit
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-[#252B36]">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-[#252B36]">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member, index) => {
                    const globalIndex =
                      (currentPage - 1) * membersPerPage + index;
                    const isWinner = groupDetails.winners.includes(member);
                    const isCurrentUser =
                      userAddress &&
                      member.toLowerCase() === userAddress.toLowerCase();

                    return (
                      <tr
                        key={member}
                        className={`hover:bg-gray-50 transition-colors ${
                          isCurrentUser ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-[#7D7C7C] font-medium">
                          {globalIndex + 1}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#252B36]">
                              {member.slice(0, 6)}...{member.slice(-4)}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-[#7D7C7C]">
                          $
                          {formatUnits(
                            groupDetails.totalexpectedDepositPerUser,
                            6,
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs">
                          {hasEnded ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] bg-gray-100 text-gray-700">
                              Pool Ended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] bg-green-100 text-green-700">
                              ● Active
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs">
                          {isWinner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                              🏆 Winner
                            </span>
                          ) : (
                            <span className="text-[#7D7C7C]">Participant</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          No members yet
                        </p>
                        <p className="text-xs text-gray-400">
                          Be the first to join this pool!
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#7D7C7C]">
                Showing {(currentPage - 1) * membersPerPage + 1} to{" "}
                {Math.min(
                  currentPage * membersPerPage,
                  groupDetails.memberCount,
                )}{" "}
                of {groupDetails.memberCount} members
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-[#252B36] rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#FFC000] text-[#252B36]"
                            : "bg-white border border-gray-300 text-[#252B36] hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-[#252B36] rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
