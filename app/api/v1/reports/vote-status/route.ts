/**
 * Vote Status Check Endpoint
 * GET /api/v1/reports/vote-status?address=xxx&voterAddress=xxx
 *
 * Check whether a wallet has already voted on any report for a given address.
 * Returns the vote type and report ID if found.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const voterAddress = searchParams.get('voterAddress');

    if (!address || !voterAddress) {
      return errors.validation('address and voterAddress query params are required');
    }

    // Find the address record
    const addressRecord = await prisma.address.findUnique({
      where: { address },
      select: { id: true },
    });

    if (!addressRecord) {
      return apiSuccess({ hasVoted: false, voteType: null, reportId: null });
    }

    // Find any vote by this voter on any report for this address
    const vote = await prisma.vote.findFirst({
      where: {
        voterAddress,
        report: {
          addressId: addressRecord.id,
        },
      },
      select: {
        vote: true,
        reportId: true,
      },
    });

    return apiSuccess({
      hasVoted: !!vote,
      voteType: vote?.vote ?? null,
      reportId: vote?.reportId ?? null,
    });
  });
}
