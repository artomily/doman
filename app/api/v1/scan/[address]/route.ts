/**
 * Contract Scan Endpoint
 * GET /api/v1/scan/[address]
 *
 * Scan a smart contract for potential security risks and scam patterns.
 * Returns risk score, detected patterns, and similar known scams.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';
import { scanContract } from '@/services/scanner-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address: addressParam } = await params;

    // Validate address format
    const addressResult = addressSchema.safeParse(addressParam);
    if (!addressResult.success) {
      return errors.invalidAddress(addressResult.error.errors);
    }

    const address = addressResult.data;

    // Perform scan
    const result = await scanContract(address);

    return apiSuccess(result);
  });
}
