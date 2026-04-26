/**
 * Domain Service
 *
 * Service for checking and managing scam/phishing domains.
 */

import prisma from '@/lib/prisma';
import type { ScamDomain } from '@prisma/client';

/**
 * Check if a domain is a known scam
 * @param domain Domain to check (e.g., "fake-base-airdrop.xyz")
 * @returns Domain check result
 */
export async function checkDomain(domain: string): Promise<{
  isScam: boolean;
  riskScore: number;
  category: string;
  description?: string;
  source?: string;
}> {
  try {
    // Clean domain - remove protocol, www, and path
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    // Check database
    const scamDomain = await prisma.scamDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (!scamDomain) {
      return {
        isScam: false,
        riskScore: 0,
        category: 'UNKNOWN',
      };
    }

    return {
      isScam: scamDomain.status === 'ACTIVE',
      riskScore: scamDomain.riskScore,
      category: scamDomain.category,
      description: scamDomain.description || undefined,
      source: scamDomain.source,
    };
  } catch (error) {
    console.error('Domain check failed:', error);
    return {
      isScam: false,
      riskScore: 0,
      category: 'UNKNOWN',
    };
  }
}

/**
 * List scam domains with pagination and filters
 */
export async function listScamDomains(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  minRiskScore?: number;
}) {
  const { page = 1, limit = 20, search, category, status, minRiskScore } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status.toUpperCase();
  }

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { domain: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minRiskScore !== undefined) {
    where.riskScore = { gte: minRiskScore };
  }

  const [domains, total] = await Promise.all([
    prisma.scamDomain.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.scamDomain.count({ where }),
  ]);

  return {
    data: domains,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all addresses associated with a scam domain
 * Note: This function returns empty array since we don't store domain-address mappings
 * @param domain Scam domain
 * @returns Empty array
 */
export async function getAddressesForDomain(domain: string): Promise<string[]> {
  // Domain-address mappings no longer stored
  return [];
}

/**
 * Get all domains associated with a scam address
 * Note: This function returns empty array since we don't store domain-address mappings
 * @param address Scam address
 * @returns Empty array
 */
export async function getDomainsForAddress(address: string): Promise<ScamDomain[]> {
  // Domain-address mappings no longer stored
  return [];
}

/**
 * Add or update scam domain
 */
export async function upsertScamDomain(data: {
  domain: string;
  name?: string;
  category?: string;
  description?: string;
  source?: string;
  riskScore?: number;
}) {
  const { domain, ...domainData } = data;

  // Clean domain
  const cleanDomain = domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  // Upsert domain
  const scamDomain = await prisma.scamDomain.upsert({
    where: { domain: cleanDomain },
    update: domainData,
    create: {
      domain: cleanDomain,
      ...domainData,
    },
  });

  return scamDomain;
}

/**
 * Batch check multiple domains
 */
export async function batchCheckDomains(domains: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  await Promise.all(
    domains.map(async (domain) => {
      const cleanDomain = domain
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      const exists = await prisma.scamDomain.findUnique({
        where: { domain: cleanDomain },
        select: { id: true },
      });

      results[cleanDomain] = !!exists;
    })
  );

  return results;
}
