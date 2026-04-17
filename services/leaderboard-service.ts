/**
 * Leaderboard Service
 *
 * Manages user reputation scores and leaderboard rankings.
 * Users earn reputation from:
 * - Submitted reports that get verified
 * - Accurate voting (votes that match final outcome)
 * - Early detection of new scams
 */

import prisma from '@/lib/prisma';
import type { LeaderboardEntry, UserProfileDetail, ReputationEvent } from '@/types/models';

/**
 * Reputation points configuration
 */
const REWARD_POINTS = {
  REPORT_VERIFIED: 100, // Report accepted as scam
  REPORT_PENDING: 10, // Report submitted
  VOTE_CORRECT: 25, // Vote matched final outcome
  VOTE_PARTICIPATION: 5, // Participated in voting
  EARLY_DETECTION: 50, // Detected scam before widespread
  STREAK_BONUS: 20, // Bonus for consecutive correct votes
  TAG_SUBMITTED: 5, // Submitted address tag
} as const;

/**
 * Calculate user reputation score
 */
async function calculateUserReputation(userAddress: string): Promise<number> {
  // Get all verified reports by user
  const verifiedReports = await prisma.report.count({
    where: {
      reporterAddress: userAddress,
      status: 'VERIFIED',
    },
  });

  // Get all pending reports
  const pendingReports = await prisma.report.count({
    where: {
      reporterAddress: userAddress,
      status: 'PENDING',
    },
  });

  // Get votes that matched final outcome
  const correctVotes = await prisma.vote.count({
    where: {
      voterAddress: userAddress,
      report: {
        status: { in: ['VERIFIED', 'REJECTED'] },
      },
      OR: [
        {
          vote: 'FOR',
          report: { status: 'VERIFIED' },
        },
        {
          vote: 'AGAINST',
          report: { status: 'REJECTED' },
        },
      ],
    },
  });

  // Calculate total votes for streak bonus
  const recentVotes = await prisma.vote.findMany({
    where: {
      voterAddress: userAddress,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: {
      report: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Calculate streak
  let streak = 0;
  for (const vote of recentVotes) {
    const isCorrect =
      (vote.vote === 'FOR' && vote.report.status === 'VERIFIED') ||
      (vote.vote === 'AGAINST' && vote.report.status === 'REJECTED');

    if (isCorrect) {
      streak++;
    } else {
      break;
    }
  }

  const streakBonus = Math.floor(streak / 3) * REWARD_POINTS.STREAK_BONUS;

  // Total reputation
  const reputation =
    verifiedReports * REWARD_POINTS.REPORT_VERIFIED +
    pendingReports * REWARD_POINTS.REPORT_PENDING +
    correctVotes * REWARD_POINTS.VOTE_CORRECT +
    streakBonus;

  return reputation;
}

/**
 * Get leaderboard (paginated)
 */
export async function getLeaderboard(options: {
  period?: 'all' | 'week' | 'month';
  category?: 'reporters' | 'voters' | 'all';
  page?: number;
  limit?: number;
}): Promise<{ data: LeaderboardEntry[]; pagination: any }> {
  const { period = 'all', category = 'all', page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  // Date filter for period
  const dateFilter: any = {};
  if (period === 'week') {
    dateFilter.gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get all unique addresses from reports and votes
  const [reporters, voters] = await Promise.all([
    prisma.report.findMany({
      where: period === 'all' ? {} : { createdAt: dateFilter },
      select: { reporterAddress: true },
      distinct: ['reporterAddress'],
    }),
    prisma.vote.findMany({
      where: period === 'all' ? {} : { createdAt: dateFilter },
      select: { voterAddress: true },
      distinct: ['voterAddress'],
    }),
  ]);

  // Get all unique user addresses
  const allAddresses = Array.from(
    new Set([
      ...reporters.map((r) => r.reporterAddress),
      ...voters.map((v) => v.voterAddress),
    ])
  );

  // Calculate reputation for each user
  const entries: LeaderboardEntry[] = [];

  for (const address of allAddresses) {
    const reputation = await calculateUserReputation(address);

    // Get specific stats
    const verifiedReports = await prisma.report.count({
      where: {
        reporterAddress: address,
        status: 'VERIFIED',
        ...(period !== 'all' && { createdAt: dateFilter }),
      },
    });

    const totalVotes = await prisma.vote.count({
      where: {
        voterAddress: address,
        ...(period !== 'all' && { createdAt: dateFilter }),
      },
    });

    const correctVotes = await prisma.vote.count({
      where: {
        voterAddress: address,
        ...(period !== 'all' && { createdAt: dateFilter }),
        report: {
          status: { in: ['VERIFIED', 'REJECTED'] },
        },
        OR: [
          { vote: 'FOR', report: { status: 'VERIFIED' } },
          { vote: 'AGAINST', report: { status: 'REJECTED' } },
        ],
      },
    });

    // Category filtering
    if (category === 'reporters' && verifiedReports === 0) continue;
    if (category === 'voters' && totalVotes === 0) continue;

    // Get user profile if exists
    const profile = await prisma.userProfile.findUnique({
      where: { address },
    });

    entries.push({
      address,
      ens: profile?.ensName || undefined,
      reputation,
      rank: 0, // Will be set after sorting
      stats: {
        reportsSubmitted: verifiedReports,
        accurateVotes: correctVotes,
        totalVotes,
        accuracy: totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0,
      },
    });
  }

  // Sort by reputation
  entries.sort((a, b) => b.reputation - a.reputation);

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Pagination
  const total = entries.length;
  const paginatedEntries = entries.slice(skip, skip + limit);

  return {
    data: paginatedEntries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user profile with stats
 */
export async function getUserProfile(userAddress: string): Promise<UserProfileDetail | null> {
  const user = await prisma.userProfile.findUnique({
    where: { address: userAddress },
  });

  if (!user) {
    return null;
  }

  const reputation = await calculateUserReputation(userAddress);

  // Get recent reputation events
  const recentReports = await prisma.report.findMany({
    where: {
      reporterAddress: userAddress,
      status: 'VERIFIED',
      updatedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const events: ReputationEvent[] = recentReports.map((report) => ({
    type: 'report_verified',
    points: REWARD_POINTS.REPORT_VERIFIED,
    description: `Report verified`,
    timestamp: report.updatedAt,
  }));

  // Get rank - need to get all active users
  const [reporters, voters] = await Promise.all([
    prisma.report.findMany({
      select: { reporterAddress: true },
      distinct: ['reporterAddress'],
    }),
    prisma.vote.findMany({
      select: { voterAddress: true },
      distinct: ['voterAddress'],
    }),
  ]);

  const allAddresses = Array.from(
    new Set([
      ...reporters.map((r) => r.reporterAddress),
      ...voters.map((v) => v.voterAddress),
    ])
  );

  const reputations = await Promise.all(
    allAddresses.map((addr) => calculateUserReputation(addr))
  );

  const sorted = allAddresses
    .map((addr, i) => ({ address: addr, reputation: reputations[i] }))
    .sort((a, b) => b.reputation - a.reputation);

  const rank = sorted.findIndex((u) => u.address === userAddress) + 1;

  return {
    address: user.address,
    ens: user.ensName || undefined,
    reputation,
    rank,
    joinedAt: user.createdAt,
    stats: {
      totalReports: await prisma.report.count({
        where: { reporterAddress: userAddress },
      }),
      verifiedReports: await prisma.report.count({
        where: { reporterAddress: userAddress, status: 'VERIFIED' },
      }),
      totalVotes: await prisma.vote.count({
        where: { voterAddress: userAddress },
      }),
      accurateVotes: await prisma.vote.count({
        where: {
          voterAddress: userAddress,
          report: {
            status: { in: ['VERIFIED', 'REJECTED'] },
          },
          OR: [
            { vote: 'FOR', report: { status: 'VERIFIED' } },
            { vote: 'AGAINST', report: { status: 'REJECTED' } },
          ],
        },
      }),
      tagsSubmitted: user.tagsSubmitted,
    },
    recentActivity: events,
  };
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(data: {
  address: string;
  ensName?: string;
}): Promise<UserProfileDetail> {
  const profile = await prisma.userProfile.upsert({
    where: { address: data.address },
    update: {
      ...(data.ensName !== undefined && { ensName: data.ensName }),
    },
    create: {
      address: data.address,
      ensName: data.ensName,
    },
  });

  const result = await getUserProfile(profile.address);
  if (!result) {
    throw new Error('Failed to create user profile');
  }
  return result;
}

/**
 * Award reputation points
 */
export async function awardReputation(
  userAddress: string,
  event: keyof typeof REWARD_POINTS,
  description?: string
): Promise<void> {
  const points = REWARD_POINTS[event];

  // Get or create user profile
  await prisma.userProfile.upsert({
    where: { address: userAddress },
    update: {
      reputation: { increment: points },
    },
    create: {
      address: userAddress,
      reputation: points,
    },
  });

  // Could add reputation history table here for full audit trail
}

/**
 * Get user's reputation history
 */
export async function getReputationHistory(
  userAddress: string,
  limit: number = 20
): Promise<ReputationEvent[]> {
  // For now, derive from reports and votes
  const reports = await prisma.report.findMany({
    where: {
      reporterAddress: userAddress,
      status: { in: ['VERIFIED', 'REJECTED'] },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  const events: ReputationEvent[] = [];

  for (const report of reports) {
    if (report.status === 'VERIFIED') {
      events.push({
        type: 'report_verified',
        points: REWARD_POINTS.REPORT_VERIFIED,
        description: `Report verified`,
        timestamp: report.updatedAt,
      });
    }
  }

  return events;
}
