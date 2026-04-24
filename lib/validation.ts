/**
 * Validation Schemas
 *
 * Zod schemas for validating API requests and responses.
 * All API routes should use these schemas to ensure type safety
 * and prevent invalid data from entering the system.
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const AddressStatusEnum = z.enum(['LEGIT', 'SCAM', 'SUSPICIOUS', 'UNKNOWN']);
export const AddressCategoryEnum = z.enum([
  'DEFI',
  'NFT',
  'BRIDGE',
  'DEX',
  'LENDING',
  'PHISHING',
  'DRAINER',
  'AIRDROP_SCAM',
  'RUGPULL',
  'IMPOSTER',
  'OTHER',
]);
export const DataSourceEnum = z.enum(['COMMUNITY', 'SCANNER', 'EXTERNAL', 'SEED', 'ADMIN']);
export const ReportStatusEnum = z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'DISPUTED']);
export const VoteTypeEnum = z.enum(['FOR', 'AGAINST']);
export const RiskLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

// ============================================
// COMMON SCHEMAS
// ============================================

/**
 * Ethereum address validation
 * - Must start with 0x
 * - Must be 42 characters (0x + 40 hex)
 * - Case-insensitive (checksum validation optional)
 */
export const addressSchema = z.string().min(2).max(42).regex(/^0x[a-fA-F0-9]*$/, 'Invalid Ethereum address');

/**
 * Transaction hash validation
 */
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');

/**
 * URL validation with HTTPS requirement
 */
export const httpsUrlSchema = z.string().url('Invalid URL').refine((url) => url.startsWith('https://'), {
  message: 'URL must use HTTPS',
});

/**
 * Pagination params
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// ADDRESS SCHEMAS
// ============================================

/**
 * GET /api/v1/address/[address] - Response
 */
export const addressResponseSchema = z.object({
  id: z.string(),
  address: addressSchema,
  name: z.string().nullable(),
  chain: z.string(),
  status: AddressStatusEnum,
  riskScore: z.number().int().min(0).max(100),
  category: AddressCategoryEnum,
  source: DataSourceEnum,
  description: z.string().nullable(),
  url: z.string().nullable(),
  logoUrl: z.string().nullable(),
  tvl: z.number().nullable(),
  verifiedBy: addressSchema.nullable(),
  verifiedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.object({
    id: z.string(),
    tag: z.string(),
    taggedBy: z.string().nullable(),
    createdAt: z.string().datetime(),
  })),
  reportCount: z.number().int().nonnegative(),
  lastScanned: z.string().datetime().nullable(),
});

/**
 * GET /api/v1/dapps - Query params
 */
export const dappsQuerySchema = paginationSchema.partial().extend({
  status: AddressStatusEnum.optional(),
  category: AddressCategoryEnum.optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['riskScore', 'tvl', 'name', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/v1/search - Query params
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

// ============================================
// REPORT SCHEMAS
// ============================================

/**
 * POST /api/v1/report - Request body
 */
/** ETH address OR domain string (e.g. "uniswap.org") */
const reportTargetSchema = z.union([
  addressSchema,
  z.string().min(2).max(253).regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/, 'Invalid domain'),
]);

export const createReportSchema = z.object({
  address: reportTargetSchema,
  reason: z.string().trim().min(1).max(5000),
  evidenceUrl: httpsUrlSchema.optional().nullable(),
  category: AddressCategoryEnum.default('OTHER'),
  reporterAddress: addressSchema,
  reasonHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid bytes32 hex').optional().nullable(),
  reasonData: z.object({
    selectedReasons: z.array(z.string()).min(0).max(20),
    customText: z.string().max(2000),
  }).optional().nullable(),
});

/**
 * GET /api/v1/reports - Query params
 */
export const reportsQuerySchema = paginationSchema.partial().extend({
  status: ReportStatusEnum.optional(),
  category: AddressCategoryEnum.optional(),
  reporterAddress: addressSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * POST /api/v1/reports/[id]/vote - Request body
 */
export const voteSchema = z.object({
  vote: VoteTypeEnum,
  voterAddress: addressSchema,
  txHash: txHashSchema.optional().nullable(),
});

// ============================================
// SCANNER SCHEMAS
// ============================================

/**
 * GET /api/v1/scan/[address] - Response
 */
export const scanResponseSchema = z.object({
  address: addressSchema,
  riskScore: z.number().int().min(0).max(100),
  riskLevel: RiskLevelEnum,
  isVerified: z.boolean(),
  patterns: z.array(z.object({
    name: z.string(),
    severity: RiskLevelEnum,
    description: z.string(),
  })),
  similarScams: z.array(z.object({
    address: addressSchema,
    name: z.string().nullable(),
    similarity: z.number().min(0).max(1),
  })),
  reportCount: z.number().int().nonnegative(),
  scanDuration: z.number().int().nonnegative(),
  scannedAt: z.string().datetime(),
});

/**
 * POST /api/v1/scan/batch - Request body
 */
export const batchScanSchema = z.object({
  addresses: z.array(addressSchema).min(1).max(25),
});

// ============================================
// STATS & LEADERBOARD SCHEMAS
// ============================================

/**
 * GET /api/v1/stats - Response
 */
export const statsResponseSchema = z.object({
  totalAddresses: z.number().int().nonnegative(),
  legitCount: z.number().int().nonnegative(),
  scamCount: z.number().int().nonnegative(),
  suspiciousCount: z.number().int().nonnegative(),
  unknownCount: z.number().int().nonnegative(),
  totalReports: z.number().int().nonnegative(),
  verifiedReports: z.number().int().nonnegative(),
  pendingReports: z.number().int().nonnegative(),
  topCategories: z.array(z.object({
    category: AddressCategoryEnum,
    count: z.number().int().nonnegative(),
  })),
  recentScams: z.array(addressSchema),
  scansToday: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

/**
 * GET /api/v1/leaderboard - Response
 */
export const leaderboardResponseSchema = z.object({
  data: z.array(z.object({
    address: addressSchema,
    ensName: z.string().nullable(),
    reportsSubmitted: z.number().int().nonnegative(),
    reportsVerified: z.number().int().nonnegative(),
    reputation: z.number().int(),
  })),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
  }),
});

// ============================================
// SYNC SCHEMAS
// ============================================

/**
 * POST /api/v1/sync - Request body
 */
export const syncRequestSchema = z.object({
  source: z.enum(['defillama', 'scamsniffer', 'cryptoscamdb', 'base', 'all']),
});

/**
 * POST /api/v1/sync - Response
 */
export const syncResponseSchema = z.object({
  success: z.boolean(),
  source: z.string(),
  recordsAdded: z.number().int().nonnegative(),
  recordsUpdated: z.number().int().nonnegative(),
  syncLogId: z.string(),
  duration: z.number().int().nonnegative(),
  error: z.string().nullable().optional(),
});

// ============================================
// API RESPONSE WRAPPERS
// ============================================

/**
 * Success response wrapper
 */
export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.object({
      pagination: z.object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().positive(),
      }).optional(),
      cached: z.boolean().optional(),
    }).optional(),
  });

/**
 * Error response wrapper
 */
export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

// ============================================
// EXPORT TYPES
// ============================================

export type AddressStatus = z.infer<typeof AddressStatusEnum>;
export type AddressCategory = z.infer<typeof AddressCategoryEnum>;
export type DataSource = z.infer<typeof DataSourceEnum>;
export type ReportStatus = z.infer<typeof ReportStatusEnum>;
export type VoteType = z.infer<typeof VoteTypeEnum>;
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type BatchScanInput = z.infer<typeof batchScanSchema>;
export type SyncRequestInput = z.infer<typeof syncRequestSchema>;
export type DappsQueryInput = z.infer<typeof dappsQuerySchema>;
export type ReportsQueryInput = z.infer<typeof reportsQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
