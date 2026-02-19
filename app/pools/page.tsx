"use client";

import { useGetAllGroups } from "@/hooks/useGetAllGroup";
import LoadingSpinner from "@/components/Loaders/LoadingSpinner";
import PoolCard from '@/components/pools/PoolCard'

export default function Pools() {
  const { groups, hasGroups, groupCount, isLoading, error, refetch } =
    useGetAllGroups();

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
        Error loading groups: {error.message}
      </div>
    );
  }

  if (!hasGroups) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No savings groups found yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#252B36] mb-1">
            Bloom
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-700">
            Everything here grows. Find your place.
          </p>
        </div>

        <div className="flex justify-between items-start flex-wrap gap-4 lg:flex-row md:flex-row">
          {groups.map((info) => (
            <PoolCard
              key={info.group}
              group={info.group}
              name={info.name}
              uri={info.uri}
              totalDepositGoal={info.totalDepositGoal}
              additionalInfo={info.additionalInfo}
              owner={info.owner}
            />
          ))}
        </div>
      </main>
    </div>
  );
}