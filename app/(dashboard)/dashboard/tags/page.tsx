"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Plus } from "lucide-react";

const existingTags = [
  { name: "Scammer", count: 234, variant: "danger" as const },
  { name: "Verified", count: 1892, variant: "safe" as const },
  { name: "DeFi Protocol", count: 456, variant: "safe" as const },
  { name: "Phishing", count: 123, variant: "danger" as const },
  { name: "Bridge", count: 89, variant: "warning" as const },
  { name: "CEX Wallet", count: 567, variant: "safe" as const },
  { name: "NFT Marketplace", count: 234, variant: "safe" as const },
  { name: "Suspicious", count: 78, variant: "warning" as const },
  { name: "Mixer", count: 45, variant: "danger" as const },
  { name: "DAO Treasury", count: 156, variant: "safe" as const },
];

export default function TagsPage() {
  const [newTag, setNewTag] = useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community Tags</h1>
        <p className="mt-1 text-sm text-muted">
          User-submitted labels for addresses and contracts
        </p>
      </div>

      {/* Add tag */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Suggest a New Tag
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNewTag("");
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Tag
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name..."
              className="pl-10"
            />
          </div>
          <Button type="submit" size="md">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </form>
      </Card>

      {/* Tag cloud */}
      <Card>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">
          Popular Tags
        </h2>
        <div className="flex flex-wrap gap-3">
          {existingTags.map((tag) => (
            <div
              key={tag.name}
              className="group flex items-center gap-2"
            >
              <Badge variant={tag.variant}>
                {tag.name}
                <span className="ml-1.5 opacity-60">{tag.count}</span>
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
