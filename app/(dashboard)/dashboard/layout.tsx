import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { WalletGuard } from "@/components/dashboard/wallet-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <WalletGuard>{children}</WalletGuard>
        </main>
      </div>
    </div>
  );
}
