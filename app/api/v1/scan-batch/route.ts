/**
 * Batch Scan Endpoint
 * POST /api/v1/scan/batch
 *
 * Scan multiple addresses in a single request.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { withRateLimiting } from '@/middleware/security';
import { batchScan } from '@/services/scanner-service';

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Apply rate limiting (medium for batch operations)
    await withRateLimiting(request, 'medium');

    const body = await request.json();

    // Validate addresses array
    const { addresses } = body;

    if (!Array.isArray(addresses)) {
      return errors.validation('addresses must be an array');
    }

    if (addresses.length === 0) {
      return errors.validation('addresses array cannot be empty');
    }

    if (addresses.length > 25) {
      return errors.validation('Cannot scan more than 25 addresses at once', {
        maxAddresses: 25,
        providedCount: addresses.length,
      });
    }

    // Validate each address format
    const addressRegex = /^0x[a-fA-F0-9]*$/;
    for (const addr of addresses) {
      if (typeof addr !== 'string' || !addressRegex.test(addr)) {
        return errors.validation(`Invalid address format: ${addr}`);
      }
      if (addr.length < 2 || addr.length > 42) {
        return errors.validation(`Invalid address length: ${addr}`);
      }
    }

    // Deduplicate addresses
    const uniqueAddresses = Array.from(new Set(addresses.map((a) => a.toLowerCase())));

    if (uniqueAddresses.length !== addresses.length) {
      // Note: duplicates removed, but don't error
    }

    // Run batch scan
    const results = await batchScan(uniqueAddresses);

    return apiSuccess({
      scanned: results.length,
      results: results.map((r) => ({
        address: r.address,
        riskScore: r.riskScore,
        riskLevel: r.riskLevel,
      })),
    });
  });
}
