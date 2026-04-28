/**
 * Scan History Endpoint
 * GET /api/v1/history?checker=0x...&limit=50&type=all|address|ens|domain
 *
 * Returns unified history combining:
 * - ContractScan (address checks)
 * - SearchHistory (ENS and domain checks)
 * Scoped to `checker` wallet if provided, otherwise returns recent global checks.
 */

import { NextRequest } from "next/server";
import { apiSuccess, withErrorHandler } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = request.nextUrl;
    const checker = searchParams.get("checker") || undefined;
    const type = searchParams.get("type") || "all"; // all | address | ens | domain
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

    const addressChecks: { id: string; searchType: string; query: string; resolvedTo: string | null; riskScore: number; riskLevel: string; createdAt: Date; meta?: Record<string, unknown> }[] = [];
    const searchChecks: { id: string; searchType: string; query: string; resolvedTo: string | null; riskScore: number; riskLevel: string; createdAt: Date; meta?: Record<string, unknown> }[] = [];

    // Fetch contract/address scans
    if (type === "all" || type === "address") {
      const scans = await prisma.contractScan.findMany({
        where: checker ? { checkerAddress: checker } : {},
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          riskScore: true,
          riskLevel: true,
          isProxy: true,
          isVerified: true,
          createdAt: true,
          address: {
            select: { address: true, chain: true, category: true },
          },
        },
      });

      for (const s of scans) {
        addressChecks.push({
          id: s.id,
          searchType: "address",
          query: s.address.address,
          resolvedTo: null,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          createdAt: s.createdAt,
          meta: {
            chain: s.address.chain,
            category: s.address.category,
            isProxy: s.isProxy,
            isVerified: s.isVerified,
          },
        });
      }
    }

    // Fetch ENS & domain searches
    if (type === "all" || type === "ens" || type === "domain") {
      const searchTypeFilter =
        type === "ens" ? ["ens"] :
        type === "domain" ? ["domain"] :
        ["ens", "domain"];

      const searches = await prisma.searchHistory.findMany({
        where: {
          ...(checker ? { checkerAddress: checker } : {}),
          searchType: { in: searchTypeFilter },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          searchType: true,
          query: true,
          resolvedTo: true,
          riskScore: true,
          riskLevel: true,
          createdAt: true,
        },
      });

      for (const s of searches) {
        searchChecks.push({
          id: s.id,
          searchType: s.searchType,
          query: s.query,
          resolvedTo: s.resolvedTo,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          createdAt: s.createdAt,
        });
      }
    }

    // Merge and sort by createdAt desc, then truncate to limit
    const combined = [...addressChecks, ...searchChecks]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }));

    return apiSuccess(combined);
  });
}
