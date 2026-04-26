/**
 * Smart Contract Configuration — ScamReporter
 *
 * ABI sourced from ScamReporter.json (Solidity 0.8.24, deployed on Base).
 * Replace CONTRACT_ADDRESSES with real deployed addresses.
 */

import { base, baseSepolia } from 'wagmi/chains';

/**
 * ABI from ScamReporter.sol
 * - submitVote(uint8, bytes32, bytes32, bool) — target-scoped vote
 * - hasVoted(bytes32, address) — anti-double-vote query
 * - addressToTargetId(address) — canonical address target hash helper
 */
export const DOMAN_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'addressToTargetId',
    inputs: [{ name: 'target', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'hasVoted',
    inputs: [
      { name: 'targetId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'reporterAddr', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
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
    type: 'function',
    name: 'submitVote',
    inputs: [
      { name: 'targetType', type: 'uint8', internalType: 'uint8' },
      { name: 'targetId', type: 'bytes32', internalType: 'bytes32' },
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
    type: 'event',
    name: 'ScamVoteSubmitted',
    inputs: [
      { name: 'reporter', type: 'address', indexed: true, internalType: 'address' },
      { name: 'targetId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'targetType', type: 'uint8', indexed: false, internalType: 'uint8' },
      { name: 'reasonHash', type: 'bytes32', indexed: false, internalType: 'bytes32' },
      { name: 'isScam', type: 'bool', indexed: false, internalType: 'bool' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyVoted',
    inputs: [
      { name: 'targetId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'reporter', type: 'address', internalType: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'EmptyReasonHash',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyTargetId',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTargetType',
    inputs: [],
  },
] as const;

/**
 * Contract addresses keyed by chainId.
 * Configure via environment variables:
 * - NEXT_PUBLIC_SCAM_REPORTER_BASE_ADDRESS
 * - NEXT_PUBLIC_SCAM_REPORTER_BASE_SEPOLIA_ADDRESS
 */
export const CONTRACT_ADDRESSES: Record<number, `0x${string}` | ''> = {
  [base.id]:
    (process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_ADDRESS as `0x${string}` | undefined) ?? '',
  [baseSepolia.id]:
    (process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_SEPOLIA_ADDRESS as `0x${string}` | undefined) ?? '',
};

/** Chain IDs that Doman supports */
export const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
