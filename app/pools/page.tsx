"use client";

import { useState, useMemo } from "react";
import { useGetAllPools, PoolInfo } from "@/hooks/useGetAllPools";
import {
  getFlowerForPool,
  formatFrequency,
  frequencyUnit,
  POOL_STATE_LABELS,
  POOL_STATE_COLORS,
} from "@/utils/poolutils";
import { formatUnits } from "viem";
import LoadingSpinner from "@/components/Loaders/LoadingSpinner";
import Link from "next/link";

const POOLS_PER_PAGE = 9;

function PoolCard({ pool }: { pool: PoolInfo }) {
  const flower = getFlowerForPool(pool.address);
  const freq = formatFrequency(pool.cycleDuration);
  const unit = frequencyUnit(pool.cycleDuration);
  const stateLabel = POOL_STATE_LABELS[pool.state] || "Unknown";
  const stateColor =
    POOL_STATE_COLORS[pool.state] || "bg-gray-100 text-gray-700";

  const perCycle =
    pool.totalCycles > 0 && pool.maxMembers > 0
      ? pool.targetAmount / BigInt(pool.maxMembers) / BigInt(pool.totalCycles)
      : 0n;

  const slotsLeft = pool.maxMembers - pool.activeMembers;

  return (
    <Link
      href={`/pools/${pool.address}`}
      className="block w-full lg:w-[31%] md:w-[48%]"
    >
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Flower Header */}
        <div
          className={`bg-gradient-to-br ${flower.gradient} p-6 text-center relative`}
        >
          <span className="text-5xl">{flower.emoji}</span>
          <p className={`text-xs mt-2 font-medium ${flower.accentColor}`}>
            {flower.name}
          </p>
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium ${stateColor}`}
          >
            {stateLabel}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-bold text-[#252B36]">
              {formatUnits(pool.targetAmount, 6)}{" "}
              <span className="text-xs font-normal text-gray-500">target</span>
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${flower.bgColor} ${flower.accentColor}`}
            >
              {freq}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {formatUnits(perCycle, 6)} per {unit} &middot; {pool.totalCycles}{" "}
            {unit}s
          </p>

          {/* Members bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>
                {pool.activeMembers} / {pool.maxMembers} members
              </span>
              <span>
                {slotsLeft} {slotsLeft === 1 ? "slot" : "slots"} left
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#FFC000] h-1.5 rounded-full transition-all"
                style={{
                  width: `${pool.maxMembers > 0 ? (pool.activeMembers / pool.maxMembers) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-gray-500 pt-1">
            <span>
              Cycle {pool.currentCycle} / {pool.totalCycles}
            </span>
            <span>
              {pool.winnersCount}{" "}
              {pool.winnersCount === 1 ? "winner" : "winners"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Pools() {
  const { pools, hasPools, poolCount, isLoading, error } = useGetAllPools();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(poolCount / POOLS_PER_PAGE);

  const paginatedPools = useMemo(() => {
    const start = (currentPage - 1) * POOLS_PER_PAGE;
    return pools.slice(start, start + POOLS_PER_PAGE);
  }, [pools, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading pools: {error.message}
      </div>
    );
  }

  if (!hasPools) {
    return (
      <div className="min-h-screen bg-white">
        <main>
          <div className="mb-5 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#252B36] mb-1">
              Bloom
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-700">
              Everything here grows. Find your place.
            </p>
          </div>
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">&#x1F331;</span>
            <p className="text-gray-500 font-medium">No pools yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to plant a seed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main>
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#252B36] mb-1">
            Bloom
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-700">
            Everything here grows. Find your place.
          </p>
        </div>

        {/* Pool grid */}
        <div className="flex justify-between items-start flex-wrap gap-4 lg:flex-row md:flex-row">
          {paginatedPools.map((pool) => (
            <PoolCard key={pool.address} pool={pool} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-[#252B36] rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
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
                    className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
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
              className="px-4 py-2 bg-white border border-gray-300 text-[#252B36] rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        <p className="text-center text-[10px] text-gray-400 mt-4">
          Showing {(currentPage - 1) * POOLS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * POOLS_PER_PAGE, poolCount)} of {poolCount}{" "}
          pools
        </p>
      </main>
    </div>
  );
}