import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import {
  Search,
  Shield,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalScans,
    flaggedCount,
    watchlistCount,
    riskScoreAvg,
    recentScans,
  ] = await Promise.all([
    prisma.contractScan.count(),
    prisma.address.count({
      where: { status: { in: ["SCAM", "SUSPICIOUS"] } },
    }),
    prisma.watchlist.count(),
    prisma.address.aggregate({ _avg: { riskScore: true } }),
    prisma.contractScan.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        address: {
          select: { address: true, chain: true, category: true },
        },
      },
    }),
  ]);

  const trustScoreAvg = riskScoreAvg._avg.riskScore
    ? Math.round(100 - riskScoreAvg._avg.riskScore)
    : 0;

  const stats = [
    {
      label: "Total Checks",
      value: totalScans.toLocaleString(),
      change: null,
      up: true,
      icon: Search,
    },
    {
      label: "Flagged Addresses",
      value: flaggedCount.toLocaleString(),
      change: null,
      up: true,
      icon: AlertTriangle,
    },
    {
      label: "Watchlist",
      value: watchlistCount.toLocaleString(),
      change: null,
      up: false,
      icon: Eye,
    },
    {
      label: "Trust Score Avg",
      value: trustScoreAvg.toString(),
      change: null,
      up: true,
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of your Web3 security activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <stat.icon size={18} className="text-muted" />
              {stat.change && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    stat.up ? "text-green-400" : "text-muted"
                  }`}
                >
                  {stat.up ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {stat.change}
                </span>
              )}
            </div>
            <div>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <a
            href="/dashboard/history"
            className="text-xs text-accent hover:underline"
          >
            View All
          </a>
        </div>
        <div className="space-y-0">
          {recentScans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No scan activity yet. Try checking an address.
            </p>
          ) : (
            recentScans.map((scan: typeof recentScans[number]) => (
              <div
                key={scan.id}
                className="flex items-center justify-between border-t border-card-border py-4 first:border-0 first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">
                    {scan.address.address}
                  </p>
                  <p className="mt-0.5 text-xs text-muted capitalize">
                    {scan.address.category.toLowerCase().replace("_", " ")} ·{" "}
                    {scan.address.chain}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <TrustScoreBadge score={100 - scan.riskScore} />
                  <span className="hidden text-xs text-muted sm:block">
                    {new Date(scan.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

