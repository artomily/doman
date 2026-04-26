/**
 * Watchlist Endpoints
 * GET  /api/v1/watchlist?userAddress=0x...  - list watchlist entries
 * POST /api/v1/watchlist                    - add address to watchlist
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addWatchlistSchema = z.object({
  userAddress: addressSchema,
  watchedAddress: addressSchema,
});

type WatchlistEntry = {
  id: string;
  userAddress: string;
  createdAt: Date;
  address: {
    address: string;
    riskScore: number | null;
    status: string | null;
    chain: string | null;
    scans: Array<{
      riskScore: number | null;
      createdAt: Date;
    }>;
  };
};

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const userAddress = request.nextUrl.searchParams.get('userAddress');

    if (!userAddress) {
      return errors.validation('userAddress query param is required');
    }

    const parsed = addressSchema.safeParse(userAddress);
    if (!parsed.success) {
      return errors.invalidAddress(parsed.error.errors);
    }

    const entries: WatchlistEntry[] = await prisma.watchlist.findMany({
      where: { userAddress: parsed.data },
      include: {
        address: {
          select: {
            address: true,
            riskScore: true,
            status: true,
            chain: true,
            scans: {
              orderBy: { createdAt: 'desc' },
              take: 2,
              select: { riskScore: true, createdAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with live address data
    const enriched = entries.map((entry) => {
      const addr = entry.address;
      const currentScore = addr.riskScore ?? null;
      const prevScore = addr.scans[1]?.riskScore ?? currentScore;

      return {
        id: entry.id,
        userAddress: entry.userAddress,
        watchedAddress: addr.address,
        createdAt: entry.createdAt.toISOString(),
        score: currentScore,
        prevScore,
        status: addr.status ?? 'UNKNOWN',
        chain: addr.chain ?? '—',
        lastChecked: addr.scans[0]?.createdAt.toISOString() ?? null,
      };
    });

    return apiSuccess(enriched);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const parsed = addWatchlistSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation('Invalid input', parsed.error.errors);
    }

    const { userAddress, watchedAddress } = parsed.data;

    // Find or create the watched address
    let watchedAddressRecord = await prisma.address.findUnique({
      where: { address: watchedAddress },
    });

    if (!watchedAddressRecord) {
      watchedAddressRecord = await prisma.address.create({
        data: {
          address: watchedAddress,
        },
      });
    }

    // Upsert UserProfile so FK constraint is satisfied
    await prisma.userProfile.upsert({
      where: { address: userAddress },
      create: { address: userAddress },
      update: {},
    });

    const entry = await prisma.watchlist.upsert({
      where: {
        userAddress_addressId: {
          userAddress,
          addressId: watchedAddressRecord.id,
        },
      },
      create: { userAddress, addressId: watchedAddressRecord.id },
      update: {},
    });

    return apiSuccess(entry);
  });
}
