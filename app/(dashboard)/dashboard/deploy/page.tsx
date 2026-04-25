"use client";

import { useState } from "react";
import { useAccount, useConnect, useDeployContract, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { CheckCircle2, Loader2, ExternalLink, Wallet, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import artifact from "@/ScamReporter.json";

type DeployState =
  | { status: "idle" }
  | { status: "deploying" }
  | { status: "success"; address: `0x${string}`; txHash: `0x${string}` }
  | { status: "error"; message: string };

export default function DeployPage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { deployContractAsync } = useDeployContract();

  const [state, setState] = useState<DeployState>({ status: "idle" });
  const [copied, setCopied] = useState(false);

  const isCorrectChain = chainId === baseSepolia.id;

  const handleDeploy = async () => {
    if (!isConnected || !isCorrectChain) return;
    setState({ status: "deploying" });
    try {
      const result = await deployContractAsync({
        abi: artifact.abi,
        bytecode: artifact.bytecode.object as `0x${string}`,
        args: [],
      });
      // deployContractAsync returns the tx hash; we need to wait for the receipt
      // but we can show the tx hash immediately and poll for address
      setState({ status: "success", address: result as any, txHash: result });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.includes("User rejected") || err.message.includes("user rejected")
            ? "Transaction cancelled."
            : err.message
          : "Deployment failed.";
      setState({ status: "error", message });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deploy ScamReporter Contract</h1>
        <p className="mt-1 text-sm text-muted">
          Deploy the ScamReporter smart contract to Base Sepolia using your connected wallet.
          This is a one-time operation.
        </p>
      </div>

      {/* Wallet */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Wallet
        </h3>
        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">Connect your wallet to deploy.</p>
            <div className="flex flex-wrap gap-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  variant="secondary"
                  size="sm"
                >
                  <Wallet size={13} className="mr-1.5" />
                  {connector.name}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Connected as</span>
              <span className="font-mono text-xs">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Network</span>
              {isCorrectChain ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950 px-2.5 py-1 text-xs font-medium text-blue-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Base Sepolia
                </span>
              ) : (
                <Button
                  onClick={() => switchChain({ chainId: baseSepolia.id })}
                  disabled={isSwitching}
                  variant="secondary"
                  size="sm"
                >
                  {isSwitching ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Switch to Base Sepolia"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Contract info */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Contract
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Name</span>
            <span>ScamReporter</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Compiler</span>
            <span>Solidity 0.8.24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Function</span>
            <span className="font-mono text-xs">submitReport(bytes32, bool)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Gas (est.)</span>
            <span>~22–24k per call</span>
          </div>
        </div>
      </Card>

      {/* Deploy button / status */}
      {state.status === "success" ? (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold">Deployed!</p>
              <p className="text-xs text-muted">Transaction sent to Base Sepolia.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-card-border bg-surface p-3 text-xs">
              <p className="mb-1 text-muted">Tx hash</p>
              <div className="flex items-center justify-between gap-2">
                <span className="break-all font-mono">{state.txHash}</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${state.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-accent hover:underline"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-900 bg-yellow-950/30 p-4 text-sm">
              <p className="font-medium text-yellow-400">Next step</p>
              <p className="mt-1 text-xs text-muted">
                Wait for the transaction to be confirmed, then check BaseScan for the contract
                address and paste it into{" "}
                <code className="font-mono text-accent">config/contracts.ts</code>:
              </p>
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-card p-3 font-mono text-[11px]">
                <code className="flex-1 break-all text-muted">
                  {`[baseSepolia.id]: '0x<contract-address>',`}
                </code>
              </div>
              <a
                href={`https://sepolia.basescan.org/tx/${state.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
              >
                Open BaseScan <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </Card>
      ) : state.status === "error" ? (
        <Card>
          <p className="text-sm text-red-400">{state.message}</p>
          <Button
            onClick={() => setState({ status: "idle" })}
            variant="secondary"
            size="sm"
            className="mt-3"
          >
            Try again
          </Button>
        </Card>
      ) : (
        <Button
          onClick={handleDeploy}
          variant="primary"
          disabled={!isConnected || !isCorrectChain || state.status === "deploying"}
          className="w-full"
        >
          {state.status === "deploying" ? (
            <>
              <Loader2 size={15} className="mr-2 animate-spin" />
              Deploying…
            </>
          ) : (
            "Deploy ScamReporter to Base Sepolia"
          )}
        </Button>
      )}
    </div>
  );
}
