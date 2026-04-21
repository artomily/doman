"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Search } from "lucide-react";

type BadgeVariant = "safe" | "warning" | "danger" | "unknown";

function statusToVariant(status: string): BadgeVariant {
  if (status === "LEGIT") return "safe";
  if (status === "SUSPICIOUS") return "warning";
  if (status === "SCAM") return "danger";
  return "unknown";
}

interface TagEntry {
  id: string;
  tag: string;
  taggedBy: string | null;
}

interface AddressEntry {
  address: string;
  status: string;
  tags: TagEntry[];
}

export default function TagsClient({
  initialData,
}: {
  initialData: AddressEntry[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [data, setData] = useState(initialData);

  const filtered = searchQuery
    ? data.filter(
        (a) =>
          a.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags.some((t) =>
            t.tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : data;

  const handleAddTag = async (e: React.FormEvent, address: string) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    const res = await fetch("/api/v1/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, tag: tagInput.trim() }),
    });
    const json = await res.json();
    if (json.success) {
      setData((prev) =>
        prev.map((entry) =>
          entry.address === address
            ? {
                ...entry,
                tags: [
                  ...entry.tags,
                  { id: json.data.id, tag: json.data.tag, taggedBy: json.data.taggedBy },
                ],
              }
            : entry
        )
      );
    }
    setTagInput("");
    setSelectedAddress(null);
  };

  return (
    <div className="space-y-8">
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            {searchQuery
              ? "No addresses found matching your search."
              : "No tagged addresses yet."}
          </div>
        )}

        {filtered.map((entry) => {
          const variant = statusToVariant(entry.status);

          return (
            <Card
              key={entry.address}
              className="flex flex-col justify-between min-h-24"
            >
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
                    <Badge key={tag.id} variant={variant}>
                      <Tag size={10} className="mr-1" />
                      {tag.tag}
                      {tag.taggedBy && (
                        <span className="ml-1.5 opacity-60">{tag.taggedBy}</span>
                      )}
                    </Badge>
                  ))}
                </div>

                {/* Add tag inline */}
                {selectedAddress === entry.address ? (
                  <form
                    onSubmit={(e) => handleAddTag(e, entry.address)}
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
          );
        })}
      </div>
    </div>
  );
}
