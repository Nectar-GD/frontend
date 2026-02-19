"use client";

import React, { useState, useEffect } from "react";
import usePinataUpload from "@/hooks/usePinataUpload";
import { ImagePlus } from "lucide-react";
import LoadingSpinner from "@/components/Loaders/LoadingSpinner";
import tokenList from "@/constant/tokenList.json";
import { useCreateGroup, SavingsGroupFormData } from "@/hooks/useCreateGroup";
import { toast } from "sonner";

const Create = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const { uploadToPinata, isUploading } = usePinataUpload();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minDeposit: "",
    maxDeposit: "",
    duration: "",
    startTime: "",
    winnersCount: "",
    minMembers: "",
    maxMembers: "",
    totalDepositGoal: "",
    totalexpectedDepositPerUser: "",
  });

  const [selectedToken, setSelectedToken] = useState("");
  const [selectedYieldAdapterAddress, setSelectedYieldAdapterAddress] =
    useState("");

  const token = Object.values(tokenList);
  const currentToken = selectedToken
    ? tokenList[selectedToken as keyof typeof tokenList]
    : null;

  const { createGroup, isConfirming, isSuccess, isWriting } = useCreateGroup();

 
  useEffect(() => {
    if (isSuccess) {
      setFormData({
        name: "",
        description: "",
        minDeposit: "",
        maxDeposit: "",
        duration: "",
        startTime: "",
        winnersCount: "",
        minMembers: "",
        maxMembers: "",
        totalDepositGoal: "",
        totalexpectedDepositPerUser: "",
      });
      setSelectedToken("");
      setSelectedYieldAdapterAddress("");
      setImageUrl("");
    }
  }, [isSuccess]);

  const convertIpfsUrl = (url: any) =>
    url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
      : url;

  const changeHandler = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 1) {
        setError("File size exceeds 1MB. Please choose a smaller file.");
      } else {
        setError("");
        try {
          const uploadedUrl = await uploadToPinata(file);
          setImageUrl(uploadedUrl);
        } catch (error) {
          console.error("File upload failed:", error);
        }
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }
    if (!selectedToken) {
      toast.error("Please select a token");
      return;
    }
    if (!selectedYieldAdapterAddress) {
      toast.error("Please select a yield adapter");
      return;
    }
    if (!formData.minDeposit || !formData.maxDeposit) {
      toast.error("Please enter min and max deposit amounts");
      return;
    }
    if (!formData.startTime) {
      toast.error("Please select a start time");
      return;
    }

    const groupData: SavingsGroupFormData = {
      name: formData.name,
      yieldAdapter: selectedYieldAdapterAddress as `0x${string}`,
      token: selectedToken as `0x${string}`,
      startTime: new Date(formData.startTime),
      duration: Number(formData.duration),
      winnersCount: Number(formData.winnersCount),
      minDeposit: formData.minDeposit,
      maxDeposit: formData.maxDeposit,
      minMembers: Number(formData.minMembers),
      maxMembers: Number(formData.maxMembers),
      totalexpectedDepositPerUser: formData.totalexpectedDepositPerUser,
      totalDepositGoal: formData.totalDepositGoal,
      imageUri: imageUrl,
      additionalInfo: formData.description,
    };

    createGroup(groupData, currentToken?.decimals || 6);
  };

   const isLoading = isWriting || isConfirming;

  return (
    <main className="">
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[32px] font-bold text-[#252B36] mb-1">
          Create
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-700">
          Everything here grows. Find your place.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-[80%] md:w-[80%] mx-auto my-8"
      >
        <div className="w-full my-8">
          <div className="flex justify-between lg:flex-row md:flex-row flex-col">
            <div className="w-full lg:w-[25%] md:w-[25%]">
              <label>Select an Image (Image URL (Below 1mb))</label>
              <div className="mb-4 w-full">
                {isUploading ? (
                  <div className="w-full mx-auto h-25 flex items-center justify-center rounded-lg border border-black/20">
                    <LoadingSpinner />
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full mx-auto h-25 border border-black/20 rounded-md overflow-hidden group">
                    <img
                      src={convertIpfsUrl(imageUrl)}
                      alt="Uploaded"
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                      className="absolute bottom-2 right-2 bg-black/80 p-2 rounded-full hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                      title="Change image"
                    >
                      <ImagePlus size={20} />
                    </button>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={changeHandler}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full mx-auto h-[100px] flex items-center justify-center rounded-lg border border-black/20 cursor-pointer hover:border-white/40 transition"
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                  >
                    <ImagePlus size={64} className="text-black/60" />
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={changeHandler}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {error}
                  </p>
                )}

                {imageUrl && (
                  <input
                    type="text"
                    value={imageUrl}
                    readOnly
                    className="mt-4 hidden border border-white/20 w-full rounded-md p-3 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between w-full lg:w-[66%] md:w-[66%] flex-wrap lg:flex-row md:flex-row flex-col">
              <div className="mb-4 w-full lg:w-[48%] md:w-[48%]">
                <label className="text-[14px] font-medium">Group name:</label>
                <input
                  type="text"
                  placeholder="Enter a name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
                />
              </div>
              <div className="mb-4 w-full lg:w-[48%] md:w-[48%]">
                <label className="text-[14px] font-medium">Description:</label>
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
                />
              </div>
              <div className="mb-4 w-full lg:w-[48%] md:w-[48%]">
                <label className="text-[14px] font-medium">Min amount:</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter a min amount users can pay"
                  value={formData.minDeposit}
                  onChange={(e) =>
                    handleInputChange("minDeposit", e.target.value)
                  }
                  className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
                />
              </div>
              <div className="mb-4 w-full lg:w-[48%] md:w-[48%]">
                <label className="text-[14px] font-medium">Max amount:</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter a max amount users can pay"
                  value={formData.maxDeposit}
                  onChange={(e) =>
                    handleInputChange("maxDeposit", e.target.value)
                  }
                  className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full flex-wrap lg:flex-row md:flex-row flex-col">
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Duration (days)</label>
              <input
                type="number"
                placeholder="Duration in days"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-[500]">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Winners count:</label>
              <input
                type="number"
                placeholder="Enter winners count"
                value={formData.winnersCount}
                onChange={(e) =>
                  handleInputChange("winnersCount", e.target.value)
                }
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Token:</label>
              <select
                value={selectedToken}
                onChange={(e) => {
                  setSelectedToken(e.target.value);
                  const token =
                    tokenList[e.target.value as keyof typeof tokenList];
                  if (token) setSelectedYieldAdapterAddress(token.yieldadapter);
                }}
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg bg-transparent"
              >
                <option value="">Select a token</option>
                {token.map((info) => (
                  <option key={info.address} value={info.address}>
                    {info.name} ({info.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Yield Adapter:</label>
              <select
                value={selectedYieldAdapterAddress}
                onChange={(e) => setSelectedYieldAdapterAddress(e.target.value)}
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg bg-transparent"
              >
                <option value="">Select a yield adapter</option>
                {token.map((info) => (
                  <option key={info.yieldadapter} value={info.yieldadapter}>
                    {info["yieldAdapter name"]}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Min Member:</label>
              <input
                type="number"
                placeholder="Enter min for members"
                value={formData.minMembers}
                onChange={(e) =>
                  handleInputChange("minMembers", e.target.value)
                }
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">Max Member:</label>
              <input
                type="number"
                placeholder="Enter max for members"
                value={formData.maxMembers}
                onChange={(e) =>
                  handleInputChange("maxMembers", e.target.value)
                }
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">
                Target Deposit Goal:
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter target amount"
                value={formData.totalDepositGoal}
                onChange={(e) =>
                  handleInputChange("totalDepositGoal", e.target.value)
                }
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
            <div className="mb-4 w-full lg:w-[32%] md:w-[32%]">
              <label className="text-[14px] font-medium">
                Amount per user:
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter an amount for users"
                value={formData.totalexpectedDepositPerUser}
                onChange={(e) =>
                  handleInputChange(
                    "totalexpectedDepositPerUser",
                    e.target.value,
                  )
                }
                className="p-3 border border-[#252B36]/30 block w-full text-xs rounded-lg"
              />
            </div>
          </div>

          <div className="w-full lg:w-[40%] md:w-[40%] mx-auto lg:mt-8 md:mt-6 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#FFC000] text-[#252B36] px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg font-medium text-sm lg:text-base hover:bg-[#2D3441] hover:text-white transition-colors duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : "Create"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Create;