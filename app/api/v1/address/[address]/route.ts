/**
 * Address Lookup Endpoint
 * GET /api/v1/address/[address]
 *
 * Get detailed information about an address including:
 * - Status (LEGIT, SCAM, SUSPICIOUS, UNKNOWN)
 * - Risk score
 * - Category
 * - Tags
 * - Reports
 * - Recent scans
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, parseQueryParams, withErrorHandler } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';
import type { AddressDTO } from '@/types/api';

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

    // Fetch address with relations
    const addressData = await prisma.address.findUnique({
      where: { address },
      include: {
        tags: {
          select: {
            id: true,
            tag: true,
            taggedBy: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            createdAt: true,
          },
        },
        _count: {
          select: { reports: true },
        },
      },
    });

    // If address not found, return 404
    if (!addressData) {
      return errors.addressNotFound(address);
    }

    // Format response
    const response: AddressDTO = {
      id: addressData.id,
      address: addressData.address,
      name: addressData.name,
      chain: addressData.chain,
      status: addressData.status,
      riskScore: addressData.riskScore,
      category: addressData.category,
      source: addressData.source,
      description: addressData.description,
      url: addressData.url,
      logoUrl: addressData.logoUrl,
      tvl: addressData.tvl ? Number(addressData.tvl) : null,
      verifiedBy: addressData.verifiedBy,
      verifiedAt: addressData.verifiedAt?.toISOString() || null,
      createdAt: addressData.createdAt.toISOString(),
      updatedAt: addressData.updatedAt.toISOString(),
      tags: addressData.tags.map((tag: any) => ({
        id: tag.id,
        tag: tag.tag,
        taggedBy: tag.taggedBy,
        createdAt: tag.createdAt.toISOString(),
      })),
      reportCount: addressData._count.reports,
      lastScanned: addressData.scans[0]?.createdAt.toISOString() || null,
    };

    return apiSuccess(response);
  });
}
