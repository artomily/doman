import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Eye,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Checks",
    value: "1,247",
    change: "+12%",
    up: true,
    icon: Search,
  },
  {
    label: "Flagged Addresses",
    value: "23",
    change: "+3",
    up: true,
    icon: AlertTriangle,
  },
  {
    label: "Watchlist",
    value: "8",
    change: "0",
    up: false,
    icon: Eye,
  },
  {
    label: "Trust Score Avg",
    value: "72",
    change: "+5",
    up: true,
    icon: Shield,
  },
];

const recentActivity = [
  {
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    type: "Address Check",
    score: 85,
    time: "2 min ago",
  },
  {
    address: "uniswap.org",
    type: "Domain Check",
    score: 95,
    time: "15 min ago",
  },
  {
    address: "0xdead000000000000000000000000000000000000",
    type: "Address Check",
    score: 12,
    time: "1 hour ago",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    type: "Contract Check",
    score: 45,
    time: "3 hours ago",
  },
  {
    address: "fake-airdrop.xyz",
    type: "Domain Check",
    score: 8,
    time: "5 hours ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of your Web3 security activity
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <stat.icon size={18} className="text-muted" />
              <span
                className={`flex items-center gap-1 text-xs ${
                  stat.up ? "text-green-400" : "text-muted"
                }`}
              >
                {stat.up ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <a
            href="/dashboard/history"
            className="text-xs text-accent hover:underline"
          >
            View All
          </a>
        </div>
        <div className="space-y-0">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-t border-card-border py-4 first:border-0 first:pt-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm">{item.address}</p>
                <p className="mt-0.5 text-xs text-muted">{item.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <TrustScoreBadge score={item.score} />
                <span className="hidden text-xs text-muted sm:block">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
