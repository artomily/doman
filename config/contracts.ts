/**
 * Smart Contract Configuration
 *
 * Placeholder ABI and addresses for the Wallo on-chain report contract.
 * Replace CONTRACT_ADDRESSES with real deployed addresses before going live.
 */

import { base, baseSepolia } from 'wagmi/chains';

/**
 * submitReport(bytes32 reasonHash, bool isScam) → bool
 */
export const WALLO_CONTRACT_ABI = [
  {
    name: 'submitReport',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'reasonHash', type: 'bytes32' },
      { name: 'isScam', type: 'bool' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
] as const;

/**
 * Contract addresses keyed by chainId.
 * Leave as empty string until the contract is deployed.
 */
export const CONTRACT_ADDRESSES: Record<number, `0x${string}` | ''> = {
  [base.id]: '',       // TODO: replace with Base Mainnet address after deployment
  [baseSepolia.id]: '', // TODO: replace with Base Sepolia address after deployment
};

/** Chain IDs that Wallo supports */
export const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
