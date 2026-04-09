"use client";

import { Bell, Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-card-border bg-card px-6">
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
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-accent to-green-600" />
          <div className="hidden text-sm md:block">
            <p className="font-medium">0x1a2b...3c4d</p>
          </div>
        </div>
      </div>
    </header>
  );
}
