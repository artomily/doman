"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrustScoreBadge, Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Clock,
  Users,
  FileCode,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// Mock result data
const mockResult = {
  address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
  score: 72,
  factors: [
    { label: "Transaction History", score: 80, icon: Clock },
    { label: "Funding Source", score: 65, icon: Shield },
    { label: "Community Signal", score: 78, icon: Users },
    { label: "Contract Risk", score: 60, icon: FileCode },
  ],
  tags: ["DeFi User", "Active Trader", "Verified"],
  firstSeen: "2021-03-15",
  totalTx: 1247,
  chainId: "Ethereum",
};

export default function CheckerPage() {
  const [query, setQuery] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [votes, setVotes] = useState({ up: 42, down: 3 });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResult(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Address & Domain Checker
        </h1>
        <p className="mt-1 text-sm text-muted">
          Enter any wallet address, contract, or domain to get a trust score
        </p>
      </div>

      {/* Search form */}
      <Card>
        <form onSubmit={handleCheck} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="0x... address, ENS name, or domain"
              className="pl-10"
            />
          </div>
          <Button type="submit">
            Check <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>
      </Card>

      {/* Result */}
      {showResult && (
        <div className="space-y-6">
          {/* Score header */}
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-sm text-muted">
                  {mockResult.address}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="text-5xl font-bold text-accent">
                    {mockResult.score}
                  </div>
                  <div>
                    <TrustScoreBadge score={mockResult.score} />
                    <p className="mt-1 text-xs text-muted">
                      Trust Score out of 100
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {mockResult.tags.map((tag) => (
                  <Badge key={tag} variant="safe">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-card-border pt-6">
              <div>
                <p className="text-xs text-muted">Chain</p>
                <p className="mt-1 text-sm font-medium">
                  {mockResult.chainId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">First Seen</p>
                <p className="mt-1 text-sm font-medium">
                  {mockResult.firstSeen}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Transactions</p>
                <p className="mt-1 text-sm font-medium">
                  {mockResult.totalTx.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Factor breakdown */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Score Breakdown
            </h3>
            <div className="space-y-4">
              {mockResult.factors.map((f) => (
                <div key={f.label} className="flex items-center gap-4">
                  <f.icon size={18} className="text-muted" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{f.label}</span>
                      <span className="text-sm font-medium">{f.score}/100</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-surface">
                      <div
                        className="h-2 rounded-full bg-accent transition-all"
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Voting */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Community Voting
            </h3>
            <p className="mb-4 text-sm text-muted">
              Do you trust this address? Help the community by voting.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setVotes((v) => ({ ...v, up: v.up + 1 }))
                }
                className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-green-500 hover:text-green-400"
              >
                <ThumbsUp size={16} /> {votes.up}
              </button>
              <button
                onClick={() =>
                  setVotes((v) => ({ ...v, down: v.down + 1 }))
                }
                className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-red-500 hover:text-red-400"
              >
                <ThumbsDown size={16} /> {votes.down}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
