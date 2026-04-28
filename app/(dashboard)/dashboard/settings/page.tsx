"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Key, Shield, Loader2 } from "lucide-react";

interface UserProfile {
  address: string;
  ensName: string | null;
  reportsSubmitted: number;
  reportsVerified: number;
  reputation: number;
  createdAt: string;
}

export default function SettingsPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !walletAddress) {
      setProfile(null);
      return;
    }
    setLoading(true);
    fetch(`/api/v1/address/${walletAddress}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile({
            address: walletAddress,
            ensName: json.data.ensName ?? null,
            reportsSubmitted: json.data.reportsSubmitted ?? 0,
            reportsVerified: json.data.reportsVerified ?? 0,
            reputation: json.data.reputation ?? 0,
            createdAt: json.data.createdAt ?? new Date().toISOString(),
          });
        } else {
          // User exists in wallet but not DB yet — show wallet defaults
          setProfile({
            address: walletAddress,
            ensName: null,
            reportsSubmitted: 0,
            reportsVerified: 0,
            reputation: 0,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        setProfile({
          address: walletAddress,
          ensName: null,
          reportsSubmitted: 0,
          reportsVerified: 0,
          reputation: 0,
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [walletAddress, isConnected]);

  const truncate = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-muted" />
          <h2 className="text-lg font-semibold">Profile</h2>
          {loading && <Loader2 size={14} className="animate-spin text-muted ml-auto" />}
        </div>

        {!isConnected ? (
          <p className="text-sm text-muted">Connect your wallet to view profile details.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted">Wallet Address</label>
              <p className="mt-1 font-mono text-sm break-all">
                {profile?.address ?? walletAddress ?? "—"}
              </p>
            </div>
            {profile?.ensName && (
              <div>
                <label className="text-xs text-muted">ENS Name</label>
                <p className="mt-1 text-sm">{profile.ensName}</p>
              </div>
            )}
            <div>
              <label className="text-xs text-muted">Member Since</label>
              <p className="mt-1 text-sm">
                {profile
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-card-border bg-surface px-4 py-3 text-center">
                <p className="text-lg font-bold">{profile?.reportsSubmitted ?? 0}</p>
                <p className="text-xs text-muted mt-0.5">Reports Submitted</p>
              </div>
              <div className="rounded-xl border border-card-border bg-surface px-4 py-3 text-center">
                <p className="text-lg font-bold">{profile?.reportsVerified ?? 0}</p>
                <p className="text-xs text-muted mt-0.5">Reports Verified</p>
              </div>
              <div className="rounded-xl border border-card-border bg-surface px-4 py-3 text-center">
                <p className="text-lg font-bold">{profile?.reputation ?? 0}</p>
                <p className="text-xs text-muted mt-0.5">Reputation</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted">Plan</label>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-sm font-medium">Free</p>
                <Button size="sm" variant="secondary">
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Bell size={18} className="text-muted" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              label: "Score Changes",
              desc: "Get notified when a watchlisted address score changes",
            },
            {
              label: "New Threats",
              desc: "Alerts about newly flagged addresses in your history",
            },
            {
              label: "Weekly Digest",
              desc: "Weekly summary of your security activity",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between border-b border-card-border pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted">{item.desc}</p>
              </div>
              <div className="h-6 w-10 rounded-full bg-accent/20 p-0.5">
                <div className="h-5 w-5 rounded-full bg-accent transition-transform translate-x-4" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* API Keys */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Key size={18} className="text-muted" />
          <h2 className="text-lg font-semibold">API Keys</h2>
        </div>
        <p className="text-sm text-muted">
          Generate API keys to integrate Doman trust scores into your own
          applications. Available on Pro plan.
        </p>
        <Button size="sm" variant="secondary" className="mt-4">
          Generate API Key
        </Button>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={18} className="text-muted" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Sign-In with Ethereum (SIWE)
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Your wallet is your identity — no passwords needed
              </p>
            </div>
            <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs text-green-400">
              Active
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
