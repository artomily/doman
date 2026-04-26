/**
 * Address Tags API (per address)
 * GET /api/v1/address/[address]/tags - Get all tags for an address
 * DELETE /api/v1/address/[address]/tags?tag=xxx - Delete a tag
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validation';

type GetTagsResponse = {
  data: Array<{
    tag: string;
    taggedBy: string | null;
    createdAt: Date;
  }>;
  address: string;
  count: number;
};

type AddressTagItem = GetTagsResponse['data'][number];

type DeleteTagResponse = {
  message: string;
  address: string;
  tag: string;
};

/**
 * GET - Get all tags for an address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler<GetTagsResponse>(async () => {
    const { address } = await params;

    // Validate address format
    const validationResult = addressSchema.safeParse(address);
    if (!validationResult.success) {
      return errors.validation('Invalid address format', validationResult.error.errors);
    }

    // Find address
    const addressRecord = await prisma.address.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!addressRecord) {
      return apiSuccess({
        data: [],
        address: address.toLowerCase(),
        count: 0,
      });
    }

    // Get tags
    const tags: AddressTagItem[] = await prisma.addressTag.findMany({
      where: { addressId: addressRecord.id },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      data: tags.map((t) => ({
        tag: t.tag,
        taggedBy: t.taggedBy,
        createdAt: t.createdAt,
      })),
      address: addressRecord.address,
      count: tags.length,
    });
  });
}

/**
 * DELETE - Delete a tag from an address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler<DeleteTagResponse>(async () => {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    // Validate address format
    const validationResult = addressSchema.safeParse(address);
    if (!validationResult.success) {
      return errors.validation('Invalid address format', validationResult.error.errors);
    }

    if (!tag) {
      return errors.validation('tag parameter is required');
    }

    // Find address
    const addressRecord = await prisma.address.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!addressRecord) {
      return errors.notFound('Address not found');
    }

    // Delete tag
    await prisma.addressTag.deleteMany({
      where: {
        addressId: addressRecord.id,
        tag: tag,
      },
    });

    return apiSuccess({
      message: 'Tag deleted successfully',
      address: addressRecord.address,
      tag,
    });
  });
}
