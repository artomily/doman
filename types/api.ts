/**
 * API Request/Response Types
 *
 * Type definitions for API endpoints.
 * These types ensure type safety across the application.
 */

import { AddressStatus, AddressCategory, DataSource, ReportStatus, VoteType, RiskLevel } from '@/lib/validation';

// ============================================
// COMMON TYPES
// ============================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * API Response wrapper for success
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    cached?: boolean;
  };
}

/**
 * API Response wrapper for error
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// ADDRESS TYPES
// ============================================

/**
 * Address DTO (Data Transfer Object)
 */
export interface AddressDTO {
  id: string;
  address: string;
  name: string | null;
  chain: string;
  status: AddressStatus;
  riskScore: number;
  category: AddressCategory;
  source: DataSource;
  description: string | null;
  url: string | null;
  logoUrl: string | null;
  tvl: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: AddressTagDTO[];
  reportCount: number;
  lastScanned: string | null;
}

/**
 * Address Tag DTO
 */
export interface AddressTagDTO {
  id: string;
  tag: string;
  taggedBy: string | null;
  createdAt: string;
}

/**
 * dApps list query params
 */
export interface DappsQueryParams extends PaginationParams {
  status?: AddressStatus;
  category?: AddressCategory;
  search?: string;
  sort?: 'riskScore' | 'tvl' | 'name' | 'createdAt';
  order?: SortOrder;
}

/**
 * dApps list response
 */
export interface DappsResponse {
  data: AddressDTO[];
  pagination: PaginationMeta;
}

/**
 * Search query params
 */
export interface SearchQueryParams {
  q: string;
  limit?: number;
}

/**
 * Search result
 */
export interface SearchResult {
  address: string;
  name: string | null;
  status: AddressStatus;
  category: AddressCategory;
  riskScore: number;
}

/**
 * Search response
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

// ============================================
// REPORT TYPES
// ============================================

/**
 * Report DTO
 */
export interface ReportDTO {
  id: string;
  addressId: string;
  address: {
    id: string;
    address: string;
    name: string | null;
    status: AddressStatus;
    category: AddressCategory;
  };
  reporterAddress: string;
  reason: string;
  evidenceUrl: string | null;
  category: AddressCategory;
  status: ReportStatus;
  votesFor: number;
  votesAgainst: number;
  txHash: string | null;
  reasonHash: string | null;
  reasonData: { selectedReasons: string[]; customText: string } | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create report request
 */
export interface CreateReportRequest {
  address: string;
  reason: string;
  evidenceUrl?: string | null;
  category: AddressCategory;
  reporterAddress: string;
  reasonHash?: string | null;
  reasonData?: { selectedReasons: string[]; customText: string } | null;
}

/**
 * Create report response
 */
export interface CreateReportResponse {
  id: string;
  status: ReportStatus;
  txHash?: string;
  message: string;
}

/**
 * Reports query params
 */
export interface ReportsQueryParams extends PaginationParams {
  status?: ReportStatus;
  category?: AddressCategory;
  reporterAddress?: string;
}

/**
 * Reports list response
 */
export interface ReportsResponse {
  data: ReportDTO[];
  pagination: PaginationMeta;
}

/**
 * Vote request
 */
export interface VoteRequest {
  vote: VoteType;
  voterAddress: string;
  txHash?: string | null;
}

/**
 * Vote response
 */
export interface VoteResponse {
  reportId: string;
  votesFor: number;
  votesAgainst: number;
  status: ReportStatus;
}

// ============================================
// SCANNER TYPES
// ============================================

/**
 * Detected pattern
 */
export interface DetectedPattern {
  name: string;
  severity: RiskLevel;
  description: string;
}

/**
 * Similar scam
 */
export interface SimilarScam {
  address: string;
  name: string | null;
  similarity: number; // 0-1
}

/**
 * Input type for scan (address, ENS name, or domain)
 */
export type ScanInputType = 'address' | 'ens' | 'domain';

/**
 * Scan result
 */
export interface ScanResult {
  address: string;
  inputType?: ScanInputType;
  displayInput?: string; // ENS display value (original input)
  resolvedAddress?: string; // ENS → resolved 0x address
  riskScore: number;
  riskLevel: RiskLevel;
  isVerified: boolean;
  patterns: DetectedPattern[];
  similarScams: SimilarScam[];
  reportCount: number;
  votesFor: number;
  votesAgainst: number;
  scanDuration: number;
  scannedAt: string;
}

/**
 * Quick scan result (lighter version)
 */
export interface QuickScanResult {
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AddressStatus;
  hasReports: boolean;
  lastScanned?: string;
}

/**
 * Batch scan request
 */
export interface BatchScanRequest {
  addresses: string[];
}

/**
 * Batch scan result
 */
export interface BatchScanResult {
  results: QuickScanResult[];
}

// ============================================
// STATS TYPES
// ============================================

/**
 * Category stats
 */
export interface CategoryStats {
  category: AddressCategory;
  count: number;
}

/**
 * Platform statistics
 */
export interface PlatformStats {
  totalAddresses: number;
  legitCount: number;
  scamCount: number;
  suspiciousCount: number;
  unknownCount: number;
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  topCategories: CategoryStats[];
  recentScams: string[];
  scansToday: number;
  updatedAt: string;
}

/**
 * Stats response
 */
export type StatsResponse = PlatformStats;

// ============================================
// LEADERBOARD TYPES
// ============================================

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  address: string;
  ensName: string | null;
  reportsSubmitted: number;
  reportsVerified: number;
  reputation: number;
}

/**
 * Leaderboard response
 */
export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  pagination: PaginationMeta;
}

// ============================================
// SYNC TYPES
// ============================================

/**
 * Sync request
 */
export interface SyncRequest {
  source: 'defillama' | 'scamsniffer' | 'cryptoscamdb' | 'base' | 'all';
}

/**
 * Sync response
 */
export interface SyncResponse {
  success: boolean;
  source: string;
  recordsAdded: number;
  recordsUpdated: number;
  syncLogId: string;
  duration: number;
  error?: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Error codes enum
 */
export enum ErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMITED = 'RATE_LIMITED',

  // Address errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',

  // Report errors
  REPORT_NOT_FOUND = 'REPORT_NOT_FOUND',
  REPORT_ALREADY_VOTED = 'REPORT_ALREADY_VOTED',

  // Scan errors
  SCAN_TIMEOUT = 'SCAN_TIMEOUT',
  SCAN_FAILED = 'SCAN_FAILED',
}

// ============================================
// EXPORT UTILS
// ============================================

/**
 * Type guard to check if response is success
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is error
 */
export function isErrorResponse(response: ApiResponse<unknown>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
