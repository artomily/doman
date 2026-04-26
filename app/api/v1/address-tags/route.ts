/**
 * Address Tags API
 * POST /api/v1/address-tags - Create tag for address
 * GET /api/v1/address-tags - List all tags (with filters)
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { addressSchema } from '@/lib/validation';

// Reputation points for submitting a tag
const TAG_SUBMITTED_POINTS = 5;

type PostTagResponse = {
  tag: {
    id: string;
    tag: string;
    taggedBy: string | null;
    createdAt: Date;
    addressId: string;
  };
  user?: {
    id: string;
    address: string;
    tagsSubmitted: number;
    reputation: number;
  };
};

type AddressTagListItem = {
  id: string;
  tag: string;
  taggedBy: string | null;
  createdAt: Date;
  address: {
    address: string;
    name: string | null;
    status: string;
    riskScore: number;
  };
};

type GetTagsListResponse = {
  data: AddressTagListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type AddressTagWhere = {
  addressId?: string;
  tag?: {
    contains: string;
    mode: 'insensitive';
  };
  taggedBy?: string;
};

/**
 * POST - Create address tag
 */
export async function POST(request: NextRequest) {
  return withErrorHandler<PostTagResponse>(async () => {
    const body = await request.json();

    // Validate required fields
    const { address, tag, taggedBy } = body;

    if (!address) {
      return errors.validation('address is required');
    }

    if (!tag) {
      return errors.validation('tag is required');
    }

    // Validate address format
    const addressResult = addressSchema.safeParse(address);
    if (!addressResult.success) {
      return errors.validation('Invalid address format', addressResult.error.errors);
    }

    // Validate taggedBy address if provided
    if (taggedBy) {
      const taggedByResult = addressSchema.safeParse(taggedBy);
      if (!taggedByResult.success) {
        return errors.validation('Invalid taggedBy address format', taggedByResult.error.errors);
      }
    }

    // Check if address exists, create if not
    let addressRecord = await prisma.address.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!addressRecord) {
      addressRecord = await prisma.address.create({
        data: {
          address: address.toLowerCase(),
          status: 'UNKNOWN',
          riskScore: 0,
          category: 'OTHER',
          source: 'COMMUNITY',
        },
      });
    }

    // Create tag (upsert to handle unique constraint)
    const tagRecord = await prisma.addressTag.upsert({
      where: {
        addressId_tag: {
          addressId: addressRecord.id,
          tag: tag.trim(),
        },
      },
      update: {
        taggedBy: taggedBy || null,
      },
      create: {
        addressId: addressRecord.id,
        tag: tag.trim(),
        taggedBy: taggedBy || null,
      },
    });

    // Update user profile if taggedBy is provided
    if (taggedBy) {
      const userProfile = await prisma.userProfile.upsert({
        where: { address: taggedBy.toLowerCase() },
        update: {
          tagsSubmitted: { increment: 1 },
          reputation: { increment: TAG_SUBMITTED_POINTS },
        },
        create: {
          address: taggedBy.toLowerCase(),
          tagsSubmitted: 1,
          reputation: TAG_SUBMITTED_POINTS,
        },
      });

      return apiSuccess(
        { tag: tagRecord, user: userProfile },
        {
          message: 'Tag created successfully',
          pointsEarned: TAG_SUBMITTED_POINTS,
        }
      );
    }

    return apiSuccess(
      { tag: tagRecord },
      {
        message: 'Tag created successfully',
      }
    );
  });
}

/**
 * GET - List address tags
 */
export async function GET(request: NextRequest) {
  return withErrorHandler<GetTagsListResponse>(async () => {
    const { searchParams } = new URL(request.url);

    const address = searchParams.get('address');
    const tag = searchParams.get('tag');
    const taggedBy = searchParams.get('taggedBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: AddressTagWhere = {};

    if (address) {
      const addressRecord = await prisma.address.findUnique({
        where: { address: address.toLowerCase() },
      });

      if (addressRecord) {
        where.addressId = addressRecord.id;
      } else {
        return apiSuccess({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }

    if (tag) {
      where.tag = {
        contains: tag,
        mode: 'insensitive',
      };
    }

    if (taggedBy) {
      where.taggedBy = taggedBy.toLowerCase();
    }

    // Get tags with address info
    const [tags, total]: [AddressTagListItem[], number] = await Promise.all([
      prisma.addressTag.findMany({
        where,
        include: {
          address: {
            select: {
              address: true,
              name: true,
              status: true,
              riskScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.addressTag.count({ where }),
    ]);

    return apiSuccess({
      data: tags.map((t) => ({
        id: t.id,
        tag: t.tag,
        taggedBy: t.taggedBy,
        createdAt: t.createdAt,
        address: t.address,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}
