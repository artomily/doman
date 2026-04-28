/**
 * Sync Service
 *
 * Service for syncing data from external sources:
 * - DeFiLlama (Base dApps)
 * ScamSniffer (scam database)
 * CryptoScamDB (phishing data)
 * Base Registry (official dApps)
 */

import prisma from '@/lib/prisma';
import { EXTERNAL_APIS } from '@/lib/constants';
import { isValidAddress } from '@/lib/viem';
import type { SyncResult, BatchSyncResult } from '@/types/models';

function normalizeAddress(value: string | undefined | null): `0x${string}` | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!isValidAddress(trimmed)) return null;
  return trimmed.toLowerCase() as `0x${string}`;
}

/**
 * Sync DeFiLlama protocols (Base chain)
 *
 * NOTE: DeFiLlama API may be unreliable. This function is kept for reference
 * but the primary sync source is ScamSniffer.
 */
export async function syncDefiLlama(): Promise<SyncResult> {
  const startTime = Date.now();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${EXTERNAL_APIS.DEFILLAMA.BASE_URL}${EXTERNAL_APIS.DEFILLAMA.PROTOCOLS_ENDPOINT}`,
      { signal: controller.signal }
    ).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const protocols = await response.json();

    // Filter Base protocols
    const baseProtocols = protocols.filter((p: any) =>
      p.chain?.toLowerCase() === 'base' || p.chains?.includes('Base')
    );

    for (const protocol of baseProtocols) {
      const normalizedAddress = normalizeAddress(protocol.address?.[0]);
      if (!normalizedAddress) continue;

      const addressData = {
        address: normalizedAddress,
        name: protocol.name,
        category: categorizeProtocol(protocol.category),
        description: protocol.description,
        url: protocol.url,
        logoUrl: protocol.logo,
        tvl: protocol.tvl || 0,
        source: 'EXTERNAL' as const,
      };

      // Upsert address
      await prisma.address.upsert({
        where: { address: addressData.address },
        update: {
          name: addressData.name,
          tvl: addressData.tvl,
          url: addressData.url,
          logoUrl: addressData.logoUrl,
          description: addressData.description,
        },
        create: {
          address: addressData.address,
          name: addressData.name,
          category: addressData.category as any,
          description: addressData.description,
          url: addressData.url,
          logoUrl: addressData.logoUrl,
          tvl: addressData.tvl,
          status: 'UNKNOWN',
          riskScore: 0,
          chain: 'base',
          source: 'EXTERNAL',
        },
      });

      // Track upsert
      const existing = await prisma.address.findUnique({
        where: { address: addressData.address },
      });

      if (existing) {
        recordsUpdated++;
      } else {
        recordsAdded++;
      }

      // Add external source reference
      await prisma.externalSource.upsert({
        where: {
          addressId_source_sourceId: {
            addressId: existing!.id,
            source: 'defillama',
            sourceId: protocol.name || '',
          },
        },
        update: {
          sourceUrl: protocol.url,
          rawData: protocol,
          syncedAt: new Date(),
          lastSeenAt: new Date(),
        },
        create: {
          addressId: addressData.address,
          source: 'defillama',
          sourceId: protocol.name || '',
          sourceUrl: protocol.url,
          rawData: protocol,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        },
      });
    }

    // Log sync
    await prisma.syncLog.create({
      data: {
        source: 'defillama',
        status: 'success',
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
      },
    });

    return {
      source: 'defillama',
      status: 'success',
      recordsAdded,
      recordsUpdated,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    // Log error but return gracefully
    console.warn('DeFiLlama sync failed:', error instanceof Error ? error.message : 'Unknown error');

    await prisma.syncLog.create({
      data: {
        source: 'defillama',
        status: 'failed',
        recordsAdded: 0,
        recordsUpdated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    return {
      source: 'defillama',
      status: 'failed',
      recordsAdded: 0,
      recordsUpdated: 0,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper: Categorize DeFiLlama protocol
 */
function categorizeProtocol(category: string): 'DEX' | 'LENDING' | 'BRIDGE' | 'NFT' | 'DEFI' | 'OTHER' {
  const cat = category?.toLowerCase() || '';
  const categoryMap: Record<string, 'DEX' | 'LENDING' | 'BRIDGE' | 'NFT' | 'DEFI' | 'OTHER'> = {
    dex: 'DEX',
    lending: 'LENDING',
    'yield': 'LENDING',
    bridge: 'BRIDGE',
    exchanges: 'DEX',
    'nft marketplace': 'NFT',
    options: 'DEFI',
    insurance: 'DEFI',
    prediction: 'DEFI',
    derivative: 'DEFI',
    algo: 'DEFI',
    'asset management': 'DEFI',
  };

  return categoryMap[cat] || 'OTHER';
}

/**
 * Sync from ScamSniffer (GitHub repository)
 *
 * Uses the working ScamSniffer blacklist endpoints:
 * - combined.json: Combined address and domain data (primary source)
 * - address.json: Scam contract addresses (fallback)
 *
 * Handles both wallet addresses (0x...) and phishing domains
 */
export async function syncScamSniffer(): Promise<SyncResult> {
  const startTime = Date.now();
  let addressesAdded = 0;
  let addressesUpdated = 0;
  let domainsAdded = 0;
  let domainsUpdated = 0;

  try {
    // Use all.json - up to date list with both addresses and domains
    // Format: { "address": ["0x...", ...], "domain": ["domain.com", ...], "combined": {} }
    const allUrl = 'https://raw.githubusercontent.com/scamsniffer/scam-database/refs/heads/main/blacklist/all.json';

    const response = await fetch(allUrl);
    if (!response.ok) {
      throw new Error(`ScamSniffer API error: ${response.status}`);
    }

    const data: { address?: string[]; domain?: string[] } = await response.json();
    const addresses = data.address ?? [];
    const domains = data.domain ?? [];

    // Process scam addresses (limit to 100 per sync)
    for (const address of addresses.slice(0, 100)) {
      const normalized = normalizeAddress(address);
      if (!normalized) continue;
      const existing = await prisma.address.findUnique({
        where: { address: normalized },
      });

      const record = await prisma.address.upsert({
        where: { address: normalized },
        update: {
          description: 'Flagged by ScamSniffer',
          updatedAt: new Date(),
        },
        create: {
          address: normalized,
          status: 'SCAM',
          riskScore: 80,
          category: 'OTHER',
          source: 'EXTERNAL',
          chain: 'base',
          description: 'Flagged by ScamSniffer',
        },
      });

      if (existing) {
        addressesUpdated++;
      } else {
        addressesAdded++;
      }
    }

    // Process scam domains
    if (Array.isArray(data.domain)) {
      for (const domain of data.domain.slice(0, 500)) { // Limit to 500 per sync
        if (!domain || typeof domain !== 'string') continue;

        // Clean domain name
        const cleanDomain = domain.replace(/^www\./, '').toLowerCase().trim();

        // Skip invalid domains
        if (!cleanDomain.includes('.')) continue;

        const existing = await prisma.scamDomain.findUnique({
          where: { domain: cleanDomain },
        });

        await prisma.scamDomain.upsert({
          where: { domain: cleanDomain },
          update: {
            status: 'ACTIVE',
          },
          create: {
            domain: cleanDomain,
            name: cleanDomain,
            category: 'PHISHING',
            riskScore: 90,
            status: 'ACTIVE',
            source: 'scamsniffer',
          },
        });
      };
    }

    // Process scam domains (limit to 100 per sync)
    for (const domain of domains.slice(0, 100)) {
      const normalized = domain?.trim().toLowerCase();
      if (!normalized) {
        continue;
      }

      const existing = await prisma.scamDomain.findUnique({
        where: { domain: normalized },
      });

      await prisma.scamDomain.upsert({
        where: { domain: normalized },
        update: {
          description: 'Flagged by ScamSniffer',
          rawData: { domain: normalized },
          updatedAt: new Date(),
        },
        create: {
          domain: normalized,
          category: 'PHISHING',
          status: 'ACTIVE',
          source: 'scamsniffer',
          riskScore: 80,
          description: 'Flagged by ScamSniffer',
          rawData: { domain: normalized },
        },
      });

      if (existing) {
        domainsUpdated++;
      } else {
        domainsAdded++;
      }
    }

    // Log sync result
    await prisma.syncLog.create({
      data: {
        source: 'scamsniffer',
        status: 'success',
        recordsAdded: addressesAdded + domainsAdded,
        recordsUpdated: addressesUpdated + domainsUpdated,
        completedAt: new Date(),
      },
    });

    return {
      source: 'scamsniffer',
      status: 'success',
      recordsAdded: addressesAdded + domainsAdded,
      recordsUpdated: addressesUpdated + domainsUpdated,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    await prisma.syncLog.create({
      data: {
        source: 'scamsniffer',
        status: 'failed',
        recordsAdded: 0,
        recordsUpdated: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

/**
 * Sync from CryptoScamDB
 *
 * Note: This API may be unreliable. The function includes fallback handling.
 * API endpoint: https://cryptoscamdb.org/api/scams
 */
export async function syncCryptoScamDB(): Promise<SyncResult> {
  const startTime = Date.now();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  try {
    // Fetch from CryptoScamDB with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://cryptoscamdb.org/api/scams', {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`CryptoScamDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response formats
    const scams = Array.isArray(data) ? data : (data?.scams || data?.results || []);

    if (scams.length === 0) {
      console.warn('CryptoScamDB returned no data');
      return {
        source: 'cryptoscamdb',
        status: 'success',
        recordsAdded: 0,
        recordsUpdated: 0,
        duration: Date.now() - startTime,
      };
    }

    // Process each scam - limit to 50 per sync
    for (const scam of scams.slice(0, 50)) {
      // Handle various data formats
      const address = scam.address || scam.contract_address || scam.hash;
      if (!address || !address.startsWith('0x')) continue;

      const addressData = {
        address,
        name: scam.name || scam.project || 'Unknown Scam',
        category: (scam.category || scam.type || 'PHISHING')?.toUpperCase() || 'PHISHING',
        description: scam.description || scam.details || 'Flagged by CryptoScamDB',
        url: scam.url || scam.website || undefined,
      };

      await prisma.address.upsert({
        where: { address: addressData.address },
        update: {
          name: addressData.name,
          description: addressData.description,
          url: addressData.url,
        },
        create: {
          address: addressData.address,
          name: addressData.name,
          category: addressData.category as any,
          description: addressData.description,
          url: addressData.url,
          status: 'SCAM',
          riskScore: 85,
          chain: 'base',
          source: 'EXTERNAL',
        },
      });

      const existing = await prisma.address.findUnique({
        where: { address: addressData.address },
      });

      if (existing) {
        recordsUpdated++;
      } else {
        recordsAdded++;
      }
    }

    await prisma.syncLog.create({
      data: {
        source: 'cryptoscamdb',
        status: 'success',
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
      },
    });

    return {
      source: 'cryptoscamdb',
      status: 'success',
      recordsAdded,
      recordsUpdated,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    // Log error but don't throw - allow sync to continue
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('CryptoScamDB sync failed:', errorMessage);

    await prisma.syncLog.create({
      data: {
        source: 'cryptoscamdb',
        status: 'failed',
        recordsAdded: 0,
        recordsUpdated: 0,
        error: errorMessage,
        completedAt: new Date(),
      },
    });

    // Return partial success instead of throwing
    return {
      source: 'cryptoscamdb',
      status: 'failed',
      recordsAdded: 0,
      recordsUpdated: 0,
      duration: Date.now() - startTime,
      error: errorMessage,
    };
  }
}

/**
 * Run all syncs
 * Continues even if individual syncs fail
 */
export async function runAllSyncs(): Promise<BatchSyncResult> {
  const results = await Promise.allSettled([
    syncDefiLlama().catch((e): SyncResult => {
      console.error('DeFiLlama sync failed:', e.message);
      return { source: 'defillama', status: 'failed', recordsAdded: 0, recordsUpdated: 0, duration: 0, error: e.message };
    }),
    syncScamSniffer().catch((e): SyncResult => {
      console.error('ScamSniffer sync failed:', e.message);
      return { source: 'scamsniffer', status: 'failed', recordsAdded: 0, recordsUpdated: 0, duration: 0, error: e.message };
    }),
    syncCryptoScamDB().catch((e): SyncResult => {
      console.error('CryptoScamDB sync failed:', e.message);
      return { source: 'cryptoscamdb', status: 'failed', recordsAdded: 0, recordsUpdated: 0, duration: 0, error: e.message };
    }),
  ]);

  const successful = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  const totalAdded = successful.reduce(
    (sum, r) => sum + (r.value.recordsAdded || 0),
    0
  );
  const totalUpdated = successful.reduce(
    (sum, r) => sum + (r.value.recordsUpdated || 0),
    0
  );

  return {
    results: successful.map((r) => r.value),
    totalAdded,
    totalUpdated,
    totalDuration: Date.now(),
    hasErrors: failed.length > 0 || successful.some((r) => r.value.status === 'failed'),
  };
}

/**
 * Get sync logs
 */
export async function getSyncLogs(limit: number = 50) {
  return prisma.syncLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}
