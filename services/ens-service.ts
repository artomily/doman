/**
 * ENS Service
 *
 * Service for resolving ENS names and caching results.
 * Uses public web API for ENS resolution.
 */

import prisma from '@/lib/prisma';
import type { EnsRecord } from '@prisma/client';

const ENS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Resolve ENS name to address
 * Note: ENS resolution requires Infura/Alchemy Web3 API with ENS support
 * For MVP, we return cached results only
 * @param ensName ENS name (e.g., "vitalik.eth" or "vitalik")
 * @returns Address or null
 */
export async function resolveEns(ensName: string): Promise<string | null> {
  try {
    // Normalize ENS name
    let fullName = ensName.toLowerCase();
    if (!fullName.endsWith('.eth')) {
      fullName = `${fullName}.eth`;
    }

    // Store without .eth suffix for database lookup
    const normalizedName = fullName.replace(/\.eth$/, '');

    // Check cache first - we only support cached ENS records for now
    const cached = await prisma.ensRecord.findUnique({
      where: { ensName: normalizedName },
    });

    if (cached) {
      const cacheAge = Date.now() - cached.lastChecked.getTime();
      if (cacheAge < ENS_CACHE_DURATION) {
        return cached.addressId;
      }
    }

    // ENS resolution not configured - requires Infura/Alchemy with Web3 API
    // For production, set ETHEREUM_RPC_URL to Infura/Alchemy Web3 HTTP endpoint
    return null;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}

/**
 * Reverse resolve address to ENS name
 * Note: Only returns cached ENS records
 * @param address Ethereum address
 * @returns ENS name or null
 */
export async function reverseResolveEns(address: string): Promise<string | null> {
  try {
    // Check cache - we only support cached ENS records for now
    const cached = await prisma.ensRecord.findFirst({
      where: { addressId: address },
    });

    if (cached) {
      return cached.fullName;
    }

    return null;
  } catch (error) {
    console.error('ENS reverse resolution failed:', error);
    return null;
  }
}

/**
 * Get ENS avatar for address or name
 * @param identifier Address or ENS name
 * @returns Avatar URL or null
 */
export async function getEnsAvatar(identifier: string): Promise<string | null> {
  try {
    // For now, return null - avatar resolution requires more complex setup
    // Can be implemented later with proper ENS NFT resolution
    return null;
  } catch (error) {
    console.error('ENS avatar fetch failed:', error);
    return null;
  }
}

/**
 * Get all ENS records for an address
 * @param address Ethereum address
 * @returns Array of ENS records
 */
export async function getEnsRecordsForAddress(address: string): Promise<EnsRecord[]> {
  try {
    const records = await prisma.ensRecord.findMany({
      where: { addressId: address },
      orderBy: { lastChecked: 'desc' },
    });

    return records;
  } catch (error) {
    console.error('Failed to fetch ENS records:', error);
    return [];
  }
}

/**
 * Batch resolve multiple ENS names
 * @param ensNames Array of ENS names
 * @returns Map of ENS name to address
 */
export async function batchResolveEns(ensNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  await Promise.all(
    ensNames.map(async (ensName) => {
      const normalizedName = ensName.toLowerCase().replace(/\.eth$/, '');
      const address = await resolveEns(normalizedName);
      results[normalizedName] = address;
    })
  );

  return results;
}

/**
 * Refresh cached ENS record
 * @param ensName ENS name to refresh
 */
export async function refreshEnsRecord(ensName: string): Promise<boolean> {
  try {
    const address = await resolveEns(ensName);

    if (!address) {
      // Delete if no longer resolves
      const normalizedName = ensName.toLowerCase().replace(/\.eth$/, '');
      await prisma.ensRecord.delete({
        where: { ensName: normalizedName },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('ENS refresh failed:', error);
    return false;
  }
}
