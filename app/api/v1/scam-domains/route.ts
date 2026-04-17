/**
 * Scam Domains API
 *
 * Get list of known phishing/scam domains
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { applyRateLimit } from '@/middleware/rate-limit';
import prisma from '@/lib/prisma';

/**
 * GET /api/v1/scam-domains
 * Get paginated list of scam domains
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    // Apply rate limit
    const rateLimitResult = await applyRateLimit(request, 'loose');
    if (!rateLimitResult.allowed) {
      return errors.rateLimited({
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { domain: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [domains, total] = await Promise.all([
      prisma.scamDomain.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          domain: true,
          name: true,
          category: true,
          description: true,
          riskScore: true,
          source: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.scamDomain.count({ where }),
    ]);

    return apiSuccess({
      data: domains,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}
