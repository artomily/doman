"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Wallet, LogOut, ChevronDown, Copy, Check } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const ACTIVE_SCAN_CHAIN_ID = Number.parseInt(
  process.env.NEXT_PUBLIC_SCAN_CHAIN_ID ?? process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? "84532",
  10
);

function NetworkModeButtons() {
  const isTestnetActive = ACTIVE_SCAN_CHAIN_ID === 84532;

  return (
    <div
      className="hidden items-center rounded-xl border border-card-border bg-surface p-1 md:flex"
      role="tablist"
      aria-label="Scan network mode"
    >
      <button
        type="button"
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isTestnetActive
            ? "bg-accent/20 text-accent"
            : "text-muted hover:text-foreground"
        }`}
        aria-pressed={isTestnetActive}
        title="Scanning is currently enabled on Base Sepolia"
      >
        Testnet
      </button>
      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-lg px-3 py-1.5 text-xs font-medium text-muted opacity-60"
        aria-disabled="true"
        title="Mainnet scan is not available yet"
      >
        Mainnet
      </button>
    </div>
  );
}

function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="flex items-center gap-2 rounded-xl border border-card-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Wallet size={15} />
        <span className="hidden md:inline">Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-card-border bg-surface px-3 py-1.5 text-sm transition-colors hover:border-accent"
      >
        <div className="h-5 w-5 rounded-full bg-linear-to-br from-accent to-zinc-400 shrink-0" />
        <span className="hidden font-mono md:inline">{truncated}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-card-border bg-card shadow-xl z-50">
          <div className="border-b border-card-border px-4 py-3">
            <p className="text-xs text-muted">Connected wallet</p>
            <p className="mt-0.5 font-mono text-sm break-all">{address}</p>
          </div>
          <div className="p-1.5">
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy address"}
            </button>
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-950/40"
            >
              <LogOut size={15} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-card-border bg-card px-6 sticky top-0 z-10">
      {/* Left spacer for mobile hamburger */}
      <div className="w-10 lg:hidden" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="Search address, domain, or tag..."
          className="w-80 rounded-xl border border-card-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <NetworkModeButtons />
        <button className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <WalletButton />
      </div>
    </header>
  );
}
