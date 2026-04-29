<div align="center">

<img src="public/logo2.png" alt="DOMAN" width="120" />

**Community-Powered Security & Decision Engine for Base Chain**

_Scan before you send. Trust before you transact._

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.7.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Docs](https://domanprotocol.vercel.app/api-reference) · [Contributing](#-contributing) · [Full Docs](https://doman-docs.vercel.app)

</div>

---

## Table of Contents

- [What is DOMAN?](#what-is-doman)
- [Why DOMAN?](#why-doman)
- [How DOMAN Works](#how-doman-works)
- [User Journeys](#user-journeys)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## What is DOMAN?

**DOMAN** is an _open-source_ Web3 security platform designed specifically for the **Base Chain**. It combines on-chain analysis, smart contract inspection, and community reputation signals to provide a **Trust Score** in real-time for every address, contract, and domain.

DOMAN consists of three main components:

| Component             | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| **Web Dashboard**     | Interactive dashboard for scanning, voting, watchlist, and tag management |
| **REST API**          | 27+ endpoints serving the dashboard and browser extension                 |
| **Browser Extension** | Real-time scanning directly in your browser _(live)_                      |

---

## Why DOMAN?

> **$14.0 billion** lost to crypto fraud in 2024. Security shouldn't be a privilege for technical users alone.
>
> _Source: [Chainalysis 2024 Crypto Crime Report](https://www.chainalysis.com/blog/2024-crypto-crime-report/); [FBI IC3 2024 Report](https://www.ic3.gov/)_

| Problem                                          | DOMAN Solution                                                  |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Hard to distinguish legitimate vs scam addresses | **Trust Score 0-100** with multi-factor analysis                |
| Dangerous contracts look normal                  | **Bytecode inspection** + pattern matching (opcodes, selectors) |
| Phishing domains impersonate popular dApps       | **Domain checker** with integrated scam domain database         |
| Decisions rely on single sources                 | **Community voting** — community verifies together              |
| Developers need security integration             | **Public REST API** for programmatic access                     |

**Core Principles of DOMAN:**

1. **Community-Powered** — Security belongs to the community, not a single entity
2. **Real-Time Protection** — Instant analysis, not audits that take days
3. **Deep Contract Analysis** — Scan bytecode down to opcode level, not just surface-level
4. **Reputation System** — Trusted contributors gain greater influence
5. **Open & Transparent** — Open-source, auditable by anyone

---

## How DOMAN Works

```mermaid
flowchart LR
    A["User Input<br/>(Address / ENS / Domain)"] --> B{Input Type?}

    B -->|"0x..."| C["Contract Scanner<br/>Bytecode Analysis"]
    B -->|".eth"| D["ENS Resolver<br/>(Ethereum Mainnet)"]
    B -->|"domain.com"| E["Domain Checker<br/>(ScamDomain DB)"]

    D --> C
    C --> F["Pattern Matching<br/>Opcodes + Selectors + Bytecode"]
    F --> G["Risk Score Calculation<br/>(0-100)"]
    E --> G

    G --> H["Community Signals<br/>(Reports + Votes + Tags)"]
    H --> I["Trust Score<br/>(100 - Risk Score)"]

    I --> J["Result<br/>Score + Risk Level + Patterns + Recommendations"]
```

### Scam Detection Engine

DOMAN detects scam patterns through three layers of analysis:

```mermaid
flowchart TB
    subgraph "Layer 1: Opcode Analysis"
        O1["SELFDESTRUCT (0xff)<br/>+40 risk"]
        O2["DELEGATECALL (0xf4)<br/>+15 risk"]
        O3["CALLCODE (0xf2)<br/>+5 risk"]
    end

    subgraph "Layer 2: Function Selectors"
        S1["Unlimited Approve<br/>+25 risk"]
        S2["Unsafe TransferFrom<br/>+30 risk"]
        S3["Unlimited Minting<br/>+20 risk"]
        S4["Ownership Transfer<br/>+10 risk"]
    end

    subgraph "Layer 3: Bytecode Patterns"
        B1["ERC1967 Proxy<br/>+15 risk"]
        B2["Honeypot Signature<br/>+50 risk"]
        B3["Beacon Proxy<br/>+15 risk"]
    end

    O1 & O2 & O3 & S1 & S2 & S3 & S4 & B1 & B2 & B3 --> R["Total Risk Score<br/>= Sum(riskAdd per pattern)<br/>Max: 100"]
```

**Implementation notes**
1. **Opcode parsing is hardened** — detection skips PUSH data to reduce false positives from embedded constants.
2. **Weighted scoring** — risk score uses `riskAdd` from `config/scam-patterns`.
3. **Governance/voting contracts** — ScamReporter selectors are classified as `GOVERNANCE`.
4. **Similar scams** — only returned when `bytecodeHash` matches existing scans.

### Risk Level Classification

| Score  | Level      | Badge | Meaning                                                |
| ------ | ---------- | ----- | ------------------------------------------------------ |
| 0-40   | `LOW`      | 🟢    | Address is safe, no dangerous patterns detected        |
| 41-60  | `MEDIUM`   | 🟡    | Some suspicious patterns detected, proceed with care   |
| 61-80  | `HIGH`     | 🟠    | Dangerous patterns detected, strongly advised to avoid |
| 81-100 | `CRITICAL` | 🔴    | Critical patterns detected, likely a scam              |

---

## User Journeys

### Journey 1: DeFi Trader checks address before swap

```mermaid
journey
    title DeFi Trader using DOMAN
    section Open Dashboard
      Open DOMAN landing page: 5: User
      Click "Try the Checker": 5: User
    section Scan Address
      Input new token contract address: 5: User
      System detects input type (address): 5: System
      Scanner retrieves bytecode from Base RPC: 4: System
      Pattern matching against 17+ scam patterns: 4: System
      Calculate Risk Score (0-100): 5: System
    section View Results
      View Trust Score badge: 5: User
      Read detected patterns and severity: 4: User
      Check community votes and reports: 4: User
    section Make Decision
      Decide whether to interact or avoid: 5: User
      Add to Watchlist for monitoring: 4: User
```

### Journey 2: Community Member reports scam

```mermaid
journey
    title Community Member reporting a scam
    section Connect Wallet
      Open dashboard and connect wallet: 4: User
      System verifies wallet address: 5: System
    section Create Report
      Click "Report Scam" on scan result: 5: User
      Input target address: 5: User
      Select reason (phishing, rugpull, etc): 4: User
      Add evidence URL: 3: User
      Preview and confirm report: 5: User
    section On-chain Verification
      Submit report to database: 5: System
      Optional: submit on-chain via ScamReporter contract: 3: System
      Reputation +1 for reporter: 5: System
    section Community Voting
      Other users vote FOR/AGAINST: 4: Community
      If threshold reached: auto-verify: 5: System
      Reporter gets +10 if report verified: 5: System
```

### Journey 3: Developer integrates API

```mermaid
journey
    title Developer integrating DOMAN API
    section Explore API
      Read API documentation: 4: Developer
      Test endpoints via Postman collection: 4: Developer
    section Integrate
      Implement GET /api/v1/scan/{address}: 5: Developer
      Parse response (riskScore, riskLevel, patterns): 4: Developer
      Display trust score in dApp: 5: Developer
    section Extend
      Use /api/v1/watchlist for monitoring: 3: Developer
      Use /api/v1/stats for dashboard metrics: 4: Developer
```

---

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        LP["Landing Page<br/>(Marketing)"]
        DB["Dashboard UI<br/>(Protected)"]
        WP["Wagmi Provider<br/>(Wallet Connection)"]
    end

    subgraph "API Layer — 27+ Endpoints"
        SCAN["/scan/&#123;address&#125;"]
        ADDR["/address/&#123;address&#125;"]
        REP["/reports + /vote"]
        WL["/watchlist"]
        SYNC["/sync"]
        STAT["/stats"]
        TAGS["/tags + /address-tags"]
        DOM["/check-domain + /scam-domains"]
    end

    subgraph "Service Layer"
        SS["ScannerService"]
        RS["ReportService"]
        SY["SyncService"]
        AS["AddressService"]
        DS["DomainService"]
        ES["EnsService"]
        LS["LeaderboardService"]
        ST["StatsService"]
    end

    subgraph "Infrastructure"
        PR["Prisma ORM<br/>(PostgreSQL)"]
        VI["Viem Client<br/>(Blockchain RPC)"]
        WA["Wagmi v3<br/>(Wallet + Contracts)"]
        RQ["React Query<br/>(Fetching + Cache)"]
    end

    subgraph "External"
        PG[("PostgreSQL<br/>(Supabase)")]
        BC["Base RPC / BaseScan"]
        EXT["DeFiLlama · ScamSniffer<br/>CryptoScamDB · ENS"]
    end

    LP & DB --> SCAN & ADDR & REP & WL & SYNC & STAT & TAGS & DOM
    WP --> DB

    SCAN --> SS --> VI & PR
    REP --> RS --> PR
    SYNC --> SY --> EXT & PR
    ADDR --> AS --> PR
    DOM --> DS --> PR
    TAGS --> PR
    STAT --> ST --> PR

    PR --> PG
    VI --> BC
    SS --> VI
    SY --> EXT
```

### Data Flow — Address Scan

```mermaid
sequenceDiagram
    participant U as User
    participant C as Checker UI
    participant A as API Route
    participant S as ScannerService
    participant V as Viem (RPC)
    participant D as Database

    U->>C: Input "0x1234..."
    C->>C: detectInputType("0x1234...") → address
    C->>A: GET /api/v1/scan/0x1234...

    A->>S: scanContract("0x1234...")
    S->>V: getCode("0x1234...")

    alt Bytecode exists (Smart Contract)
        V-->>S: bytecode
        S->>S: Extract opcodes + selectors
        S->>S: Match scam patterns (17+ patterns)
        S->>S: calculateRiskScore()
        S->>S: getBytecodeHash() for similarity
        S->>D: Query similar contracts
        D-->>S: similar contracts list
    else No bytecode (EOA)
        V-->>S: null
        S->>D: Query reports for address
        D-->>S: report data
    end

    S->>D: Save ContractScan record
    S-->>A: ScanResult
    A-->>C: JSON response

    C->>U: Render: Trust Score + Risk Level + Patterns + Community Votes
```

### Data Flow — Report & Vote

```mermaid
sequenceDiagram
    participant U as User
    participant H as useReportScam Hook
    participant A as POST /api/v1/reports
    participant R as ReportService
    participant L as LeaderboardService
    participant D as Database
    participant W as Wagmi (On-chain)

    U->>H: Submit report (address, reasons, evidence)
    H->>A: POST {address, reason, category, reporterAddress}
    A->>R: createReport(data)
    R->>D: upsert Address (if not exists)
    R->>R: hashReasonData() → keccak256
    R->>D: create Report record
    R->>L: awardReputation(reporter, +1)
    L->>D: update UserProfile
    R-->>A: CreateReportResponse
    A-->>H: {id, status, message}

    opt On-chain (if contract deployed)
        H->>W: writeContract: submitReport()
        W-->>H: txHash
    end

    H->>U: Show success
```

---

## Tech Stack

| Component          | Technology                                 | Version |
| ------------------ | ------------------------------------------ | ------- |
| Framework          | **Next.js** (App Router)                   | 16.2.3  |
| UI Library         | **React**                                  | 19.2.4  |
| Language           | **TypeScript**                             | 5.x     |
| Styling            | **Tailwind CSS**                           | 4.x     |
| ORM                | **Prisma**                                 | 7.7.0   |
| Database           | **PostgreSQL** (Supabase)                  | —       |
| Blockchain Client  | **Viem**                                   | 2.48.0  |
| Wallet Integration | **Wagmi**                                  | 3.6.4   |
| Data Fetching      | **TanStack React Query**                   | 5.100.1 |
| Validation         | **Zod**                                    | 3.25.76 |
| Icons              | **Lucide React**                           | 1.8.0   |
| Chain              | **Base** (8453) / **Base Sepolia** (84532) | —       |

---

## Features

| Feature                | Status | Description                                                 |
| ---------------------- | ------ | ----------------------------------------------------------- |
| Address Scanner        | ✅     | Scan 0x addresses with bytecode analysis + pattern matching |
| ENS Resolution         | ✅     | Resolve .eth names via Ethereum Mainnet + caching           |
| Domain Checker         | ✅     | Check if domain is phishing/scam                            |
| Community Reporting    | ✅     | Report scams with multi-step wizard                         |
| Community Voting       | ✅     | Vote FOR/AGAINST with wallet-based validation               |
| Trust Score Engine     | ✅     | Multi-factor risk scoring (0-100)                           |
| Watchlist              | ✅     | Monitor addresses with score tracking                       |
| Tag Management         | ✅     | Tag addresses as LEGIT/SUSPICIOUS/SCAM                      |
| Reputation System      | ✅     | Points + levels (Beginner → Master)                         |
| Smart Contract Deploy  | ✅     | Deploy ScamReporter contract to Base                        |
| External Data Sync     | ✅     | Sync from DeFiLlama, ScamSniffer, CryptoScamDB              |
| dApps Directory        | ✅     | Browse and search verified dApps                            |
| 27+ REST API Endpoints | ✅     | Full-featured API for extension and integrations            |
| Browser Extension      | ✅     | Real-time scanning in browser _(live)_                      |
| Rate Limiting          | 🔜     | Upstash Redis-based rate limiting                           |
| Authentication         | 🔜     | Wallet-based login (SIWE)                                   |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** database ([Supabase](https://supabase.com/) recommended)
- **Git**

### 1. Clone & Install

```bash
git clone  https://github.com/artomily/wallo.git
cd wallo
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` — minimum required variables:

```env
DATABASE_URL="postgresql://postgres.REF:PASSWORD@aws-1-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.REF:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_BASE_RPC_URL="https://sepolia.base.org"
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
```

> [!TIP]
> Use [Supabase free tier](https://supabase.com/) for database and [Alchemy](https://www.alchemy.com/) for RPC.

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### NPM Scripts

| Script                | Command                         | Description                        |
| --------------------- | ------------------------------- | ---------------------------------- |
| `npm run dev`         | `next dev`                      | Development server with hot reload |
| `npm run build`       | `prisma generate && next build` | Production build                   |
| `npm run start`       | `next start`                    | Start production server            |
| `npm run lint`        | `eslint`                        | Run ESLint                         |
| `npm run db:generate` | `prisma generate`               | Generate Prisma Client             |
| `npm run db:push`     | `prisma db push`                | Push schema to database            |
| `npm run db:migrate`  | `prisma migrate dev`            | Run migrations                     |
| `npm run db:seed`     | `prisma db seed`                | Seed database                      |
| `npm run db:studio`   | `prisma studio`                 | Visual database browser            |
| `npm run db:reset`    | `prisma migrate reset`          | Reset database                     |

---

## Project Structure

```
doman/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── providers.tsx             # Wagmi + React Query providers
│   ├── globals.css               # Global styles + CSS variables
│   ├── (marketing)/              # Landing page (public)
│   │   └── page.tsx
│   ├── (dashboard)/              # Dashboard (protected)
│   │   └── dashboard/
│   │       ├── layout.tsx        # Sidebar + Header layout
│   │       ├── page.tsx          # Overview / stats
│   │       ├── checker/          # Address checker + voting
│   │       ├── deploy/           # Deploy ScamReporter contract
│   │       ├── history/          # Scan history
│   │       ├── watchlist/        # Watchlist management
│   │       ├── tags/             # Tag management
│   │       └── settings/         # Settings
│   └── api/                      # REST API (27+ endpoints)
│       ├── health/
│       └── v1/
│
├── components/                   # React components
│   ├── ui/                       # Primitives (Button, Card, Input, Modal, Badge)
│   ├── dashboard/                # Sidebar, Header, ReportModal, TrustBadge
│   └── marketing/                # Navbar, Footer
│
├── hooks/                        # Custom hooks (useReportScam)
├── config/                       # Chains, Contracts, Endpoints, Scam Patterns
├── lib/                          # Utilities (prisma, viem, wagmi, validation, etc.)
├── services/                     # Business logic (8 services)
├── types/                        # TypeScript types (API + Models)
├── prisma/                       # Schema, migrations, seed
└── public/                       # Static assets
```

---

## API Overview

All APIs use envelope format `{ success, data, meta }` with consistent pagination and error codes.

| Category      | Endpoints                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core**      | `GET /scan/{address}` · `GET /address/{address}` · `GET /check-domain` · `GET /resolve/{ens}` · `GET /stats` · `GET /history` · `GET /dapps` · `POST /scan-batch` · `GET /search` |
| **Community** | `POST /reports` · `GET /reports` · `POST /reports/{id}/vote` · `GET /reports/vote-status`                                                                                         |
| **User**      | `GET/POST /watchlist` · `DELETE /watchlist/{address}` · `GET/POST /address-tags` · `POST /tags`                                                                                   |
| **System**    | `POST /sync` · `GET /leaderboard` · `GET /leaderboard/{address}` · `GET /health`                                                                                                  |

> For the full API reference with request/response schemas and examples, see **[API Reference](https://domanprotocol.vercel.app/api-reference)**.

---

## Environment Variables

| Variable                    | Required | Default                        | Description                                    |
| --------------------------- | -------- | ------------------------------ | ---------------------------------------------- |
| `DATABASE_URL`              | ✅       | —                              | PostgreSQL connection string (Supabase pooler) |
| `DIRECT_URL`                | —        | `DATABASE_URL`                 | Direct connection (bypass pooler)              |
| `NEXT_PUBLIC_BASE_RPC_URL`  | ✅       | `https://sepolia.base.org`     | Base RPC URL                                   |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | —        | `84532`                        | 84532 = Sepolia, 8453 = Mainnet                |
| `NEXT_PUBLIC_BASESCAN_URL`  | —        | `https://sepolia.basescan.org` | Block explorer URL                             |
| `ETHEREUM_RPC_URL`          | ✅       | —                              | Ethereum Mainnet RPC (for ENS)                 |
| `WALLET_PRIVATE_KEY`        | —        | —                              | Server-side wallet key (0x prefixed)           |
| `CRON_SECRET`               | —        | —                              | Secret for cron/sync endpoints                 |
| `BASESCAN_API_KEY`          | —        | —                              | BaseScan API key                               |

---

## Database

### Schema Overview

```mermaid
erDiagram
    Address ||--o{ Report : "has"
    Address ||--o{ ContractScan : "scanned by"
    Address ||--o{ AddressTag : "tagged with"
    Address ||--o{ ExternalSource : "sourced from"
    Address ||--o{ Watchlist : "watched by"
    Address ||--o{ EnsRecord : "resolved to"
    Address ||--o{ ContractSignature : "contains"
    Address ||--o{ SearchHistory : "checked by"
    Report ||--o{ Vote : "receives"
    Report }o--|| UserProfile : "reported by"
    UserProfile ||--o{ Watchlist : "created by"
    ScamDomain ||--o{ ExternalSource : "linked to"
    SyncLog }o--|| ExternalSource : "tracked by"

    Address {
        string id PK
        string address UK
        enum status
        int riskScore
        enum category
        enum addressType
        enum contractType
        enum source
        string chain
    }

    Report {
        string id PK
        string reporterAddress
        string reason
        enum status
        int votesFor
        int votesAgainst
        enum category
    }

    Vote {
        string id PK
        string voteType
        string voterAddress
    }

    ContractScan {
        string id PK
        int riskScore
        enum riskLevel
        string patterns
        boolean isProxy
        string bytecodeHash
    }

    UserProfile {
        string id PK
        string address UK
        int reputation
        int reportsVerified
    }

    SearchHistory {
        string id PK
        string checkerAddress
        string searchType
        string query
        int riskScore
        string riskLevel
    }
```

### 14 Models

`Address` · `Report` · `Vote` · `OnchainVoteEvent` · `ContractScan` · `AddressTag` · `ExternalSource` · `Watchlist` · `UserProfile` · `ScamDomain` · `EnsRecord` · `ContractSignature` · `SyncLog` · `SearchHistory`

---

## Contributing

We appreciate all forms of contribution! Here's a guide to get started.

### Quick Start for Contributors

```bash
# 1. Fork repository
# 2. Clone your fork
git clone https://github.com/<username>/doman.git
cd doman

# 3. Create branch for your feature/fix
git checkout -b feat/my-feature
# or: fix/bug-description, docs/update-readme

# 4. Install dependencies
npm install

# 5. Setup environment
cp .env.example .env.local
# Edit .env.local with your database and RPC

# 6. Setup database
npm run db:generate
npm run db:push

# 7. Run dev server
npm run dev

# 8. Make changes, commit, and push
git add .
git commit -m "feat: description of changes"
git push origin feat/my-feature

# 9. Create Pull Request
```

### Branch Naming Convention

| Type          | Format                 | Example                     |
| ------------- | ---------------------- | --------------------------- |
| Feature       | `feat/description`     | `feat/add-rate-limiting`    |
| Bug Fix       | `fix/description`      | `fix/scan-timeout-error`    |
| Documentation | `docs/description`     | `docs/update-api-reference` |
| Refactor      | `refactor/description` | `refactor/scanner-service`  |
| Chore         | `chore/description`    | `chore/update-dependencies` |

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Formatting, whitespace (no code change)
- `refactor` — Refactoring without behavior changes
- `test` — Add or fix tests
- `chore` — Build process, dependencies, etc

**Scope:** `scanner`, `report`, `api`, `ui`, `db`, `auth`, `sync`, `config`

**Examples:**

```bash
feat(scanner): add proxy pattern detection for ERC1967
fix(api): handle timeout on large contract bytecode
docs(api): update scan endpoint response format
refactor(db): optimize address query with composite indexes
```

### Pull Request Process

1. **Ensure** `npm run lint` passes without errors
2. **Ensure** `npm run build` succeeds without errors
3. **Update documentation** if changes affect API or behavior
4. **Add clear description** in PR — what changed and why
5. **Link related issues** if any (e.g., `Closes #12`)
6. **Keep PRs focused** on a single change (feature or fix)

### Code Style

- **TypeScript strict mode** — no `any` without justification
- **Prettier + ESLint** — run `npm run lint` before committing
- **React Server Components** — default for all pages, use `'use client'` only when necessary
- **Service pattern** — business logic in `services/`, not in route handlers
- **Zod validation** — all inputs validated with Zod schema
- **Error handling** — use `AppError` from `lib/error-handler.ts`

### Areas That Need Contribution

| Area                | Priority  | Description                             | How to Get Started                                            |
| ------------------- | --------- | --------------------------------------- | ------------------------------------------------------------- |
| Test Suite          | 🔴 HIGH   | Unit tests for services and API routes  | Check `__tests__/` folder and add tests for untested services |
| Authentication      | 🔴 HIGH   | Wallet-based login (SIWE)               | Implement Sign-In with Ethereum flow                          |
| Rate Limiting       | 🔴 HIGH   | Upstash Redis middleware                | Add Redis client and rate limiting middleware                 |
| CI/CD Pipeline      | 🟡 MEDIUM | GitHub Actions for lint, build, test    | Create `.github/workflows/` actions                           |
| API Docs (OpenAPI)  | 🟡 MEDIUM | Swagger/OpenAPI specification           | Generate OpenAPI schema from code                             |
| Multi-chain Support | 🟢 LOW    | Support chains beyond Base              | Add chain configs and update services                         |
| i18n                | 🟢 LOW    | Multi-language support                  | Use `next-intl` or similar library                            |
| Data Visualization  | 🟢 LOW    | Risk trend charts, analytics dashboards | Add charting library and new dashboard views                  |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with love for the Base community.**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
