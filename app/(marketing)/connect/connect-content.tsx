"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { Wallet, ArrowRight, Loader2, CheckCircle2, History, Eye, Tag, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: History,
    label: "Personal History",
    desc: "Track every address you've checked",
  },
  {
    icon: Eye,
    label: "Watchlist",
    desc: "Monitor specific addresses for risk changes",
  },
  {
    icon: Tag,
    label: "Custom Tags",
    desc: "Label addresses with your own notes",
  },
  {
    icon: Shield,
    label: "Community Reports",
    desc: "Submit on-chain scam reports to protect others",
  },
];

interface Feature {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  desc: string;
}

// Map connector ids to icon/name
function ConnectorIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("metamask")) {
    return (
      <svg width="24" height="24" viewBox="0 0 35 33" fill="none" className="shrink-0">
        <path d="M32.96 1L19.39 10.7l2.52-5.94L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.03 1l13.46 9.8-2.4-5.94L2.03 1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28.2 23.53l-3.62 5.54 7.75 2.13 2.22-7.54-6.35-.13zM1.47 23.66l2.2 7.54 7.74-2.13-3.6-5.54-6.34.13z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 14.37l-2.17 3.28 7.73.34-.26-8.3L11 14.37zM23.97 14.37l-5.38-4.78-.18 8.4 7.72-.34-2.16-3.28z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.41 29.07l4.65-2.26-4.01-3.13-.64 5.39zM18.93 26.81l4.66 2.26-.65-5.39-4.01 3.13z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return <Wallet size={24} className="shrink-0 text-muted" />;
}

export default function ConnectWalletContent() {
  const { isConnected, status } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  // Redirect to intended destination (or dashboard) after connecting
  useEffect(() => {
    if (status === "connected") {
      router.replace(redirectTo);
    }
  }, [status, router, redirectTo]);

  // While wagmi is still reconnecting, show nothing (avoids flash)
  if (status === "reconnecting" || status === "connecting") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  // Already connected state (brief flash before redirect)
  if (isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-accent">
          <CheckCircle2 size={18} />
          Wallet connected — redirecting…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
            <CheckCircle2 size={30} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Connect your wallet</h1>
          <p className="mt-2 text-sm text-muted">
            Connect to unlock your personal history, watchlist, and on-chain reporting.
          </p>
        </div>

        {/* Connector buttons */}
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="group flex w-full items-center gap-4 rounded-xl border border-card-border bg-card px-5 py-4 text-left transition-all hover:border-accent/50 hover:bg-surface disabled:opacity-60"
            >
              <ConnectorIcon name={connector.name} />
              <div className="flex-1">
                <p className="font-medium leading-none">{connector.name}</p>
                <p className="mt-1 text-xs text-muted">Browser extension / injected wallet</p>
              </div>
              {isPending ? (
                <Loader2 size={16} className="shrink-0 animate-spin text-muted" />
              ) : (
                <ArrowRight size={16} className="shrink-0 text-muted transition-colors group-hover:text-accent" />
              )}
            </button>
          ))}

          {connectors.length === 0 && (
            <div className="rounded-xl border border-card-border bg-surface px-5 py-4 text-sm text-muted">
              No wallet detected. Install{" "}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                MetaMask
              </a>{" "}
              or another browser wallet to continue.
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-card-border" />
          <span className="text-xs text-muted">What you unlock</span>
          <div className="h-px flex-1 bg-card-border" />
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-card-border bg-card p-4 space-y-1.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Icon size={15} className="text-accent" />
              </div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[11px] text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Skip */}
        <p className="text-center text-xs text-muted">
          Don&apos;t have a wallet?{" "}
          <button
            onClick={() => router.push("/dashboard/checker")}
            className="text-accent hover:underline"
          >
            Use the checker anonymously
          </button>
        </p>
      </div>
    </div>
  );
}
