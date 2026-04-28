/**
 * ENS Resolution API
 *
 * GET /api/v1/resolve/[ens]
 * Resolve an ENS name to its associated address
 *
 * Examples:
 * - /api/v1/resolve/vitalik.eth
 * - /api/v1/resolve/vitalik
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveEns } from '@/services/ens-service';
import { apiSuccess, apiError } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const paramsSchema = z.object({
  ens: z.string().min(1),
});

/**
 * GET /api/v1/resolve/[ens]
 * Resolve ENS name to address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ens: string }> }
) {
  try {
    const { ens } = await params;

    // Validate input
    const validated = paramsSchema.safeParse({ ens });
    if (!validated.success) {
      return apiError('INVALID_REQUEST', 'Invalid ENS name', undefined, 400);
    }

    const ensName = validated.data.ens;

    // Resolve ENS
    const address = await resolveEns(ensName);

    if (!address) {
      return apiError('NOT_FOUND', `ENS name '${ensName}' not found or does not resolve to an address`, undefined, 404);
    }

    const checker = request.nextUrl.searchParams.get('checker') ?? undefined;
    const resolvedData = {
      ens: ensName.endsWith('.eth') ? ensName : `${ensName}.eth`,
      address,
      resolvedAt: new Date().toISOString(),
    };

    // Record search history (fire-and-forget)
    prisma.searchHistory.create({
      data: {
        checkerAddress: checker ?? null,
        searchType: 'ens',
        query: resolvedData.ens,
        resolvedTo: address,
        riskScore: 0,
        riskLevel: 'LOW',
        result: resolvedData as any,
      },
    }).catch(() => {});

    return apiSuccess(resolvedData);
  } catch (error) {
    console.error('ENS resolution error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to resolve ENS name', undefined, 500);
  }
}

/**
 * OPTIONS - for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
