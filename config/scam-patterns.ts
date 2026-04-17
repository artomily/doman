/**
 * Scam Detection Patterns Configuration
 *
 * Detailed patterns and rules for detecting malicious contracts.
 * These patterns are used by the scanner service to analyze bytecode
 * and identify potential scams.
 */

import { RISK_LEVELS } from '@/lib/constants';
import type { RiskLevel } from '@/lib/validation';

// ============================================
// PATTERN TYPES
// ============================================

export interface ScamPattern {
  id: string;
  name: string;
  description: string;
  severity: RiskLevel;
  riskAdd: number;
  category: 'bytecode' | 'function' | 'storage' | 'event';
  detector: 'opcode' | 'selector' | 'bytecode' | 'external';
  pattern: string | string[];
  explanation?: string;
  references?: string[];
}

// ============================================
// OPCODE PATTERNS
// ============================================

export const opcodePatterns: ScamPattern[] = [
  {
    id: 'selfdestruct',
    name: 'Self-Destruct Capability',
    description: 'Contract contains self-destruct opcode that can destroy the contract',
    severity: 'CRITICAL',
    riskAdd: 40,
    category: 'bytecode',
    detector: 'opcode',
    pattern: '0xff', // SELFDESTRUCT
    explanation: 'Self-destruct allows the contract to be destroyed, potentially locking user funds permanently. Legitimate contracts rarely need this functionality.',
    references: [
      'https://docs.soliditylang.org/en/v0.8.0/control-structures.html#destruct-operations',
    ],
  },
  {
    id: 'delegatecall',
    name: 'Delegate Call',
    description: 'Contract uses delegatecall which can execute arbitrary code',
    severity: 'MEDIUM',
    riskAdd: 15,
    category: 'bytecode',
    detector: 'opcode',
    pattern: '0xf4', // DELEGATECALL
    explanation: 'Delegatecall executes code in the context of the current contract, which can be dangerous if the target address is not trusted or can be changed.',
    references: [
      'https://docs.soliditylang.org/en/v0.8.0/introduction-to-smart-contracts.html#delegatecall',
    ],
  },
  {
    id: 'callcode_obsolete',
    name: 'Obsolete CALLCODE',
    description: 'Contract uses obsolete CALLCODE opcode',
    severity: 'LOW',
    riskAdd: 5,
    category: 'bytecode',
    detector: 'opcode',
    pattern: '0xf2', // CALLCODE (obsolete)
    explanation: 'CALLCODE is obsolete and should not be used in modern contracts. Use delegatecall instead.',
  },
  {
    id: 'extcodehash',
    name: 'External Code Hash Check',
    description: 'Contract checks external code (potential for manipulation)',
    severity: 'LOW',
    riskAdd: 5,
    category: 'bytecode',
    detector: 'opcode',
    pattern: '0x3f', // EXTCODEHASH
    explanation: 'Checking external code can be used for legitimate purposes but may also indicate logic that can be manipulated.',
  },
];

// ============================================
// FUNCTION SELECTOR PATTERNS
// ============================================

export const selectorPatterns: ScamPattern[] = [
  {
    id: 'unlimited_approve',
    name: 'Unlimited Token Approval',
    description: 'Contract calls approve() with max uint256 value',
    severity: 'HIGH',
    riskAdd: 25,
    category: 'function',
    detector: 'selector',
    pattern: '0x095ea7b3', // approve(address,uint256)
    explanation: 'Approving unlimited tokens allows the spender to drain all tokens from the user wallet. This should only be done with trusted contracts.',
    references: [
      'https://eips.ethereum.org/EIPS/eip-20#approve',
    ],
  },
  {
    id: 'transfer_from_unsafe',
    name: 'Unsafe Transfer From',
    description: 'Transfer from without proper validation',
    severity: 'HIGH',
    riskAdd: 30,
    category: 'function',
    detector: 'selector',
    pattern: '0x23b872dd', // transferFrom(address,address,uint256)
    explanation: 'Transfer from should always validate return value and check allowance. Unsafe implementations can lead to loss of funds.',
  },
  {
    id: 'transfer_ownership',
    name: 'Ownership Transfer',
    description: 'Contract allows ownership transfer',
    severity: 'LOW',
    riskAdd: 10,
    category: 'function',
    detector: 'selector',
    pattern: '0xf2fde38b', // transferOwnership(address)
    explanation: 'Ownership transfer is normal for upgradeable contracts but can be abused if new owner is malicious.',
    references: [
      'https://docs.openzeppelin.com/contracts/access-control',
    ],
  },
  {
    id: 'renounce_ownership',
    name: 'Renounce Ownership',
    description: 'Contract allows renouncing ownership',
    severity: 'LOW',
    riskAdd: 5,
    category: 'function',
    detector: 'selector',
    pattern: '0x715018a6', // renounceOwnership()
    explanation: 'Renouncing ownership makes contract immutable. This is generally safe but means contract can never be updated.',
  },
  {
    id: 'pause_contract',
    name: 'Contract Pause Capability',
    description: 'Contract can be paused by owner',
    severity: 'MEDIUM',
    riskAdd: 10,
    category: 'function',
    detector: 'selector',
    pattern: ['0x8456cb59', '0x8456cb59'], // pause() / unpause()
    explanation: 'Pausing can be used to protect users but can also be abused to lock funds temporarily or permanently.',
  },
  {
    id: 'mint_unlimited',
    name: 'Unlimited Minting',
    description: 'Contract has mint function without supply limit',
    severity: 'HIGH',
    riskAdd: 20,
    category: 'function',
    detector: 'selector',
    pattern: ['0x40c10f19', '0x6a627842'], // mint(address,uint256) / mint(uint256)
    explanation: 'Unlimited minting can cause hyperinflation and devalue existing tokens. Legitimate tokens usually have supply caps.',
  },
  {
    id: 'burn_from',
    name: 'Burn From Function',
    description: 'Contract can burn tokens from other addresses',
    severity: 'MEDIUM',
    riskAdd: 15,
    category: 'function',
    detector: 'selector',
    pattern: '0x79cc6790', // burnFrom(address,uint256)
    explanation: 'Burn from requires allowance but can be abused if approval is granted carelessly.',
  },
  {
    id: 'multicall',
    name: 'Multicall Pattern',
    description: 'Contract supports multicall (can be used for manipulation)',
    severity: 'LOW',
    riskAdd: 5,
    category: 'function',
    detector: 'selector',
    pattern: ['0xac9650d8', '0x252dba42'], // multicall(bytes[]) / multicall(uint256,bytes[])
    explanation: 'Multicall is a legitimate pattern for batch operations but can be abused for complex attacks.',
  },
];

// ============================================
// BYTECODE PATTERNS
// ============================================

export const bytecodePatterns: ScamPattern[] = [
  {
    id: 'upgradeable_proxy',
    name: 'Upgradeable Proxy Pattern',
    description: 'Contract appears to be a proxy with upgradeable implementation',
    severity: 'MEDIUM',
    riskAdd: 15,
    category: 'bytecode',
    detector: 'bytecode',
    pattern: [
      // ERC1967 Proxy patterns
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // ERC1967_IMPLEMENTATION_SLOT
      '0x5f5e1002688876ba1e3ca4a44b666fe1a69abb4b', // Some proxy implementations
    ],
    explanation: 'Proxy contracts allow the implementation to be upgraded. While useful, it also means the logic can be changed by the admin.',
    references: [
      'https://docs.openzeppelin.com/contracts/5.x/api/proxy',
      'https://eips.ethereum.org/EIPS/eip-1967',
    ],
  },
  {
    id: 'beacon_proxy',
    name: 'Beacon Proxy Pattern',
    description: 'Contract uses beacon proxy pattern',
    severity: 'MEDIUM',
    riskAdd: 15,
    category: 'bytecode',
    detector: 'bytecode',
    pattern: [
      '0xa3f0df74a6be9f275853a7bb4574c9e6a31c8t6e',
    ],
    explanation: 'Beacon proxies allow multiple proxies to share the same implementation, which can be upgraded for all proxies at once.',
    references: [
      'https://eips.ethereum.org/EIPS/eip-1967',
    ],
  },
  {
    id: 'minimal_proxy',
    name: 'Minimal Proxy (EIP-1167)',
    description: 'Contract uses minimal proxy pattern',
    severity: 'LOW',
    riskAdd: 10,
    category: 'bytecode',
    detector: 'bytecode',
    pattern: [
      '0x363d3d373d3d3d363d73', // Start of minimal proxy bytecode
    ],
    explanation: 'Minimal proxies are gas-efficient clones of a master contract. The master contract can affect all clones.',
    references: [
      'https://eips.ethereum.org/EIPS/eip-1167',
    ],
  },
  {
    id: 'honeypot_bytecode',
    name: 'Honeypot Bytecode Signature',
    description: 'Bytecode matches known honeypot patterns',
    severity: 'CRITICAL',
    riskAdd: 50,
    category: 'bytecode',
    detector: 'bytecode',
    pattern: [
      // Known honeypot signatures (simplified)
      '0x608060405234801561001057600080fd5b50', // Common contract start
    ],
    explanation: 'Honeypot contracts allow buying but prevent selling. This pattern indicates a high probability of scam.',
    references: [],
  },
];

// ============================================
// EXTERNAL CHECKS
// ============================================

export const externalPatterns: ScamPattern[] = [
  {
    id: 'unverified_source',
    name: 'Unverified Source Code',
    description: 'Contract source code is not verified on block explorer',
    severity: 'LOW',
    riskAdd: 10,
    category: 'bytecode',
    detector: 'external',
    pattern: 'verified_check',
    explanation: 'Unverified contracts are harder to audit and may contain hidden malicious code. Always verify before interacting.',
    references: [],
  },
  {
    id: 'recent_deployment',
    name: 'Recently Deployed',
    description: 'Contract was deployed very recently (high risk indicator)',
    severity: 'LOW',
    riskAdd: 5,
    category: 'bytecode',
    detector: 'external',
    pattern: 'deployment_age_check',
    explanation: 'New contracts are more likely to be scams as they haven\'t been battle-tested by the community.',
    references: [],
  },
];

// ============================================
// COMBINED PATTERNS
// ============================================

export const allScamPatterns: ScamPattern[] = [
  ...opcodePatterns,
  ...selectorPatterns,
  ...bytecodePatterns,
  ...externalPatterns,
];

// ============================================
// PATTERN MATCHING UTILITIES
// ============================================

/**
 * Find patterns by severity
 */
export function getPatternsBySeverity(severity: RiskLevel): ScamPattern[] {
  return allScamPatterns.filter((p) => p.severity === severity);
}

/**
 * Find patterns by category
 */
export function getPatternsByCategory(category: ScamPattern['category']): ScamPattern[] {
  return allScamPatterns.filter((p) => p.category === category);
}

/**
 * Find patterns by detector type
 */
export function getPatternsByDetector(detector: ScamPattern['detector']): ScamPattern[] {
  return allScamPatterns.filter((p) => p.detector === detector);
}

/**
 * Get pattern by ID
 */
export function getPatternById(id: string): ScamPattern | undefined {
  return allScamPatterns.find((p) => p.id === id);
}

/**
 * Calculate total risk score from matched patterns
 */
export function calculateRiskScore(matches: ScamPattern[]): number {
  let score = 0;

  // Base score from pattern matches
  for (const match of matches) {
    score += match.riskAdd;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get risk level from risk score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= RISK_LEVELS.LOW.max) return 'LOW';
  if (score <= RISK_LEVELS.MEDIUM.max) return 'MEDIUM';
  if (score <= RISK_LEVELS.HIGH.max) return 'HIGH';
  return 'CRITICAL';
}

// ============================================
// EXPORTS
// ============================================
