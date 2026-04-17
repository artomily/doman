/**
 * ENS Service
 *
 * Service for resolving ENS names and caching results.
 * Supports Base mainnet ENS resolution.
 */

import { ensClient } from '@/lib/viem';
import prisma from '@/lib/prisma';
import type { EnsRecord } from '@prisma/client';

const ENS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const BASE_ENS_REGISTRY = '0x283af0b28c62b091ab3f7cd9e93c4a33eb20119b'; // Base ENS registry

/**
 * Resolve ENS name to address
 * @param ensName ENS name (e.g., "vitalik.eth" or "vitalik")
 * @returns Address or null
 */
export async function resolveEns(ensName: string): Promise<string | null> {
  try {
    // Normalize ENS name - ensure it ends with .eth for resolution
    let fullName = ensName.toLowerCase();
    if (!fullName.endsWith('.eth')) {
      fullName = `${fullName}.eth`;
    }

    // Store without .eth suffix for database lookup
    const normalizedName = fullName.replace(/\.eth$/, '');

    // Check cache first
    const cached = await prisma.ensRecord.findUnique({
      where: { ensName: normalizedName },
    });

    if (cached) {
      const cacheAge = Date.now() - cached.lastChecked.getTime();
      if (cacheAge < ENS_CACHE_DURATION) {
        return cached.addressId;
      }
    }

    // Resolve using viem with full name
    const address = await ensClient.getEnsAddress({
      name: fullName,
    });

    if (!address) {
      return null;
    }

    // Get avatar
    let avatar: string | null = null;
    try {
      avatar = await ensClient.getEnsAvatar({
        name: fullName,
      });
    } catch {
      // Avatar resolution failed, continue without it
    }

    // Upsert to database
    await prisma.ensRecord.upsert({
      where: { ensName: normalizedName },
      update: {
        addressId: address,
        fullName,
        avatar,
        lastChecked: new Date(),
      },
      create: {
        addressId: address,
        ensName: normalizedName,
        fullName,
        avatar,
      },
    });

    return address;
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return null;
  }
}

/**
 * Reverse resolve address to ENS name
 * @param address Ethereum address
 * @returns ENS name or null
 */
export async function reverseResolveEns(address: string): Promise<string | null> {
  try {
    // Check cache first
    const cached = await prisma.ensRecord.findFirst({
      where: { addressId: address },
    });

    if (cached) {
      const cacheAge = Date.now() - cached.lastChecked.getTime();
      if (cacheAge < ENS_CACHE_DURATION) {
        return cached.ensName;
      }
    }

    // Reverse resolve using viem
    const ensName = await ensClient.getEnsName({
      address: address as `0x${string}`,
    });

    if (!ensName) {
      return null;
    }

    const normalizedName = ensName.toLowerCase().replace(/\.eth$/, '');

    // Upsert to database
    await prisma.ensRecord.upsert({
      where: { ensName: normalizedName },
      update: {
        addressId: address,
        fullName: ensName,
        lastChecked: new Date(),
      },
      create: {
        addressId: address,
        ensName: normalizedName,
        fullName: ensName,
      },
    });

    return ensName;
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
    let avatar: string | null = null;

    // Check if it's an ENS name or address
    if (identifier.includes('.')) {
      avatar = await ensClient.getEnsAvatar({
        name: identifier,
      });
    } else {
      // For address, first get ENS name, then get avatar
      const ensName = await reverseResolveEns(identifier);
      if (ensName) {
        avatar = await ensClient.getEnsAvatar({
          name: ensName,
        });
      }
    }

    return avatar;
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
    const normalizedName = ensName.toLowerCase().replace(/\.eth$/, '');

    const address = await ensClient.getEnsAddress({
      name: normalizedName,
    });

    if (!address) {
      // Delete if no longer resolves
      await prisma.ensRecord.delete({
        where: { ensName: normalizedName },
      });
      return false;
    }

    // Update cache
    await prisma.ensRecord.upsert({
      where: { ensName: normalizedName },
      update: {
        addressId: address,
        lastChecked: new Date(),
      },
      create: {
        addressId: address,
        ensName: normalizedName,
        fullName: `${normalizedName}.eth`,
      },
    });

    return true;
  } catch (error) {
    console.error('ENS refresh failed:', error);
    return false;
  }
}
