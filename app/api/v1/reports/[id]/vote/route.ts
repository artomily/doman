/**
 * Vote on Report Endpoint
 * POST /api/v1/reports/[id]/vote
 *
 * Vote on a community report (FOR or AGAINST).
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { voteSchema } from '@/lib/validation';
import { withRateLimiting } from '@/middleware/security';
import { voteOnReport } from '@/services/report-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    // Apply rate limiting (medium for voting)
    await withRateLimiting(request, 'medium');

    // Parse and validate request body
    const body = await request.json();
    const validationResult = voteSchema.safeParse(body);
    if (!validationResult.success) {
      return errors.validation('Invalid vote data', validationResult.error.errors);
    }

    // Submit vote
    const report = await voteOnReport(
      id,
      validationResult.data.vote,
      validationResult.data.voterAddress,
      validationResult.data.txHash || undefined
    );

    return apiSuccess({
      reportId: report.id,
      votesFor: report.votesFor,
      votesAgainst: report.votesAgainst,
      status: report.status,
      message:
        report.status === 'PENDING'
          ? 'Vote recorded. Waiting for more votes.'
          : `Report ${report.status.toLowerCase()}.`,
    });
  });
}
