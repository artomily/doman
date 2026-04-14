import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Key, Shield } from "lucide-react";

export default function SettingsPage() {
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
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted">Wallet Address</label>
            <p className="mt-1 font-mono text-sm">
              0x1a2b3c4d5e6f7890abcdef1234567890abcdef12
            </p>
          </div>
          <div>
            <label className="text-xs text-muted">Connected Since</label>
            <p className="mt-1 text-sm">April 1, 2026</p>
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
          Generate API keys to integrate Wallo trust scores into your own
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
