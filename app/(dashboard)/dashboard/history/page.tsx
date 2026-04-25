"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { TrustScoreBadge, Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ScanRow {
  id: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
  address: { address: string; chain: string; category: string };
}

export default function HistoryPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (isConnected && walletAddress) {
      params.set("checker", walletAddress);
    }
    setLoading(true);
    fetch(`/api/v1/history?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setScans(json.data);
      })
      .finally(() => setLoading(false));
  }, [walletAddress, isConnected]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check History</h1>
        <p className="mt-1 text-sm text-muted">
          {isConnected
            ? "Your personal check history"
            : "Connect your wallet to see your history, or view all recent checks below"}
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Chain</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={18} className="mx-auto animate-spin text-muted" />
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted"
                  >
                    {isConnected
                      ? "No checks yet. Try checking an address."
                      : "No scan history yet."}
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-card-border/50 transition-colors hover:bg-surface/50"
                  >
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-sm">
                      {scan.address.address}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted capitalize">
                        {scan.address.category.toLowerCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {scan.address.chain}
                    </td>
                    <td className="px-6 py-4">
                      <TrustScoreBadge score={100 - scan.riskScore} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          scan.riskLevel === "LOW"
                            ? "safe"
                            : scan.riskLevel === "MEDIUM"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {scan.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

