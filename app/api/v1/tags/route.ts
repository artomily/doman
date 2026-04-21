/**
 * Tags Endpoint
 * POST /api/v1/tags  - add a tag to an address
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { addressSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addTagSchema = z.object({
  address: addressSchema,
  tag: z.string().min(1).max(100).trim(),
  taggedBy: z.string().max(255).optional(),
});

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const parsed = addTagSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation('Invalid input', parsed.error.errors);
    }

    const { address, tag, taggedBy } = parsed.data;

    // Find the address record
    const addressRecord = await prisma.address.findUnique({
      where: { address },
      select: { id: true },
    });

    if (!addressRecord) {
      return errors.addressNotFound(address);
    }

    const entry = await prisma.addressTag.upsert({
      where: { addressId_tag: { addressId: addressRecord.id, tag } },
      create: { addressId: addressRecord.id, tag, taggedBy: taggedBy ?? null },
      update: {},
    });

    return apiSuccess(entry);
  });
}
