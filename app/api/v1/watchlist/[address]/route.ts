/**
 * Watchlist Delete Endpoint
 * DELETE /api/v1/watchlist/[address]?userAddress=0x...
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address: watchedAddress } = await params;
    const userAddress = request.nextUrl.searchParams.get('userAddress');

    if (!userAddress) {
      return errors.validation('userAddress query param is required');
    }

    const watchedParsed = addressSchema.safeParse(watchedAddress);
    const userParsed = addressSchema.safeParse(userAddress);

    if (!watchedParsed.success) {
      return errors.invalidAddress(watchedParsed.error.errors);
    }
    if (!userParsed.success) {
      return errors.invalidAddress(userParsed.error.errors);
    }

    // Find the watched address to get its ID
    const watchedAddressRecord = await prisma.address.findUnique({
      where: { address: watchedParsed.data },
    });

    if (!watchedAddressRecord) {
      return errors.validation('Address not found');
    }

    await prisma.watchlist.deleteMany({
      where: {
        userAddress: userParsed.data,
        addressId: watchedAddressRecord.id,
      },
    });

    return apiSuccess({ deleted: true });
  });
}
