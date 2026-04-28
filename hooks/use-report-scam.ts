'use client';

import { useState, useCallback } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
} from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { hashReasonData, type ReasonData } from '@/lib/hash';
import {
  DOMAN_CONTRACT_ABI,
  CONTRACT_ADDRESSES,
  SUPPORTED_CHAIN_IDS,
} from '@/config/contracts';
import { wagmiConfig } from '@/lib/wagmi';
import artifact from '@/ScamReporter.json';
import { isAddress, keccak256, pad, toBytes } from 'viem';
import { base } from 'wagmi/chains';

export type ReportStep =
  | 'idle'
  | 'saving'
  | 'deploying'
  | 'deploy-confirming'
  | 'wallet'
  | 'confirming'
  | 'success'
  | 'error';

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

/** Read cached contract address from localStorage (set after first deploy). */
function getCachedAddress(chainId: number): `0x${string}` | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(`wallo:contract:${chainId}`);
  return v ? (v as `0x${string}`) : null;
}

function getTargetTypeAndId(target: string): { targetType: number; targetId: `0x${string}` } {
  const normalized = target.trim();

  if (isAddress(normalized)) {
    return {
      targetType: 0,
      targetId: pad(normalized.toLowerCase() as `0x${string}`, { size: 32 }),
    };
  }

  const normalizedText = normalized.toLowerCase();
  const targetType = normalizedText.endsWith('.eth') ? 1 : 2;
  return {
    targetType,
    targetId: keccak256(toBytes(normalizedText)),
  };
}

export function useReportScam(): UseReportScamReturn {
  const [step, setStep] = useState<ReportStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { deployContractAsync } = useDeployContract();
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  // Mirror on-chain confirmation in our step machine
  const resolvedStep: ReportStep =
    step === 'confirming' && isConfirmed ? 'success'
    : step === 'confirming' && isConfirming ? 'confirming'
    : step === 'success' ? 'success'
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

      // Determine whether on-chain submission is possible
      const isChainSupported = (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);
      const existingAddress: `0x${string}` | '' =
        CONTRACT_ADDRESSES[chainId] || getCachedAddress(chainId) || '';

      try {
        // 1. Hash reason data deterministically
        const reasonHash = hashReasonData(reasonData);
        const { targetType, targetId } = getTargetTypeAndId(targetAddress);

        // Build a human-readable reason string for the `reason` field
        const reasonText = [
          ...reasonData.selectedReasons,
          reasonData.customText ? `Custom: ${reasonData.customText}` : '',
        ]
          .filter(Boolean)
          .join(', ') || 'Reported as scam';

        // 2. Save off-chain first — always succeeds regardless of wallet/chain
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

        // 3. On-chain step — only if chain is supported
        if (!isChainSupported) {
          // Off-chain report saved; skip on-chain
          setStep('success');
          return;
        }

        // Resolve contract address (config → localStorage cache → deploy)
        let contractAddress: `0x${string}` | '' = existingAddress;

        if (!contractAddress) {
          if (chainId === base.id) {
            throw new Error('Kontrak belum di-deploy ke Base mainnet. Silakan switch ke Base Sepolia (testnet) untuk mencoba.');
          }

          // Deploy the contract — user approves in wallet
          setStep('deploying');
          const deployTxHash = await deployContractAsync({
            abi: artifact.abi,
            bytecode: artifact.bytecode.object as `0x${string}`,
            args: [],
          });

          setStep('deploy-confirming');
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: deployTxHash,
            confirmations: 1,
          });

          if (!receipt.contractAddress) {
            throw new Error('Contract deployment failed — no address in receipt.');
          }

          contractAddress = receipt.contractAddress;
          if (typeof window !== 'undefined') {
            localStorage.setItem(`wallo:contract:${chainId}`, contractAddress);
          }
        }

        // 4. Trigger wallet for on-chain submission
        setStep('wallet');
        const hash = await writeContractAsync({
          address: contractAddress as `0x${string}`,
          abi: DOMAN_CONTRACT_ABI,
          functionName: 'submitVote',
          args: [targetType, targetId, reasonHash, true],
          chainId,
        });

        setPendingTxHash(hash);
        setStep('confirming');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message.includes('User rejected') || err.message.includes('user rejected')
              ? 'Transaction cancelled.'
              : err.message.includes('AlreadyVoted')
                ? 'You have already voted for this target on-chain.'
              : err.message
            : 'An unexpected error occurred.';
        setError(message);
        setStep('error');
      }
    },
    [writeContractAsync, deployContractAsync]
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
    isLoading:
      resolvedStep === 'saving' ||
      resolvedStep === 'deploying' ||
      resolvedStep === 'deploy-confirming' ||
      resolvedStep === 'wallet' ||
      resolvedStep === 'confirming',
    submit,
    reset,
  };
}
