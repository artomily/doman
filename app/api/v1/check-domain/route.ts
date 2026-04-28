/**
 * Domain Check API
 *
 * Check if a domain is a known phishing/scam domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { applyRateLimit } from '@/middleware/rate-limit';
import prisma from '@/lib/prisma';
import type { DomainCheckResult } from '@/types/models';

/**
 * GET /api/v1/check-domain?domain=example.com
 * Check if a domain is a known scam
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
    const domain = searchParams.get('domain');
    const checker = searchParams.get('checker') || undefined;

    if (!domain) {
      return errors.validation('Domain parameter is required');
    }

    // Clean up domain - remove protocol, www, and path
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    // Check database
    const scamDomain = await prisma.scamDomain.findUnique({
      where: { domain: cleanDomain },
    });

    const riskScore = scamDomain?.riskScore ?? 0;
    const riskLevel = riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';

    const result: DomainCheckResult = {
      domain: cleanDomain,
      isScam: !!scamDomain,
      riskScore,
      category: scamDomain?.category ?? 'UNKNOWN',
      description: scamDomain?.description || undefined,
      source: scamDomain?.source || undefined,
      checkedAt: new Date().toISOString(),
    };

    // Record search history (fire-and-forget)
    prisma.searchHistory.create({
      data: {
        checkerAddress: checker ?? null,
        searchType: 'domain',
        query: cleanDomain,
        riskScore,
        riskLevel,
        result: result as any,
      },
    }).catch(() => {});

    return apiSuccess(result);
  });
}
