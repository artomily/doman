"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { TrustScoreBadge, Badge } from "@/components/ui/badge";
import { Loader2, Globe, AtSign, Wallet } from "lucide-react";

interface HistoryRow {
  id: string;
  searchType: "address" | "ens" | "domain";
  query: string;
  resolvedTo: string | null;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
  meta?: { chain?: string; category?: string; isProxy?: boolean; isVerified?: boolean };
}

const TYPE_ICON = {
  address: Wallet,
  ens: AtSign,
  domain: Globe,
};

const TYPE_LABEL = {
  address: "Address",
  ens: "ENS",
  domain: "Domain",
};

type FilterType = "all" | "address" | "ens" | "domain";

export default function HistoryPage() {
  const { address: walletAddress, isConnected, status } = useAccount();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    // Wait until wagmi has finished resolving wallet state
    if (status === 'connecting' || status === 'reconnecting') return;
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", type: filter });
    if (isConnected && walletAddress) params.set("checker", walletAddress);

    fetch(`/api/v1/history?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setRows(json.data);
      })
      .finally(() => setLoading(false));
  }, [walletAddress, isConnected, status, filter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check History</h1>
        <p className="mt-1 text-sm text-muted">
          {isConnected
            ? "Your personal check history — addresses, ENS names, and domains"
            : "Connect your wallet to see your history, or view all recent checks below"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-card-border bg-surface p-1 w-fit">
        {(["all", "address", "ens", "domain"] as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === t
                ? "bg-accent/20 text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-medium">Query</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 size={18} className="mx-auto animate-spin text-muted" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">
                    {isConnected
                      ? "No checks yet. Try checking an address, ENS name, or domain."
                      : "No search history yet."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const Icon = TYPE_ICON[row.searchType] ?? Wallet;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-card-border/50 transition-colors hover:bg-surface/50"
                    >
                      <td className="px-6 py-4">
                        <p className="truncate max-w-xs font-mono text-sm">{row.query}</p>
                        {row.resolvedTo && (
                          <p className="mt-0.5 truncate max-w-xs text-xs text-muted">
                            → {row.resolvedTo}
                          </p>
                        )}
                        {row.meta?.chain && (
                          <p className="mt-0.5 text-xs text-muted capitalize">
                            {row.meta.category?.toLowerCase().replace("_", " ")} · {row.meta.chain}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                          <Icon size={11} />
                          {TYPE_LABEL[row.searchType]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <TrustScoreBadge score={100 - row.riskScore} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            row.riskLevel === "LOW"
                              ? "safe"
                              : row.riskLevel === "MEDIUM"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {row.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

