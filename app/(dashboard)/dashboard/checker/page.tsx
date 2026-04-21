"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrustScoreBadge, Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  AlertTriangle,
  FileCode,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import type { ScanResult } from "@/types/api";

type ScanState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: ScanResult };

function riskLevelToIcon(level: string) {
  if (level === "LOW") return Shield;
  if (level === "MEDIUM") return AlertTriangle;
  return FileCode;
}

function CheckerContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [state, setState] = useState<ScanState>({ status: "idle" });

  const runCheck = async (address: string) => {
    if (!address.trim()) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(
        `/api/v1/scan/${encodeURIComponent(address.trim())}`
      );
      const json = await res.json();
      if (json.success) {
        setState({ status: "done", data: json.data });
      } else {
        setState({ status: "error", message: json.error?.message ?? "Scan failed" });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  };

  // Pre-fill from URL query param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      runCheck(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    runCheck(query);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Address, ENS & Domain Checker
        </h1>
        <p className="mt-1 text-sm text-muted">
          Enter a wallet address, contract, ENS name (vitalik.eth), or domain
          to get a trust score
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
          <Button type="submit" disabled={state.status === "loading"}>
            {state.status === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Check <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Error */}
      {state.status === "error" && (
        <Card>
          <p className="text-sm text-red-400">{state.message}</p>
        </Card>
      )}

      {/* Result */}
      {state.status === "done" && (
        <div className="space-y-6">
          {/* Score header */}
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                {/* ENS or original input label */}
                {(state.data as any).displayInput && (
                  <p className="text-sm font-medium">
                    {(state.data as any).displayInput}
                  </p>
                )}
                <p className="font-mono text-sm text-muted">
                  {(state.data as any).resolvedAddress ?? state.data.address}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="text-5xl font-bold text-accent">
                    {100 - state.data.riskScore}
                  </div>
                  <div>
                    <TrustScoreBadge score={100 - state.data.riskScore} />
                    <p className="mt-1 text-xs text-muted">
                      Trust Score out of 100
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    state.data.riskLevel === "LOW"
                      ? "safe"
                      : state.data.riskLevel === "MEDIUM"
                      ? "warning"
                      : "danger"
                  }
                >
                  {state.data.riskLevel} Risk
                </Badge>
                {state.data.isVerified && (
                  <Badge variant="safe">Verified</Badge>
                )}
                {(state.data as any).inputType === "ens" && (
                  <Badge variant="unknown">ENS</Badge>
                )}
                {(state.data as any).inputType === "domain" && (
                  <Badge variant="unknown">Domain</Badge>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-card-border pt-6">
              <div>
                <p className="text-xs text-muted">Risk Score</p>
                <p className="mt-1 text-sm font-medium">{state.data.riskScore}/100</p>
              </div>
              <div>
                <p className="text-xs text-muted">Reports</p>
                <p className="mt-1 text-sm font-medium">{state.data.reportCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Scanned At</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(state.data.scannedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Detected patterns */}
          {state.data.patterns.length > 0 && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Detected Risk Patterns
              </h3>
              <div className="space-y-4">
                {state.data.patterns.map((p, i) => {
                  const Icon = riskLevelToIcon(p.severity);
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <Icon size={18} className="mt-0.5 shrink-0 text-muted" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge
                            variant={
                              p.severity === "LOW"
                                ? "unknown"
                                : p.severity === "MEDIUM"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {p.severity}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Community Voting */}
          <Card>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
              Community Voting
            </h3>
            <p className="mb-4 text-sm text-muted">
              Do you trust this address? Help the community by voting.
            </p>
            <VoteButtons address={state.data.address} />
          </Card>
        </div>
      )}
    </div>
  );
}

function VoteButtons({ address }: { address: string }) {
  const [votes, setVotes] = useState<{ up: number; down: number } | null>(null);
  const [voted, setVoted] = useState(false);

  // Fetch report for this address to get votes
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/address/${encodeURIComponent(address)}`);
      const json = await res.json();
      if (json.success) {
        setVotes({ up: 0, down: 0 }); // base votes; report votes come from reports
      }
    }
    load();
  }, [address]);

  const handleVote = async (type: "up" | "down") => {
    if (voted) return;
    setVoted(true);
    setVotes((v) =>
      v ? { ...v, [type]: v[type] + 1 } : { up: type === "up" ? 1 : 0, down: type === "down" ? 1 : 0 }
    );
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleVote("up")}
        disabled={voted}
        className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-green-500 hover:text-green-400 disabled:opacity-50"
      >
        <ThumbsUp size={16} /> {votes?.up ?? 0}
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={voted}
        className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
      >
        <ThumbsDown size={16} /> {votes?.down ?? 0}
      </button>
    </div>
  );
}

export default function CheckerPage() {
  return (
    <Suspense fallback={<div className="grid grid-cols-1 gap-6 p-8">Loading...</div>}>
      <CheckerContent />
    </Suspense>
  );
}
