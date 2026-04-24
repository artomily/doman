/**
 * Smart Contract Configuration — ScamReporter
 *
 * ABI sourced from ScamReporter.json (Solidity 0.8.24, deployed on Base).
 * Replace CONTRACT_ADDRESSES with real deployed addresses.
 */

import { base, baseSepolia } from 'wagmi/chains';

/**
 * ABI from ScamReporter.sol
 * - submitReport(bytes32, bool) — void, emits ScamReportSubmitted
 * - ScamReportSubmitted event — reporter + reasonHash indexed
 * - EmptyReasonHash error — reverts when hash is bytes32(0)
 */
export const WALLO_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'submitReport',
    inputs: [
      { name: 'reasonHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'isScam', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ScamReportSubmitted',
    inputs: [
      { name: 'reporter', type: 'address', indexed: true, internalType: 'address' },
      { name: 'reasonHash', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'isScam', type: 'bool', indexed: false, internalType: 'bool' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'EmptyReasonHash',
    inputs: [],
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
