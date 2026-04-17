/**
 * Create Report Endpoint
 * POST /api/v1/report
 *
 * Submit a new community report for an address.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { createReportSchema } from '@/lib/validation';
import { withRateLimiting } from '@/middleware/security';
import { createReport } from '@/services/report-service';
import { sanitizeInput } from '@/middleware/security';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Apply rate limiting (strict for write operations)
    await withRateLimiting(request, 'strict');

    // Parse and validate request body
    const body = await request.json();
    const sanitizedBody = {
      ...body,
      reason: sanitizeInput(body.reason),
    };

    const validationResult = createReportSchema.safeParse(sanitizedBody);
    if (!validationResult.success) {
      return errors.validation('Invalid request data', validationResult.error.errors);
    }

    // Create report
    const report = await createReport(validationResult.data);

    return apiSuccess(
      {
        id: report.id,
        status: report.status,
        message: 'Report submitted successfully. Awaiting community verification.',
      },
      { meta: { cached: false } }
    );
  });
}
