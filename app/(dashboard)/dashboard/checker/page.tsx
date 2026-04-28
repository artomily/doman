"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
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
  Flag,
  CheckCircle2,
  X,
} from "lucide-react";
import type { ScanResult } from "@/types/api";
import { ReportScamModal } from "@/components/dashboard/report-scam-modal";

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
  const { address: walletAddress } = useAccount();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const didAutoRun = useRef(false);

  const runCheck = useCallback(async (address: string) => {
    if (!address.trim()) return;
    setState({ status: "loading" });
    try {
      const url = new URL(
        `/api/v1/scan/${encodeURIComponent(address.trim())}`,
        window.location.origin
      );
      if (walletAddress) url.searchParams.set("checker", walletAddress);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setState({ status: "done", data: json.data });
      } else {
        setState({ status: "error", message: json.error?.message ?? "Scan failed" });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }, [walletAddress]);

  // Auto-run once when query param exists (avoid setState inside effect)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !didAutoRun.current) {
      didAutoRun.current = true;
      runCheck(q);
    }
  }, [searchParams, runCheck]);

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
                {state.data.displayInput && (
                  <p className="text-sm font-medium">
                    {state.data.displayInput}
                  </p>
                )}
                <p className="font-mono text-sm text-muted">
                  {state.data.resolvedAddress ?? state.data.address}
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
                {state.data.inputType === "ens" && (
                  <Badge variant="unknown">ENS</Badge>
                )}
                {state.data.inputType === "domain" && (
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

          {/* Community Voting / Report */}
          <Card>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted">
              Community
            </h3>

            {/* Scam flagged banner */}
            {(state.data.votesFor > 0 || state.data.votesAgainst > 0) && (
              <div
                className={`mb-4 mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${state.data.votesFor >= 3
                    ? "border-red-900 bg-red-950/30 text-red-400"
                    : "border-yellow-900 bg-yellow-950/20 text-yellow-400"
                  }`}
              >
                <AlertTriangle size={14} className="shrink-0" />
                {state.data.votesFor >= 3
                  ? `${state.data.votesFor} anggota komunitas sudah menandai ini sebagai scam`
                  : `${state.data.votesFor + state.data.votesAgainst} vote komunitas tercatat untuk alamat ini`}
              </div>
            )}

            <p className="mb-4 text-sm text-muted">
              Help the community by reporting suspicious activity.
            </p>
            <div className="flex flex-col gap-4">
              {state.data.inputType !== "domain" && (
                <VoteButtons
                  address={state.data.resolvedAddress ?? state.data.address}
                  votesFor={state.data.votesFor}
                  votesAgainst={state.data.votesAgainst}
                />
              )}
              <div>
                <ReportScamButton
                  address={state.data.resolvedAddress ?? state.data.address}
                  isDomain={state.data.inputType === 'domain'}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ReportScamButton({ address, isDomain }: { address: string; isDomain?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-red-900 bg-red-950/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500 hover:bg-red-950/60"
      >
        <Flag size={14} /> {isDomain ? 'Report Website' : 'Report Scam'}
      </button>
      <ReportScamModal
        isOpen={open}
        onClose={() => setOpen(false)}
        targetAddress={address}
        isDomain={isDomain}
      />
    </>
  );
}

function VoteButtons({
  address,
  votesFor,
  votesAgainst,
}: {
  address: string;
  votesFor: number;
  votesAgainst: number;
}) {
  const { address: walletAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [voted, setVoted] = useState(false);
  const [myVoteType, setMyVoteType] = useState<"FOR" | "AGAINST" | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [showAlreadyVotedPopup, setShowAlreadyVotedPopup] = useState(false);
  const [showRateLimitBanner, setShowRateLimitBanner] = useState(false);
  const [counts, setCounts] = useState({ for: votesFor, against: votesAgainst });
  const [pendingVote, setPendingVote] = useState<"up" | "down" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the connected wallet has already voted (once per address+wallet)
  useEffect(() => {
    if (!isConnected || !walletAddress || !address) return;

    const controller = new AbortController();
    fetch(
      `/api/v1/reports/vote-status?address=${encodeURIComponent(address)}&voterAddress=${encodeURIComponent(walletAddress)}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.hasVoted) {
          setVoted(true);
          setMyVoteType(json.data.voteType);
        }
      })
      .catch(() => { });

    return () => controller.abort();
  }, [address, walletAddress, isConnected]);

  // Auto-dismiss "already voted" popup after 3 seconds
  useEffect(() => {
    if (!showAlreadyVotedPopup) return;
    const t = setTimeout(() => setShowAlreadyVotedPopup(false), 3000);
    return () => clearTimeout(t);
  }, [showAlreadyVotedPopup]);

  // Auto-dismiss rate limit banner after 5 seconds
  useEffect(() => {
    if (!showRateLimitBanner) return;
    const t = setTimeout(() => setShowRateLimitBanner(false), 5000);
    return () => clearTimeout(t);
  }, [showRateLimitBanner]);

  const submitVote = async (type: "up" | "down") => {
    if (voted) {
      setShowAlreadyVotedPopup(true);
      setPendingVote(null);
      return;
    }
    setVoteError(null);
    setIsSubmitting(true);

    if (!isConnected || !walletAddress) {
      const connector = connectors[0];
      if (connector) connect({ connector });
      setPendingVote(null);
      setIsSubmitting(false);
      return;
    }

    try {
      const reportsRes = await fetch(
        `/api/v1/reports?address=${encodeURIComponent(address)}&limit=1`
      );
      const reportsJson = await reportsRes.json();

      if (!reportsJson.success || !reportsJson.data?.length) {
        setVoteError("No reports exist for this address yet.");
        setIsSubmitting(false);
        setPendingVote(null);
        return;
      }

      const reportId = reportsJson.data[0].id;
      // ThumbsUp = safe (against the scam report), ThumbsDown = confirms scam (for the report)
      const vote = type === "up" ? "AGAINST" : "FOR";

      const voteRes = await fetch(`/api/v1/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote, voterAddress: walletAddress }),
      });
      const voteJson = await voteRes.json();

      if (voteRes.status === 409) {
        setVoted(true);
        setMyVoteType(vote);
        setShowAlreadyVotedPopup(true);
        setPendingVote(null);
        setIsSubmitting(false);
        return;
      }
      if (voteRes.status === 429) {
        const retryAfter = voteJson.error?.details?.retryAfter as number | undefined;
        setVoteError(
          retryAfter
            ? `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`
            : "Terlalu banyak permintaan. Coba lagi sebentar."
        );
        setShowRateLimitBanner(true);
        setIsSubmitting(false);
        setPendingVote(null);
        return;
      }
      if (!voteRes.ok || !voteJson.success) {
        setVoteError(voteJson.error?.message ?? "Vote gagal. Silakan coba lagi.");
        setIsSubmitting(false);
        setPendingVote(null);
        return;
      }

      setVoted(true);
      setMyVoteType(vote);
      setCounts({ for: voteJson.data.votesFor, against: voteJson.data.votesAgainst });
    } catch {
      setVoteError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      setPendingVote(null);
    }
  };

  const total = counts.for + counts.against;
  const scamPct = total > 0 ? Math.round((counts.for / total) * 100) : 0;

  return (
    <div className="space-y-3 w-full">
      {/* Community sentiment bar */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <ThumbsUp size={11} className="text-green-400" />
              Safe — {counts.against}
            </span>
            <span className="font-medium">{total} vote{total !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              {counts.for} — Scam
              <ThumbsDown size={11} className="text-red-400" />
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-border">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${scamPct}%` }}
            />
          </div>
          {scamPct >= 50 && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertTriangle size={11} />
              Majority of voters flagged this as a scam
            </p>
          )}
        </div>
      )}

      {/* Vote buttons / confirmation / voted state */}
      <div className="flex flex-wrap items-center gap-3">
        {voted ? (
          <div className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm text-muted">
            <CheckCircle2 size={15} className="text-accent" />
            You voted:{" "}
            <span
              className={
                myVoteType === "FOR" ? "font-medium text-red-400" : "font-medium text-green-400"
              }
            >
              {myVoteType === "FOR" ? "Scam" : "Safe"}
            </span>
          </div>
        ) : pendingVote !== null ? (
          // Confirmation dialog
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-card-border bg-surface px-4 py-3 text-sm w-full">
            <span className="flex-1 font-medium">
              {pendingVote === "up"
                ? "✅ Confirm this address is Safe?"
                : "🚨 Confirm this address is a Scam?"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingVote(null)}
                disabled={isSubmitting}
                className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => submitVote(pendingVote)}
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  pendingVote === "up"
                    ? "bg-green-900/60 text-green-400 hover:bg-green-900"
                    : "bg-red-900/60 text-red-400 hover:bg-red-900"
                }`}
              >
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : null}
                {pendingVote === "up" ? "Yes, Safe" : "Yes, Scam"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setPendingVote("up")}
              className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-green-500 hover:text-green-400"
              title="Mark as safe"
            >
              <ThumbsUp size={16} />
              <span>Safe</span>
              {counts.against > 0 && (
                <span className="ml-1 rounded-full bg-surface px-1.5 py-0.5 text-xs text-muted">
                  {counts.against}
                </span>
              )}
            </button>
            <button
              onClick={() => setPendingVote("down")}
              className="flex items-center gap-2 rounded-xl border border-card-border px-4 py-2 text-sm transition-colors hover:border-red-500 hover:text-red-400"
              title="Confirm scam"
            >
              <ThumbsDown size={16} />
              <span>Scam</span>
              {counts.for > 0 && (
                <span className="ml-1 rounded-full bg-surface px-1.5 py-0.5 text-xs text-muted">
                  {counts.for}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Already voted popup */}
      {showAlreadyVotedPopup && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-accent">
            <CheckCircle2 size={14} />
            Anda sudah memberikan vote pada laporan ini.
          </span>
          <button
            onClick={() => setShowAlreadyVotedPopup(false)}
            className="shrink-0 text-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Rate limit banner */}
      {showRateLimitBanner && voteError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-yellow-900 bg-yellow-950/20 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle size={14} />
            {voteError}
          </span>
          <button
            onClick={() => { setShowRateLimitBanner(false); setVoteError(null); }}
            className="shrink-0 text-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Generic error (non-rate-limit) */}
      {voteError && !showRateLimitBanner && (
        <p className="text-xs text-red-400">{voteError}</p>
      )}
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
