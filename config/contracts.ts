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

/** 
 * WHITELIST OF TRUSTED CONTRACTS (Phase 1)
 * 
 * ⚠️  TEMPORARY SOLUTION - See docs/VERIFICATION_STRATEGY.md for long-term roadmap
 * 
 * These contracts bypass full bytecode scanning:
 * - Doman's own contracts (ScamReporter)
 * - Popular/verified protocols (Uniswap, Aave, etc)
 * - Marked as LEGIT/LOW risk in database
 * 
 * MAINTENANCE INSTRUCTIONS:
 * 1. Only add contracts from Etherscan-verified sources
 * 2. Verify source code matches bytecode on explorer
 * 3. Check TVL, deployment date, audit history
 * 4. Document reason + link in comment (see format below)
 * 
 * TEMPLATE FOR NEW ENTRIES:
 * // {NAME} - {CHAIN} - TVL: {TVL}
 * // Verified: {ETHERSCAN_LINK}
 * // Audit: {AUDIT_LINK_OR_NONE}
 * '0x...',
 * 
 * Last updated: 2026-04-28
 * Maintenance Schedule: Monthly review recommended
 */
export const WHITELISTED_CONTRACTS: `0x${string}`[] = [
  // === DOMAN INFRASTRUCTURE ===
  // ScamReporter contract (add when deployed)
  ...(process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_ADDRESS ? [process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_ADDRESS as `0x${string}`] : []),
  ...(process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_SEPOLIA_ADDRESS ? [process.env.NEXT_PUBLIC_SCAM_REPORTER_BASE_SEPOLIA_ADDRESS as `0x${string}`] : []),

  // === POPULAR DEX & ROUTERS ===
  // Uniswap V3 Router - Ethereum
  // TVL: $8B+ | Verified: https://etherscan.io/address/0xe592427a0aece92de3edee1f18e0157c05861564
  '0xe592427a0aece92de3edee1f18e0157c05861564',
  
  // Uniswap V2 Router - Ethereum
  // TVL: $2B+ | Verified: https://etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  
  // Curve Finance - Ethereum
  // TVL: $10B+ | Verified on Etherscan
  '0xd61ff287fcc231d8f8a5d3f0dae2c016ae10344b',
  '0x865377367054516e404d7965f0e44ec32d910df9',

  // === LENDING PROTOCOLS ===
  // Aave Pool - Ethereum
  // TVL: $15B+ | Verified: https://etherscan.io/address/0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9
  // Audit: Multiple audits (Trail of Bits, OpenZeppelin)
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
  
  // Compound III (cUSDCv3) - Ethereum
  // TVL: $3B+ | Verified on Etherscan
  // Audit: OpenZeppelin audit
  '0xc3d688b66703497daa19211eedff47f25384cdc3d',

  // === STAKING & GOVERNANCE ===
  // Lido (stETH) - Ethereum
  // TVL: $30B+, Most used liquid staking | Verified on Etherscan
  // Audit: Multiple professional audits
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  
  // OpenZeppelin Proxy - Common upgrade beacon
  // Pattern used across major protocols
  '0x1967f0683d361dBcf5Dd14E10Fb82D50B937Fc02',

  // === BRIDGE & CROSS-CHAIN ===
  // LayerZero Endpoint - Multi-chain infrastructure
  // TVL: $2B+ | Verified on Etherscan
  '0x66a71dcef29a0ffbdbe3c6a460a3b5618545cffb',
];

/** Chain IDs that Doman supports */
export const SUPPORTED_CHAIN_IDS = [base.id, baseSepolia.id] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
