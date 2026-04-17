/**
 * dApps Directory Endpoint
 * GET /api/v1/dapps
 *
 * Get list of verified and known dApps with filtering and pagination.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { getDApps, getPopularDApps, getTrendingDApps } from '@/services/address-service';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;

    // Check if requesting special lists
    const listType = searchParams.get('list');

    if (listType === 'popular') {
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const dApps = await getPopularDApps(Math.min(limit, 50));
      return apiSuccess(dApps);
    }

    if (listType === 'trending') {
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const dApps = await getTrendingDApps(Math.min(limit, 50));
      return apiSuccess(dApps);
    }

    // Parse filter parameters
    const filters = {
      status: searchParams.get('status') as any || undefined,
      category: searchParams.get('category') as any || undefined,
      riskLevel: searchParams.get('riskLevel') as any || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as any || 'tvl',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      minTvl: searchParams.get('minTvl') ? parseFloat(searchParams.get('minTvl')!) : undefined,
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    };

    // Validate limit
    if (filters.limit > 100) {
      return errors.validation('Limit cannot exceed 100', { maxLimit: 100 });
    }

    // Validate sortBy
    const validSortBy = ['tvl', 'name', 'riskScore', 'createdAt'];
    if (!validSortBy.includes(filters.sortBy)) {
      return errors.validation('Invalid sortBy value', { validSortBy });
    }

    // Validate sortOrder
    if (filters.sortOrder !== 'asc' && filters.sortOrder !== 'desc') {
      return errors.validation('Invalid sortOrder value', { validValues: ['asc', 'desc'] });
    }

    const result = await getDApps(filters);

    return apiSuccess(result.data, {
      meta: {
        pagination: result.pagination,
        filters: {
          status: filters.status,
          category: filters.category,
          riskLevel: filters.riskLevel,
          search: filters.search,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          minTvl: filters.minTvl,
          verifiedOnly: filters.verifiedOnly,
        },
      },
    });
  });
}
