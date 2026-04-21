import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export default async function HistoryPage() {
  const scans = await prisma.contractScan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      address: {
        select: { address: true, chain: true, category: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check History</h1>
        <p className="mt-1 text-sm text-muted">
          All previous trust score checks on the platform
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Chain</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted"
                  >
                    No scan history yet. Try checking an address.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-card-border/50 transition-colors hover:bg-surface/50"
                  >
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-sm">
                      {scan.address.address}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted capitalize">
                        {scan.address.category
                          .toLowerCase()
                          .replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {scan.address.chain}
                    </td>
                    <td className="px-6 py-4">
                      <TrustScoreBadge score={100 - scan.riskScore} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {scan.riskLevel}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

