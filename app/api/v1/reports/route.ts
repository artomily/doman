/**
 * Get Reports List Endpoint
 * GET /api/v1/reports
 *
 * Get paginated list of reports with optional filters.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, withErrorHandler } from '@/lib/api-response';
import { getReports } from '@/services/report-service';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filters = {
      status: searchParams.get('status') as any,
      category: searchParams.get('category') as any,
      reporterAddress: searchParams.get('reporterAddress') || undefined,
      targetAddress: searchParams.get('address') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    const result = await getReports(filters);

    return apiSuccess(result.data, {
      meta: { pagination: result.pagination },
    });
  });
}
