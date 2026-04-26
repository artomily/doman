/**
 * Address Service
 *
 * Handles address lookups, dApp listings, and address management.
 */

import prisma from '@/lib/prisma';
import { publicClient } from '@/lib/viem';
import type { Address, AddressCategory, AddressStatus, RiskLevel, AddressFilter, DAppsListResponse } from '@/types/models';

/**
 * Get single address with full details
 */
export async function getAddress(address: string): Promise<Address | null> {
  // Check database first
  const dbAddress = await prisma.address.findUnique({
    where: { address: address.toLowerCase() },
    include: {
      tags: true,
      sourceLinks: true,
      scans: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          addressId: true,
          checkerAddress: true,
          bytecodeHash: true,
          riskScore: true,
          riskLevel: true,
          patterns: true,
          detectedSignatures: true,
          isVerified: true,
          isProxy: true,
          proxyType: true,
          implementationAddress: true,
          scannerVersion: true,
          scanDuration: true,
          createdAt: true,
        },
      },
      reports: {
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  if (!dbAddress) {
    // Try to fetch from blockchain
    const bytecode = await publicClient.getBytecode({
      address: address as `0x${string}`,
    });

    if (!bytecode || bytecode === '0x') {
      // EOA, not a contract
      return null;
    }

    // Create basic address entry for unknown contract
    const newAddress = await prisma.address.create({
      data: {
        address: address.toLowerCase(),
        name: 'Unknown Contract',
        status: 'UNKNOWN',
        riskScore: 50,
        chain: 'base',
        category: 'OTHER',
        source: 'SCANNER',
      },
      include: {
        tags: true,
        sourceLinks: true,
        scans: {
          select: {
            id: true,
            addressId: true,
            checkerAddress: true,
            bytecodeHash: true,
            riskScore: true,
            riskLevel: true,
            patterns: true,
            detectedSignatures: true,
            isVerified: true,
            isProxy: true,
            proxyType: true,
            implementationAddress: true,
            scannerVersion: true,
            scanDuration: true,
            createdAt: true,
          },
        },
      },
    });

    return newAddress as Address;
  }

  return dbAddress as Address;
}

/**
 * Get list of dApps with filtering and pagination
 */
export async function getDApps(options: AddressFilter): Promise<DAppsListResponse> {
  const {
    status,
    category,
    riskLevel,
    search,
    sortBy = 'tvl',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
    minTvl,
    verifiedOnly = false,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    source: 'EXTERNAL',
    chain: 'base',
  };

  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (riskLevel) {
    if (riskLevel === 'high') {
      where.riskScore = { gte: 70 };
    } else if (riskLevel === 'medium') {
      where.riskScore = { gte: 40, lt: 70 };
    } else if (riskLevel === 'low') {
      where.riskScore = { lt: 40 };
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minTvl !== undefined) {
    where.tvl = { gte: minTvl };
  }

  if (verifiedOnly) {
    where.status = 'VERIFIED';
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'tvl') {
    orderBy = { tvl: sortOrder };
  } else if (sortBy === 'name') {
    orderBy = { name: sortOrder };
  } else if (sortBy === 'riskScore') {
    orderBy = { riskScore: sortOrder };
  } else if (sortBy === 'createdAt') {
    orderBy = { createdAt: sortOrder };
  }

  // Execute query
  const [addresses, total] = await Promise.all([
    prisma.address.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        tags: true,
        sourceLinks: {
          select: {
            source: true,
            sourceUrl: true,
          },
        },
      },
    }),
    prisma.address.count({ where }),
  ]);

  // Transform to response format
  const data = addresses.map((addr) => ({
    address: addr.address,
    name: addr.name,
    category: addr.category as AddressCategory,
    status: addr.status as AddressStatus,
    riskScore: addr.riskScore,
    riskLevel: getRiskLevel(addr.riskScore),
    tvl: addr.tvl ? Number(addr.tvl) : undefined,
    logoUrl: addr.logoUrl,
    url: addr.url,
    description: addr.description,
    tags: addr.tags.map((t) => ({
      id: t.id,
      label: t.tag,
      type: t.taggedBy || 'manual',
    })),
    sources: addr.sourceLinks.map((s) => s.source),
    updatedAt: addr.updatedAt,
  }));

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
 * Search addresses and domains
 */
export async function searchAddresses(query: string, options: {
  limit?: number;
  type?: 'all' | 'contracts' | 'eoa';
  status?: AddressStatus;
} = {}): Promise<any[]> {
  const { limit = 20, type = 'all', status } = options;

  if (!query || query.length < 2) {
    return [];
  }

  const searchQuery = query.toLowerCase();

  // Build where clause
  const where: any = {
    OR: [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } },
    ],
  };

  if (status) {
    where.status = status;
  }

  if (type === 'contracts') {
    where.addressType = { in: ['SMART_CONTRACT', 'PROXY', 'FACTORY'] };
  } else if (type === 'eoa') {
    where.addressType = 'EOA';
  }

  const results = await prisma.address.findMany({
    where,
    take: limit,
    include: {
      tags: true,
    },
  });

  return results.map((addr) => ({
    address: addr.address,
    name: addr.name,
    status: addr.status,
    riskScore: addr.riskScore,
    category: addr.category,
    logoUrl: addr.logoUrl,
    url: addr.url,
    tags: addr.tags.map((t) => t.tag),
    matchType: addr.address.toLowerCase().includes(searchQuery) ? 'address' : 'name',
  }));
}

/**
 * Get popular dApps (by TVL)
 */
export async function getPopularDApps(limit: number = 10): Promise<any[]> {
  const addresses = await prisma.address.findMany({
    where: {
      source: 'EXTERNAL',
      status: { in: ['LEGIT', 'UNKNOWN'] },
      tvl: { not: null },
      chain: 'base',
    },
    orderBy: { tvl: 'desc' },
    take: limit,
    include: {
      tags: true,
    },
  });

  return addresses.map((addr) => ({
    address: addr.address,
    name: addr.name,
    category: addr.category,
    tvl: addr.tvl ? Number(addr.tvl) : 0,
    logoUrl: addr.logoUrl,
    url: addr.url,
    tags: addr.tags.map((t) => t.tag),
  }));
}

/**
 * Get trending dApps (most scanned recently)
 */
export async function getTrendingDApps(limit: number = 10): Promise<any[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const addresses = await prisma.address.findMany({
    where: {
      scans: {
        some: {
          createdAt: { gte: sevenDaysAgo },
        },
      },
    },
    include: {
      tags: true,
      scans: {
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true },
      },
    },
    take: limit * 2, // Get more to sort by scan count
  });

  // Sort by scan count and map
  return addresses
    .sort((a, b) => b.scans.length - a.scans.length)
    .slice(0, limit)
    .map((addr) => ({
      address: addr.address,
      name: addr.name,
      category: addr.category,
      status: addr.status,
      riskScore: addr.riskScore,
      logoUrl: addr.logoUrl,
      url: addr.url,
      tags: addr.tags.map((t) => t.tag),
      scanCount: addr.scans.length,
    }));
}

/**
 * Get similar addresses
 */
export async function getSimilarAddresses(
  address: string,
  limit: number = 5
): Promise<any[]> {
  const target = await prisma.address.findUnique({
    where: { address: address.toLowerCase() },
    include: { tags: true },
  });

  if (!target) {
    return [];
  }

  // Find similar by category and name
  const orConditions: any[] = [{ category: target.category }];
  if (target.name) {
    orConditions.push({ name: { contains: target.name.split(' ')[0], mode: 'insensitive' } });
  }

  const similar = await prisma.address.findMany({
    where: {
      address: { not: address.toLowerCase() },
      OR: orConditions,
    },
    take: limit * 2,
    include: {
      tags: true,
    },
  });

  // Calculate similarity score and sort
  const scored = similar.map((addr) => {
    let score = 0;

    if (addr.category === target.category) score += 50;
    if (addr.status === target.status) score += 20;

    // Tag overlap
    const targetTags = target.tags?.map((t) => t.tag) || [];
    const addrTags = addr.tags.map((t) => t.tag);
    const overlap = targetTags.filter((t) => addrTags.includes(t)).length;
    score += overlap * 15;

    return { ...addr, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...addr }) => ({
      address: addr.address,
      name: addr.name,
      category: addr.category,
      status: addr.status,
      riskScore: addr.riskScore,
      logoUrl: addr.logoUrl,
      url: addr.url,
    }));
}

/**
 * Update address metadata
 */
export async function updateAddress(
  address: string,
  updates: Partial<{
    name: string;
    description: string;
    url: string;
    logoUrl: string;
    category: AddressCategory;
    status: AddressStatus;
    riskScore: number;
  }>
): Promise<Address> {
  const updated = await prisma.address.update({
    where: { address: address.toLowerCase() },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
    include: {
      tags: true,
      sourceLinks: true,
    },
  });

  return updated as Address;
}

/**
 * Add tag to address
 */
export async function addTagToAddress(
  address: string,
  label: string,
  type: string = 'MANUAL'
): Promise<any> {
  // First get the address by address string to get the ID
  const addr = await prisma.address.findUnique({
    where: { address: address.toLowerCase() },
    select: { id: true },
  });

  if (!addr) {
    throw new Error('Address not found');
  }

  const tag = await prisma.addressTag.create({
    data: {
      addressId: addr.id,
      tag: label,
      taggedBy: type,
    },
  });

  return tag;
}

/**
 * Remove tag from address
 */
export async function removeTagFromAddress(tagId: string): Promise<void> {
  await prisma.addressTag.delete({
    where: { id: tagId },
  });
}

/**
 * Helper: Get risk level from score
 */
function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
