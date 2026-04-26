/**
 * Address ENS Records API
 *
 * GET /api/v1/address/[address]/ens
 * Get all ENS records associated with an address
 *
 * Example:
 * - /api/v1/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/ens
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnsRecordsForAddress, reverseResolveEns } from '@/services/ens-service';
import { apiSuccess, apiError } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';

/**
 * GET /api/v1/address/[address]/ens
 * Get ENS records for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: addressParam } = await params;

    // Validate address
    const validated = addressSchema.safeParse(addressParam);
    if (!validated.success) {
      return apiError('INVALID_ADDRESS', 'Invalid Ethereum address', undefined, 400);
    }

    const address = validated.data;

    // Get ENS records
    const records = await getEnsRecordsForAddress(address);

    // Get primary ENS name (reverse resolve)
    const primaryName = await reverseResolveEns(address);

    return apiSuccess({
      address,
      primaryName,
      records,
      count: records.length,
    });
  } catch (error) {
    console.error('ENS records fetch error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to fetch ENS records', undefined, 500);
  }
}

/**
 * OPTIONS - for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
