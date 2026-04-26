/**
 * Database Model Type Extensions
 *
 * Extended types for Prisma models with relations and computed properties.
 * These types provide better TypeScript support when working with database models.
 */

import type {
  Address,
  Report,
  Vote,
  ContractScan,
  AddressTag,
  ExternalSource,
  SyncLog,
  UserProfile,
  ScamDomain,
  AddressStatus,
  AddressCategory,
  DataSource,
  ReportStatus,
  VoteType,
  RiskLevel,
} from '@prisma/client';

// ============================================
// ADDRESS TYPES
// ============================================

/**
 * Address with relations populated
 */
export type AddressWithRelations = Address & {
  reports?: Report[];
  scans?: ContractScan[];
  tags?: AddressTag[];
  sourceLinks?: ExternalSource[];
  _count?: {
    reports: number;
    scans: number;
    tags: number;
  };
};

/**
 * Address with computed properties
 */
export type AddressExtended = AddressWithRelations & {
  reportCount: number;
  lastScanned?: Date | null;
  lastReported?: Date | null;
};

// ============================================
// REPORT TYPES
// ============================================

/**
 * Report with address and votes
 */
export type ReportWithAddress = Report & {
  address: Address;
};

/**
 * Report with votes
 */
export type ReportWithVotes = Report & {
  votes: Vote[];
};

/**
 * Report with full relations
 */
export type ReportWithRelations = Report & {
  address: Address;
  votes: Vote[];
};

// ============================================
// VOTE TYPES
// ============================================

/**
 * Vote with report
 */
export type VoteWithReport = Vote & {
  report: Report;
};

// ============================================
// CONTRACT SCAN TYPES
// ============================================

/**
 * Contract scan with address
 */
export type ContractScanWithAddress = ContractScan & {
  address: Address;
};

/**
 * Detected pattern from scan
 */
export interface DetectedPatternModel {
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
}

/**
 * Extended contract scan with parsed patterns
 */
export type ContractScanExtended = ContractScanWithAddress & {
  detectedPatterns: DetectedPatternModel[];
};

// ============================================
// TAG TYPES
// ============================================

/**
 * Address tag with address
 */
export type AddressTagWithAddress = AddressTag & {
  address: Address;
};

// ============================================
// EXTERNAL SOURCE TYPES
// ============================================

/**
 * External source with address
 */
export type ExternalSourceWithAddress = ExternalSource & {
  address: Address;
};

// ============================================
// SYNC LOG TYPES
// ============================================

/**
 * Sync log summary
 */
export interface SyncLogSummary {
  id: string;
  source: string;
  status: string;
  recordsAdded: number;
  recordsUpdated: number;
  startedAt: Date;
  completedAt: Date | null;
  duration?: number; // in seconds
  error?: string | null;
}

// ============================================
// USER PROFILE TYPES
// ============================================

/**
 * User profile with stats
 */
export type UserProfileWithStats = UserProfile & {
  _recentReports?: Report[];
  _verifiedReportsCount?: number;
  _reputationLevel?: string;
};

// ============================================
// SCAM DOMAIN TYPES
// ============================================

/**
 * Scam domain with source info
 */
export type ScamDomainWithSource = ScamDomain & {
  sourceUrl?: string;
};

/**
 * Domain check result
 */
export interface DomainCheckResult {
  domain: string;
  isScam: boolean;
  riskScore: number;
  category: string;
  description?: string;
  source?: string;
  checkedAt: string;
}

// ============================================
// FILTER & INPUT TYPES
// ============================================

/**
 * Address filters for queries
 */
export interface AddressFilters {
  status?: ('LEGIT' | 'SCAM' | 'SUSPICIOUS' | 'UNKNOWN')[];
  categories?: ('DEFI' | 'NFT' | 'BRIDGE' | 'DEX' | 'LENDING' | 'PHISHING' | 'DRAINER' | 'AIRDROP_SCAM' | 'RUGPULL' | 'IMPOSTER' | 'OTHER')[];
  source?: ('COMMUNITY' | 'SCANNER' | 'EXTERNAL' | 'SEED' | 'ADMIN')[];
  chain?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
  search?: string; // Search by name or address
  hasReports?: boolean;
  tags?: string[];
}

/**
 * Report filters for queries
 */
export interface ReportFilters {
  status?: ('PENDING' | 'VERIFIED' | 'REJECTED' | 'DISPUTED')[];
  category?: ('DEFI' | 'NFT' | 'BRIDGE' | 'DEX' | 'LENDING' | 'PHISHING' | 'DRAINER' | 'AIRDROP_SCAM' | 'RUGPULL' | 'IMPOSTER' | 'OTHER')[];
  reporterAddress?: string;
  addressId?: string;
  targetAddress?: string; // filter by the reported address value (joins to Address table)
  minVotesFor?: number;
  minVotesAgainst?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'riskScore' | 'tvl' | 'name';
    direction: 'asc' | 'desc';
  };
}

/**
 * Sort options for lists
 */
export interface SortOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'riskScore' | 'tvl' | 'name' | 'reputation';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// AGGREGATION TYPES
// ============================================

/**
 * Address count by status
 */
export interface AddressCountByStatus {
  status: 'LEGIT' | 'SCAM' | 'SUSPICIOUS' | 'UNKNOWN';
  count: number;
}

/**
 * Address count by category
 */
export interface AddressCountByCategory {
  category: 'DEFI' | 'NFT' | 'BRIDGE' | 'DEX' | 'LENDING' | 'PHISHING' | 'DRAINER' | 'AIRDROP_SCAM' | 'RUGPULL' | 'IMPOSTER' | 'OTHER';
  count: number;
}

/**
 * Statistics aggregation
 */
export interface StatsAggregation {
  totalAddresses: number;
  legitCount: number;
  scamCount: number;
  suspiciousCount: number;
  unknownCount: number;
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  rejectedReports: number;
  topCategories: AddressCountByCategory[];
  recentScams: Address[];
}

// ============================================
// EXTERNAL DATA TYPES
// ============================================

/**
 * DeFiLlama protocol data
 */
export interface DefiLlamaProtocol {
  name: string;
  symbol?: string;
  address?: string[]; // Contract addresses
  chain: string;
  category?: string;
  tvl: number;
  url?: string;
  logo?: string;
}

/**
 * ScamSniffer scam data
 */
export interface ScamSnifferData {
  address: string;
  name?: string;
  type: string; // 'phishing', 'drainer', etc
  description?: string;
  url?: string;
  addedAt?: string;
}

/**
 * CryptoScamDB entry
 */
export interface CryptoScamDbEntry {
  address: string;
  name?: string;
  category: string;
  description?: string;
  url?: string;
  status: 'active' | 'inactive';
}

/**
 * Base registry dApp data
 */
export interface BaseRegistryDapp {
  name: string;
  description?: string;
  url: string;
  address?: string;
  category?: string;
  logo?: string;
}

// ============================================
// SYNC TYPES
// ============================================

/**
 * Sync source types
 */
export type SyncSource = 'defillama' | 'scamsniffer' | 'cryptoscamdb' | 'base';

/**
 * Sync result
 */
export interface SyncResult {
  source: SyncSource;
  status: 'success' | 'failed';
  recordsAdded: number;
  recordsUpdated: number;
  error?: string;
  duration: number; // in milliseconds
}

/**
 * Batch sync result
 */
export interface BatchSyncResult {
  results: SyncResult[];
  totalAdded: number;
  totalUpdated: number;
  totalDuration: number;
  hasErrors: boolean;
}

// ============================================
// MISC TYPES
// ============================================

/**
 * paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Reputation event for user history
 */
export interface ReputationEvent {
  type: 'report_verified' | 'vote_correct' | 'streak_bonus' | 'early_detection';
  points: number;
  description: string;
  timestamp: Date;
}

/**
 * User profile extended with stats (API response format)
 */
export interface UserProfileDetail {
  address: string;
  ens?: string;
  avatar?: string;
  reputation: number;
  rank: number;
  joinedAt: Date;
  stats: {
    totalReports: number;
    verifiedReports: number;
    totalVotes: number;
    accurateVotes: number;
    tagsSubmitted: number;
  };
  recentActivity?: ReputationEvent[];
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  address: string;
  ens?: string;
  avatar?: string;
  reputation: number;
  rank: number;
  stats: {
    reportsSubmitted: number;
    accurateVotes: number;
    totalVotes: number;
    accuracy: number;
  };
}

/**
 * Address filter options
 */
export interface AddressFilter {
  status?: AddressStatus;
  category?: AddressCategory;
  riskLevel?: 'high' | 'medium' | 'low';
  search?: string;
  sortBy?: 'tvl' | 'name' | 'riskScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  minTvl?: number;
  verifiedOnly?: boolean;
}

/**
 * dApps list response
 */
export interface DAppsListResponse {
  data: Array<{
    address: string;
    name: string | null;
    category: AddressCategory;
    status: AddressStatus;
    riskScore: number;
    riskLevel: RiskLevel;
    tvl?: number;
    logoUrl: string | null;
    url: string | null;
    description: string | null;
    tags: Array<{ id: string; label: string; type: string }>;
    sources: string[];
    updatedAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  succeeded: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  blockchain: 'connected' | 'disconnected';
  externalApis: Record<string, 'connected' | 'disconnected' | 'timeout'>;
  timestamp: Date;
}

// ============================================
// EXPORT PRISMA TYPES
// ============================================

export type {
  Address,
  Report,
  Vote,
  ContractScan,
  AddressTag,
  ExternalSource,
  SyncLog,
  UserProfile,
  ScamDomain,
};

export type {
  AddressStatus,
  AddressCategory,
  DataSource,
  ReportStatus,
  VoteType,
  RiskLevel,
};
