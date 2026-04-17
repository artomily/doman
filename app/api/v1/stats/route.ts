/**
 * Platform Statistics Endpoint
 * GET /api/v1/stats
 *
 * Returns aggregated statistics about the platform including
 * address counts, report stats, top categories, and recent activity.
 */

import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { getOverallStats } from '@/services/stats-service';

export async function GET() {
  return withErrorHandler(async () => {
    const stats = await getOverallStats();
    return apiSuccess(stats);
  });
}
