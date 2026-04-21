"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";

// Demo user address — replace with real wallet connect when auth is added
const DEMO_USER = "0x0000000000000000000000000000000000000001";

interface WatchlistEntry {
  id: string;
  watchedAddress: string;
  label: string | null;
  score: number | null;
  prevScore: number | null;
  status: string;
  chain: string;
  lastChecked: string | null;
}

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/watchlist?userAddress=${DEMO_USER}`);
      const json = await res.json();
      if (json.success) setEntries(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/v1/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: DEMO_USER,
          watchedAddress: newAddress.trim().toLowerCase(),
          label: newLabel.trim() || undefined,
        }),
      });
      setNewAddress("");
      setNewLabel("");
      setShowAdd(false);
      await fetchWatchlist();
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (watchedAddress: string) => {
    await fetch(
      `/api/v1/watchlist/${watchedAddress}?userAddress=${DEMO_USER}`,
      { method: "DELETE" }
    );
    setEntries((prev) =>
      prev.filter((e) => e.watchedAddress !== watchedAddress)
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
          <p className="mt-1 text-sm text-muted">
            Monitor addresses and get alerted on score changes
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={14} className="mr-1" /> Add Address
        </Button>
      </div>

      {showAdd && (
        <Card>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x... wallet or contract address"
              className="flex-1"
            />
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (optional)"
              className="sm:w-48"
            />
            <Button type="submit" disabled={adding} size="sm">
              {adding ? "Adding…" : "Add"}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-muted">
            Your watchlist is empty. Add an address to start monitoring.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((item) => {
            const diff =
              item.score !== null && item.prevScore !== null
                ? item.score - item.prevScore
                : 0;
            const isUp = diff > 0;
            const isChanged = diff !== 0;

            return (
              <Card
                key={item.id}
                className="flex flex-col justify-between min-h-24"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {item.label ?? item.watchedAddress}
                    </p>
                    {item.label && (
                      <p className="mt-1 truncate font-mono text-xs text-muted">
                        {item.watchedAddress}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <a
                      href={`/dashboard/checker?q=${item.watchedAddress}`}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => handleRemove(item.watchedAddress)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    {item.score !== null ? (
                      <TrustScoreBadge score={100 - item.score} />
                    ) : (
                      <span className="text-xs text-muted">No data</span>
                    )}
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
                    <p className="text-[10px] text-muted">
                      {item.lastChecked
                        ? new Date(item.lastChecked).toLocaleString()
                        : "Never checked"}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

