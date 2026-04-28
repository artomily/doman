/**
 * Application Constants
 *
 * Centralized configuration values used across the application.
 * These constants should be environment-independent.
 */

// ============================================
// APP INFO
// ============================================

export const APP_NAME = 'Doman';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Web3 Scam Detection Platform for Base Chain';

// Security constants — must be set via environment variable
export const CRON_SECRET = process.env.CRON_SECRET;

// ============================================
// RISK SCORE THRESHOLDS
// ============================================

export const RISK_SCORE = {
  SAFE: 20,
  LOW: 40,
  MEDIUM: 60,
  HIGH: 80,
} as const;

export const RISK_LEVELS = {
  LOW: { min: 0, max: RISK_SCORE.LOW },
  MEDIUM: { min: RISK_SCORE.LOW + 1, max: RISK_SCORE.MEDIUM },
  HIGH: { min: RISK_SCORE.MEDIUM + 1, max: RISK_SCORE.HIGH },
  CRITICAL: { min: RISK_SCORE.HIGH + 1, max: 100 },
} as const;

/**
 * Get risk level from risk score
 */
export function getRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score <= RISK_LEVELS.LOW.max) return 'LOW';
  if (score <= RISK_LEVELS.MEDIUM.max) return 'MEDIUM';
  if (score <= RISK_LEVELS.HIGH.max) return 'HIGH';
  return 'CRITICAL';
}

// ============================================
// SCAM DETECTION PATTERNS
// ============================================

export const SCAM_PATTERNS = {
  // Bytecode patterns
  HIDDEN_TRANSFER_FROM: {
    name: 'Hidden Transfer From',
    description: 'Contract contains transferFrom without proper parameter validation',
    severity: 'HIGH' as const,
    riskAdd: 30,
  },
  UNLIMITED_APPROVE: {
    name: 'Unlimited Approval',
    description: 'Contract requests unlimited token approval (max uint256)',
    severity: 'HIGH' as const,
    riskAdd: 25,
  },
  SELF_DESTRUCT: {
    name: 'Self Destruct',
    description: 'Contract can be destroyed, potentially locking user funds',
    severity: 'CRITICAL' as const,
    riskAdd: 40,
  },
  DELEGATE_CALL: {
    name: 'Delegate Call',
    description: 'Contract uses delegatecall which can allow arbitrary code execution',
    severity: 'MEDIUM' as const,
    riskAdd: 15,
  },
  UPGRADEABLE_PROXY: {
    name: 'Upgradeable Proxy',
    description: 'Contract is a proxy, allowing implementation changes by owner',
    severity: 'MEDIUM' as const,
    riskAdd: 15,
  },
  OWNER_CAN_PAUSE: {
    name: 'Owner Can Pause',
    description: 'Contract owner can pause transfers, potentially trapping funds',
    severity: 'MEDIUM' as const,
    riskAdd: 10,
  },
  OWNERSHIP_TRANSFER: {
    name: 'Ownership Transfer',
    description: 'Contract allows ownership transfer',
    severity: 'LOW' as const,
    riskAdd: 5,
  },
  UNVERIFIED_SOURCE: {
    name: 'Unverified Source',
    description: 'Contract source code is not verified on block explorer',
    severity: 'LOW' as const,
    riskAdd: 10,
  },
  HONEYTRANSFER: {
    name: 'Honeypot Pattern',
    description: 'Contract may contain honeypot mechanics preventing sells',
    severity: 'CRITICAL' as const,
    riskAdd: 50,
  },
  MINT_WITHOUT_LIMIT: {
    name: 'Unlimited Minting',
    description: 'Contract allows unlimited token minting, causing inflation',
    severity: 'HIGH' as const,
    riskAdd: 20,
  },
} as const;

// Function selectors for common scam patterns
export const SCAM_SELECTORS = {
  // approve(address,uint256) - check if approves max uint256
  APPROVE: '0x095ea7b3',
  // transferFrom(address,address,uint256)
  TRANSFER_FROM: '0x23b872dd',
  // delegatecall(...)
  DELEGATE_CALL: '0x...delegatecall', // Detected via opcode 0xf4
  // selfdestruct() / selfdestruct(address)
  SELF_DESTRUCT: '0x...selfdestruct', // Detected via opcode 0xff
  // transferOwnership(address)
  TRANSFER_OWNERSHIP: '0xf2fde38b',
  // pause() / unpause()
  PAUSE: '0x8456cb59',
} as const;

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================
// CACHE DURATIONS
// ============================================

export const CACHE_DURATION = {
  // Short cache for frequently changing data
  SHORT: 60 * 5, // 5 minutes
  // Medium cache for semi-frequent data
  MEDIUM: 60 * 15, // 15 minutes
  // Long cache for rarely changing data
  LONG: 60 * 60, // 1 hour
  // Very long cache for static data
  VERY_LONG: 60 * 60 * 24, // 24 hours
} as const;

// ============================================
// SCAN LIMITS
// ============================================

export const SCAN_LIMITS = {
  MAX_BATCH_SIZE: 25,
  SCAN_TIMEOUT: 30_000, // 30 seconds
  QUICK_SCAN_TIMEOUT: 5_000, // 5 seconds
} as const;

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMITS = {
  // Strict limits for write operations
  STRICT: {
    requests: 5,
    window: 60 * 60 * 1000, // 1 hour
  },
  // Medium limits for expensive read operations
  MEDIUM: {
    requests: 20,
    window: 60 * 1000, // 1 minute
  },
  // Loose limits for cheap read operations
  LOOSE: {
    requests: 100,
    window: 60 * 1000, // 1 minute
  },
} as const;

// ============================================
// REPORT THRESHOLDS
// ============================================

export const REPORT_THRESHOLDS = {
  // Minimum votes to consider a report verified
  VERIFICATION_THRESHOLD: 5,
  // Minimum votes to consider a report rejected
  REJECTION_THRESHOLD: 5,
  // Minimum reputation required to vote
  MIN_REPUTATION_TO_VOTE: 10,
} as const;

// ============================================
// REPUTATION SYSTEM
// ============================================

export const REPUTATION = {
  // Points earned for various actions
  POINTS: {
    REPORT_SUBMITTED: 1,
    REPORT_VERIFIED: 10,
    REPORT_CORRECT_VOTE: 2,
    REPORT_WRONG_VOTE: -1,
    SCAN_COMPLETED: 1,
  },
  // Reputation levels
  LEVELS: {
    BEGINNER: { min: 0, max: 49, name: 'Beginner' },
    TRUSTED: { min: 50, max: 199, name: 'Trusted' },
    EXPERT: { min: 200, max: 499, name: 'Expert' },
    MASTER: { min: 500, max: Infinity, name: 'Master' },
  },
} as const;

/**
 * Get reputation level from points
 */
export function getReputationLevel(points: number): string {
  for (const level of Object.values(REPUTATION.LEVELS)) {
    if (points >= level.min && points <= level.max) {
      return level.name;
    }
  }
  return REPUTATION.LEVELS.BEGINNER.name;
}

// ============================================
// EXTERNAL API ENDPOINTS
// ============================================

export const EXTERNAL_APIS = {
  DEFILLAMA: {
    BASE_URL: 'https://api.llama.fi',
    PROTOCOLS_ENDPOINT: '/protocols',
    TIMEOUT: 10_000,
  },
  SCAMSNIFFER: {
    REPO_URL: 'https://github.com/scamsniffer/scam-database',
    RAW_URL: 'https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist',
    // Working endpoints:
    // - address.json: Scam addresses
    // - domains.json: Scam domains
    // - combined.json: Combined address and domain data
    ADDRESS_ENDPOINT: '/address.json',
    DOMAINS_ENDPOINT: '/domains.json',
    COMBINED_ENDPOINT: '/combined.json',
    TIMEOUT: 15_000,
  },
  CRYPTOSCAMDB: {
    BASE_URL: 'https://cryptoscamdb.org/api',
    TIMEOUT: 10_000,
  },
  BASE_REGISTRY: {
    BASE_URL: 'https://base.org',
    TIMEOUT: 10_000,
  },
} as const;

// ============================================
// CHAIN CONFIG
// ============================================

export const CHAIN_CONFIG = {
  BASE_SEPOLIA: {
    CHAIN_ID: 84532,
    NAME: 'Base Sepolia',
    RPC_URL: 'https://sepolia.base.org',
    EXPLORER_URL: 'https://sepolia.basescan.org',
    NATIVE_CURRENCY: {
      NAME: 'Ether',
      SYMBOL: 'ETH',
      DECIMALS: 18,
    },
  },
  BASE_MAINNET: {
    CHAIN_ID: 8453,
    NAME: 'Base',
    RPC_URL: 'https://mainnet.base.org',
    EXPLORER_URL: 'https://basescan.org',
    NATIVE_CURRENCY: {
      NAME: 'Ether',
      SYMBOL: 'ETH',
      DECIMALS: 18,
    },
  },
} as const;

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',

  // Address errors
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  ADDRESS_ALREADY_EXISTS: 'ADDRESS_ALREADY_EXISTS',

  // Report errors
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  REPORT_ALREADY_VOTED: 'REPORT_ALREADY_VOTED',
  REPORT_THRESHOLD_REACHED: 'REPORT_THRESHOLD_REACHED',
  INSUFFICIENT_REPUTATION: 'INSUFFICIENT_REPUTATION',

  // Scan errors
  SCAN_TIMEOUT: 'SCAN_TIMEOUT',
  SCAN_FAILED: 'SCAN_FAILED',
  INVALID_BYTECODE: 'INVALID_BYTECODE',

  // Sync errors
  SYNC_FAILED: 'SYNC_FAILED',
  SYNC_IN_PROGRESS: 'SYNC_IN_PROGRESS',
} as const;

// ============================================
// HTTP STATUS CODES
// ============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================
// TAGS
// ============================================

export const SYSTEM_TAGS = {
  VERIFIED: 'verified',
  OFFICIAL: 'official',
  SCAM: 'scam',
  PHISHING: 'phishing',
  DRAINER: 'drainer',
  HONEYPOT: 'honeypot',
  HIGH_RISK: 'high-risk',
  WATCHLIST: 'watchlist',
} as const;

export const CATEGORY_TAGS = {
  DEFI: ['defi', 'dex', 'lending', 'borrowing', 'staking', 'yield'],
  NFT: ['nft', 'marketplace', 'collection'],
  BRIDGE: ['bridge', 'cross-chain'],
  DEX: ['dex', 'swap', 'exchange'],
  LENDING: ['lending', 'borrowing', 'protocol'],
} as const;
