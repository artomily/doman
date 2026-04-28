import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ConnectWalletContent from "./connect-content";

export default function ConnectWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={20} className="animate-spin text-muted" />
        </div>
      }
    >
      <ConnectWalletContent />
    </Suspense>
  );
}


