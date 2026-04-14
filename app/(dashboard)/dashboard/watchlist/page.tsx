"use client";

import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

const watchlistData = [
  {
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    label: "My main wallet",
    score: 85,
    prevScore: 80,
    chain: "Ethereum",
    lastChecked: "2 min ago",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    label: "Suspicious contract",
    score: 45,
    prevScore: 52,
    chain: "Ethereum",
    lastChecked: "1 hour ago",
  },
  {
    address: "uniswap.org",
    label: "Uniswap",
    score: 95,
    prevScore: 95,
    chain: "—",
    lastChecked: "3 hours ago",
  },
  {
    address: "0xdead000000000000000000000000000000000000",
    label: "Known scam",
    score: 8,
    prevScore: 15,
    chain: "Ethereum",
    lastChecked: "6 hours ago",
  },
];

export default function WatchlistPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="mt-1 text-sm text-muted">
            Monitor addresses and get alerted on score changes
          </p>
        </div>
        <Button size="sm" href="/dashboard/checker">
          + Add Address
        </Button>
      </div>

      <div className="grid gap-4">
        {watchlistData.map((item, i) => {
          const diff = item.score - item.prevScore;
          const isUp = diff > 0;
          const isChanged = diff !== 0;

          return (
            <Card key={i} className="flex flex-col justify-between min-h-24">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 truncate font-mono text-xs text-muted">
                    {item.address}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground">
                    <Eye size={14} />
                  </button>
                  <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <TrustScoreBadge score={item.score} />
                  {isChanged && (
                    <span
                      className={`flex items-center gap-0.5 text-xs ${
                        isUp ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight size={12} />
                      ) : (
                        <ArrowDownRight size={12} />
                      )}
                      {Math.abs(diff)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted">{item.chain}</p>
                  <p className="text-[10px] text-muted">{item.lastChecked}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
