"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  History,
  Eye,
  Tag,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Checker", href: "/dashboard/checker", icon: Search },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Eye },
  { label: "Tags", href: "/dashboard/tags", icon: Tag },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-card-border bg-card p-2 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-card-border bg-card transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-card-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent glow-accent">
            <Shield size={16} className="text-white" />
          </div>
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            DOMAN
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-card-border px-4 py-4">
          <div className="rounded-xl bg-surface p-3">
            <p className="text-xs font-medium text-foreground">Free Plan</p>
            <p className="mt-1 text-[10px] text-muted">
              50 checks/day · Upgrade for more
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
