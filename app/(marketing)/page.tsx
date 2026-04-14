import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  Plus,
} from "lucide-react";

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Abstract gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 h-200 w-200 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/4 h-150 w-150 rounded-full bg-green-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        {/* Top nav row */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-card-border pb-4 text-xs uppercase tracking-wider text-muted">
          <span>How It Works</span>
          <span>SEO</span>
          <span>Marketing</span>
          <span>Connect Us</span>
        </div>

        {/* Brand wordmark */}
        <div className="py-20 flex items-center justify-between">
          <Plus size={20} strokeWidth={1.5} className="text-muted/50" />
          <p className="text-center text-[20vw] font-bold tracking-tighter sm:text-[15vw] md:text-[20vw]">
            WAL<span className="text-accent">L</span>O
          </p>
          <Plus size={20} strokeWidth={1.5} className="text-muted/50" />
        </div>

        {/* Hero visual placeholder */}
        <div className="relative mb-16 h-75 overflow-hidden rounded-3xl border border-card-border md:h-100">
          <Image
            src="/hero-bg.png"
            alt="Wallo Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">
                <Shield size={12} /> Web3 Security Engine
              </div>
            </div>
            <div className="hidden text-right text-xs text-muted md:block">
              Trusted by 10,000+ users
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div className="max-w-5xl py-80">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            SCAN BEFORE
            <br />
            YOU SEND.
            <br />
            <span className="text-muted">TRUST BEFORE</span>
            <br />
            <span className="text-muted">YOU TRANSACT</span>
            <span className="inline-block ml-3 h-12 w-12 rounded-full bg-accent md:h-16 md:w-16" />
          </h1>

          <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Wallo combines on-chain analysis, smart contract inspection, and
            community reputation signals into a single trust score — so you know
            what&apos;s safe before you click or send.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" href="/dashboard/checker">
              Try the Checker <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="secondary" size="lg" href="#features">
              Explore Features
            </Button>
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
            About · Wallo
          </span>
        </div>

        <h2 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
          YOU THINK THE BLOCKCHAIN IS TRANSPARENT. ACTUALLY IT&apos;S A MAZE,
          AND SOMEHOW WALLO HELPS YOU NAVIGATE YOUR{" "}
          <span className="inline-flex items-center">
            SAFETY
            <span className="ml-2 inline-block h-10 w-10 rounded-full bg-accent md:h-14 md:w-14" />
          </span>
        </h2>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Web3 scam losses reached $3.8B in 2023 — mostly from phishing, bad
          approvals, and fake addresses. Existing tools are too technical and
          developer-focused. Wallo makes security accessible to everyone.
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
            Services · Wallo
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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-black md:h-9 md:w-9 lg:h-12 lg:w-12">
            <Shield className="h-full w-full p-1" />
          </span>{" "}
          WEB3 MEANS{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-600 text-white md:h-9 md:w-9 lg:h-12 lg:w-12">
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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-black md:h-9 md:w-9 lg:h-12 lg:w-12">
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
              Wallo combines on-chain data from Alchemy, Moralis, and Etherscan
              with community-driven reputation signals. Our scoring engine
              processes transaction history, funding sources, and contract risk
              to deliver trust scores with &gt;90% detection accuracy and
              &lt;2% false positives.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-accent">{"<"}1.5s</p>
                <p className="mt-1 text-xs text-muted">API Response</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-accent">99.5%</p>
                <p className="mt-1 text-xs text-muted">Uptime SLA</p>
              </div>
              <div className="rounded-xl border border-card-border bg-card p-4">
                <p className="text-2xl font-bold text-accent">{">"}90%</p>
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
            <div className="bg-linear-to-br from-accent/10 to-green-900/20 p-8 md:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">
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
          <Button size="lg" href="/dashboard/checker">
            Launch Checker <ArrowRight size={16} className="ml-2" />
          </Button>
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
      <CTA />
    </>
  );
}
