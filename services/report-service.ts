/**
 * Report Service
 *
 * Service for managing community reports and voting.
 * Handles report creation, voting, and verification.
 */

import prisma from '@/lib/prisma';
import { createHash } from 'crypto';
import type {
  Report,
  ReportStatus,
  ReportFilters,
  PaginatedResult,
} from '@/types/models';
import type { CreateReportRequest } from '@/types/api';
import { REPORT_THRESHOLDS, REPUTATION } from '@/lib/constants';
import type { AddressCategory, VoteType } from '@/lib/validation';
import { AppError } from '@/lib/error-handler';

/**
 * Create a new report
 */
export async function createReport(data: CreateReportRequest): Promise<Report> {
  // Determine if target is a domain/ENS (not a 42-char 0x ETH address)
  const isDomainTarget = !(data.address.startsWith('0x') && data.address.length === 42);

  // For domain/ENS targets: generate a deterministic 42-char key so it fits ADDRESS VARCHAR(42).
  // Full target string is stored in the `url` and `name` fields.
  const addressKey = isDomainTarget
    ? ('0x' + createHash('sha256').update(data.address.toLowerCase()).digest('hex').slice(0, 40))
    : data.address;

  let address = await prisma.address.findUnique({
    where: { address: addressKey },
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        address: addressKey,
        ...(isDomainTarget && { name: data.address, url: data.address }),
        status: 'UNKNOWN',
        riskScore: 50,
        category: data.category,
        source: 'COMMUNITY',
      },
    });
  }

  // Check for duplicate reports (same address, reporter, recent)
  const existingReport = await prisma.report.findFirst({
    where: {
      addressId: address.id,
      reporterAddress: data.reporterAddress,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  if (existingReport) {
    throw new AppError('DUPLICATE_REPORT', 'You have already reported this address recently', 409);
  }

  // Create report
  const report = await prisma.report.create({
    data: {
      addressId: address.id,
      reporterAddress: data.reporterAddress,
      reason: data.reason,
      evidenceUrl: data.evidenceUrl,
      category: data.category,
      status: 'PENDING',
      reasonHash: data.reasonHash ?? null,
      reasonData: data.reasonData ?? undefined,
    },
  });

  // Update user profile
  await prisma.userProfile.upsert({
    where: { address: data.reporterAddress },
    update: {
      reportsSubmitted: { increment: 1 },
      reputation: { increment: REPUTATION.POINTS.REPORT_SUBMITTED },
    },
    create: {
      address: data.reporterAddress,
      reportsSubmitted: 1,
      reputation: REPUTATION.POINTS.REPORT_SUBMITTED,
    },
  });

  return report;
}

/**
 * Get reports with filters
 */
export async function getReports(
  filters: ReportFilters = {},
  pagination?: { page?: number; limit?: number }
): Promise<PaginatedResult<Report>> {
  const page = pagination?.page || 1;
  const limit = Math.min(pagination?.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.reporterAddress) {
    where.reporterAddress = filters.reporterAddress;
  }

  if (filters.addressId) {
    where.addressId = filters.addressId;
  }

  if (filters.targetAddress) {
    where.address = { address: filters.targetAddress };
  }

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        address: {
          select: {
            id: true,
            address: true,
            name: true,
            status: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Vote on a report
 */
export async function voteOnReport(
  reportId: string,
  vote: VoteType,
  voterAddress: string,
  txHash?: string
): Promise<Report> {
  // Get report
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { address: true },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Check if report is still pending
  if (report.status !== 'PENDING') {
    throw new Error('Report is not open for voting');
  }

  // Check if user has already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      reportId_voterAddress: {
        reportId,
        voterAddress,
      },
    },
  });

  if (existingVote) {
    throw new AppError('REPORT_ALREADY_VOTED', 'You have already voted on this report', 409);
  }

  // Check voter reputation
  const voterProfile = await prisma.userProfile.findUnique({
    where: { address: voterAddress },
  });

  const reputation = voterProfile?.reputation || 0;
  if (reputation < REPORT_THRESHOLDS.MIN_REPUTATION_TO_VOTE) {
    throw new Error('Insufficient reputation to vote');
  }

  // Create vote
  await prisma.vote.create({
    data: {
      reportId,
      voterAddress,
      vote,
      txHash,
    },
  });

  // Update report vote counts
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      votesFor: vote === 'FOR' ? { increment: 1 } : undefined,
      votesAgainst: vote === 'AGAINST' ? { increment: 1 } : undefined,
    },
  });

  // Check if threshold reached
  await checkThreshold(reportId);

  return updatedReport;
}

/**
 * Check if report has reached verification threshold
 */
async function checkThreshold(reportId: string): Promise<void> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report || report.status !== 'PENDING') {
    return;
  }

  let newStatus: ReportStatus | null = null;

  // Check verification threshold
  if (report.votesFor >= REPORT_THRESHOLDS.VERIFICATION_THRESHOLD) {
    newStatus = 'VERIFIED';
  }
  // Check rejection threshold
  else if (report.votesAgainst >= REPORT_THRESHOLDS.REJECTION_THRESHOLD) {
    newStatus = 'REJECTED';
  }

  // Update status if threshold reached
  if (newStatus) {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
      },
    });

    // If verified, update address status
    if (newStatus === 'VERIFIED') {
      await prisma.address.update({
        where: { id: report.addressId },
        data: {
          status: report.category === 'PHISHING' || report.category === 'DRAINER'
            ? 'SCAM'
            : 'LEGIT',
          verifiedBy: report.reporterAddress,
          verifiedAt: new Date(),
        },
      });
    }
  }
}

/**
 * Get reports by address
 */
export async function getReportsByAddress(
  addressId: string,
  limit: number = 10
): Promise<Report[]> {
  return prisma.report.findMany({
    where: { addressId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      votes: {
        select: {
          id: true,
          voterAddress: true,
          vote: true,
          createdAt: true,
        },
      },
    },
  });
}

/**
 * Resolve a report (admin function)
 */
export async function resolveReport(
  reportId: string,
  status: 'VERIFIED' | 'REJECTED',
  resolvedBy: string
): Promise<Report> {
  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolvedAt: new Date(),
    },
  });

  // Update address status if verified
  if (status === 'VERIFIED') {
    await prisma.address.update({
      where: { id: report.addressId },
      data: {
        verifiedBy: resolvedBy,
        verifiedAt: new Date(),
      },
    });
  }

  // Update reporter reputation
  await prisma.userProfile.update({
    where: { address: report.reporterAddress },
    data: {
      reputation: { increment: REPUTATION.POINTS.REPORT_VERIFIED },
    },
  });

  return report;
}

/**
 * Get report statistics
 */
export async function getReportStats(): Promise<{
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  disputed: number;
}> {
  const [total, pending, verified, rejected, disputed] = await Promise.all([
    prisma.report.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'VERIFIED' } }),
    prisma.report.count({ where: { status: 'REJECTED' } }),
    prisma.report.count({ where: { status: 'DISPUTED' } }),
  ]);

  return { total, pending, verified, rejected, disputed };
}
