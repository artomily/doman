/**
 * Scan History Endpoint
 * GET /api/v1/history?checker=0x...&limit=50
 *
 * Returns ContractScan records. If `checker` is provided, returns only that
 * wallet's scans; otherwise returns the most recent scans globally.
 */

import { NextRequest } from "next/server";
import { apiSuccess, withErrorHandler } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = request.nextUrl;
    const checker = searchParams.get("checker") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

    const where = checker ? { checkerAddress: checker } : {};

    const scans = await prisma.contractScan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        address: {
          select: { address: true, chain: true, category: true },
        },
      },
    });

    return apiSuccess(scans);
  });
}
