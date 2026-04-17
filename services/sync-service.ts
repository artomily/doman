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
import type { SyncResult, BatchSyncResult } from '@/types/models';

/**
 * Sync DeFiLlama protocols (Base chain)
 */
export async function syncDefiLlama(): Promise<SyncResult> {
  const startTime = Date.now();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  try {
    const response = await fetch(
      `${EXTERNAL_APIS.DEFILLAMA.BASE_URL}${EXTERNAL_APIS.DEFILLAMA.PROTOCOLS_ENDPOINT}`
    );

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const protocols = await response.json();

    // Filter Base protocols
    const baseProtocols = protocols.filter((p: any) =>
      p.chain?.toLowerCase() === 'base' || p.chains?.includes('Base')
    );

    for (const protocol of baseProtocols) {
      const addressData = {
        address: protocol.address?.[0] || '',
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
          ...addressData,
          status: 'UNKNOWN',
          riskScore: 0,
          chain: 'base',
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
            addressId: addressData.address,
            source: 'defillama',
            sourceId: protocol.name || '',
          },
        },
        update: {
          data: {
            sourceUrl: protocol.url,
            rawData: protocol,
            syncedAt: new Date(),
          },
        },
        create: {
          data: {
            addressId: addressData.address,
            source: 'defillama',
            sourceId: protocol.name || '',
            sourceUrl: protocol.url,
            rawData: protocol,
          },
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
      syncLogId: 'defillama-' + Date.now(),
      duration: Date.now() - startTime,
    };
  } catch (error) {
    // Log error
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

    throw error;
  }
}

/**
 * Helper: Categorize DeFiLlama protocol
 */
function categorizeProtocol(category: string): string {
  const cat = category?.toLowerCase() || '';
  const categoryMap: Record<string, string> = {
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
 */
export async function syncScamSniffer(): Promise<SyncResult> {
  const startTime = Date.now();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  try {
    // Fetch from raw GitHub
    const response = await fetch(
      'https://raw.githubusercontent.com/scamsniffer/scam-database/main/scams.json'
    );

    if (!response.ok) {
      throw new Error(`ScamSniffer fetch error: ${response.status}`);
    }

    const scams = await response.json();

    // Process each scam
    for (const scam of scams.slice(0, 100)) {
      // Limit to 100 per sync
      const addressData = {
        address: scam.address,
        name: scam.name,
        category: scam.category?.toUpperCase() || 'OTHER',
        description: scam.description,
        url: scam.url,
        source: 'EXTERNAL' as const,
      };

      // Upsert as SCAM
      await prisma.address.upsert({
        where: { address: addressData.address },
        update: {
          data: {
            name: addressData.name,
            description: addressData.description,
            url: addressData.url,
            updatedAt: new Date(),
          },
        },
        create: {
          data: {
            ...addressData,
            status: 'SCAM',
            riskScore: 80,
            chain: 'base',
          },
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

      // Add external source
      await prisma.externalSource.upsert({
        where: {
          addressId_source_sourceId: {
            addressId: addressData.address,
            source: 'scamsniffer',
            sourceId: scam.name || '',
          },
        },
        create: {
          data: {
            addressId: addressData.address,
            source: 'scamsniffer',
            sourceId: scam.name || '',
            sourceUrl: scam.url,
            rawData: scam,
          },
        },
      });
    }

    await prisma.syncLog.create({
      data: {
        source: 'scamsniffer',
        status: 'success',
        recordsAdded,
        recordsUpdated,
        completedAt: new Date(),
      },
    });

    return {
      source: 'scamsniffer',
      status: 'success',
      recordsAdded,
      recordsUpdated,
      syncLogId: 'scamsniffer-' + Date.now(),
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
 */
export async function syncCryptoScamDB(): Promise<SyncResult> {
  const startTime = Date.now();
  let recordsAdded = 0;
  let recordsUpdated = 0;

  try {
    // Fetch from CryptoScamDB
    const response = await fetch('https://cryptoscamdb.org/api/scams');

    if (!response.ok) {
      throw new Error(`CryptoScamDB error: ${response.status}`);
    }

    const scams = await response.json();

    // Process each scam
    for (const scam of scams.slice(0, 50)) {
      const addressData = {
        address: scam.address,
        name: scam.name,
        category: scam.category?.toUpperCase() || 'PHISHING',
        description: scam.description,
        url: scam.url,
        source: 'EXTERNAL' as const,
      };

      await prisma.address.upsert({
        where: { address: addressData.address },
        create: {
          data: {
            ...addressData,
            status: 'SCAM',
            riskScore: 85,
            chain: 'base',
          },
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
      syncLogId: 'cryptoscamdb-' + Date.now(),
      duration: Date.now() - startTime,
    };
  } catch (error) {
    await prisma.syncLog.create({
      data: {
        source: 'cryptoscamdb',
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
 * Run all syncs
 */
export async function runAllSyncs(): Promise<BatchSyncResult> {
  const results = await Promise.allSettled([
    syncDefiLlama(),
    syncScamSniffer(),
    syncCryptoScamDB(),
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
    hasErrors: failed.length > 0,
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
