import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export function useVerificationStatus() {
  const { address, isConnected } = useAccount();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!address || !isConnected) {
        setIsVerified(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Check if user has been verified by querying your backend
        const response = await fetch(`/api/verification-status?address=${address}`);
        const data = await response.json();
        
        setIsVerified(data.isVerified || false);
      } catch (error) {
        console.error('Failed to check verification status:', error);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [address, isConnected]);

  return {
    isVerified,
    isLoading,
    address,
  };
}