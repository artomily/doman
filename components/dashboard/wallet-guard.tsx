"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

// Pages inside /dashboard that are accessible without a wallet
const PUBLIC_PATHS = [
  "/connect",
  "/dashboard/checker",
];

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, status } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  // Track whether wallet was connected in a previous render
  const prevConnected = useRef<boolean | null>(null);

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (status === "connecting" || status === "reconnecting") return;

    if (!isConnected && !isPublicPath) {
      if (prevConnected.current === true) {
        // Mid-session disconnect → back to marketing home
        router.replace("/");
      } else {
        // Initial launch without wallet → connect page
        router.replace("/connect");
      }
    }

    prevConnected.current = isConnected;
  }, [isConnected, status, isPublicPath, router]);

  // While resolving, show spinner only for protected pages
  if ((status === "connecting" || status === "reconnecting") && !isPublicPath) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  return <>{children}</>;
}
