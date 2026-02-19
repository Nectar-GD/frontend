import { useState } from "react";
import { toast } from "sonner";

const usePinataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadToPinata = async (file:any) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const metadata = JSON.stringify({ name: "Avatar" });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({ cidVersion: 0 });
      formData.append("pinataOptions", options);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT!}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload to Pinata");
      }

      const resData = await res.json();
      const ipfsUrl = `ipfs://${resData.IpfsHash}`;
      toast.success("Upload Successful", { position: "top-center" });

      return ipfsUrl;
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      toast.error("Upload failed", { position: "top-center" });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToPinata, isUploading };
};

export default usePinataUpload;