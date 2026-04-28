'use client';

import { useState } from 'react';
import { useAccount, useConnect, useSwitchChain, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { AlertTriangle, CheckCircle2, Loader2, ExternalLink, Wallet, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Steps } from '@/components/ui/steps';
import { Button } from '@/components/ui/button';
import { hashReasonData, type ReasonData } from '@/lib/hash';
import { useReportScam } from '@/hooks/use-report-scam';
import { SUPPORTED_CHAIN_IDS, CONTRACT_ADDRESSES } from '@/config/contracts';

// ─── Types ───────────────────────────────────────────────────────────────────

const REASONS = [
  { id: 'phishing', label: 'Phishing', emoji: '🎣' },
  { id: 'rug_pull', label: 'Rug Pull', emoji: '💸' },
  { id: 'fake_airdrop', label: 'Fake Airdrop', emoji: '🎁' },
  { id: 'impersonation', label: 'Impersonation', emoji: '🎭' },
  { id: 'other', label: 'Other', emoji: '⚠️' },
] as const;

type ReasonId = (typeof REASONS)[number]['id'];

interface ReportScamModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAddress: string;
  isDomain?: boolean;
}

const STEPS = ['Details', 'Preview', 'Confirm'];

const BLOCK_EXPLORER: Record<number, string> = {
  [base.id]: 'https://basescan.org/tx/',
  [baseSepolia.id]: 'https://sepolia.basescan.org/tx/',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NetworkBadge({ chainId }: { chainId: number }) {
  const isBase = chainId === base.id;
  const isBaseSepolia = chainId === baseSepolia.id;
  const isSupported = (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isSupported
          ? 'bg-blue-950 text-blue-400'
          : 'bg-red-950 text-red-400'
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${isSupported ? 'bg-blue-400' : 'bg-red-400'}`}
      />
      {isBase ? 'Base' : isBaseSepolia ? 'Base Sepolia' : `Chain ${chainId}`}
    </span>
  );
}

// ─── Step 1: Form ─────────────────────────────────────────────────────────────

interface Step1Props {
  selectedReasons: ReasonId[];
  customText: string;
  onToggleReason: (id: ReasonId) => void;
  onCustomTextChange: (v: string) => void;
  onNext: () => void;
}

function Step1Form({ selectedReasons, customText, onToggleReason, onCustomTextChange, onNext }: Step1Props) {
  const canProceed = selectedReasons.length > 0 || customText.trim().length > 0;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Select all reasons that apply. Your report helps the community stay safe.
      </p>

      {/* Reason checkboxes */}
      <div className="space-y-2">
        {REASONS.map((reason) => {
          const checked = selectedReasons.includes(reason.id);
          return (
            <label
              key={reason.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                checked
                  ? 'border-accent bg-accent/5 text-foreground'
                  : 'border-card-border hover:border-muted'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onToggleReason(reason.id)}
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked ? 'border-accent bg-accent' : 'border-card-border'
                }`}
              >
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="mr-1">{reason.emoji}</span>
              {reason.label}
            </label>
          );
        })}
      </div>

      {/* Custom text */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          Additional details (optional)
        </label>
        <textarea
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="Describe what happened…"
          maxLength={2000}
          rows={3}
          className="w-full resize-none rounded-xl border border-card-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-muted">{customText.length}/2000</p>
      </div>

      {!canProceed && (
        <p className="text-xs text-red-400">Select at least one reason or add a description to continue.</p>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} variant="primary" size="sm">
          Preview →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Preview ──────────────────────────────────────────────────────────

interface Step2Props {
  targetAddress: string;
  selectedReasons: ReasonId[];
  customText: string;
  chainId: number;
  isDomain: boolean;
  onBack: () => void;
  onNext: () => void;
}

function Step2Preview({ targetAddress, selectedReasons, customText, chainId, isDomain, onBack, onNext }: Step2Props) {
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const reasonData: ReasonData = {
    selectedReasons: selectedReasons.map((id) => REASONS.find((r) => r.id === id)!.label),
    customText,
  };
  const hash = hashReasonData(reasonData);
  // On mainnet without a deployed contract, require switching to testnet first
  const mainnetMissingContract = !isDomain && chainId === base.id && !CONTRACT_ADDRESSES[base.id];
  const isSupported = isDomain || ((SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId) && !mainnetMissingContract);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {isDomain
          ? 'Review your report before submitting to our community database.'
          : 'Review your report before submitting to the blockchain.'}
      </p>

      {/* Report summary */}
      <div className="space-y-3 rounded-xl border border-card-border bg-surface px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-muted">{isDomain ? 'Target website' : 'Target address'}</p>
          <p className="mt-0.5 font-mono text-xs">{targetAddress}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Selected reasons</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {selectedReasons.map((id) => {
              const r = REASONS.find((r) => r.id === id)!;
              return (
                <span key={id} className="rounded-full bg-card border border-card-border px-2.5 py-0.5 text-xs">
                  {r.emoji} {r.label}
                </span>
              );
            })}
            {!selectedReasons.length && <span className="text-muted">None selected</span>}
          </div>
        </div>
        {customText && (
          <div>
            <p className="text-xs text-muted">Additional details</p>
            <p className="mt-0.5 text-xs text-foreground">{customText}</p>
          </div>
        )}
        {!isDomain && (
          <div>
            <p className="text-xs text-muted">Reason hash (bytes32)</p>
            <p className="mt-0.5 font-mono text-[10px] break-all text-muted">{hash}</p>
          </div>
        )}
      </div>

      {/* Network check — address only */}
      {!isDomain && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-card-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Network</span>
              <NetworkBadge chainId={chainId} />
            </div>
            {(!isSupported || mainnetMissingContract) && (
              <Button
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                disabled={isSwitching}
                variant="secondary"
                size="sm"
              >
                {isSwitching ? <Loader2 size={12} className="animate-spin" /> : 'Switch to Base Sepolia'}
              </Button>
            )}
          </div>
          {mainnetMissingContract && (
            <div className="flex items-start gap-2 rounded-xl border border-yellow-900 bg-yellow-950/20 px-4 py-3 text-xs text-yellow-400">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>
                Kontrak belum di-deploy ke mainnet. Gunakan <strong>Base Sepolia</strong> (testnet) untuk mencoba fitur ini terlebih dahulu.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="sm">← Back</Button>
        <Button onClick={onNext} variant="primary" size="sm" disabled={!isSupported}>
          Confirm & Submit →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

interface Step3Props {
  targetAddress: string;
  selectedReasons: ReasonId[];
  customText: string;
  chainId: number;
  isDomain: boolean;
  onBack: () => void;
  onClose: () => void;
}

function Step3Confirm({ targetAddress, selectedReasons, customText, chainId, isDomain, onBack, onClose }: Step3Props) {
  const { address: walletAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { step, txHash, error, isLoading, submit, reset } = useReportScam();

  const txExplorerUrl = txHash ? `${BLOCK_EXPLORER[chainId] ?? 'https://sepolia.basescan.org/tx/'}${txHash}` : null;

  const handleSubmit = () => {
    if (!walletAddress) return;
    const reasonData: ReasonData = {
      selectedReasons: selectedReasons.map((id) => REASONS.find((r) => r.id === id)!.label),
      customText,
    };
    submit({ targetAddress, reasonData, reporterAddress: walletAddress, chainId });
  };

  // ── Success state
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 size={28} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold">
            {isDomain ? 'Website reported!' : 'Report submitted!'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {isDomain
              ? 'Thank you! This website has been flagged in our database.'
              : 'Thank you for helping keep the community safe.'}
          </p>
        </div>
        {!isDomain && txExplorerUrl && (
          <a
            href={txExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            View on BaseScan <ExternalLink size={11} />
          </a>
        )}
        <Button onClick={onClose} variant="secondary" size="sm">
          Close
        </Button>
      </div>
    );
  }

  // ── Error state
  if (step === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-950">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} variant="secondary" size="sm">
            <RefreshCw size={13} className="mr-1.5" /> Try again
          </Button>
          <Button onClick={onBack} variant="ghost" size="sm">← Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Wallet connect prompt */}
      {!isConnected ? (
        <div className="rounded-xl border border-card-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium">Connect your wallet to submit</p>
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
        <div className="rounded-xl border border-card-border bg-surface px-4 py-3 text-sm">
          <span className="text-muted">Connected as </span>
          <span className="font-mono text-xs">
            {walletAddress?.slice(0, 6)}…{walletAddress?.slice(-4)}
          </span>
        </div>
      )}

      {/* In-progress states */}
      {step === 'saving' && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          Saving report…
        </div>
      )}
      {!isDomain && step === 'deploying' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            Deploying ScamReporter contract — approve in your wallet…
          </div>
          <p className="pl-6 text-xs text-muted">
            One-time setup. Only needed once per network.
          </p>
        </div>
      )}
      {!isDomain && step === 'deploy-confirming' && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          Waiting for contract deployment to confirm…
        </div>
      )}
      {!isDomain && step === 'wallet' && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          Submitting report on-chain — approve in your wallet…
        </div>
      )}
      {!isDomain && step === 'confirming' && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          Transaction submitted — waiting for block confirmation…
          {txExplorerUrl && (
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-surface px-4 py-3 text-xs text-muted">
        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
        <span>
          {isDomain
            ? 'Your report will be saved to our community database to help warn other users. No gas fee required.'
            : 'Submitting requires a small gas fee on Base. If the contract is not yet deployed, you will be asked to approve a deploy transaction first (one-time). Only the hash of your report is stored on-chain — no personal data.'}
        </span>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="sm" disabled={isLoading}>← Back</Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="sm"
          disabled={!isConnected || isLoading}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : '🚨 Submit Report'}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ReportScamModal({ isOpen, onClose, targetAddress, isDomain = false }: ReportScamModalProps) {
  const chainId = useChainId();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState<ReasonId[]>([]);
  const [customText, setCustomText] = useState('');

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedReasons([]);
      setCustomText('');
    }, 200);
  };

  const toggleReason = (id: ReasonId) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isDomain ? 'Report Scam Website' : 'Report Scam Address'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Steps indicator */}
        <Steps steps={STEPS} current={currentStep} />

        {/* Divider */}
        <div className="border-t border-card-border" />

        {/* Step content */}
        {currentStep === 1 && (
          <Step1Form
            selectedReasons={selectedReasons}
            customText={customText}
            onToggleReason={toggleReason}
            onCustomTextChange={setCustomText}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2Preview
            targetAddress={targetAddress}
            selectedReasons={selectedReasons}
            customText={customText}
            chainId={chainId}
            isDomain={isDomain}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <Step3Confirm
            targetAddress={targetAddress}
            selectedReasons={selectedReasons}
            customText={customText}
            chainId={chainId}
            isDomain={isDomain}
            onBack={() => setCurrentStep(2)}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
}
