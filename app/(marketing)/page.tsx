import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuardedButton } from "@/components/marketing/guarded-button";
import {
  Shield,
  Search,
  FileCode,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Eye,
  Zap,
  Lock,
  MonitorSmartphone,
  ArrowDownLeft,
  GitBranch,
  BookOpen,
  Code2,
  ExternalLink,
  Puzzle,
  Bell,
  ScanSearch,
  ShieldAlert,
} from "lucide-react";

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background">
      {/* Multi-layer gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/3 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[140px]" />
        <div className="absolute -bottom-1/4 -right-1/5 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-accent/5 blur-[180px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes hero-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes hero-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {/* Scan line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/30"
        style={{ animation: "hero-scan 6s linear infinite" }}
      />
      
      {/* Content */}
      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 py-32 md:py-40">
        {/* Headline */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            SCAN BEFORE
            <br />
            <span className="relative inline-block">
              YOU SEND
            </span>
            <span className="text-accent">.</span>
            <br />
            <span className="text-muted/70">TRUST BEFORE</span>
            <br />
            <span className="text-muted/70">YOU TRANSACT</span>
            <span className="text-accent">.</span>
          </h1>
        </div>

        {/* Description + CTA */}
        <div className="flex max-w-2xl flex-col items-center text-center">
          <p className="max-w-lg text-sm leading-relaxed text-muted md:text-base">
            Real-time on-chain analysis, smart contract inspection, and community
            reputation — fused into a single trust score.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <GuardedButton size="lg" href="/dashboard/checker">
              Try the Checker <ArrowRight size={16} className="ml-2" />
            </GuardedButton>
            <Button variant="secondary" size="lg" href="#features">
              See How It Works
            </Button>
          </div>
        </div>

        {/* Floating checker preview */}
        <div
          className="relative mt-16 w-full max-w-2xl md:mt-20 lg:max-w-3xl"
          style={{ animation: "hero-float 8s ease-in-out infinite" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-card-border/60 bg-card/60 backdrop-blur-xl">
            {/* Inner glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/10 blur-[60px]" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-500/8 blur-[50px]" />

            {/* Header bar */}
            <div className="flex items-center gap-3 border-b border-card-border/50 bg-surface/30 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 rounded-md bg-background/60 px-3 py-1 text-center font-mono text-[10px] text-muted">
                domanprotocol.vercel.app/dashboard/checker
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/15">
                <Shield size={11} className="text-accent" />
              </div>
            </div>

            {/* Checker body */}
            <div className="p-5 md:p-6">
              {/* Address input */}
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-card-border/50 bg-background/40 px-4 py-3">
                <Search size={14} className="shrink-0 text-muted" />
                <span className="flex-1 truncate font-mono text-xs text-muted">
                  0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
                </span>
                <div
                  className="h-2 w-2 shrink-0 rounded-full bg-accent"
                  style={{ animation: "hero-pulse 1.5s ease-in-out infinite" }}
                />
              </div>

              {/* Scan result — split layout */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Score circle */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-green-500/15 bg-green-500/5 p-5">
                  <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-green-500/30">
                    <div className="absolute inset-2 rounded-full border border-green-500/20" />
                    <span className="text-3xl font-bold text-green-400">91</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-green-400" />
                    <span className="text-xs font-semibold text-green-400">SAFE</span>
                  </div>
                </div>

                {/* Detail rows */}
                <div className="flex flex-col justify-center gap-3 rounded-xl border border-card-border/40 bg-surface/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">Tx History</span>
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">Clean</span>
                  </div>
                  <div className="h-px bg-card-border/40" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">Contract Risk</span>
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">None</span>
                  </div>
                  <div className="h-px bg-card-border/40" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">Funding</span>
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">Verified</span>
                  </div>
                  <div className="h-px bg-card-border/40" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted">Risk Level</span>
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">LOW</span>
                  </div>
                </div>
              </div>

              {/* Data source strip */}
              <div className="mt-4 flex items-center justify-center gap-3 text-[9px] uppercase tracking-widest text-muted/30">
                <span>Base</span>
                <span className="text-muted/15">|</span>
                <span>GoPlus</span>
                <span className="text-muted/15">|</span>
                <span>Basescan</span>
                <span className="text-muted/15">|</span>
                <span>Community Signals</span>
              </div>
            </div>
          </div>

          {/* Bottom glow shadow */}
          <div className="absolute -bottom-6 left-1/2 h-12 w-2/3 -translate-x-1/2 rounded-full bg-accent/8 blur-2xl" />
        </div>

        {/* Bottom stat counters */}
        <div className="mt-16 flex items-center gap-8 text-center md:mt-20">
          <div>
            <p className="text-lg font-bold text-accent">10K+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted/50">Users</p>
          </div>
          <div className="h-6 w-px bg-card-border/30" />
          <div>
            <p className="text-lg font-bold">500K+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted/50">Scanned</p>
          </div>
          <div className="h-6 w-px bg-card-border/30" />
          <div>
            <p className="text-lg font-bold text-glow">90%+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted/50">Detection</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── About / Problem ───────── */
function About() {
  return (
    <section id="about" className="border-t border-card-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
            {/* <span className="text-[10px] font-bold text-black">W</span> */}
          </div>
          <span className="text-xs uppercase tracking-wider text-muted">
            About · Doman
          </span>
        </div>

        <h2 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
          YOU THINK THE BLOCKCHAIN IS TRANSPARENT. ACTUALLY IT&apos;S A MAZE,
          AND SOMEHOW DOMAN HELPS YOU NAVIGATE YOUR{" "}
          <span className="inline-flex items-center">
            SAFETY
            <span className="ml-2 inline-block h-10 w-10 rounded-full bg-accent md:h-14 md:w-14" />
          </span>
        </h2>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Web3 scam losses reached $14B in 2024 — mostly from phishing, bad
          approvals, and fake addresses. Existing tools are too technical and
          developer-focused. Doman makes security accessible to everyone.
        </p>
      </div>
    </section>
  );
}

/* ───────── Use Cases ───────── */
const useCases = [
  {
    label: "DEFI NEWBIE",
    tag: "SAFETY",
    description: "Simple safe/unsafe signals before every transaction",
    color: "from-zinc-800/50 to-zinc-900/70",
  },
  {
    label: "ACTIVE TRADER",
    tag: "SPEED",
    description: "Quick trust checks that don't interrupt your workflow",
    color: "from-zinc-800/50 to-zinc-900/70",
  },
  {
    label: "NFT COLLECTOR",
    tag: "PROTECTION",
    description: "Scan domains and mint pages before connecting",
    color: "from-zinc-800/50 to-zinc-900/70",
  },
  {
    label: "DEVELOPER",
    tag: "API",
    description: "Integrate trust scores into your own applications",
    color: "from-zinc-800/50 to-zinc-900/70",
  },
];

function UseCases() {
  return (
    <section id="use-cases" className="border-t border-card-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted">
              Use Cases
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              WHO IT&apos;S FOR
            </h2>
          </div>
          <span className="hidden text-sm text-muted md:block">01—04</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {useCases.map((uc) => (
            <div
              key={uc.label}
              className={`group relative overflow-hidden rounded-2xl border border-card-border bg-linear-to-br ${uc.color} p-8 transition-all hover:border-accent/30 md:p-10`}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  {uc.label}
                </span>
                <span className="rounded-full bg-card-border/50 px-3 py-1 text-[10px] uppercase tracking-wider text-muted">
                  {uc.tag}
                </span>
              </div>
              <p className="text-lg font-medium leading-snug md:text-xl">
                {uc.description}
              </p>
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight size={20} className="text-accent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Features ───────── */
const features = [
  {
    num: "01",
    title: "TRUST SCORE ENGINE",
    desc: "Analyze transaction history, funding sources, community signals, and contract risk.",
    icon: ArrowDownLeft,
  },
  {
    num: "02",
    title: "ADDRESS CHECKER",
    desc: "Input any address or domain and get an instant safety assessment.",
    icon: ArrowDownLeft,
  },
  {
    num: "03",
    title: "CONTRACT INSPECTOR",
    desc: "Decode smart contracts and detect risky approval patterns.",
    icon: ArrowDownLeft,
  },
  {
    num: "04",
    title: "BROWSER EXTENSION",
    desc: "Real-time scanning and warning overlays while you browse.",
    icon: ArrowDownLeft,
  },
  {
    num: "05",
    title: "PUBLIC API",
    desc: "Programmatic access to trust scores for developers and partners.",
    icon: ArrowDownLeft,
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-card-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
            {/* <span className="text-[10px] font-bold text-black">W</span> */}
          </div>
          <span className="text-xs uppercase tracking-wider text-muted">
            Services · Doman
          </span>
        </div>

        <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-5xl">
          SECURITY
          <br />
          FEATURES
        </h2>

        <div className="space-y-0">
          {features.map((f) => (
            <div
              key={f.num}
              className="group flex items-center justify-between border-t border-card-border px-4 py-8 transition-colors hover:bg-surface/50 md:py-12"
            >
              <div className="flex items-center gap-6 md:gap-10">
                <span className="text-sm text-muted">{f.num}</span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight md:text-3xl">
                    {f.title}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-muted opacity-0 transition-opacity group-hover:opacity-100">
                    {f.desc}
                  </p>
                </div>
              </div>
              <f.icon
                size={64}
                className="text-muted transition-colors group-hover:text-accent"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Manifesto ───────── */
function Manifesto() {
  return (
    <section className="border-t border-card-border bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-bold leading-[1.2] tracking-tight md:text-4xl lg:text-5xl">
          SIMPLIFYING{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-white md:h-9 md:w-9 lg:h-12 lg:w-12">
            <Shield className="h-full w-full p-1" />
          </span>{" "}
          WEB3 MEANS{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-glow/20 text-glow md:h-9 md:w-9 lg:h-12 lg:w-12">
            <Lock className="h-full w-full p-1" />
          </span>{" "}
          PROTECTING USERS. BY ELIMINATING{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white md:h-9 md:w-9 lg:h-12 lg:w-12">
            <AlertTriangle className="h-full w-full p-1" />
          </span>{" "}
          SCAMS AND{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-500 text-black md:h-9 md:w-9 lg:h-12 lg:w-12">
            <Eye className="h-full w-full p-1" />
          </span>{" "}
          RISKS, ONLY SAFE{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-white md:h-9 md:w-9 lg:h-12 lg:w-12">
            <CheckCircle className="h-full w-full p-1" />
          </span>{" "}
          TRANSACTIONS REMAIN.
        </h2>
      </div>
    </section>
  );
}

/* ───────── Advantage ───────── */
function Advantage() {
  return (
    <section id="how-it-works" className="border-t border-card-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Visual */}
          <div className="flex items-center justify-center">
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              <div className="absolute inset-0 rounded-full border-2 border-card-border" />
              <div className="absolute inset-6 rounded-full border-2 border-accent/30" />
              <div className="absolute inset-12 rounded-full border-2 border-accent/50" />
              <div className="absolute inset-18 rounded-full bg-accent/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-accent">85</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="text-xs uppercase tracking-wider text-muted">
              Advantage
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              YOUR ASSETS
              <br />
              STAY SAFER
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Doman combines on-chain data from Alchemy, Moralis, and Etherscan
              with community-driven reputation signals. Our scoring engine
              processes transaction history, funding sources, and contract risk
              to deliver trust scores with &gt;90% detection accuracy and
              &lt;2% false positives.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-glow">{"<"}1.5s</p>
                <p className="mt-1 text-xs text-muted">API Response</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-accent">99.5%</p>
                <p className="mt-1 text-xs text-muted">Uptime SLA</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-glow">{">"}90%</p>
                <p className="mt-1 text-xs text-muted">Detection Rate</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-accent">{"<"}300ms</p>
                <p className="mt-1 text-xs text-muted">Extension Speed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Product Highlights ───────── */
function ProductHighlights() {
  return (
    <section className="border-t border-card-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Trust Engine */}
          <div className="overflow-hidden rounded-2xl border border-card-border">
            <div className="bg-linear-to-br from-accent/5 to-zinc-900/40 p-8 md:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                <Zap size={12} /> Engine
              </div>
              <h3 className="text-xs uppercase tracking-wider text-muted">
                Core Technology
              </h3>
              <p className="mt-2 text-xl font-bold md:text-2xl">
                TRUST SCORE ENGINE
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Multi-factor analysis combining transaction patterns, wallet
                age, funding traces, smart contract bytecode inspection, and
                real-time community reputation signals.
              </p>
            </div>
          </div>

          {/* Extension */}
          <div className="overflow-hidden rounded-2xl border border-card-border">
            <div className="bg-linear-to-br from-zinc-800/40 to-zinc-900/60 p-8 md:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-700/50 px-3 py-1 text-xs text-zinc-300">
                <MonitorSmartphone size={12} /> Browser
              </div>
              <h3 className="text-xs uppercase tracking-wider text-muted">
                Real-Time Protection
              </h3>
              <p className="mt-2 text-xl font-bold md:text-2xl">
                BROWSER EXTENSION
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Automatic scanning when you browse crypto sites. Color-coded
                trust badges, popup scores, MetaMask integration, and
                full-screen danger overlays for high-risk pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Extension ───────── */
const extensionFeatures = [
  {
    icon: ScanSearch,
    title: "Real-Time Address Scanning",
    desc: "Automatically detects Ethereum and EVM addresses on any page and overlays instant trust badges.",
  },
  {
    icon: ShieldAlert,
    title: "Phishing & Scam Warnings",
    desc: "Full-screen danger overlays block known scam domains before you can connect your wallet.",
  },
  {
    icon: Globe,
    title: "Works on Every Crypto Site",
    desc: "Etherscan, OpenSea, Uniswap, Blur — the extension silently scans in the background wherever you go.",
  },
  {
    icon: Zap,
    title: "Sub-300ms Response",
    desc: "Powered by the DOMAN API with edge caching so warnings appear before you even notice the scan.",
  },
];

function Extension() {
  return (
    <section
      id="extension"
      className="border-t border-card-border bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                <Puzzle size={11} />
                Browser Extension
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-yellow-400">
                <Bell size={10} />
                Coming Soon — Chrome Web Store
              </span>
            </div>

            <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              PROTECT EVERY
              <br />
              CLICK.
              <br />
              <span className="text-muted">EVERYWHERE YOU BROWSE.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
              The DOMAN browser extension brings the full power of our trust
              engine directly into your browser. Scan addresses, detect
              phishing domains, and get real-time warnings — without ever
              leaving the page.
            </p>
          </div>

          {/* Visual mock */}
          <div className="relative flex-none">
            <div className="relative h-52 w-72 overflow-hidden rounded-2xl border border-card-border bg-card md:h-60 md:w-80">
              <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-zinc-800/30" />
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 border-b border-card-border bg-[#080808] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 rounded bg-zinc-800 px-3 py-1 text-[9px] text-muted">
                  https://app.uniswap.org/swap
                </div>
                {/* Extension icon */}
                <div className="flex h-5 w-5 items-center justify-center rounded bg-accent/20">
                  <Shield size={10} className="text-accent" />
                </div>
              </div>
              {/* Mock content area */}
              <div className="relative p-4">
                {/* Address badge */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex-1 rounded bg-zinc-800 px-2 py-1.5 font-mono text-[8px] text-zinc-400">
                    0x4200...0006
                  </div>
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[8px] font-semibold text-green-400">
                    SAFE · 91
                  </span>
                </div>
                {/* Warning overlay */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={10} className="text-red-400" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-red-400">
                      Phishing Domain Detected
                    </span>
                  </div>
                  <p className="text-[7px] leading-relaxed text-red-300/70">
                    This site is flagged as a known scam. Do not connect your
                    wallet.
                  </p>
                </div>
                {/* Scanning indicator */}
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  <span className="text-[8px] text-muted">Scanning page...</span>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {extensionFeatures.map((feat) => (
            <div
              key={feat.title}
              className="group rounded-2xl border border-card-border bg-card p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                <feat.icon size={16} className="text-accent" />
              </div>
              <h3 className="text-sm font-semibold leading-snug">{feat.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-10 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-card-border bg-card p-8 md:flex-row">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              doman-extension · Releasing on Chrome Web Store
            </p>
            <p className="mt-1 text-lg font-bold">
              Be the first to know when it drops.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="lg"
              href="https://github.com/domanprotocol/extension"
            >
              <GitBranch size={15} className="mr-2" />
              View Extension Source
              <ExternalLink size={12} className="ml-2 opacity-50" />
            </Button>
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-accent/20 px-5 py-3 text-sm font-medium text-accent/60 opacity-70 ring-1 ring-accent/20"
            >
              <Puzzle size={15} />
              Add to Chrome
              <span className="ml-1 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-yellow-400">
                Soon
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Open Source / Developer ───────── */
function OpenSource() {
  return (
    <section
      id="open-source"
      className="border-t border-card-border bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
              <GitBranch size={11} />
              Open Source · MIT License
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
              BUILT IN THE OPEN.
              <br />
              <span className="text-muted">FREE TO BUILD ON.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
              DOMAN is fully open source. The entire API — 22+ endpoints
              covering scanning, reporting, watchlists, ENS, and more — is
              documented and ready for you to integrate into your own
              applications, bots, or extensions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:flex-col">
            <Button href="/api-reference" size="lg">
              <BookOpen size={15} className="mr-2" />
              API Reference
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="https://github.com/domanprotocol/doman"
            >
              <GitBranch size={15} className="mr-2" />
              View on GitHub
              <ExternalLink size={12} className="ml-2 opacity-50" />
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* REST API */}
          <div className="group rounded-2xl border border-card-border bg-card p-7 transition-colors hover:border-accent/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Zap size={18} className="text-accent" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              REST API
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              22+ endpoints for address scanning, risk scoring, ENS resolution,
              domain checks, reports, and more. All responses follow a
              consistent JSON envelope.
            </p>
            <Link
              href="/api-reference"
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent opacity-80 transition-opacity hover:opacity-100"
            >
              Browse endpoints <ArrowRight size={12} />
            </Link>
          </div>

          {/* Open Source */}
          <div className="group rounded-2xl border border-card-border bg-card p-7 transition-colors hover:border-accent/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Code2 size={18} className="text-accent" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Open Source
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Full source code on GitHub under the MIT license. Fork it, deploy
              your own instance, or contribute improvements directly.
            </p>
            <a
              href="https://github.com/domanprotocol/doman"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent opacity-80 transition-opacity hover:opacity-100"
            >
              Star on GitHub <ExternalLink size={11} />
            </a>
          </div>

          {/* Extension */}
          <div className="group rounded-2xl border border-card-border bg-card p-7 transition-colors hover:border-accent/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Shield size={18} className="text-accent" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Browser Extension
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Chrome extension source is also open. Inspect how we call the API
              for real-time phishing detection and in-page address scanning.
            </p>
            <a
              href="https://github.com/domanprotocol/extension/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent opacity-80 transition-opacity hover:opacity-100"
            >
              View extension source <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Quick code snippet */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-card-border bg-[#080808]">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-3">
            <span className="text-xs text-muted font-mono">Quick example — scan an address</span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
              GET
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-zinc-300">
            <code>{
`fetch('https://domanprotocol.vercel.app/api/v1/scan/0x4200000000000000000000000000000000000006')
  .then(r => r.json())
  .then(({ data }) => {
    console.log(data.riskScore)  // 0–100
    console.log(data.riskLevel)  // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    console.log(data.isVerified) // true
  })`
            }</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA ───────── */
function CTA() {
  return (
    <section className="border-t border-card-border bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
          START PROTECTING YOUR WEB3 JOURNEY TODAY
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-sm text-muted md:text-base">
          Join thousands of users who scan before they send. Free to start,
          powerful when you need it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <GuardedButton size="lg" href="/dashboard/checker">
            Launch Checker <ArrowRight size={16} className="ml-2" />
          </GuardedButton>
          <Button variant="secondary" size="lg" href="#">
            Get Extension
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ───────── Page Composition ───────── */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <UseCases />
      <Features />
      <Manifesto />
      <Advantage />
      <ProductHighlights />
      <Extension />
      <OpenSource />
      <CTA />
    </>
  );
}
