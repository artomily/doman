/**
 * Search Endpoint
 * GET /api/v1/search
 *
 * Search for addresses and domains by name or address.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { searchAddresses } from '@/services/address-service';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return errors.validation('Search query must be at least 2 characters', {
        minLength: 2,
      });
    }

    // Validate query length
    if (query.length > 100) {
      return errors.validation('Search query too long', { maxLength: 100 });
    }

    const type = (searchParams.get('type') as 'all' | 'contracts' | 'eoa') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') as any || undefined;

    // Validate limit
    if (limit > 50) {
      return errors.validation('Limit cannot exceed 50', { maxLimit: 50 });
    }

    const results = await searchAddresses(query, { limit, type, status });

    return apiSuccess(results, {
      meta: {
        query,
        count: results.length,
        type,
      },
    });
  });
}
