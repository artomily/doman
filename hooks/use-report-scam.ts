'use client';

import { useState, useCallback } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { hashReasonData, type ReasonData } from '@/lib/hash';
import {
  WALLO_CONTRACT_ABI,
  CONTRACT_ADDRESSES,
  SUPPORTED_CHAIN_IDS,
} from '@/config/contracts';

export type ReportStep = 'idle' | 'saving' | 'wallet' | 'confirming' | 'success' | 'error';

export interface UseReportScamReturn {
  step: ReportStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  isLoading: boolean;
  submit: (params: {
    targetAddress: string;
    reasonData: ReasonData;
    reporterAddress: string;
    chainId: number;
  }) => Promise<void>;
  reset: () => void;
}

export function useReportScam(): UseReportScamReturn {
  const [step, setStep] = useState<ReportStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Mirror on-chain confirmation in our step machine
  const resolvedStep: ReportStep =
    step === 'confirming' && isConfirmed ? 'success'
    : step === 'confirming' && isConfirming ? 'confirming'
    : step;

  const submit = useCallback(
    async ({
      targetAddress,
      reasonData,
      reporterAddress,
      chainId,
    }: {
      targetAddress: string;
      reasonData: ReasonData;
      reporterAddress: string;
      chainId: number;
    }) => {
      setError(null);

      // Validate chain support
      if (!(SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId)) {
        setError('Please switch to Base or Base Sepolia.');
        setStep('error');
        return;
      }

      const contractAddress = CONTRACT_ADDRESSES[chainId];
      if (!contractAddress) {
        setError('Contract not yet deployed on this network. Try Base Sepolia.');
        setStep('error');
        return;
      }

      try {
        // 1. Hash reason data deterministically
        const reasonHash = hashReasonData(reasonData);

        // Build a human-readable reason string for the legacy `reason` field
        const reasonText = [
          ...reasonData.selectedReasons,
          reasonData.customText ? `Custom: ${reasonData.customText}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        // 2. Save off-chain first (before touching wallet)
        setStep('saving');
        const res = await fetch('/api/v1/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: targetAddress,
            reason: reasonText,
            category: 'OTHER',
            reporterAddress,
            reasonHash,
            reasonData: {
              selectedReasons: [...reasonData.selectedReasons].sort(),
              customText: reasonData.customText,
            },
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error?.message ?? 'Failed to save report. Please try again.');
        }

        // 3. Trigger wallet
        setStep('wallet');
        const hash = await writeContractAsync({
          address: contractAddress as `0x${string}`,
          abi: WALLO_CONTRACT_ABI,
          functionName: 'submitReport',
          args: [reasonHash, true],
          chainId,
        });

        setPendingTxHash(hash);
        setStep('confirming');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message.includes('User rejected') || err.message.includes('user rejected')
              ? 'Transaction cancelled.'
              : err.message
            : 'An unexpected error occurred.';
        setError(message);
        setStep('error');
      }
    },
    [writeContractAsync]
  );

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPendingTxHash(undefined);
  }, []);

  return {
    step: resolvedStep,
    txHash: pendingTxHash,
    error,
    isLoading: resolvedStep === 'saving' || resolvedStep === 'wallet' || resolvedStep === 'confirming',
    submit,
    reset,
  };
}
