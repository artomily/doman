/**
 * Leaderboard Endpoint
 * GET /api/v1/leaderboard
 *
 * Get user reputation leaderboard.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { getLeaderboard } from '@/services/leaderboard-service';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const period = (searchParams.get('period') as 'all' | 'week' | 'month') || 'all';
    const category = (searchParams.get('category') as 'reporters' | 'voters' | 'all') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Validate limit
    if (limit > 100) {
      return errors.validation('Limit cannot exceed 100', { maxLimit: 100 });
    }

    const result = await getLeaderboard({ period, category, page, limit });

    return apiSuccess(result.data, {
      meta: {
        pagination: result.pagination,
        filters: { period, category },
      },
    });
  });
}
