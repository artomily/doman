import { Card } from "@/components/ui/card";
import { TrustScoreBadge } from "@/components/ui/badge";

const historyData = [
  {
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    type: "Address",
    score: 85,
    date: "2026-04-09 14:30",
    chain: "Ethereum",
  },
  {
    address: "uniswap.org",
    type: "Domain",
    score: 95,
    date: "2026-04-09 14:15",
    chain: "—",
  },
  {
    address: "0xdead000000000000000000000000000000000000",
    type: "Address",
    score: 12,
    date: "2026-04-09 13:00",
    chain: "Ethereum",
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    type: "Contract",
    score: 45,
    date: "2026-04-09 11:30",
    chain: "Ethereum",
  },
  {
    address: "fake-airdrop.xyz",
    type: "Domain",
    score: 8,
    date: "2026-04-09 09:00",
    chain: "—",
  },
  {
    address: "0x7890abcdef1234567890abcdef1234567890abcd",
    type: "Address",
    score: 72,
    date: "2026-04-08 22:00",
    chain: "Polygon",
  },
  {
    address: "opensea.io",
    type: "Domain",
    score: 92,
    date: "2026-04-08 20:30",
    chain: "—",
  },
  {
    address: "0x5678901234567890abcdef1234567890abcdef56",
    type: "Contract",
    score: 58,
    date: "2026-04-08 18:00",
    chain: "Ethereum",
  },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check History</h1>
        <p className="mt-1 text-sm text-muted">
          All your previous trust score checks
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-medium">Address / Domain</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Chain</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-card-border/50 transition-colors hover:bg-surface/50"
                >
                  <td className="max-w-xs truncate px-6 py-4 font-mono text-sm">
                    {item.address}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {item.chain}
                  </td>
                  <td className="px-6 py-4">
                    <TrustScoreBadge score={item.score} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
