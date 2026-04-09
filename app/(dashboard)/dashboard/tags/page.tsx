"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Search } from "lucide-react";

type BadgeVariant = "safe" | "warning" | "danger" | "unknown";

const taggedAddresses = [
  {
    address: "0xdead000000000000000000000000000000000000",
    tags: [
      { name: "Scammer", variant: "danger" as BadgeVariant, by: 234 },
      { name: "Phishing", variant: "danger" as BadgeVariant, by: 189 },
      { name: "Rug Pull", variant: "danger" as BadgeVariant, by: 76 },
    ],
  },
  {
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    tags: [
      { name: "Verified", variant: "safe" as BadgeVariant, by: 1892 },
      { name: "DeFi Protocol", variant: "safe" as BadgeVariant, by: 456 },
    ],
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    tags: [
      { name: "Suspicious", variant: "warning" as BadgeVariant, by: 78 },
      { name: "Mixer", variant: "danger" as BadgeVariant, by: 45 },
      { name: "High Volume", variant: "warning" as BadgeVariant, by: 32 },
    ],
  },
  {
    address: "0x7890abcdef1234567890abcdef1234567890abcd",
    tags: [
      { name: "CEX Wallet", variant: "safe" as BadgeVariant, by: 567 },
      { name: "Binance", variant: "safe" as BadgeVariant, by: 412 },
    ],
  },
  {
    address: "0x5678901234567890abcdef1234567890abcdef56",
    tags: [
      { name: "NFT Marketplace", variant: "safe" as BadgeVariant, by: 234 },
      { name: "Verified", variant: "safe" as BadgeVariant, by: 198 },
      { name: "Bridge", variant: "warning" as BadgeVariant, by: 89 },
    ],
  },
];

export default function TagsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const filtered = searchQuery
    ? taggedAddresses.filter(
        (a) =>
          a.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : taggedAddresses;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community Tags</h1>
        <p className="mt-1 text-sm text-muted">
          Human-submitted labels for wallets and contracts. Each address can
          have multiple tags contributed by different users.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by address or tag name..."
          className="pl-10"
        />
      </div>

      {/* Address list with tags */}
      <div className="space-y-4">
        {filtered.map((entry) => (
          <Card key={entry.address}>
            <div className="flex flex-col gap-4">
              {/* Address */}
              <div className="flex items-center justify-between">
                <p className="truncate font-mono text-sm">{entry.address}</p>
                <span className="ml-2 shrink-0 text-xs text-muted">
                  {entry.tags.length} tags
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag.name} variant={tag.variant}>
                    <Tag size={10} className="mr-1" />
                    {tag.name}
                    <span className="ml-1.5 opacity-60">
                      {tag.by}
                    </span>
                  </Badge>
                ))}
              </div>

              {/* Add tag inline */}
              {selectedAddress === entry.address ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setTagInput("");
                    setSelectedAddress(null);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag to this address..."
                    className="text-xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAddress(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setSelectedAddress(entry.address)}
                  className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
                >
                  <Plus size={12} /> Add tag to this address
                </button>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            No addresses found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
