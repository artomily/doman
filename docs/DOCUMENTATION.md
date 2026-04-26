# DOMAN — Frontend End-to-End Documentation

> **Web Application: Community-Powered Security & Decision Engine for Base Chain**
> Version 1.0.0 | Last Updated: 26 April 2026

---

## Daftar Isi

1. [Pengantar](#1-pengantar)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Tech Stack](#3-tech-stack)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Instalasi & Build](#5-instalasi--build)
6. [Environment Variables](#6-environment-variables)
7. [Routing & Pages](#7-routing--pages)
8. [Layout & Providers](#8-layout--providers)
9. [Komponen UI](#9-komponen-ui)
10. [Dashboard](#10-dashboard)
11. [Landing Page (Marketing)](#11-landing-page-marketing)
12. [API Routes](#12-api-routes)
13. [Service Layer](#13-service-layer)
14. [Blockchain Integration](#14-blockchain-integration)
15. [Smart Contract Integration](#15-smart-contract-integration)
16. [State Management](#16-state-management)
17. [Database Schema](#17-database-schema)
18. [Scam Detection Engine](#18-scam-detection-engine)
19. [External Data Sync](#19-external-data-sync)
20. [Styling & Design System](#20-styling--design-system)
21. [Alur Data End-to-End](#21-alur-data-end-to-end)
22. [Testing & Debug](#22-testing--debug)
23. [Extension Integration](#23-extension-integration)
24. [Roadmap](#24-roadmap)

---

## 1. Pengantar

### 1.1 Apa itu DOMAN Frontend?

DOMAN Frontend adalah **web application** yang berfungsi sebagai dashboard utama dan API backend untuk platform keamanan Web3 di Base chain. Aplikasi ini menyediakan:

- **Dashboard interaktif** — Statistik platform, scan history, watchlist, tag management
- **Address Checker** — Scan address/ENS/domain secara real-time dengan risk assessment
- **Community Reporting** — Sistem laporan scam dengan voting dan reputasi
- **Contract Scanner** — Analisis bytecode smart contract untuk deteksi pola scam
- **REST API** — Backend API yang dikonsumsi oleh browser extension dan frontend

### 1.2 Hubungan dengan Extension

Frontend ini adalah **backend + dashboard** yang melayani browser extension:

```
Browser Extension (MV3)  ──HTTP──►  DOMAN API Routes  ──►  Services  ──►  Database
                                                          │
                                                          ├── Blockchain (Viem)
                                                          └── External APIs (DeFiLlama, ScamSniffer, dll)
```

### 1.3 Target User

- User Base chain yang butuh dashboard untuk analisis mendalam
- Komunitas Web3 yang melaporkan dan memverifikasi scam
- Security researcher yang ingin analyze smart contracts
- Developer dApp yang ingin verify contract mereka

---

## 2. Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS 16 APP (APP ROUTER)                           │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              CLIENT LAYER                                   │ │
│  │                                                                             │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐   │ │
│  │  │  Landing Page  │  │  Dashboard UI  │  │  Wagmi Provider            │   │ │
│  │  │  (Marketing)   │  │  (Protected)   │  │  (Wallet Connection)       │   │ │
│  │  └────────────────┘  └───────┬────────┘  └────────────────────────────┘   │ │
│  │                              │                                              │ │
│  │  ┌───────────────────────────┼──────────────────────────────────────────┐  │ │
│  │  │  Components + Hooks      │                                           │  │ │
│  │  │  ├── ui/ (Button, Card,  │                                           │  │ │
│  │  │  │   Input, Modal, Badge,│                                           │  │ │
│  │  │  │   Steps)              │                                           │  │ │
│  │  │  ├── dashboard/          │                                           │  │ │
│  │  │  │   (Sidebar, Header,   │                                           │  │ │
│  │  │  │    ReportModal, Trust) │                                           │  │ │
│  │  │  ├── marketing/          │                                           │  │ │
│  │  │  │   (Navbar, Footer)    │                                           │  │ │
│  │  │  └── hooks/              │                                           │  │ │
│  │  │      useReportScam       │                                           │  │ │
│  │  └───────────────────────────┼──────────────────────────────────────────┘  │ │
│  └──────────────────────────────┼─────────────────────────────────────────────┘ │
│                                 │ fetch() / server components                  │
│  ┌──────────────────────────────┼─────────────────────────────────────────────┐ │
│  │                           API LAYER (22+ endpoints)                        │ │
│  │                              ▼                                              │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  API Routes (/api/v1/*)                                             │   │ │
│  │  │                                                                     │   │ │
│  │  │  GET    /scan/[address]     → ScannerService → Blockchain + DB      │   │ │
│  │  │  GET    /address/[address]  → AddressService → DB                   │   │ │
│  │  │  GET/DE /address/[a]/tags   → DB                                    │   │ │
│  │  │  GET    /address/[a]/ens    → EnsService                            │   │ │
│  │  │  GET/POST /address-tags     → DB + Reputation                       │   │ │
│  │  │  GET    /check-domain       → DomainService → DB                    │   │ │
│  │  │  GET    /history            → DB (ContractScan)                     │   │ │
│  │  │  GET    /resolve/[ens]      → EnsService                            │   │ │
│  │  │  GET    /scam-domains       → DomainService → DB                    │   │ │
│  │  │  POST   /tags               → DB                                    │   │ │
│  │  │  GET/POST /reports          → ReportService → DB + Blockchain       │   │ │
│  │  │  GET    /reports/vote-status→ DB                                    │   │ │
│  │  │  POST   /reports/[id]/vote  → ReportService → DB                    │   │ │
│  │  │  GET/POST/DEL /watchlist    → DB                                    │   │ │
│  │  │  GET    /dapps              → AddressService → DB                   │   │ │
│  │  │  POST   /sync               → SyncService → External APIs + DB     │   │ │
│  │  │  GET    /stats              → StatsService → DB                     │   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                          SERVICE LAYER                                     │ │
│  │                                                                            │ │
│  │  ScannerService    ReportService     SyncService     AddressService       │ │
│  │  StatsService      LeaderboardSvc    EnsService      DomainService        │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                        INFRASTRUCTURE                                      │ │
│  │                                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │  Prisma ORM  │  │  Viem Client │  │  Wagmi v3    │  │  React Query │ │ │
│  │  │  (PostgreSQL)│  │  (Blockchain)│  │  (Wallet +   │  │  (Fetching)  │ │ │
│  │  │              │  │              │  │   Contracts) │  │              │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    ▼                              ▼
        ┌──────────────────┐          ┌────────────────────────────┐
        │   PostgreSQL     │          │   EXTERNAL SERVICES        │
        │   (Supabase)     │          │                            │
        │                  │          │   Base RPC / BaseScan       │
        │   - addresses    │          │   DeFiLlama API             │
        │   - reports      │          │   ScamSniffer DB            │
        │   - votes        │          │   CryptoScamDB              │
        │   - scans        │          │   ENS (Ethereum Mainnet)    │
        │   - tags         │          └────────────────────────────┘
        │   - sync_logs    │
        │   - user_profiles│
        │   - scam_domains │
        │   - ens_records  │
        │   - signatures   │
        └──────────────────┘
```

---

## 3. Tech Stack

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16.2.3 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| ORM | Prisma | 7.7.0 |
| Database | PostgreSQL (Supabase) | - |
| Blockchain Client | Viem | 2.48.0 |
| Wallet Integration | Wagmi | 3.6.4 |
| Data Fetching | TanStack React Query | 5.100.1 |
| Validation | Zod | 3.25.76 |
| Icons | Lucide React | 1.8.0 |
| Date Utilities | date-fns | 3.6.0 |
| ID Generation | nanoid | 5.1.9 |
| Chain | Base (8453) / Base Sepolia (84532) | - |

---

## 4. Struktur Proyek

```
wallo/                                    # Project root
├── package.json                          # Dependencies & scripts
├── next.config.ts                        # Next.js configuration
├── tsconfig.json                         # TypeScript config (strict mode)
├── postcss.config.mjs                    # PostCSS + Tailwind v4
├── prisma.config.ts                      # Prisma config (adapter + pool)
├── .env.local                            # Environment variables (not committed)
├── .env.example                          # Environment template
├── ScamReporter.json                     # Compiled ScamReporter contract artifact
│
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # Root layout (fonts, metadata)
│   ├── providers.tsx                     # Client providers (Wagmi, React Query)
│   ├── globals.css                       # Global styles + CSS variables
│   │
│   ├── (marketing)/                      # Marketing route group
│   │   └── page.tsx                      # Landing page (467 lines)
│   │
│   ├── (dashboard)/                      # Dashboard route group
│   │   └── dashboard/
│   │       ├── layout.tsx                # Dashboard layout (sidebar + header)
│   │       ├── page.tsx                  # Overview / stats (159 lines)
│   │       ├── checker/page.tsx          # Address checker + voting (509 lines)
│   │       ├── deploy/page.tsx           # Deploy ScamReporter contract (232 lines)
│   │       ├── history/page.tsx          # Scan history (125 lines)
│   │       ├── settings/page.tsx         # Settings (121 lines)
│   │       ├── tags/page.tsx             # Tag management (server wrapper)
│   │       │   └── tags-client.tsx       # Tag management client (185 lines)
│   │       └── watchlist/page.tsx        # Watchlist + add/remove (206 lines)
│   │
│   └── api/                              # API routes
│       ├── health/route.ts               # Health check
│       └── v1/
│           ├── scan/[address]/route.ts   # Contract/ENS/domain scanning
│           ├── address/[address]/route.ts # Address details
│           │   ├── ens/route.ts          # ENS resolution for address (GET)
│           │   └── tags/route.ts         # Address tags (GET, DELETE)
│           ├── address-tags/route.ts     # Tag CRUD with reputation (GET, POST)
│           ├── check-domain/route.ts     # Domain scam check (GET)
│           ├── history/route.ts          # Scan history (GET)
│           ├── resolve/[ens]/route.ts    # ENS name resolution (GET)
│           ├── scam-domains/route.ts     # Scam domain listing (GET)
│           ├── tags/route.ts             # Simplified tag creation (POST)
│           ├── reports/route.ts          # Reports CRUD
│           │   └── vote-status/route.ts  # Check if user voted (GET)
│           │   └── [id]/
│           │       ├── route.ts          # Report detail
│           │       └── vote/route.ts     # Vote on report
│           ├── watchlist/route.ts        # Watchlist (GET, POST)
│           │   └── [address]/route.ts    # Watchlist remove (DELETE)
│           ├── dapps/route.ts            # dApps directory
│           ├── sync/route.ts             # External data sync
│           └── stats/route.ts            # Platform statistics
│
├── components/                           # React components
│   ├── ui/                               # Reusable primitives
│   │   ├── button.tsx                    # Button variants (primary/secondary/ghost/danger)
│   │   ├── card.tsx                      # Card container
│   │   ├── input.tsx                     # Styled input field
│   │   ├── modal.tsx                     # Full-screen modal with backdrop (86 lines)
│   │   ├── badge.tsx                     # Status badges + TrustScoreBadge
│   │   └── steps.tsx                     # Multi-step indicator (57 lines)
│   │
│   ├── dashboard/                        # Dashboard-specific
│   │   ├── sidebar.tsx                   # Navigation sidebar (103 lines)
│   │   ├── header.tsx                    # Header + WalletButton (117 lines)
│   │   ├── report-scam-modal.tsx         # Multi-step scam report (500 lines)
│   │   └── trust-score-badge.tsx         # Trust score display (45 lines)
│   │
│   └── marketing/                        # Marketing page components
│       ├── navbar.tsx                    # Navigation bar
│       └── footer.tsx                    # Footer
│
├── hooks/                                # Custom React hooks
│   └── use-report-scam.ts               # Scam reporting workflow (225 lines)
│
├── config/                               # Configuration modules
│   ├── chains.ts                         # Base chain definitions
│   ├── contracts.ts                      # ScamReporter ABI + addresses (115 lines)
│   ├── endpoints.ts                      # External API endpoints
│   └── scam-patterns.ts                  # Scam detection patterns (362 lines)
│
├── lib/                                  # Utility libraries
│   ├── api-response.ts                   # API response builders (204 lines)
│   ├── constants.ts                      # App-wide constants (371 lines)
│   ├── error-handler.ts                  # Centralized error handling (152 lines)
│   ├── hash.ts                           # Keccak256 hashing (35 lines)
│   ├── prisma.ts                         # Prisma singleton with pg adapter (52 lines)
│   ├── utils.ts                          # Utility functions (386 lines)
│   ├── validation.ts                     # Zod schemas (321 lines)
│   ├── viem.ts                           # Blockchain client + ENS (234 lines)
│   └── wagmi.ts                          # Wallet config (28 lines)
│
├── services/                             # Business logic layer
│   ├── scanner-service.ts                # Contract scanning + domain + batch (900+ lines)
│   ├── report-service.ts                 # Report management (355 lines)
│   ├── sync-service.ts                   # External data sync (523 lines)
│   ├── address-service.ts                # Address management (455 lines)
│   ├── stats-service.ts                  # Statistics aggregation (81 lines)
│   ├── leaderboard-service.ts            # Reputation system (411 lines)
│   ├── ens-service.ts                    # ENS resolution + caching (153 lines)
│   └── domain-service.ts                 # Domain scam checking (196 lines)
│
├── types/                                # TypeScript type definitions
│   ├── api.ts                            # API request/response types (474 lines)
│   └── models.ts                         # Database model types (510 lines)
│
├── prisma/                               # Database
│   ├── schema.prisma                     # Prisma schema (409 lines, 13 models)
│   ├── seed.ts                           # Seed data script
│   └── migrations/                       # SQL migration files
│       ├── 20260418_*.sql                # Initial schema + address enhancements
│       ├── 20260420_*.sql                # Contract scans + function signatures
│       ├── 20260421_*.sql                # Watchlist support
│       └── migration_lock.toml           # Migration lock
│
├── public/                               # Static assets
│   ├── logo1.png                         # Brand logo variant
│   └── logo2.png                         # Brand logo variant
│
└── docs/                                 # Documentation
    ├── PRD.md                            # Product Requirements Document
    ├── FRONTEND_INTEGRATION.md           # Frontend integration guide (1437 lines)
    ├── EXTENSION_INTEGRATION.md          # Extension integration guide (1642 lines)
    ├── EXTENSION_DESIGN_GUIDE.md         # Extension design guide (1290 lines)
    ├── AUDIT_REPORT.md                   # Security audit report (338 lines)
    └── postman-collection.json           # Postman API collection
```

---

## 5. Instalasi & Build

### 5.1 Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database (Supabase recommended)
- Wallet private key (optional, for server-side signing)

### 5.2 Install Dependencies

```bash
npm install
```

Postinstall script otomatis menjalankan `prisma generate`.

### 5.3 Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan values yang sesuai (lihat Section 6).

### 5.4 Database Setup

```bash
# Push schema ke database
npm run db:push

# Atau gunakan migration
npm run db:migrate

# Seed data awal
npm run db:seed

# Buka Prisma Studio (visual database browser)
npm run db:studio
```

### 5.5 Development Mode

```bash
npm run dev
```

Menjalankan Next.js dev server di `http://localhost:3000` dengan hot reload.

### 5.6 Production Build

```bash
npm run build
```

Build steps:
1. `prisma generate` — Generate Prisma Client
2. `next build` — Build optimized production bundle

### 5.7 Production Start

```bash
npm start
```

### 5.8 NPM Scripts

| Script | Perintah | Deskripsi |
|--------|----------|-----------|
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `db:generate` | `prisma generate` | Generate Prisma Client |
| `db:push` | `prisma db push` | Push schema ke database |
| `db:migrate` | `prisma migrate dev` | Run migrations |
| `db:seed` | `prisma db seed` | Seed database |
| `db:studio` | `prisma studio` | Visual database browser |
| `db:reset` | `prisma migrate reset` | Reset database |

---

## 6. Environment Variables

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (Supabase pooler) |
| `DIRECT_URL` | No | `DATABASE_URL` | Direct database connection (bypass pooler) |
| `NEXT_PUBLIC_BASE_RPC_URL` | Yes | `https://sepolia.base.org` | Base RPC URL |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | No | `84532` | Chain ID (84532=Sepolia, 8453=Mainnet) |
| `NEXT_PUBLIC_BASESCAN_URL` | No | `https://sepolia.basescan.org` | Block explorer URL |
| `BASESCAN_API_KEY` | No | - | BaseScan API key untuk contract verification |
| `WALLET_PRIVATE_KEY` | No | - | Server-side wallet private key (0x prefixed) |
| `CRON_SECRET` | No | `dev-secret-change-in-production` | Secret untuk cron/sync endpoints |

---

## 7. Routing & Pages

### 7.1 Route Structure

```
/                          → Landing Page (Marketing)
/dashboard                 → Dashboard Overview (stats)
/dashboard/checker         → Address/Contract Checker + Voting
/dashboard/deploy          → Deploy ScamReporter Contract
/dashboard/history         → Scan History
/dashboard/watchlist       → Watchlist Management (add/remove)
/dashboard/tags            → Tag Management (search + add)
/dashboard/settings        → Settings

/api/health                → Health Check
/api/v1/scan/[address]     → Scan Address/ENS/Domain
/api/v1/address/[address]  → Address Details
/api/v1/address/[addr]/ens → ENS Resolution for address
/api/v1/address/[addr]/tags → Address Tags (GET, DELETE)
/api/v1/address-tags       → Tag CRUD + Reputation (GET, POST)
/api/v1/check-domain       → Domain Scam Check
/api/v1/history            → Scan History
/api/v1/resolve/[ens]      → ENS Name Resolution
/api/v1/scam-domains       → Scam Domain Listing
/api/v1/tags               → Simplified Tag Creation
/api/v1/reports            → Reports (GET list, POST create)
/api/v1/reports/vote-status → Check Vote Status
/api/v1/reports/[id]/vote  → Vote on Report
/api/v1/watchlist          → Watchlist (GET, POST)
/api/v1/watchlist/[address] → Remove from Watchlist (DELETE)
/api/v1/dapps              → dApps Directory
/api/v1/sync               → External Data Sync
/api/v1/stats              → Platform Statistics
```

### 7.2 Route Groups

| Group | Layout | Purpose |
|-------|--------|---------|
| `(marketing)` | Public, no auth | Landing page, SEO |
| `(dashboard)` | Sidebar + Header | Protected dashboard area |
| `api/` | API handlers | REST endpoints |

### 7.3 Page Details

#### Landing Page (`/`)
- Hero section dengan gradient text dan CTA
- Use cases: DeFi Traders, Airdrop Hunters, NFT Users
- Features manifesto (5 core features)
- Product highlights
- CTA sections
- Pure marketing, no wallet required

#### Dashboard Overview (`/dashboard`)
- Stats cards: Total Scans, Flagged Addresses, Watchlist Count, Avg Trust Score
- Recent Activity table: address, category, chain, score, risk level, timestamp
- Server component yang query database langsung

#### Checker (`/dashboard/checker`)
- Input field untuk address/ENS/domain
- URL query parameter pre-filling (`?address=0x...`)
- Real-time scan dengan loading states
- Result display: risk score (trust score = 100 - riskScore), risk level, detected patterns, similar scams
- Community voting section:
  - FOR/AGAINST vote buttons dengan wallet-based validation
  - Real-time vote status check (`/api/v1/reports/vote-status`)
  - Sentiment bar (visual vote ratio)
  - Already-voted indicators
- Report Scam button → opens multi-step modal
- Direct link ke block explorer
- Trust score badge visual

#### Deploy (`/dashboard/deploy`)
- Deploy ScamReporter smart contract ke Base Sepolia
- Wallet connection + chain switch (auto-switch ke Base Sepolia)
- Contract info card: name, compiler, function signatures, gas estimate (~22-24k per call)
- Real-time deployment status tracking (idle → deploying → success → error)
- Success state: transaction hash, BaseScan link, configuration guide
- Uses `useWriteContract` dari wagmi untuk on-chain deployment

#### History (`/dashboard/history`)
- Table riwayat scan sebelumnya
- Kolom: address, name, category, chain, score, risk level, timestamp
- Sortable dan paginated

#### Watchlist (`/dashboard/watchlist`)
- Daftar address yang di-watch
- Add/remove functionality
- Score tracking dengan trend indicators
- Auto-refresh periodic

#### Tags (`/dashboard/tags`)
- Server component wrapper + `TagsClient` client component (185 lines)
- Search bar: filter by address atau tag name
- Address cards with existing tag badges
- Inline add tag form per address
- Tag attribution: shows who tagged (taggedBy)
- Status-based badge variants (LEGIT=green, SUSPICIOUS=yellow, SCAM=red)
- Real-time tag updates tanpa page refresh

#### Settings (`/dashboard/settings`)
- Profile section (wallet address, ENS)
- Notification preferences
- API keys section (placeholder)
- Security settings

---

## 8. Layout & Providers

### 8.1 Root Layout (`app/layout.tsx`)

```tsx
<html lang="en" className="h-full antialiased">
  <body className="min-h-full flex flex-col">
    <Providers>{children}</Providers>
  </body>
</html>
```

**Fonts:**
- **Space Grotesk** — Body text (`--font-space-grotesk`)
- **Geist Mono** — Code/monospace (`--font-geist-mono`)

**Metadata:**
- Title: "Doman — Web3 Security & Decision Engine"
- Description: "Scan addresses, contracts, and domains before you interact..."

### 8.2 Providers (`app/providers.tsx`)

Client component yang wraps seluruh app dengan:

```tsx
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
</WagmiProvider>
```

| Provider | Library | Purpose |
|----------|---------|---------|
| `WagmiProvider` | wagmi v3 | Wallet connection & blockchain interaction |
| `QueryClientProvider` | @tanstack/react-query | Server state management & caching |

**SSR-safe pattern:** `QueryClient` dibuat per mount via `useState(() => new QueryClient())`.

### 8.3 Dashboard Layout

Dashboard menggunakan layout khusus dengan:
- **Sidebar** — Fixed navigation di kiri (collapsible di mobile)
- **Header** — Search bar + wallet connection button + notifications

---

## 9. Komponen UI

### 9.1 Primitives (`components/ui/`)

#### Button (`button.tsx`)
Variants:
| Variant | Style | Use Case |
|---------|-------|----------|
| `primary` | Blue gradient + glow | Main CTA |
| `secondary` | Dark border | Secondary actions |
| `ghost` | Transparent | Subtle actions |
| `danger` | Red | Destructive actions |

Sizes: `sm`, `md`, `lg`. Support untuk `asChild` (render as link).

#### Card (`card.tsx`)
Wrapper dasar: `rounded-xl border border-card-border bg-card p-6`.

#### Input (`input.tsx`)
Styled input dengan focus states dan border styling.

#### Modal (`modal.tsx`)
- Full-screen overlay dengan backdrop blur
- Keyboard escape support
- Body scroll prevention
- Configurable title dan max-width

#### Badge (`badge.tsx`)
Color-coded status badges + specialized `TrustScoreBadge`.

### 9.2 Dashboard Components (`components/dashboard/`)

#### Sidebar (`sidebar.tsx`)
- Navigation items: Overview, Checker, History, Watchlist, Tags, Settings
- Active state indicator
- Mobile responsive (collapsible)
- User plan indicator

#### Header (`header.tsx`)
- Search bar
- `WalletButton` — Connect/disconnect wallet, copy address
- Notification bell

#### Report Scam Modal (`report-scam-modal.tsx`)
Multi-step wizard:
1. **Details** — Input address, select reasons, add evidence
2. **Preview** — Review report before submit
3. **Confirm** — Submit dengan optional on-chain transaction

#### Trust Score Badge (`trust-score-badge.tsx`)
Visual trust score:
| Range | Variant | Color |
|-------|---------|-------|
| 0-20 | safe | Green |
| 21-60 | warning | Yellow/Amber |
| 61-80 | danger | Orange |
| 81-100 | unknown | Red |

---

## 10. Dashboard

### 10.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌──────────────────────────────────────────────┐ │
│  │             │  │  🔍 Search...          [0xAb...🔗]  🔔      │ │
│  │  DOMAN      │  ├──────────────────────────────────────────────┤ │
│  │  ─────────  │  │                                              │ │
│  │  Overview ● │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│  │  Checker    │  │  │ Total    │ │ Flagged  │ │ Watchlist│    │ │
│  │  History    │  │  │ Scans    │ │ Addresses│ │ Count   │    │ │
│  │  Watchlist  │  │  │ 1,234    │ │ 56       │ │ 12      │    │ │
│  │  Tags       │  │  └──────────┘ └──────────┘ └──────────┘    │ │
│  │  Settings   │  │                                              │ │
│  │             │  │  ┌────────────────────────────────────────┐  │ │
│  │  ─────────  │  │  │  Recent Activity                      │  │ │
│  │  Free Plan  │  │  │  Address | Cat  | Score | Level | Time│  │ │
│  │             │  │  │  0x123...| DeFi | 75    | HIGH   | 2m │  │ │
│  │             │  │  │  0x456...| NFT  | 20    | LOW    | 5m │  │ │
│  │             │  │  │  0x789...| DEX  | 90    | CRIT   | 1h │  │ │
│  │             │  │  └────────────────────────────────────────┘  │ │
│  └─────────────┘  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Checker Page Flow

```
User input (address/ENS/domain)
  → Client-side input type detection
  → fetch('/api/v1/scan/{input}')
    → ScannerService
      → detectInputType()
      → If address: getBytecode() + pattern analysis
      → If ENS: resolveEns() → then scan resolved address
      → If domain: domainService.checkDomain()
    ← ScanResult
  → Display results:
    - Risk Score gauge
    - Risk Level badge
    - Detected Patterns list
    - Similar Scams (bytecode hash matching)
    - Community Reports
    - Vote on reports
    - Submit new report
```

---

## 11. Landing Page (Marketing)

### 11.1 Sections

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar: Logo | Features | Use Cases | Docs  | [Launch ▶] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DOMAN                                                      │
│  Web3 Security &                                            │
│  Decision Engine                                            │
│  for Base Chain                                             │
│                                                             │
│  [Start Scanning]  [Learn More]                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Built for:                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ DeFi     │ │ Airdrop  │ │ NFT      │                   │
│  │ Traders  │ │ Hunters  │ │ Users    │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────┤
│  The 5 Principles:                                          │
│  ✓ Community-Powered    ✓ Real-Time Protection              │
│  ✓ Deep Contract Analysis ✓ Reputation System               │
│  ✓ Open & Transparent                                      │
├─────────────────────────────────────────────────────────────┤
│  Product Highlights                                         │
│  - Address Scanner    - Contract Analyzer                   │
│  - Domain Checker     - Community Reporting                 │
│  - Watchlist Alerts   - Browser Extension                   │
├─────────────────────────────────────────────────────────────┤
│  CTA: "Ready to protect your assets?" [Get Started]        │
├─────────────────────────────────────────────────────────────┤
│  Footer: Links | Social | Copyright                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. API Routes

### 12.1 Response Format

Semua API response menggunakan envelope format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
    "cached": false
  }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "Invalid Ethereum address format",
    "details": { ... }
  }
}
```

### 12.2 Endpoints

#### Scan

```
GET /api/v1/scan/{input}

Input: 0x address, ENS name (.eth), atau domain
Response: ScanResult

Flow:
  → detectInputType(input)
  → address: getBytecode → analyze patterns → calculate risk
  → ens: resolveEns → then scan resolved address
  → domain: checkDomain → DB lookup

Returns:
  - riskScore (0-100)
  - riskLevel (LOW/MEDIUM/HIGH/CRITICAL)
  - isVerified
  - patterns[] (detected scam patterns)
  - similarScams[] (by bytecode hash)
  - reportCount
  - scanDuration
```

#### Address Details

```
GET /api/v1/address/{address}

Response: AddressDTO
  - address, name, chain, status, riskScore
  - category, source, description
  - url, logoUrl, tvl
  - verifiedBy, verifiedAt
  - tags[] (address tags)
  - reportCount
  - lastScanned
```

#### Address Tags (nested)

```
GET /api/v1/address/{address}/tags
Response: { data: AddressTagDTO[], address, count }

DELETE /api/v1/address/{address}/tags?tag=scam
Response: { message, address, tag }
```

#### Address ENS (nested)

```
GET /api/v1/address/{address}/ens
Response: { address, primaryName, records[], count }
```

#### Address Tags (top-level, with reputation)

```
GET /api/v1/address-tags
Query: ?address=0x...&tag=scam&taggedBy=0x...&page=1&limit=20
Response: Paginated tags with address info

POST /api/v1/address-tags
Body: { address, tag, taggedBy? }
Logic:
  - Creates address record if not exists
  - Upserts tag (unique on address + tag)
  - Awards +5 reputation to tagger
  - Creates/updates UserProfile for tagger
Response: Tag record + user profile
```

#### Tags (simplified)

```
POST /api/v1/tags
Body: { address, tag, taggedBy? }
Logic: Simple tag creation with upsert (no reputation system)
Response: Created tag record
```

#### Check Domain

```
GET /api/v1/check-domain?domain=example.com
Response: { domain, isScam, riskScore, category, description, source, checkedAt }
Logic: Cleans domain (removes protocol, www, paths), checks ScamDomain table
```

#### History

```
GET /api/v1/history?checker=0x...&limit=50
Response: ContractScan[] with address details
Logic: Returns most recent scans, optionally filtered by checker address
```

#### ENS Resolution

```
GET /api/v1/resolve/{ens}
Response: { ens, address, resolvedAt }
Logic: Validates ENS name via Zod, resolves via EnsService
```

#### Scam Domains

```
GET /api/v1/scam-domains?page=1&limit=20&search=uniswap&status=ACTIVE
Response: Paginated list of scam domains
```

#### Reports

```
GET /api/v1/reports
Query: ?status=PENDING&category=PHISHING&page=1&limit=20
Response: ReportsResponse { data: ReportDTO[], pagination }

POST /api/v1/reports
Body: CreateReportRequest {
  address: string,
  reason: string,
  evidenceUrl?: string,
  category: AddressCategory,
  reporterAddress: string,
  reasonHash?: string,
  reasonData?: { selectedReasons: string[], customText: string }
}
Response: CreateReportResponse { id, status, txHash?, message }
```

#### Vote Status

```
GET /api/v1/reports/vote-status?address=0x...&voterAddress=0x...
Response: { hasVoted, voteType, reportId }
Logic: Checks if voter has already voted on any report for the address
```

#### Vote on Report

```
POST /api/v1/reports/{id}/vote
Body: { vote: "FOR"|"AGAINST", voterAddress, txHash? }
Response: VoteResponse { reportId, votesFor, votesAgainst, status }
```

#### Watchlist

```
GET /api/v1/watchlist?userAddress=0x...
Response: Watchlist entries with current/previous risk scores, last checked

POST /api/v1/watchlist
Body: { userAddress, watchedAddress }
Logic: Creates watched address if needed, creates UserProfile for FK constraint

DELETE /api/v1/watchlist/{address}?userAddress=0x...
Response: { deleted: boolean }
```

#### dApps Directory

```
GET /api/v1/dapps
Query: ?status=LEGIT&category=DEFI&search=uni&page=1&limit=20&sort=tvl&order=desc
Response: DappsResponse { data: AddressDTO[], pagination }
```

#### Sync

```
POST /api/v1/sync
Body: { source: "defillama"|"scamsniffer"|"cryptoscamdb"|"base"|"all" }
Response: SyncResponse { success, source, recordsAdded, recordsUpdated, syncLogId, duration }
```

#### Stats

```
GET /api/v1/stats
Response: PlatformStats {
  totalAddresses, legitCount, scamCount, suspiciousCount, unknownCount,
  totalReports, verifiedReports, pendingReports,
  topCategories[], recentScams[], scansToday, updatedAt
}
```

#### Health Check

```
GET /api/health
Response: { status: "healthy"|"degraded"|"unhealthy", database, blockchain, externalApis }
```

### 12.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Server error |
| `INVALID_REQUEST` | 400 | Validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Auth required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_ADDRESS` | 400 | Bad address format |
| `ADDRESS_NOT_FOUND` | 404 | Address not in database |
| `REPORT_NOT_FOUND` | 404 | Report ID not found |
| `REPORT_ALREADY_VOTED` | 400 | User already voted |
| `INSUFFICIENT_REPUTATION` | 403 | Need more reputation |
| `SCAN_TIMEOUT` | 408 | Scan took too long |
| `SCAN_FAILED` | 500 | Scanner error |
| `SYNC_FAILED` | 500 | Sync error |
| `SYNC_IN_PROGRESS` | 409 | Sync already running |

---

## 13. Service Layer

### 13.1 Architecture

Setiap service mengikuti pattern:
- Pure functions (stateless)
- Menerima `prisma` sebagai implicit dependency (via singleton import)
- Return typed data structures
- Throw `AppError` untuk business logic errors

### 13.2 Scanner Service (`scanner-service.ts` — 581 lines)

Core scanning engine untuk analisis smart contract.

**Functions:**

| Function | Input | Output | Deskripsi |
|----------|-------|--------|-----------|
| `scanContract` | address | `ScanResult` | Full contract scan (bytecode + patterns) |
| `quickScan` | address | `QuickScanResult` | Lightweight DB-only scan |
| `detectAddressType` | address | `AddressType` | EOA / SMART_CONTRACT / PROXY / FACTORY |
| `scanDomain` | domain | `DomainCheckResult` | Domain scam check |
| `batchScan` | address[] | `BatchScanResult` | Batch scanning (max 25) |

**Scan Flow:**
```
scanContract(address)
  → validateAddress()
  → getBytecode(address) via Viem
  → If no bytecode → EOA scan (check DB for reports)
  → If bytecode exists:
    → Check bytecode hash (similarity detection)
    → Detect proxy pattern (ERC1967, Gnosis, UUPS)
    → Extract function selectors
    → Match against scamPatterns (opcodes + selectors)
    → calculateRiskScore() from matched patterns
    → Check if source verified on BaseScan
    → Find similar contracts by bytecode hash
  → Save result ke ContractScan table
  → Return ScanResult
```

### 13.3 Report Service (`report-service.ts` — 355 lines)

Community report management dengan voting dan reputasi.

**Functions:**

| Function | Deskripsi |
|----------|-----------|
| `createReport` | Buat report baru, hash reason, award reputation |
| `getReports` | Paginated list dengan filters |
| `voteOnReport` | Vote FOR/AGAINST, check reputation threshold |
| `getReportsByAddress` | Reports untuk address tertentu |
| `resolveReport` | Auto-resolve berdasarkan vote threshold |

**Report Lifecycle:**
```
PENDING → (votesFor >= threshold) → VERIFIED
        → (votesAgainst >= threshold) → REJECTED
        → (dispute) → DISPUTED → re-evaluation
```

### 13.4 Address Service (`address-service.ts` — 455 lines)

**Functions:**

| Function | Deskripsi |
|----------|-----------|
| `getAddress` | Get address detail dengan tags, reports, scans |
| `getDApps` | List dApps dengan filters dan pagination |
| `searchAddresses` | Search by name atau address |
| `getPopularDApps` | Top dApps by TVL |
| `getSimilarAddresses` | Find similar contracts |

### 13.5 Sync Service (`sync-service.ts` — 523 lines)

Sinkronisasi data dari external sources.

**Functions:**

| Function | Source | Deskripsi |
|----------|--------|-----------|
| `syncDefiLlama` | DeFiLlama API | Sync DeFi protocol data (TVL, addresses) |
| `syncScamSniffer` | ScamSniffer GitHub | Sync scam addresses + domains |
| `syncCryptoScamDB` | CryptoScamDB API | Sync additional scam data |
| `runAllSyncs` | All | Run all sync sources |

**Sync Flow:**
```
syncScamSniffer()
  → fetch(scamsniffer/raw/address.json)
  → parse scam addresses
  → for each address:
    → upsert ke Address table (status: SCAM)
    → upsert ke ExternalSource table (source: scamsniffer)
    → upsert ke ScamDomain table (if domain)
  → log ke SyncLog table
```

### 13.6 Stats Service (`stats-service.ts` — 81 lines)

Aggregasi statistik platform: address counts by status, report counts, category distributions.

### 13.7 Leaderboard Service (`leaderboard-service.ts` — 411 lines)

Sistem reputasi user:

| Action | Points |
|--------|--------|
| Report submitted | +1 |
| Report verified | +10 |
| Correct vote | +2 |
| Wrong vote | -1 |
| Scan completed | +1 |

**Reputation Levels:**

| Level | Points | Name |
|-------|--------|------|
| 0-49 | Beginner |
| 50-199 | Trusted |
| 200-499 | Expert |
| 500+ | Master |

### 13.8 ENS Service (`ens-service.ts` — 153 lines)

- `resolveEns(name)` — .eth → 0x address
- `reverseResolveEns(address)` — 0x → .eth name
- `getEnsAvatar(name)` — Get ENS avatar URL
- `getEnsRecordsForAddress(address)` — All ENS records
- Caching di database (EnsRecord table)

### 13.9 Domain Service (`domain-service.ts` — 196 lines)

- `checkDomain(domain)` — Check if domain is known scam
- `listScamDomains(filters)` — Paginated scam domain list
- `upsertScamDomain(data)` — Add/update scam domain
- `batchCheckDomains(domains[])` — Batch domain check

---

## 14. Blockchain Integration

### 14.1 Viem Clients (`lib/viem.ts`)

Tiga client terpisah:

| Client | Chain | Purpose |
|--------|-------|---------|
| `publicClient` | Base Sepolia | Read blockchain data (getCode, readContract, getBalance) |
| `walletClient` | Base Sepolia | Server-side writes (requires `WALLET_PRIVATE_KEY`) |
| `mainnetClient` | Ethereum Mainnet | ENS resolution only |

**Configuration:**
```typescript
publicClient: createPublicClient({
  chain: baseSepoliaConfig,
  transport: http(rpcUrl, {
    timeout: 30_000,
    retryCount: 3,
  }),
})
```

**Utility Functions:**

| Function | Description |
|----------|-------------|
| `isValidAddress(address)` | Validate 0x address format |
| `getBytecode(address)` | Get contract bytecode (null if EOA) |
| `getBytecodeHash(address)` | Hash untuk similarity detection |
| `isContract(address)` | Check if address has bytecode |
| `getTransactionReceipt(hash)` | Get tx receipt |
| `detectInputType(input)` | Detect address/ens/domain |
| `resolveEns(name)` | ENS → address |
| `resolveInput(input)` | Universal input resolution |

### 14.2 Wagmi Configuration (`lib/wagmi.ts`)

Client-side wallet integration:

```typescript
createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),                           // MetaMask, dll
    coinbaseWallet({ appName: 'Doman' }), // Coinbase Wallet
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: true,  // Enable SSR support
})
```

### 14.3 Chain Configuration (`config/chains.ts`)

| Chain | ID | RPC | Explorer |
|-------|----|-----|----------|
| Base Sepolia | 84532 | `https://sepolia.base.org` | `https://sepolia.basescan.org` |
| Base Mainnet | 8453 | `https://mainnet.base.org` | `https://basescan.org` |

Chain ditentukan oleh `NEXT_PUBLIC_BASE_CHAIN_ID` env variable.

---

## 15. Smart Contract Integration

### 15.1 ScamReporter Contract (`config/contracts.ts`)

Contract ABI dan alamat untuk on-chain scam reporting.

**Contract Functions:**

| Function | Signature | Deskripsi |
|----------|-----------|-----------|
| `submitReport` | `(targetType, targetId, reasonHash)` | Submit scam report on-chain |
| `submitVote` | `(targetType, targetId, support)` | Vote on existing report |
| `addressToTargetId` | `(address)` → `targetId` | Get target ID for address |
| `hasVoted` | `(targetId, voter)` → `bool` | Check if already voted |

**Contract Events:**

| Event | Parameters |
|-------|-----------|
| `ScamReportSubmitted` | reporter, targetType, targetId, reasonHash |
| `ScamVoteSubmitted` | voter, targetType, targetId, support |

**Custom Errors:**

| Error | Condition |
|-------|-----------|
| `AlreadyVoted` | Voter already cast vote on this target |
| `EmptyReasonHash` | Reason hash is empty (bytes32(0)) |
| `EmptyTargetId` | Target ID is empty |
| `InvalidTargetType` | Target type not recognized |

**Supported Chains:**

| Chain | Chain ID | Contract Address |
|-------|----------|-----------------|
| Base Mainnet | 8453 | TBD (not deployed yet) |
| Base Sepolia | 84532 | TBD (not deployed yet) |

### 15.2 Deploy Page (`/dashboard/deploy`)

Memungkinkan admin deploy ScamReporter contract:

```
User visits /dashboard/deploy
  → Connect wallet (MetaMask/Coinbase)
  → Switch to Base Sepolia if needed
  → Review contract info (name, ABI, gas estimate)
  → Click "Deploy Contract"
    → wagmi useWriteContract()
    → MetaMask confirmation popup
    → Wait for transaction confirmation
  → Success:
    - Show transaction hash
    - Link to BaseScan
    - Configuration instructions (copy contract address to env)
```

### 15.3 Report Hook (`hooks/use-report-scam.ts`)

Custom hook yang menangani complete scam reporting workflow:

**States:** `idle` → `saving` → `deploying` → `wallet` → `confirming` → `success` / `error`

**Flow:**
```
submit(address, reasons, evidenceUrl, reporterAddress)
  1. Off-chain: POST /api/v1/reports → save to database
  2. On-chain (if contract deployed):
     → Get or deploy contract address (cached in localStorage)
     → writeContract: submitReport(targetType, targetId, reasonHash)
     → Wait for tx confirmation
  3. Return result
```

**Input Type Support:**
- `0x address` → targetType = 0
- `ENS name (.eth)` → targetType = 1
- `Domain` → targetType = 2

**Helper Functions:**
- `getCachedAddress(chainId)` — Get contract from localStorage cache
- `getTargetTypeAndId(input)` — Determine target type and compute ID

---

## 16. State Management

### 16.1 Server State (React Query)

Digunakan untuk caching dan fetching data dari API routes.

**Pattern di client components:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['scan', address],
  queryFn: () => fetch(`/api/v1/scan/${address}`).then(r => r.json()),
  enabled: !!address,
})
```

### 16.2 Wallet State (Wagmi)

Wagmi mengelola wallet state secara otomatis:
- Connection status
- Connected address
- Chain ID
- Balance

**Usage:**
```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const { address, isConnected, chain } = useAccount()
const { connect } = useConnect()
const { disconnect } = useDisconnect()
```

### 16.3 Server Components

Dashboard pages menggunakan **server components** (default di Next.js App Router):
- Direct database access via Prisma
- No client-side JavaScript untuk data fetching
- Faster initial page load

### 16.4 Local UI State

Modal, form inputs, dan toggle menggunakan React `useState`.

---

## 17. Database Schema

### 17.1 Entity Relationship

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Address   │────<│   Report     │────<│   Vote   │
│             │     │              │     │          │
│ id (cuid)   │     │ reporterAddr │     │ voteType │
│ address     │     │ reason       │     │ voterAddr│
│ status      │     │ status       │     └──────────┘
│ riskScore   │     │ votesFor     │
│ category    │     │ votesAgainst │
└──────┬──────┘     └──────────────┘
       │
       ├──< ┌──────────────┐
       │    │ ContractScan │
       │    │              │
       │    │ riskScore    │
       │    │ riskLevel    │
       │    │ patterns     │
       │    │ isProxy      │
       │    └──────────────┘
       │
       ├──< ┌──────────────┐
       │    │ AddressTag   │
       │    │              │
       │    │ tag          │
       │    │ taggedBy     │
       │    └──────────────┘
       │
       ├──< ┌──────────────────┐
       │    │ ExternalSource   │
       │    │                  │
       │    │ source           │
       │    │ confidence       │
       │    │ rawData (JSONB)  │
       │    └──────────────────┘
       │
       ├──< ┌──────────────────┐
       │    │ Watchlist        │
       │    │                  │
       │    │ userAddress      │
       │    └──────────────────┘
       │
       ├──< ┌──────────────────┐
       │    │ EnsRecord        │
       │    │                  │
       │    │ ensName          │
       │    │ fullName         │
       │    │ avatar           │
       │    └──────────────────┘
       │
       └──< ┌──────────────────────┐
            │ ContractSignature    │
            │                      │
            │ selector (0x...)     │
            │ functionName        │
            │ signature           │
            │ isMalicious         │
            └──────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  UserProfile     │     │  ScamDomain      │     │  SyncLog     │
│                  │     │                  │     │              │
│  address         │     │  domain          │     │  source      │
│  reputation      │     │  category        │     │  status      │
│  reportsVerified │     │  riskScore       │     │  records     │
│  tagsSubmitted   │     │  source          │     │  error       │
└──────────────────┘     └──────────────────┘     └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  OnchainVoteEvent (on-chain vote tracking)                       │
│                                                                  │
│  chainId, contractAddress, txHash, logIndex, blockNumber        │
│  reporterAddress, targetId, targetType (ADDRESS/ENS/DOMAIN)     │
│  reasonHash, isScam, blockTimestamp                             │
│  @@unique([txHash, logIndex])                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 17.2 Enums

| Enum | Values |
|------|--------|
| `AddressStatus` | `LEGIT`, `SCAM`, `SUSPICIOUS`, `UNKNOWN` |
| `AddressCategory` | `DEFI`, `NFT`, `BRIDGE`, `DEX`, `LENDING`, `PHISHING`, `DRAINER`, `AIRDROP_SCAM`, `RUGPULL`, `IMPOSTER`, `OTHER` |
| `AddressType` | `EOA`, `SMART_CONTRACT`, `PROXY`, `FACTORY` |
| `ContractType` | `DEX`, `NFT`, `TOKEN_20`, `TOKEN_721`, `TOKEN_1155`, `BRIDGE`, `LENDING`, `STAKING`, `YIELD`, `GOVERNANCE`, `MULTISIG`, `AIRDROP`, `MINTER`, `DRAINER`, `PHISHING`, `IMPOSTER`, `ROUTER`, `VAULT`, `FACTORY`, `OTHER` |
| `DataSource` | `COMMUNITY`, `SCANNER`, `EXTERNAL`, `SEED`, `ADMIN` |
| `ReportStatus` | `PENDING`, `VERIFIED`, `REJECTED`, `DISPUTED` |
| `VoteType` | `FOR`, `AGAINST` |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `TargetType` | `ADDRESS`, `ENS`, `DOMAIN` |

### 17.3 Key Indexes

Address table memiliki comprehensive indexing:
- `status`, `category`, `riskScore`, `source`, `chain` (individual)
- `(source, chain, status)` — composite untuk filtered queries
- `(status, riskScore)` — scam filtering
- `(addressType)`, `(contractType)` — type filtering
- `(firstSeenAt)`, `(lastSeenAt)` — time-based queries
- `(status, firstSeenAt)` — recent scams

ContractScan indexes: `riskLevel`, `createdAt`, `addressId`, `bytecodeHash` (similarity), `isProxy`, `checkerAddress`

OnchainVoteEvent indexes: `(txHash, logIndex)` unique, `(chainId, blockNumber)`, `(targetId, targetType)`, `reporterAddress`, `reasonHash`

### 17.4 Prisma Client (`lib/prisma.ts`)

Menggunakan **PostgreSQL adapter** (`@prisma/adapter-pg`) untuk connection pooling:

```typescript
const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**Singleton pattern** — mencegah multiple instances di development (hot reload).

---

## 18. Scam Detection Engine

### 18.1 Pattern System (`config/scam-patterns.ts`)

Empat kategori pattern:

#### Opcode Patterns
| Pattern | Severity | Risk Add |
|---------|----------|----------|
| Self-Destruct (`0xff`) | CRITICAL | +40 |
| Delegate Call (`0xf4`) | MEDIUM | +15 |
| Obsolete CALLCODE (`0xf2`) | LOW | +5 |
| External Code Hash (`0x3f`) | LOW | +5 |

#### Function Selector Patterns
| Pattern | Selector | Severity | Risk Add |
|---------|----------|----------|----------|
| Unlimited Approve | `0x095ea7b3` | HIGH | +25 |
| Unsafe Transfer From | `0x23b872dd` | HIGH | +30 |
| Ownership Transfer | `0xf2fde38b` | LOW | +10 |
| Renounce Ownership | `0x715018a6` | LOW | +5 |
| Contract Pause | `0x8456cb59` | MEDIUM | +10 |
| Unlimited Minting | `0x40c10f19` | HIGH | +20 |
| Burn From | `0x79cc6790` | MEDIUM | +15 |
| Multicall | `0xac9650d8` | LOW | +5 |

#### Bytecode Patterns
| Pattern | Severity | Risk Add |
|---------|----------|----------|
| Upgradeable Proxy (ERC1967) | MEDIUM | +15 |
| Beacon Proxy | MEDIUM | +15 |
| Minimal Proxy (EIP-1167) | LOW | +10 |
| Honeypot Signature | CRITICAL | +50 |

#### External Checks
| Pattern | Severity | Risk Add |
|---------|----------|----------|
| Unverified Source | LOW | +10 |
| Recently Deployed | LOW | +5 |

### 18.2 Risk Score Calculation

```
totalRiskScore = Σ(matchedPattern.riskAdd)
finalScore = Math.min(totalRiskScore, 100)
```

### 18.3 Risk Level Thresholds

| Level | Score Range |
|-------|-------------|
| LOW | 0 — 40 |
| MEDIUM | 41 — 60 |
| HIGH | 61 — 80 |
| CRITICAL | 81 — 100 |

### 18.4 Similarity Detection

Contracts dianggap similar jika:
- Bytecode hash cocok (first 10 bytes + last 10 bytes)
- Function selectors overlap >80%
- Deployment dari factory yang sama

---

## 19. External Data Sync

### 19.1 Data Sources

| Source | Type | Data | Frequency |
|--------|------|------|-----------|
| **DeFiLlama** | REST API | DeFi protocols, TVL, contract addresses | On-demand |
| **ScamSniffer** | GitHub Raw | Scam addresses, phishing domains, drainers | On-demand |
| **CryptoScamDB** | REST API | Scam entries, categories, descriptions | On-demand |
| **Base Registry** | Web Scrape | Official dApps, bridges, ecosystem | Manual |

### 19.2 External API Config (`config/endpoints.ts`)

```typescript
defiLlamaConfig.baseUrl     → 'https://api.llama.fi'
scamSnifferConfig.rawUrl    → 'https://raw.githubusercontent.com/scamsniffer/...'
cryptoScamDbConfig.baseUrl  → 'https://cryptoscamdb.org/api'
baseRegistryConfig.baseUrl  → 'https://base.org'
baseScanConfig.baseUrl      → 'https://sepolia.basescan.org'
```

### 19.3 Sync Flow

```
POST /api/v1/sync { source: "scamsniffer" }
  → SyncService.syncScamSniffer()
    → fetch scam addresses + domains from GitHub
    → for each address (limit 100/sync):
      → normalize to lowercase
      → upsert Address (description: "Flagged by ScamSniffer")
      → upsert ExternalSource (source: scamsniffer, rawData)
    → for each domain (limit 100/sync):
      → normalize (trim, lowercase)
      → upsert ScamDomain (category: PHISHING, source: scamsniffer)
    → create SyncLog entry
  ← SyncResponse
```

### 19.4 Sync Log

Setiap sync operasi dicatat di `SyncLog` table:
- source, status (success/failed)
- recordsAdded, recordsUpdated
- startedAt, completedAt
- error (if failed)

---

## 20. Styling & Design System

### 20.1 Color Palette

| Name | CSS Variable | Hex | Usage |
|------|-------------|-----|-------|
| Background | `--background` | `#000000` | Page background |
| Foreground | `--foreground` | `#E5E7EB` | Primary text |
| Accent | `--accent` | `#3B82F6` | Primary accent (blue) |
| Accent Dark | `--accent-dark` | `#2563EB` | Accent hover |
| Glow | `--glow` | `#22D3EE` | Cyan glow effect |
| Muted | `--muted` | `#9CA3AF` | Muted/secondary text |
| Card | `--card` | `#0D0D0D` | Card background |
| Card Border | `--card-border` | `#1F1F1F` | Card/input borders |
| Surface | `--surface` | `#0A0A0A` | Input/surface bg |

### 20.2 Typography

| Usage | Font | Variable |
|-------|------|----------|
| Body / UI | Space Grotesk | `--font-space-grotesk` |
| Code / Mono | Geist Mono | `--font-geist-mono` |

Fonts loaded via `next/font/google` (optimized, no layout shift).

### 20.3 Custom Utilities

```css
.gradient-blue    /* Blue → Cyan gradient background */
.gradient-text    /* Blue → Cyan gradient text */
.glow-accent      /* Soft blue glow box-shadow */
```

### 20.4 Scrollbar

Custom dark scrollbar:
- Width: 6px
- Track: background color
- Thumb: card-border color, rounded

### 20.5 Tailwind v4 Configuration

Menggunakan CSS-first configuration (`@theme inline` di globals.css):
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --font-sans: var(--font-space-grotesk);
  --font-mono: var(--font-geist-mono);
}
```

Tersedia sebagai Tailwind classes: `bg-background`, `text-foreground`, `text-accent`, dll.

---

## 21. Alur Data End-to-End

### 21.1 Address Scan

```
User input "0x1234..." di Checker page
  → Client: detectInputType("0x1234...") → "address"
  → fetch('/api/v1/scan/0x1234...')
    → Route handler: GET /api/v1/scan/[address]
      → withErrorHandling wrapper
      → ScannerService.scanContract(address)
        → Viem: publicClient.getCode(address)
        → Bytecode exists → analyze:
          → Extract opcodes (SELFDESTRUCT, DELEGATECALL, etc)
          → Extract function selectors
          → Match against scamPatterns
          → calculateRiskScore(matchedPatterns)
          → getBytecodeHash() for similarity
          → Query similar contracts from DB
          → Query reports from DB
        → Prisma: upsert ContractScan record
      ← ScanResult { riskScore, riskLevel, patterns, similarScams, ... }
    ← JSON response
  → Client: render results
    → TrustScoreBadge (visual gauge)
    → Patterns list (with severity colors)
    → Similar scams table
    → Community reports section
```

### 21.2 ENS Resolution + Scan

```
User input "vitalik.eth" di Checker page
  → Client: detectInputType("vitalik.eth") → "ens"
  → fetch('/api/v1/scan/vitalik.eth')
    → ScannerService.scanContract("vitalik.eth")
      → detectInputType → "ens"
      → Viem: mainnetClient.getEnsAddress({ name: "vitalik.eth" })
      → Resolved: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
      → EnsService: save to EnsRecord table
      → Continue scan resolved address (same as 20.1)
```

### 21.3 Domain Check

```
User input "app.uniswap.org" di Checker page
  → Client: detectInputType("app.uniswap.org") → "domain"
  → fetch('/api/v1/scan/app.uniswap.org')
    → ScannerService → scanDomain("app.uniswap.org")
      → DomainService.checkDomain("app.uniswap.org")
        → Prisma: query ScamDomain table
        → If found → return scam info
        → If not found → check Address table (url field)
      ← DomainCheckResult
```

### 21.4 Report Submission (Off-chain + On-chain)

```
User fill Report Scam Modal:
  Step 1: Input address, select reasons, add evidence URL
  Step 2: Preview report details
  Step 3: Confirm submission

  → useReportScam.submit()
    1. Off-chain: POST /api/v1/reports
       → ReportService.createReport(data)
         → Prisma: upsert Address (if not exists)
         → hashReasonData(reason) → keccak256 hash
         → Prisma: create Report record
         → LeaderboardService.awardReputation(reporter, +1)
       ← CreateReportResponse

    2. On-chain (if contract deployed):
       → wagmi useWriteContract: submitReport(targetType, targetId, reasonHash)
       → MetaMask confirmation
       → Wait for tx receipt
       → Save contract address to localStorage cache
  → Client: show success toast
```

### 21.5 Voting on Report

```
User click "Support" atau "Flag as Incorrect" di report
  → fetch('/api/v1/reports/{id}/vote', {
      method: 'POST',
      body: { vote: "FOR", voterAddress: "0x..." }
    })
    → ReportService.voteOnReport(reportId, voteData)
      → Check reputation threshold (min 10 points)
      → Check not already voted
      → Prisma: create Vote record
      → Update report vote counts
      → Check if threshold reached → auto-resolve
      → Award reputation to voter
    ← VoteResponse
```

### 21.6 External Data Sync

```
Admin / Cron trigger: POST /api/v1/sync { source: "scamsniffer" }
  → SyncService.syncScamSniffer()
    → fetch('https://raw.githubusercontent.com/.../blacklist/address.json')
    → Parse: { address: string[], domain: string[] }
    → For each address (limit 100/sync):
      → normalize to lowercase
      → Prisma: Address.upsert({ status: SCAM, riskScore: 80 })
      → Prisma: ExternalSource.upsert({ source: 'scamsniffer', rawData })
    → For each domain (limit 100/sync):
      → Prisma: ScamDomain.upsert({ category: PHISHING, source: scamsniffer })
    → Prisma: SyncLog.create({ source, recordsAdded, recordsUpdated })
  ← SyncResponse
```

### 21.7 Wallet Connection

```
User click "Connect Wallet" di dashboard header
  → Wagmi: useConnect().connect()
    → MetaMask popup muncul
    → User approve connection
  → useAccount() update: { address, isConnected, chainId }
  → UI update: show address + disconnect button
  → If wrong chain → prompt switch to Base
```

---

## 22. Testing & Debug

### 22.1 Manual Testing Checklist

#### Landing Page
- [ ] Hero section loads dengan gradient text
- [ ] CTA buttons navigate ke /dashboard
- [ ] Use case cards visible
- [ ] Footer links work

#### Dashboard
- [ ] Stats cards load data dari database
- [ ] Recent activity table populated
- [ ] Sidebar navigation works (all links)
- [ ] Search bar functional

#### Checker
- [ ] Input valid 0x address → scan results displayed
- [ ] Input ENS name → resolved + scanned
- [ ] Input domain → domain check result
- [ ] Invalid input → error message
- [ ] Detected patterns shown with severity
- [ ] Similar scams displayed
- [ ] Report submission works (off-chain + on-chain)
- [ ] Voting on reports works (FOR/AGAINST)
- [ ] Vote status check (already voted indicator)
- [ ] URL query parameter pre-fill (?address=0x...)

#### Deploy
- [ ] Connect wallet → shows address + network
- [ ] Auto-switch to Base Sepolia
- [ ] Deploy button → MetaMask confirmation
- [ ] Success state → tx hash + BaseScan link
- [ ] Contract address cached in localStorage

#### Watchlist
- [ ] Add address to watchlist via API
- [ ] Remove address from watchlist (DELETE)
- [ ] Score tracking updates
- [ ] Trend indicators accurate
- [ ] Last checked timestamp shown

#### Tags
- [ ] Search by address or tag name
- [ ] Add tag to address inline
- [ ] Tag badges show correct status colors
- [ ] Tag attribution (taggedBy) displayed

#### Settings
- [ ] Profile info displayed correctly
- [ ] Settings persist after page reload

#### API Endpoints
- [ ] `GET /api/health` returns healthy
- [ ] `GET /api/v1/scan/{address}` returns valid ScanResult
- [ ] `GET /api/v1/address/{address}` returns valid AddressDTO
- [ ] `GET /api/v1/address/{address}/tags` returns tags
- [ ] `DELETE /api/v1/address/{address}/tags?tag=X` removes tag
- [ ] `GET /api/v1/address/{address}/ens` returns ENS records
- [ ] `GET /api/v1/address-tags` returns paginated tags
- [ ] `POST /api/v1/address-tags` creates tag + awards reputation
- [ ] `GET /api/v1/check-domain?domain=X` checks domain
- [ ] `GET /api/v1/history` returns scan history
- [ ] `GET /api/v1/resolve/{ens}` resolves ENS name
- [ ] `GET /api/v1/scam-domains` lists scam domains
- [ ] `POST /api/v1/tags` creates tag (simplified)
- [ ] `POST /api/v1/reports` creates report
- [ ] `GET /api/v1/reports/vote-status` checks vote status
- [ ] `POST /api/v1/reports/{id}/vote` casts vote
- [ ] `GET /api/v1/watchlist` lists watchlist
- [ ] `POST /api/v1/watchlist` adds to watchlist
- [ ] `DELETE /api/v1/watchlist/{address}` removes from watchlist
- [ ] `GET /api/v1/dapps` returns paginated list
- [ ] `POST /api/v1/sync` runs sync
- [ ] `GET /api/v1/stats` returns platform stats

### 22.2 Development Tools

**Prisma Studio:**
```bash
npm run db:studio
```
Visual database browser di `http://localhost:5555`.

**Next.js DevTools:**
- Terminal shows route compilation times
- Browser console shows React errors
- Network tab shows API calls

**Database Debugging:**
```bash
# Direct SQL query
npx prisma db execute --stdin <<EOF
SELECT address, status, "riskScore" FROM addresses WHERE status = 'SCAM' LIMIT 10;
EOF
```

### 22.3 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `DATABASE_URL` not defined | Missing env variable | Set in `.env.local` |
| `Prisma Client not generated` | Missing prisma generate | Run `npm run db:generate` |
| `NEXT_PUBLIC_BASE_RPC_URL` error | Missing RPC URL | Set in `.env.local` |
| Wallet not connecting | MetaMask not installed | Install MetaMask extension |
| ENS resolution fails | Mainnet RPC unreachable | Check network / use different RPC |
| Scan timeout | Large contract bytecode | Increase `SCAN_TIMEOUT` in constants |
| Sync fails | External API down | Check API health, retry later |
| `P2002` Prisma error | Unique constraint violation | Record already exists |
| `P2025` Prisma error | Record not found | Check if data exists |

---

## 23. Extension Integration

Frontend API melayani browser extension yang berjalan di Chrome. Extension mengkonsumsi API yang sama:

### 23.1 API Consumption

| Extension Feature | API Endpoint | Method |
|-------------------|-------------|--------|
| Universal scan | `/api/v1/scan/{input}` | GET |
| Address check | `/api/v1/address/{address}` | GET |
| Domain check | `/api/v1/check-domain` | GET |
| Address tags | `/api/v1/address/{address}/tags` | GET/POST |
| Contract scan | `/api/v1/contracts/{address}/scan` | GET |
| Platform stats | `/api/v1/stats` | GET |
| Vote on tag | `/api/v1/address-tags/vote` | POST |

### 23.2 Shared Types

Extension dan Frontend menggunakan type definitions yang kompatibel:
- `ScanInputType`: `'address' | 'ens' | 'domain'`
- `SafetyLevel`: `'safe' | 'warning' | 'danger' | 'unknown'`
- `RiskLevel`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- API envelope: `{ success: boolean, data: T, error?: { code, message } }`

### 23.3 CORS

API routes perlu dikonfigurasi untuk menerima requests dari extension (`chrome-extension://` origin).

---

## 24. Roadmap

### Current Status (v1.0.0)

| Feature | Status |
|---------|--------|
| Next.js App Router setup | Done |
| Dashboard UI (overview, checker, history, watchlist, tags, settings, deploy) | Done |
| API Routes (22+ endpoints: scan, address, reports, watchlist, tags, etc) | Done |
| Service layer (scanner, report, sync, address, domain, ENS, stats, leaderboard) | Done |
| Prisma schema (12 models) with migrations | Done |
| Blockchain integration (Viem + Wagmi) | Done |
| ScamReporter smart contract (ABI + deploy page) | Done |
| Scam pattern detection engine (opcodes + selectors + bytecode) | Done |
| External data sync (DeFiLlama, ScamSniffer, CryptoScamDB) | Done |
| ENS resolution with caching | Done |
| Domain checking + scam domain database | Done |
| Community reporting + on-chain verification | Done |
| Community voting with wallet validation | Done |
| Vote status checking (anti-double-vote) | Done |
| Reputation / leaderboard system | Done |
| Watchlist API + UI (add/remove/score tracking) | Done |
| Tag management with search + inline add | Done |
| Report Scam modal (multi-step wizard) | Done |
| Landing page | Done |
| Tailwind v4 design system | Done |

### Next Phase

| Feature | Priority | Est. |
|---------|----------|------|
| Authentication (wallet-based login) | HIGH | 2 days |
| Deploy ScamReporter to Base Sepolia (testnet) | HIGH | 1 day |
| Real-time updates (WebSocket/SSE) | HIGH | 3 days |
| Rate limiting middleware | HIGH | 1 day |
| Comprehensive test suite | MEDIUM | 3 days |
| Deployment pipeline (Vercel) | MEDIUM | 1 day |
| Advanced charting (risk trends) | LOW | 2 days |
| Email/notification alerts | LOW | 2 days |
| Multi-chain support | LOW | 5 days |
| API documentation (OpenAPI/Swagger) | LOW | 1 day |

### Out of Scope

- Token price tracking
- Portfolio management
- Mobile app
- AI-based scam detection (ML model)
- Fiat on-ramp

---

*Dokumentasi ini adalah living document. Update seiring perkembangan proyek.*
