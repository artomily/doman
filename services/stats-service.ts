/**
 * Stats Service
 *
 * Service for aggregating and calculating platform statistics.
 */

import prisma from '@/lib/prisma';
import type { PlatformStats } from '@/types/api';

/**
 * Get overall platform statistics
 */
export async function getOverallStats(): Promise<PlatformStats> {
  const [
    totalAddresses,
    legitCount,
    scamCount,
    suspiciousCount,
    unknownCount,
    totalReports,
    verifiedReports,
    pendingReports,
    topCategories,
    recentScams,
    scansToday,
  ] = await Promise.all([
    // Total addresses
    prisma.address.count(),
    // Count by status
    prisma.address.count({ where: { status: 'LEGIT' } }),
    prisma.address.count({ where: { status: 'SCAM' } }),
    prisma.address.count({ where: { status: 'SUSPICIOUS' } }),
    prisma.address.count({ where: { status: 'UNKNOWN' } }),
    // Report stats
    prisma.report.count(),
    prisma.report.count({ where: { status: 'VERIFIED' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    // Top categories
    prisma.address.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    }),
    // Recent scams (last 7 days)
    prisma.address.findMany({
      where: {
        status: 'SCAM',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { address: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    // Scans today
    prisma.contractScan.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalAddresses,
    legitCount,
    scamCount,
    suspiciousCount,
    unknownCount,
    totalReports,
    verifiedReports,
    pendingReports,
    topCategories: topCategories.map((cat) => ({
      category: cat.category as any,
      count: cat._count.category,
    })),
    recentScams: recentScams.map((addr) => addr.address),
    scansToday,
    updatedAt: new Date().toISOString(),
  };
}
