'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, ShieldCheck, Gift, Lock, X } from 'lucide-react';
import {
  IDKitRequestWidget,
  orbLegacy,
  ResponseItemV3,
  ResponseItemV4,
  type RpContext,
} from '@worldcoin/idkit';
import { toast } from 'sonner';

export function AutoVerifyModal() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID! as `app_${string}`;
  const rpId = process.env.NEXT_PUBLIC_RP_ID!;
  const action = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION || 'verify-for-ubi';

  useEffect(() => {
    const checkAndTriggerVerification = async () => {
      if (!isConnected || !address || hasChecked) return;

      try {
        // Check if user is already verified
        const response = await fetch(`/api/verification-status?address=${address}`);
        const data = await response.json();

        if (!data.isVerified) {
          // User not verified - show modal
          setShowModal(true);
          setHasChecked(true);
        } else {
          setHasChecked(true);
        }
      } catch (error) {
        console.error('Failed to check verification:', error);
        setHasChecked(true);
      }
    };

    checkAndTriggerVerification();
  }, [isConnected, address, hasChecked]);

  const onVerify = async () => {
    setIsVerifying(true);

    try {
      // Fetch RP signature from backend
      const rpSig = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      }).then((r) => r.json());

      const rp_context: RpContext = {
        rp_id: rpId,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        signature: rpSig.sig,
      };

      setRpContext(rp_context);
      setOpen(true);
    } catch (err) {
      console.error('Failed to fetch RP signature:', err);
      toast.error('Failed to initialize verification');
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#252B36] mb-2">
                Verify Your Identity
              </h3>
              <p className="text-sm text-gray-600">
                You must verify your identity with World ID before joining any savings pool
              </p>
            </div>

            {/* Benefits */}
            <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">Claim 100 UBI tokens monthly</p>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">One verification per person</p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">Required to join any pool</p>
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="w-full py-3 bg-[#FFC000] text-[#252B36] rounded-lg font-bold hover:bg-[#FFD14D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Verify Now & Get UBI
                </>
              )}
            </button>

            {rpContext && (
              <IDKitRequestWidget
                open={open}
                onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (!isOpen) setIsVerifying(false);
                }}
                app_id={appId}
                action={action}
                rp_context={rpContext}
                allow_legacy_proofs={true}
                preset={orbLegacy({ signal: address })}
                onSuccess={async (result) => {
                  try {
                    // Verify proof on backend
                    const verification = await fetch('/api/verify-proof', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ rp_id: rpId, idkitResponse: result }),
                    }).then((r) => r.json());

                    if (verification.success || verification.verified) {
                      await fetch('/api/store-verification', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ 
                          address, 
                          nullifier: 'nullifier' in result.responses[0] ? (result.responses[0] as ResponseItemV3 | ResponseItemV4).nullifier : undefined,
                          verified: true 
                        }),
                      });

                      toast.success('🎉 Verification successful! UBI tokens minted!');
                      setShowModal(false);
                      
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    } else {
                      toast.error('Verification failed. Please try again.');
                    }

                    setIsVerifying(false);
                  } catch (err) {
                    console.error('Verification error:', err);
                    toast.error('Failed to verify proof');
                    setIsVerifying(false);
                  }
                }}
                onError={(errorCode) => {
                  console.error('IDKit error:', errorCode);
                  toast.error(`Verification error: ${errorCode}`);
                  setIsVerifying(false);
                }}
              />
            )}

            {/* Info */}
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                💡 You'll need the <strong>World App</strong> to complete verification. Download it from your app store.
              </p>
            </div>

            {/* Skip button (optional) */}
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now (you won't be able to join pools)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}