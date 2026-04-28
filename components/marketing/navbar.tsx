"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "API Reference", href: "/api-reference" },
  { label: "Contact", href: "#contact" },
];

function LaunchAppButton({ className }: { className?: string }) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  const handleLaunch = async () => {
    if (isConnected) {
      router.push("/dashboard/checker");
      return;
    }
    setConnecting(true);
    try {
      connect(
        { connector: connectors[0] },
        {
          onSuccess: () => router.push("/dashboard/checker"),
          onError: () => setConnecting(false),
          onSettled: () => setConnecting(false),
        }
      );
    } catch {
      setConnecting(false);
    }
  };

  return (
    <Button size="sm" className={className} onClick={handleLaunch} disabled={connecting}>
      {connecting ? "Connecting..." : "Launch App"}
    </Button>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-card-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Doman"
            width={120}
            height={32}
            priority
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <LaunchAppButton />
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-card-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <LaunchAppButton className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
