# Technical Design Document — Wallo Backend (Next.js)

**Version:** 2.0  
**Date:** 2026-04-16  
**Team:** Butuh Uwang  

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser Extension (Plasmo)                 │
│                  Wagmi + Viem → direct SC interaction          │
└──────────┬──────────────────────────────┬────────────────────┘
           │ REST API                     │ Web3 (Wagmi)
           ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────┐
│   Next.js 14 Full-Stack │    │  Smart Contracts     │
│   (App Router)          │    │  (Base Sepolia)      │
│                         │    │                      │
│  ┌───────────────────┐  │    │  AddressRegistry.sol │
│  │  /app (Dashboard) │  │    │  CommunityReport.sol │
│  ├───────────────────┤  │    │  TransactionGuard.sol│
│  │  /app/api/v1/*    │  │    └─────────────────────┘
│  │   (API Routes)    │  │            ▲
│  ├───────────────────┤  │            │ viem (server)
│  │  Services         │──┼────────────┘
│  │   - scanner       │  │
│  │   - sync          │  │    ┌─────────────────────┐
│  │   - listener      │  │    │  External Sources    │
│  │   - contract      │  │    │                      │
│  └───────────────────┘  │    │  DeFiLlama API       │
│                         │    │  ScamSniffer DB       │
│  ┌───────────────────┐  │    │  CryptoScamDB         │
│  │  Prisma ORM       │  │    │  Base Registry        │
│  └─────────┬─────────┘  │    └─────────────────────┘
└────────────┼─────────────┘
             ▼
    ┌──────────────────┐
    │   PostgreSQL     │
    │   (Supabase)     │
    └──────────────────┘
```

---

## 2. Code Flow

```
wallo/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx          # Address list + search
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Community reports
│   │   │   ├── scanner/
│   │   │   │   └── page.tsx          # Contract scanner UI
│   │   │   ├── stats/
│   │   │   │   └── page.tsx          # Statistics
│   │   │   └── leaderboard/
│   │   │       └── page.tsx          # Top reporters
│   │   │
│   │   └── api/
│   │       └── v1/
│   │           ├── address/
│   │           │   └── [address]/
│   │           │       └── route.ts  # GET address status
│   │           ├── report/
│   │           │   └── route.ts      # POST submit report
│   │           ├── reports/
│   │           │   └── route.ts      # GET list reports
│   │           │   └── [id]/
│   │           │       └── vote/
│   │           │           └── route.ts  # POST vote
│   │           ├── scan/
│   │           │   └── [address]/
│   │           │       └── route.ts  # GET contract scan
│   │           ├── search/
│   │           │   └── route.ts      # GET search
│   │           ├── stats/
│   │           │   └── route.ts      # GET statistics
│   │           ├── leaderboard/
│   │           │   └── route.ts      # GET leaderboard
│   │           ├── sync/
│   │           │   └── route.ts      # POST trigger sync (cron)
│   │           └── dapps/
│   │               └── route.ts      # GET dApp list (legit/scam)
│   │
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── viem.ts                   # Viem client config (Base)
│   │   ├── contracts.ts              # Contract ABIs + addresses
│   │   └── utils.ts                  # Helpers
│   │
│   ├── services/
│   │   ├── address-service.ts        # Address CRUD + lookup
│   │   ├── report-service.ts         # Report management
│   │   ├── scanner-service.ts        # Contract bytecode analysis
│   │   ├── sync-service.ts           # External data sync
│   │   ├── leaderboard-service.ts    # Leaderboard calculation
│   │   └── stats-service.ts          # Statistics aggregation
│   │
│   ├── config/
│   │   ├── chains.ts                 # Base chain config
│   │   └── constants.ts              # App constants
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── address-card.tsx
│   │   ├── risk-badge.tsx
│   │   ├── report-form.tsx
│   │   ├── scanner-result.tsx
│   │   ├── stats-overview.tsx
│   │   └── search-bar.tsx
│   │
│   └── types/
│       └── index.ts                  # TypeScript types
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                       # Seed script
│   └── migrations/
│
├── contracts/                        # Foundry project
│   ├── src/
│   │   ├── AddressRegistry.sol
│   │   ├── CommunityReport.sol
│   │   └── TransactionGuard.sol
│   ├── test/
│   ├── script/
│   └── foundry.toml
│
├── public/
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 3. Data Flow

### 3.1 dApp Data Ingestion Flow

```
[DeFiLlama API] ──GET daily──→ sync-service.ts
[ScamSniffer DB] ──git pull───→ sync-service.ts
[CryptoScamDB]  ──API pull────→ sync-service.ts
[Base Registry] ──scrape──────→ sync-service.ts
                                    │
                                    ▼
                              Prisma upsert
                                    │
                                    ▼
                              PostgreSQL
                              (addresses table)
                                    │
                                    ▼
                          GET /api/v1/dapps
                          GET /api/v1/address/[addr]
                                    │
                                    ▼
                              Dashboard / Extension
```

### 3.2 Community Report Flow

```
User (Extension/Dashboard)
    │
    ▼ POST /api/v1/report
{ address, reason, evidence, category }
    │
    ▼
report-service.ts
    │
    ├──→ Prisma: INSERT reports (status: pending)
    │
    ├──→ Viem: writeContract → CommunityReport.submitReport()
    │         (on-chain record, stake mechanism)
    │
    ▼
Community Vote (on-chain via Wagmi)
    │
    ├── votes_for > threshold → status: verified
    ├── votes_against > threshold → status: rejected
    │
    ▼
Event emitted → listener updates DB
    │
    ▼
Address status updated → address moved to scam/legit
```

### 3.3 Contract Scan Flow

```
User input address
    │
    ▼ GET /api/v1/scan/[address]
scanner-service.ts
    │
    ├──→ Viem: getCode() → get bytecode
    │
    ├──→ Pattern matching:
    │    ├── Hidden transferFrom     → +30 risk
    │    ├── Unlimited approve       → +25 risk
    │    ├── Upgradeable proxy       → +20 risk
    │    ├── Owner can pause         → +10 risk
    │    ├── Self-destruct           → +40 risk
    │    ├── Delegate call           → +15 risk
    │    └── No source (unverified)  → +10 risk
    │
    ├──→ Check existing reports for this address
    │
    ├──→ Check known patterns DB
    │
    ▼ Return result
{
  address,
  riskScore: 75,
  riskLevel: "high",
  patterns: ["unlimited_approve", "upgradeable_proxy"],
  isVerified: false,
  reportCount: 3,
  status: "suspicious"
}
    │
    ▼ Cache result in contract_scans table
```

### 3.4 Address Lookup Flow (Extension)

```
User buka dApp di browser
    │
    ▼
Extension detect address interaction
    │
    ▼ GET /api/v1/address/{address}
address-service.ts
    │
    ├──→ Prisma: findUnique (addresses)
    │    ├── Found → return { status, riskScore, tags, category }
    │    └── Not found → trigger quick scan
    │
    ├──→ scanner-service.quickScan(address)
    │
    ▼ Return to Extension
{
  address: "0x...",
  status: "scam",
  riskScore: 95,
  category: "drainer",
  tags: ["phishing", "token-drainer"],
  name: "FakeAirdrop.xyz",
  reportCount: 12,
  lastReported: "2026-04-15"
}
    │
    ▼
Extension shows warning badge
```

---

## 4. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// CORE TABLES
// ============================================

model Address {
  id          String   @id @default(cuid())
  address     String   @unique
  name        String?
  chain       String   @default("base")
  status      AddressStatus @default(UNKNOWN)
  riskScore   Int      @default(0)     // 0-100
  category    AddressCategory @default(OTHER)
  source      DataSource @default(SEED)
  description String?
  url         String?                   // Website URL if dApp
  logoUrl     String?
  tvl         Float?                    // From DeFiLlama
  verifiedBy  String?                   // Admin/verifier address
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  reports        Report[]
  scans          ContractScan[]
  tags           AddressTag[]
  sourceLinks    ExternalSource[]

  @@index([status])
  @@index([category])
  @@index([riskScore])
  @@index([source])
  @@map("addresses")
}

model Report {
  id              String   @id @default(cuid())
  addressId       String
  reporterAddress String
  reason          String
  evidenceUrl     String?
  category        AddressCategory @default(OTHER)
  status          ReportStatus @default(PENDING)
  votesFor        Int      @default(0)
  votesAgainst    Int      @default(0)
  txHash          String?                   // On-chain tx hash
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  address   Address  @relation(fields: [addressId], references: [id], onDelete: Cascade)
  votes     Vote[]

  @@index([status])
  @@index([reporterAddress])
  @@index([createdAt])
  @@map("reports")
}

model Vote {
  id          String   @id @default(cuid())
  reportId    String
  voterAddress String
  vote        VoteType
  txHash      String?
  createdAt   DateTime @default(now())

  // Relations
  report     Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@unique([reportId, voterAddress])
  @@map("votes")
}

model ContractScan {
  id              String   @id @default(cuid())
  addressId       String
  bytecodeHash    String?
  riskScore       Int
  riskLevel       RiskLevel
  patterns        Json        // Array of detected patterns
  isVerified      Boolean @default(false)
  scannerVersion  String  @default("1.0.0")
  scanDuration    Int?        // ms
  createdAt       DateTime @default(now())

  // Relations
  address   Address  @relation(fields: [addressId], references: [id], onDelete: Cascade)

  @@index([riskLevel])
  @@index([createdAt])
  @@map("contract_scans")
}

model AddressTag {
  id        String   @id @default(cuid())
  addressId String
  tag       String
  taggedBy  String?                   // Address or "system"
  createdAt DateTime @default(now())

  // Relations
  address   Address  @relation(fields: [addressId], references: [id], onDelete: Cascade)

  @@unique([addressId, tag])
  @@map("address_tags")
}

model ExternalSource {
  id          String   @id @default(cuid())
  addressId   String
  source      String   // "defillama", "scamsniffer", "cryptoscamdb", "base"
  sourceId    String?  // ID from external source
  sourceUrl   String?
  rawData     Json?    // Raw data from source
  syncedAt    DateTime @default(now())

  // Relations
  address   Address  @relation(fields: [addressId], references: [id], onDelete: Cascade)

  @@unique([addressId, source, sourceId])
  @@map("external_sources")
}

// ============================================
// SYSTEM TABLES
// ============================================

model SyncLog {
  id            String   @id @default(cuid())
  source        String   // "defillama", "scamsniffer", etc.
  status        String   // "success", "failed"
  recordsAdded  Int      @default(0)
  recordsUpdated Int     @default(0)
  error         String?
  startedAt     DateTime @default(now())
  completedAt   DateTime?

  @@index([source])
  @@index([startedAt])
  @@map("sync_logs")
}

model UserProfile {
  id              String   @id @default(cuid())
  address         String   @unique
  ensName         String?
  reportsSubmitted Int     @default(0)
  reportsVerified Int      @default(0)
  reputation      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("user_profiles")
}

// ============================================
// ENUMS
// ============================================

enum AddressStatus {
  LEGIT
  SCAM
  SUSPICIOUS
  UNKNOWN
}

enum AddressCategory {
  DEFI
  NFT
  BRIDGE
  DEX
  LENDING
  PHISHING
  DRAINER
  AIRDROP_SCAM
  RUGPULL
  IMPOSTER
  OTHER
}

enum DataSource {
  COMMUNITY
  SCANNER
  EXTERNAL
  SEED
  ADMIN
}

enum ReportStatus {
  PENDING
  VERIFIED
  REJECTED
  DISPUTED
}

enum VoteType {
  FOR
  AGAINST
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Address    │1─────*│    Report    │1─────*│     Vote     │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ address (UQ) │       │ addressId(FK)│       │ reportId (FK)│
│ name         │       │ reporterAddr │       │ voterAddress │
│ status       │       │ reason       │       │ vote         │
│ riskScore    │       │ status       │       │ txHash       │
│ category     │       │ votesFor     │       └──────────────┘
│ source       │       │ votesAgainst │
│ tvl          │       │ txHash       │
│ verifiedBy   │       └──────────────┘
│ verifiedAt   │
└──────┬───────┘
       │
       │1
       │
       ├──*┌──────────────┐
       │  │ AddressTag   │
       │  │──────────────│
       │  │ id (PK)      │
       │  │ addressId(FK)│
       │  │ tag          │
       │  │ taggedBy     │
       │  └──────────────┘
       │
       ├──*┌──────────────┐
       │  │ContractScan  │
       │  │──────────────│
       │  │ id (PK)      │
       │  │ addressId(FK)│
       │  │ riskScore    │
       │  │ riskLevel    │
       │  │ patterns     │
       │  │ isVerified   │
       │  └──────────────┘
       │
       └──*┌──────────────┐
          │ExternalSource│
          │──────────────│
          │ id (PK)      │
          │ addressId(FK)│
          │ source       │
          │ sourceId     │
          │ rawData      │
          └──────────────┘

┌──────────────┐       ┌──────────────┐
│   SyncLog    │       │ UserProfile  │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ source       │       │ address (UQ) │
│ status       │       │ reportsSubm. │
│ recordsAdded │       │ reportsVerif.│
│ error        │       │ reputation   │
└──────────────┘       └──────────────┘
```

---

## 5. API Design (Next.js Route Handlers)

### 5.1 Address Endpoints

**GET /api/v1/address/[address]**
```
Request: GET /api/v1/address/0x1234...abcd
Response: {
  address: "0x1234...abcd",
  name: "Aerodrome",
  status: "LEGIT",
  riskScore: 5,
  category: "DEX",
  tags: ["verified", "defi"],
  tvl: 1500000,
  reportCount: 0,
  lastScanned: "2026-04-15T10:00:00Z",
  sources: ["defillama", "base"],
  verifiedBy: "0xadmin...",
  verifiedAt: "2026-04-01T00:00:00Z"
}
```

**GET /api/v1/dapps**
```
Request: GET /api/v1/dapps?status=LEGIT&category=DEX&page=1&limit=20
Response: {
  data: [
    {
      id: "clx...",
      address: "0x...",
      name: "Aerodrome",
      status: "LEGIT",
      category: "DEX",
      riskScore: 5,
      tvl: 1500000,
      logoUrl: "https://..."
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    totalPages: 8
  }
}
Query params:
  - status: LEGIT | SCAM | SUSPICIOUS | UNKNOWN
  - category: DEFI | NFT | DEX | BRIDGE | etc
  - search: search by name or address
  - sort: riskScore | tvl | name | createdAt
  - order: asc | desc
  - page, limit
```

**GET /api/v1/search**
```
Request: GET /api/v1/search?q=aerodrome
Response: {
  results: [
    {
      address: "0x...",
      name: "Aerodrome",
      status: "LEGIT",
      category: "DEX",
      riskScore: 5
    }
  ],
  total: 3
}
```

### 5.2 Report Endpoints

**POST /api/v1/report**
```
Request: {
  address: "0x5678...efgh",
  reason: "Token drainer, stolen funds",
  category: "DRAINER",
  evidenceUrl: "https://tx.example.com/0x...",
  reporterAddress: "0xuser..."
}
Response: {
  id: "clx...",
  status: "PENDING",
  txHash: "0x... (on-chain tx)",
  message: "Report submitted. Awaiting community verification."
}
```

**GET /api/v1/reports**
```
Request: GET /api/v1/reports?status=PENDING&page=1&limit=20
Response: {
  data: [
    {
      id: "clx...",
      address: { name: "FakeApp", address: "0x...", status: "SUSPICIOUS" },
      reporterAddress: "0x...",
      reason: "Phishing",
      category: "PHISHING",
      votesFor: 3,
      votesAgainst: 1,
      createdAt: "2026-04-15T10:00:00Z"
    }
  ],
  pagination: { ... }
}
```

**POST /api/v1/reports/[id]/vote**
```
Request: {
  vote: "FOR",          // FOR | AGAINST
  voterAddress: "0x...",
  txHash: "0x..."       // On-chain vote tx
}
Response: {
  reportId: "clx...",
  votesFor: 4,
  votesAgainst: 1,
  status: "PENDING"     // or "VERIFIED"/"REJECTED" if threshold reached
}
```

### 5.3 Scanner Endpoints

**GET /api/v1/scan/[address]**
```
Response: {
  address: "0x...",
  riskScore: 75,
  riskLevel: "HIGH",
  isVerified: false,
  patterns: [
    {
      name: "Unlimited Approve",
      severity: "HIGH",
      description: "Contract requests unlimited token approval"
    },
    {
      name: "Upgradeable Proxy",
      severity: "MEDIUM",
      description: "Contract owner can change implementation"
    }
  ],
  similarScams: [
    { address: "0x...", name: "KnownScam_1", similarity: 0.85 }
  ],
  reportCount: 3,
  scanDuration: 2450
}
```

**POST /api/v1/scan/batch**
```
Request: {
  addresses: ["0x...", "0x...", "0x..."]
}
Response: {
  results: [
    { address: "0x...", riskScore: 75, riskLevel: "HIGH" },
    { address: "0x...", riskScore: 10, riskLevel: "LOW" },
    ...
  ]
}
```

### 5.4 Stats & Leaderboard

**GET /api/v1/stats**
```
Response: {
  totalAddresses: 5420,
  legitCount: 890,
  scamCount: 3100,
  suspiciousCount: 680,
  unknownCount: 750,
  totalReports: 1240,
  verifiedReports: 456,
  pendingReports: 78,
  topCategories: [
    { category: "PHISHING", count: 1200 },
    { category: "DRAINER", count: 890 },
    ...
  ],
  recentScams: [...],
  scansToday: 340
}
```

**GET /api/v1/leaderboard**
```
Response: {
  data: [
    {
      address: "0x...",
      ensName: "alice.eth",
      reportsSubmitted: 45,
      reportsVerified: 38,
      reputation: 850
    }
  ]
}
```

### 5.5 Sync Endpoint (Cron/Internal)

**POST /api/v1/sync**
```
Request: {
  source: "defillama"   // defillama | scamsniffer | cryptoscamdb | base
}
Response: {
  source: "defillama",
  recordsAdded: 12,
  recordsUpdated: 5,
  syncLogId: "clx..."
}
```

---

## 6. Service Layer Design

### 6.1 address-service.ts

```typescript
// Core operations
findById(id: string): Promise<Address | null>
findByAddress(address: string): Promise<Address | null>
search(query: string): Promise<Address[]>
list(filters: AddressFilters): Promise<PaginatedResult<Address>>
upsertFromExternal(data: ExternalAddressData): Promise<Address>
updateStatus(id: string, status: AddressStatus, verifiedBy: string): Promise<Address>
getDapps(filters: DappFilters): Promise<PaginatedResult<Address>>
```

### 6.2 report-service.ts

```typescript
// Report operations
create(data: CreateReportDTO): Promise<Report>
list(filters: ReportFilters): Promise<PaginatedResult<Report>>
vote(reportId: string, vote: VoteType, voterAddress: string): Promise<Report>
checkThreshold(reportId: string): Promise<ReportStatus>
resolve(reportId: string): Promise<Report>
getByAddress(addressId: string): Promise<Report[]>
```

### 6.3 scanner-service.ts

```typescript
// Scanner operations
scanContract(address: string): Promise<ScanResult>
quickScan(address: string): Promise<QuickScanResult>
batchScan(addresses: string[]): Promise<ScanResult[]>
analyzeBytecode(bytecode: string): Promise<PatternMatch[]>
calculateRiskScore(patterns: PatternMatch[]): number
getSimilarContracts(bytecodeHash: string): Promise<Address[]>
```

**Pattern detection rules:**
```typescript
const SCAM_PATTERNS = [
  {
    name: "Hidden TransferFrom",
    opcode: "0x65", // transferFrom without parameter check
    riskAdd: 30,
    severity: "HIGH"
  },
  {
    name: "Unlimited Approve",
    selector: "0x095ea7b3", // approve(address,uint256) with max uint256
    riskAdd: 25,
    severity: "HIGH"
  },
  {
    name: "Upgradeable Proxy",
    pattern: "ERC1967Proxy",
    riskAdd: 15,
    severity: "MEDIUM"
  },
  {
    name: "Self Destruct",
    opcode: "0xff",
    riskAdd: 40,
    severity: "CRITICAL"
  },
  {
    name: "Delegate Call",
    opcode: "0xf4",
    riskAdd: 15,
    severity: "MEDIUM"
  },
  {
    name: "Ownership Transfer",
    selector: "0xf2fde38b", // transferOwnership
    riskAdd: 10,
    severity: "LOW"
  },
  {
    name: "Unverified Source",
    check: "no source on BaseScan",
    riskAdd: 10,
    severity: "LOW"
  }
]
```

### 6.4 sync-service.ts

```typescript
// Sync operations
syncDefiLlama(): Promise<SyncResult>          // Pull all Base dApps
syncScamSniffer(): Promise<SyncResult>        // Git pull scam database
syncCryptoScamDB(): Promise<SyncResult>       // API pull phishing data
syncBaseRegistry(): Promise<SyncResult>       // Scrape official Base dApps
runAllSyncs(): Promise<SyncResult[]>           // Run all syncs
```

**DeFiLlama integration:**
```
GET https://api.llama.fi/protocols
→ filter chain === "Base"
→ upsert each protocol as Address (status: UNKNOWN or LEGIT)
→ update TVL
```

**ScamSniffer integration:**
```
git pull https://github.com/scamsniffer/scam-database
→ parse JSON files
→ upsert each address as Address (status: SCAM, category: PHISHING)
```

---

## 7. NPM Packages

### 7.1 Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    // Database
    "@prisma/client": "^5.14.0",
    
    // Web3
    "viem": "^2.13.0",
    "@wagmi/core": "^2.11.0",
    "wagmi": "^2.9.0",
    "@tanstack/react-query": "^5.40.0",
    "connectkit": "^1.7.0",
    
    // UI
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-badge": "^1.0.0",
    "lucide-react": "^0.380.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "recharts": "^2.12.0",
    
    // Utils
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    // Database
    "prisma": "^5.14.0",
    
    // TypeScript
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.12.0",
    
    // Linting
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    
    // Tailwind
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    // Testing
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0"
  }
}
```

### 7.2 Package Purpose

| Package | Purpose |
|---------|---------|
| next | Full-stack framework (App Router + API Routes) |
| prisma | ORM untuk PostgreSQL |
| viem | Web3 client (read/write contract, bytecode analysis) |
| wagmi | React hooks untuk wallet connection + contract interaction |
| connectkit | Wallet connect UI (MetaMask, WalletConnect, etc) |
| @tanstack/react-query | Data fetching + caching |
| zod | Request/response validation |
| recharts | Dashboard charts & stats |
| lucide-react | Icon library |
| radix-ui | Headless UI components (modals, dropdowns) |
| class-variance-authority | Component variant styling |
| date-fns | Date formatting |
| vitest | Testing framework |

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/wallo?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/wallo"

# Blockchain
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL="https://sepolia.base.org"
NEXT_PUBLIC_BASESCAN_URL="https://sepolia.basescan.org"

# Smart Contracts (after deploy)
NEXT_PUBLIC_ADDRESS_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_COMMUNITY_REPORT_ADDRESS="0x..."
NEXT_PUBLIC_TRANSACTION_GUARD_ADDRESS="0x..."

# Backend wallet (for server-side contract writes)
WALLET_PRIVATE_KEY="0x..."

# External APIs
DEFILLAMA_API_URL="https://api.llama.fi"
SCAMSNIFFER_REPO_URL="https://github.com/scamsniffer/scam-database"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="secret-for-sync-endpoint"
```

---

## 9. Smart Contract ↔ Backend Integration

### 9.1 Viem Client Setup

```typescript
// lib/viem.ts
import { createPublicClient, createWalletClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL!),
})

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL!),
  account: process.env.WALLET_PRIVATE_KEY as `0x${string}`,
})
```

### 9.2 Contract Interactions

```typescript
// Server-side reads
const status = await publicClient.readContract({
  address: ADDRESS_REGISTRY,
  abi: AddressRegistryABI,
  functionName: 'getStatus',
  args: [targetAddress],
})

// Server-side writes (report verification, etc)
const hash = await walletClient.writeContract({
  address: COMMUNITY_REPORT,
  abi: CommunityReportABI,
  functionName: 'verifyReport',
  args: [reportId, true],
})

// Get bytecode for scanning
const bytecode = await publicClient.getCode({
  address: targetAddress,
})
```

---

## 10. Deployment

### 10.1 Vercel (Recommended)

```
Vercel
├── Next.js App (auto-deploy from GitHub)
├── API Routes → Serverless Functions
├── Prisma → PostgreSQL (Supabase)
└── Cron Jobs → /api/v1/sync (daily)
```

### 10.2 Database (Supabase)

- Free tier: 500MB, 2 projects
- Connection pooling via pgbouncer
- Direct connection for migrations

### 10.3 Cron Jobs

```typescript
// next.config.ts - Vercel cron
{
  crons: [
    {
      path: "/api/v1/sync",
      schedule: "0 6 * * *"   // Daily at 6AM UTC
    }
  ]
}
```

Or via external cron (if not Vercel):
```
0 6 * * * curl -X POST https://wallo.app/api/v1/sync -H "Authorization: Bearer $CRON_SECRET" -d '{"source":"defillama"}'
```

---

## 11. Security Considerations

- **Rate limiting**: Upstash Redis or Vercel KV for API rate limits
- **Input validation**: Zod schemas on all API routes
- **Wallet key**: Never exposed to client, server-side only
- **CORS**: Whitelist extension ID + dashboard domain
- **SQL injection**: Prisma parameterized queries (safe by default)
- **XSS**: Next.js auto-escapes, but sanitize user-submitted content
