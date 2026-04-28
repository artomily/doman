"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface RecentScan {
  id: string;
  riskScore: number;
  riskLevel: string;
  searchType: string;
  query: string;
  createdAt: string;
  meta?: { chain?: string; category?: string };
}

interface DashboardData {
  totalChecks: number;
  myChecks: number;
  flaggedCount: number;
  watchlistCount: number;
  trustScoreAvg: number;
  recentScans: RecentScan[];
}

export default function DashboardPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);
  const prevAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (isConnected && walletAddress) params.set("checker", walletAddress);

    Promise.all([
      fetch("/api/v1/stats").then((r) => r.json()),
      fetch(`/api/v1/history?limit=5${isConnected && walletAddress ? `&checker=${walletAddress}` : ""}`).then((r) => r.json()),
      isConnected && walletAddress
        ? fetch(`/api/v1/watchlist?userAddress=${walletAddress}`).then((r) => r.json())
        : Promise.resolve({ data: [] }),
    ])
      .then(([stats, history, watchlist]) => {
        setData({
          totalChecks: stats.data?.totalScans ?? stats.data?.scansToday ?? 0,
          myChecks: history.data?.length ?? 0,
          flaggedCount: stats.data?.scamCount ?? 0,
          watchlistCount: Array.isArray(watchlist.data) ? watchlist.data.length : 0,
          trustScoreAvg: stats.data?.trustScoreAvg ?? 0,
          recentScans: history.data ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, [walletAddress, isConnected]);

  const stats = [
    {
      label: isConnected ? "My Checks" : "Total Checks",
      value: loading ? "—" : (isConnected ? data?.myChecks : data?.totalChecks ?? 0)?.toLocaleString() ?? "0",
      up: true,
      icon: Search,
    },
    {
      label: "Flagged Addresses",
      value: loading ? "—" : (data?.flaggedCount ?? 0).toLocaleString(),
      up: true,
      icon: AlertTriangle,
    },
    {
      label: "Watchlist",
      value: loading ? "—" : (data?.watchlistCount ?? 0).toLocaleString(),
      up: false,
      icon: Eye,
    },
    {
      label: "Trust Score Avg",
      value: loading ? "—" : (data?.trustScoreAvg ?? 0).toString(),
      up: true,
      icon: Shield,
    },
  ];

  const recentScans = data?.recentScans ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          {isConnected
            ? "Your personal Web3 security overview"
            : "Connect your wallet to see your personal activity"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <stat.icon size={18} className="text-muted" />
              {loading && <Loader2 size={14} className="animate-spin text-muted/50" />}
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
                    {scan.query}
                  </p>
                  <p className="mt-0.5 text-xs text-muted capitalize">
                    {scan.searchType} ·{" "}
                    {scan.meta?.chain ?? "—"}
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

