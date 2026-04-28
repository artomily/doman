"use client";

import { useState } from "react";
import {
  Shield,
  Zap,
  Globe,
  FileText,
  Search,
  BarChart3,
  Users,
  RefreshCw,
  Heart,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Tag,
  Eye,
  ListOrdered,
  Star,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────── */
type Method = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

interface Param {
  name: string;
  in: "path" | "query" | "body";
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
}

interface Endpoint {
  method: Method;
  path: string;
  summary: string;
  description: string;
  params?: Param[];
  bodyExample?: string;
  responseExample: string;
  auth?: string;
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
}

/* ── Data ───────────────────────────────────────────────────── */
const BASE_URL = "https://domanprotocol.vercel.app";

const sections: Section[] = [
  {
    id: "health",
    label: "Health",
    icon: <Heart size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        summary: "Health Check",
        description:
          "Returns the operational status of the API, database connection, blockchain RPC, and external data providers.",
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              status: "healthy",
              database: { connected: true, latency: 12 },
              blockchain: { connected: true, blockNumber: 24567890 },
              externalApis: { defillama: true, scamsniffer: true },
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "scanner",
    label: "Scanner",
    icon: <Zap size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/scan/{input}",
        summary: "Scan Address / ENS / Domain",
        description:
          "Universal scanner that accepts an Ethereum address, ENS name, or domain. Detects scam patterns, calculates a 0–100 risk score, and returns matching pattern signatures.",
        params: [
          {
            name: "input",
            in: "path",
            type: "string",
            required: true,
            description:
              "0x address, ENS name (e.g. vitalik.eth), or domain (e.g. uniswap.org)",
          },
          {
            name: "checker",
            in: "query",
            type: "string",
            required: false,
            description: "Wallet address of the user running the scan",
          },
          {
            name: "chainId",
            in: "query",
            type: "number",
            required: false,
            description: "8453 (Base mainnet) or 84532 (Base Sepolia)",
            enum: ["8453", "84532"],
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              address: "0x4200000000000000000000000000000000000006",
              inputType: "address",
              riskScore: 12,
              riskLevel: "LOW",
              isVerified: true,
              isContract: false,
              patterns: [],
              similarScams: [],
              reportCount: 0,
              scanDuration: 240,
            },
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/scan-batch",
        summary: "Batch Scan",
        description:
          "Scan up to 25 addresses in a single request. Returns an array of scan results in the same order as the input.",
        params: [
          {
            name: "addresses",
            in: "body",
            type: "string[]",
            required: true,
            description: "Array of 0x Ethereum addresses (max 25)",
          },
        ],
        bodyExample: JSON.stringify(
          {
            addresses: [
              "0x4200000000000000000000000000000000000006",
              "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            ],
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              { address: "0x4200...", riskScore: 12, riskLevel: "LOW" },
              { address: "0x8335...", riskScore: 5, riskLevel: "LOW" },
            ],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "address",
    label: "Address",
    icon: <Shield size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/address/{address}",
        summary: "Get Address Details",
        description:
          "Fetch the full address record: risk score, category, tags, TVL (for dApps), verification status, and last scan metadata.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "0x Ethereum address",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              address: "0x4200000000000000000000000000000000000006",
              name: "WETH",
              chain: "base",
              status: "LEGIT",
              riskScore: 5,
              category: "DEFI",
              tags: ["defi", "weth"],
              tvl: 480000000,
              verifiedBy: "defillama",
              reportCount: 0,
              lastScanned: "2026-04-28T10:00:00Z",
            },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/address/{address}/tags",
        summary: "Get Address Tags",
        description: "List all community tags applied to an address.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "0x Ethereum address",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              address: "0x4200...",
              count: 2,
              data: [
                { tag: "defi", taggedBy: "0xabc...", createdAt: "2026-04-28" },
                { tag: "weth", taggedBy: "0xdef...", createdAt: "2026-04-27" },
              ],
            },
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/v1/address/{address}/tags",
        summary: "Delete Address Tag",
        description: "Remove a specific tag from an address.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "0x Ethereum address",
          },
          {
            name: "tag",
            in: "query",
            type: "string",
            required: true,
            description: "Tag string to remove",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              message: "Tag removed",
              address: "0x4200...",
              tag: "scam",
            },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/address/{address}/ens",
        summary: "Get Address ENS Records",
        description: "Retrieve all ENS names linked to an address, including primary name.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "0x Ethereum address",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
              primaryName: "vitalik.eth",
              records: [{ name: "vitalik.eth", resolvedAt: "2026-04-28T08:00:00Z" }],
              count: 1,
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "address-tags",
    label: "Address Tags",
    icon: <Tag size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/address-tags",
        summary: "List Address Tags",
        description:
          "Paginated list of all address tags across the platform, filterable by address, tag value, or tagger.",
        params: [
          {
            name: "address",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by target address",
          },
          {
            name: "tag",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by tag string",
          },
          {
            name: "taggedBy",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by tagger wallet address",
          },
          {
            name: "page",
            in: "query",
            type: "number",
            required: false,
            description: "Page number (default: 1)",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Results per page (default: 20)",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [{ address: "0x4200...", tag: "defi", taggedBy: "0xabc..." }],
            meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/address-tags",
        summary: "Create Address Tag (with reputation)",
        description:
          "Tag an address and earn +5 reputation points. Creates the address record if it doesn't exist. Tags are unique per address+tag pair.",
        params: [
          {
            name: "address",
            in: "body",
            type: "string",
            required: true,
            description: "Target address to tag",
          },
          {
            name: "tag",
            in: "body",
            type: "string",
            required: true,
            description: "Tag string (e.g. 'defi', 'scam')",
          },
          {
            name: "taggedBy",
            in: "body",
            type: "string",
            required: false,
            description: "Wallet address of the tagger",
          },
        ],
        bodyExample: JSON.stringify(
          { address: "0x4200...", tag: "defi", taggedBy: "0x742d..." },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              tag: { id: "clxxx", address: "0x4200...", tag: "defi" },
              userProfile: { address: "0x742d...", reputation: 55 },
            },
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/tags",
        summary: "Create Tag (simplified)",
        description:
          "Simple tag upsert with no reputation side-effects. Use for programmatic/admin tagging.",
        params: [
          {
            name: "address",
            in: "body",
            type: "string",
            required: true,
            description: "Target address",
          },
          {
            name: "tag",
            in: "body",
            type: "string",
            required: true,
            description: "Tag string",
          },
        ],
        bodyExample: JSON.stringify({ address: "0x4200...", tag: "defi" }, null, 2),
        responseExample: JSON.stringify(
          { success: true, data: { id: "clxxx", address: "0x4200...", tag: "defi" } },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "ens",
    label: "ENS",
    icon: <Globe size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/resolve/{ens}",
        summary: "Resolve ENS Name",
        description:
          "Resolve an ENS name (e.g. vitalik.eth) to its linked Ethereum address via ENS mainnet resolver.",
        params: [
          {
            name: "ens",
            in: "path",
            type: "string",
            required: true,
            description: "ENS name ending in .eth",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              ens: "vitalik.eth",
              address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
              resolvedAt: "2026-04-28T10:00:00Z",
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "domains",
    label: "Domain Check",
    icon: <Globe size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/check-domain",
        summary: "Check Domain",
        description:
          "Check if a domain is a known phishing or scam site. The input is normalized (protocol, www, and path are stripped before lookup).",
        params: [
          {
            name: "domain",
            in: "query",
            type: "string",
            required: true,
            description: "Domain to check, e.g. uniswap-airdrop.com",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              domain: "uniswap-airdrop.com",
              isScam: true,
              riskScore: 95,
              category: "PHISHING",
              description: "Fake Uniswap airdrop site",
              source: "scamsniffer",
              checkedAt: "2026-04-28T10:00:00Z",
            },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/scam-domains",
        summary: "List Scam Domains",
        description: "Browse the full paginated blacklist of known phishing domains.",
        params: [
          {
            name: "page",
            in: "query",
            type: "number",
            required: false,
            description: "Page number (default: 1)",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Results per page (default: 20)",
          },
          {
            name: "status",
            in: "query",
            type: "string",
            required: false,
            description: "ACTIVE | INACTIVE",
            enum: ["ACTIVE", "INACTIVE"],
          },
          {
            name: "search",
            in: "query",
            type: "string",
            required: false,
            description: "Search by domain name",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                domain: "uniswap-airdrop.com",
                status: "ACTIVE",
                category: "PHISHING",
                source: "scamsniffer",
              },
            ],
            meta: { pagination: { page: 1, limit: 20, total: 4821 } },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: <FileText size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/reports",
        summary: "List Reports",
        description: "Paginated list of community scam reports with optional filters.",
        params: [
          {
            name: "status",
            in: "query",
            type: "string",
            required: false,
            description: "PENDING | APPROVED | REJECTED",
            enum: ["PENDING", "APPROVED", "REJECTED"],
          },
          {
            name: "category",
            in: "query",
            type: "string",
            required: false,
            description: "SCAM | PHISHING | RUG_PULL | HONEYPOT | FAKE_TOKEN | OTHER",
          },
          {
            name: "address",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by reported address",
          },
          {
            name: "reporterAddress",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by reporter wallet",
          },
          { name: "page", in: "query", type: "number", required: false, description: "Page number" },
          { name: "limit", in: "query", type: "number", required: false, description: "Per page" },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                id: "clxxx",
                address: "0x4200...",
                reason: "Drains wallets via approvals",
                category: "SCAM",
                status: "PENDING",
                votesFor: 3,
                votesAgainst: 0,
                reporterAddress: "0x742d...",
                createdAt: "2026-04-28T09:00:00Z",
              },
            ],
            meta: { pagination: { page: 1, limit: 20, total: 54 } },
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/reports",
        summary: "Create Report",
        description:
          "Submit a new scam report. Optionally include an on-chain TX hash and structured reason data for multi-step form submissions.",
        params: [
          {
            name: "address",
            in: "body",
            type: "string",
            required: true,
            description: "Reported address",
          },
          {
            name: "reason",
            in: "body",
            type: "string",
            required: true,
            description: "Human-readable explanation",
          },
          {
            name: "category",
            in: "body",
            type: "string",
            required: true,
            description: "SCAM | PHISHING | RUG_PULL | HONEYPOT | FAKE_TOKEN | OTHER",
            enum: ["SCAM", "PHISHING", "RUG_PULL", "HONEYPOT", "FAKE_TOKEN", "OTHER"],
          },
          {
            name: "reporterAddress",
            in: "body",
            type: "string",
            required: true,
            description: "Reporter wallet address",
          },
          {
            name: "evidenceUrl",
            in: "body",
            type: "string",
            required: false,
            description: "Link to supporting evidence",
          },
          {
            name: "reasonHash",
            in: "body",
            type: "string",
            required: false,
            description: "keccak256 hash of reason (for on-chain reference)",
          },
          {
            name: "reasonData",
            in: "body",
            type: "object",
            required: false,
            description: "{ selectedReasons: string[], customText: string }",
          },
        ],
        bodyExample: JSON.stringify(
          {
            address: "0x4200000000000000000000000000000000000006",
            reason: "Suspicious token approval patterns detected",
            category: "SCAM",
            reporterAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            evidenceUrl: "https://etherscan.io/tx/0x...",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            data: { id: "clxxx", status: "PENDING", message: "Report submitted" },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/reports/{id}",
        summary: "Get Report",
        description: "Fetch a single report by its ID.",
        params: [
          {
            name: "id",
            in: "path",
            type: "string",
            required: true,
            description: "Report ID (cuid)",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              id: "clxxx",
              address: "0x4200...",
              reason: "Drains wallets",
              category: "SCAM",
              status: "PENDING",
              votesFor: 2,
              votesAgainst: 0,
            },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/reports/vote-status",
        summary: "Check Vote Status",
        description:
          "Check whether a user has already voted on any report for a given address, and which way they voted.",
        params: [
          {
            name: "address",
            in: "query",
            type: "string",
            required: true,
            description: "The reported address",
          },
          {
            name: "voterAddress",
            in: "query",
            type: "string",
            required: true,
            description: "Voter wallet address",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: { hasVoted: true, voteType: "FOR", reportId: "clxxx" },
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/reports/{id}/vote",
        summary: "Vote on Report",
        description:
          "Cast a FOR or AGAINST vote on a report. Each voter can vote once per report. Optionally attach an on-chain TX hash.",
        params: [
          {
            name: "id",
            in: "path",
            type: "string",
            required: true,
            description: "Report ID",
          },
          {
            name: "vote",
            in: "body",
            type: "string",
            required: true,
            description: "FOR | AGAINST",
            enum: ["FOR", "AGAINST"],
          },
          {
            name: "voterAddress",
            in: "body",
            type: "string",
            required: true,
            description: "Voter wallet address",
          },
          {
            name: "txHash",
            in: "body",
            type: "string",
            required: false,
            description: "On-chain transaction hash",
          },
        ],
        bodyExample: JSON.stringify(
          { vote: "FOR", voterAddress: "0x742d..." },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            data: { reportId: "clxxx", votesFor: 3, votesAgainst: 0, status: "PENDING" },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: <Eye size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/watchlist",
        summary: "Get Watchlist",
        description:
          "Get all addresses a user is monitoring, including current and previous risk scores and the last checked timestamp.",
        params: [
          {
            name: "userAddress",
            in: "query",
            type: "string",
            required: true,
            description: "Wallet address of the user",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                watchedAddress: "0x4200...",
                riskScore: 12,
                previousRiskScore: 10,
                lastChecked: "2026-04-28T08:00:00Z",
              },
            ],
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/api/v1/watchlist",
        summary: "Add to Watchlist",
        description: "Add an address to a user's watchlist.",
        params: [
          {
            name: "userAddress",
            in: "body",
            type: "string",
            required: true,
            description: "Wallet address of the user",
          },
          {
            name: "watchedAddress",
            in: "body",
            type: "string",
            required: true,
            description: "Address to watch",
          },
        ],
        bodyExample: JSON.stringify(
          { userAddress: "0x742d...", watchedAddress: "0x4200..." },
          null,
          2
        ),
        responseExample: JSON.stringify(
          { success: true, data: { id: "clxxx", watchedAddress: "0x4200..." } },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/api/v1/watchlist/{address}",
        summary: "Remove from Watchlist",
        description: "Remove an address from the user's watchlist.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "Address to unwatch",
          },
          {
            name: "userAddress",
            in: "query",
            type: "string",
            required: true,
            description: "Wallet address of the user",
          },
        ],
        responseExample: JSON.stringify(
          { success: true, data: { deleted: true } },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "dapps",
    label: "dApps",
    icon: <Star size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/dapps",
        summary: "List dApps",
        description:
          "Browse the verified dApp directory. Use list=popular or list=trending for curated views.",
        params: [
          {
            name: "page",
            in: "query",
            type: "number",
            required: false,
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Per page",
          },
          {
            name: "sortBy",
            in: "query",
            type: "string",
            required: false,
            description: "tvl | name | riskScore",
            enum: ["tvl", "name", "riskScore"],
          },
          {
            name: "sortOrder",
            in: "query",
            type: "string",
            required: false,
            description: "asc | desc",
            enum: ["asc", "desc"],
          },
          {
            name: "status",
            in: "query",
            type: "string",
            required: false,
            description: "LEGIT | SUSPICIOUS | SCAM",
          },
          {
            name: "category",
            in: "query",
            type: "string",
            required: false,
            description: "DEFI | NFT | BRIDGE | DEX | LENDING | OTHER",
          },
          {
            name: "search",
            in: "query",
            type: "string",
            required: false,
            description: "Search by name",
          },
          {
            name: "list",
            in: "query",
            type: "string",
            required: false,
            description: "popular | trending",
            enum: ["popular", "trending"],
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                address: "0x4200...",
                name: "Uniswap v3",
                category: "DEX",
                tvl: 180000000,
                status: "LEGIT",
                riskScore: 5,
              },
            ],
            meta: { pagination: { page: 1, limit: 20, total: 180 } },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "search",
    label: "Search",
    icon: <Search size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/search",
        summary: "Search Addresses",
        description: "Full-text search over address names and hex strings.",
        params: [
          {
            name: "q",
            in: "query",
            type: "string",
            required: true,
            description: "Search query (name or partial address)",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Max results (default: 20)",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [{ address: "0x4200...", name: "Uniswap v3", riskScore: 5 }],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: <Users size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/leaderboard",
        summary: "Get Leaderboard",
        description: "Community reputation rankings, filterable by period and contribution type.",
        params: [
          {
            name: "period",
            in: "query",
            type: "string",
            required: false,
            description: "all | week | month",
            enum: ["all", "week", "month"],
          },
          {
            name: "category",
            in: "query",
            type: "string",
            required: false,
            description: "all | reporters | voters",
            enum: ["all", "reporters", "voters"],
          },
          {
            name: "page",
            in: "query",
            type: "number",
            required: false,
            description: "Page",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Per page (max 100)",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              { rank: 1, address: "0x742d...", reputation: 340, reports: 12, votes: 68 },
            ],
            meta: { pagination: { page: 1, limit: 50, total: 200 } },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/api/v1/leaderboard/{address}",
        summary: "Get User Profile",
        description: "Detailed reputation profile for a specific wallet address.",
        params: [
          {
            name: "address",
            in: "path",
            type: "string",
            required: true,
            description: "Wallet address",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              address: "0x742d...",
              rank: 1,
              reputation: 340,
              reports: 12,
              votes: 68,
              tags: 4,
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "history",
    label: "History",
    icon: <ListOrdered size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/history",
        summary: "Get Scan History",
        description:
          "Most recent contract scans, optionally filtered by the checker's wallet address.",
        params: [
          {
            name: "checker",
            in: "query",
            type: "string",
            required: false,
            description: "Filter by checker wallet address",
          },
          {
            name: "limit",
            in: "query",
            type: "number",
            required: false,
            description: "Max results (default: 50)",
          },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                id: "clxxx",
                address: "0x4200...",
                riskScore: 12,
                riskLevel: "LOW",
                scannedAt: "2026-04-28T09:30:00Z",
              },
            ],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "stats",
    label: "Stats",
    icon: <BarChart3 size={14} />,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stats",
        summary: "Platform Stats",
        description: "Aggregate platform-wide statistics including address counts and scan activity.",
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              totalAddresses: 24810,
              legitCount: 18200,
              scamCount: 4100,
              suspiciousCount: 1200,
              unknownCount: 1310,
              totalReports: 3420,
              verifiedReports: 2100,
              pendingReports: 320,
              scansToday: 4802,
              topCategories: [{ category: "DEFI", count: 8400 }],
              updatedAt: "2026-04-28T10:00:00Z",
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "sync",
    label: "Sync",
    icon: <RefreshCw size={14} />,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/sync",
        summary: "Sync External Sources",
        description:
          "Trigger data sync from external sources. Protected by CRON_SECRET. Supports individual sources or 'all'.",
        auth: "Bearer {CRON_SECRET}",
        params: [
          {
            name: "source",
            in: "body",
            type: "string",
            required: true,
            description: "defillama | scamsniffer | cryptoscamdb | base | all",
            enum: ["defillama", "scamsniffer", "cryptoscamdb", "base", "all"],
          },
        ],
        bodyExample: JSON.stringify({ source: "all" }, null, 2),
        responseExample: JSON.stringify(
          {
            success: true,
            data: {
              source: "all",
              recordsAdded: 120,
              recordsUpdated: 45,
              syncLogId: "clxxx",
              duration: 3400,
            },
          },
          null,
          2
        ),
      },
    ],
  },
];

/* ── Error codes ────────────────────────────────────────────── */
const errorCodes = [
  { code: "INTERNAL_ERROR", status: 500, description: "Server error" },
  { code: "INVALID_REQUEST", status: 400, description: "Validation failed" },
  { code: "NOT_FOUND", status: 404, description: "Resource not found" },
  { code: "UNAUTHORIZED", status: 401, description: "Auth required" },
  { code: "FORBIDDEN", status: 403, description: "Insufficient permissions" },
  { code: "RATE_LIMITED", status: 429, description: "Too many requests" },
  { code: "INVALID_ADDRESS", status: 400, description: "Bad address format" },
  { code: "ADDRESS_NOT_FOUND", status: 404, description: "Address not in database" },
  { code: "REPORT_NOT_FOUND", status: 404, description: "Report ID not found" },
  { code: "REPORT_ALREADY_VOTED", status: 400, description: "User already voted" },
  { code: "INSUFFICIENT_REPUTATION", status: 403, description: "Need more reputation" },
  { code: "SCAN_TIMEOUT", status: 408, description: "Scan took too long" },
  { code: "SCAN_FAILED", status: 500, description: "Scanner error" },
  { code: "SYNC_FAILED", status: 500, description: "Sync error" },
  { code: "SYNC_IN_PROGRESS", status: 409, description: "Sync already running" },
];

/* ── Helpers ────────────────────────────────────────────────── */
const methodColors: Record<Method, string> = {
  GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  PATCH: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

const statusColors: Record<number, string> = {
  200: "text-emerald-400",
  400: "text-amber-400",
  401: "text-amber-400",
  403: "text-amber-400",
  404: "text-amber-400",
  408: "text-orange-400",
  409: "text-orange-400",
  429: "text-orange-400",
  500: "text-red-400",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Badge({ method }: { method: Method }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${methodColors[method]}`}
    >
      {method}
    </span>
  );
}

function ParamBadge({ param }: { param: Param }) {
  const inColors = {
    path: "bg-accent/10 text-accent",
    query: "bg-zinc-700/60 text-zinc-300",
    body: "bg-purple-400/10 text-purple-300",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${inColors[param.in]}`}>
      {param.in}
    </span>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg border border-card-border bg-[#080808] overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-4 py-2">
        <span className="text-xs text-muted">{label ?? "json"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-300 scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-card-border bg-card overflow-hidden transition-colors hover:border-zinc-700/80">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <Badge method={endpoint.method} />
        <code className="flex-1 text-sm text-foreground font-mono">{endpoint.path}</code>
        <span className="hidden sm:block text-xs text-muted">{endpoint.summary}</span>
        {open ? (
          <ChevronDown size={14} className="shrink-0 text-muted" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-muted" />
        )}
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-card-border px-5 py-5 space-y-6">
          {/* Description */}
          <p className="text-sm text-muted leading-relaxed">{endpoint.description}</p>

          {/* Auth */}
          {endpoint.auth && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3">
              <Shield size={13} className="text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">
                <span className="font-semibold">Authorization required —</span>{" "}
                <code className="font-mono">{endpoint.auth}</code>
              </p>
            </div>
          )}

          {/* Parameters */}
          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                Parameters
              </h4>
              <div className="overflow-x-auto rounded-lg border border-card-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-card-border bg-[#080808] text-left">
                      <th className="px-4 py-2.5 text-muted font-medium">Name</th>
                      <th className="px-4 py-2.5 text-muted font-medium">In</th>
                      <th className="px-4 py-2.5 text-muted font-medium">Type</th>
                      <th className="px-4 py-2.5 text-muted font-medium">Required</th>
                      <th className="px-4 py-2.5 text-muted font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((p) => (
                      <tr key={p.name} className="border-b border-card-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <code className="font-mono text-accent">{p.name}</code>
                        </td>
                        <td className="px-4 py-3">
                          <ParamBadge param={p} />
                        </td>
                        <td className="px-4 py-3 text-zinc-400 font-mono">{p.type}</td>
                        <td className="px-4 py-3">
                          {p.required ? (
                            <span className="text-red-400">yes</span>
                          ) : (
                            <span className="text-zinc-600">no</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {p.description}
                          {p.enum && (
                            <span className="ml-1 text-zinc-600">
                              ({p.enum.join(" | ")})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Body example */}
          {endpoint.bodyExample && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                Request Body
              </h4>
              <CodeBlock code={endpoint.bodyExample} label="application/json" />
            </div>
          )}

          {/* Response example */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
              Response (200)
            </h4>
            <CodeBlock code={endpoint.responseExample} label="application/json" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState("health");

  const current = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Top hero */}
      <div className="border-b border-card-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent">
            <BookOpen size={11} /> REST API Reference
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            DOMAN API <span className="text-accent">v1</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted leading-relaxed">
            Web3 Security & Decision Engine — Base Chain. All endpoints live under{" "}
            <code className="rounded bg-card-border px-1.5 py-0.5 font-mono text-xs text-foreground">
              {BASE_URL}/api/v1
            </code>
            .
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              { label: "Endpoints", value: sections.reduce((a, s) => a + s.endpoints.length, 0).toString() },
              { label: "Base chain", value: "8453" },
              { label: "Version", value: "1.0.0" },
              { label: "Format", value: "JSON" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 flex gap-8">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Endpoints
            </p>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <span className="shrink-0">{s.icon}</span>
                {s.label}
                <span className="ml-auto text-[10px] text-zinc-600">{s.endpoints.length}</span>
              </button>
            ))}

            <div className="my-4 border-t border-card-border" />

            <button
              onClick={() => setActiveSection("errors")}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeSection === "errors"
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground hover:bg-card"
              }`}
            >
              <Shield size={14} className="shrink-0" />
              Error Codes
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden w-full mb-6">
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  activeSection === s.id
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setActiveSection("errors")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                activeSection === "errors"
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-card-border text-muted hover:text-foreground"
              }`}
            >
              <Shield size={12} />
              Errors
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-8">
          {activeSection === "errors" ? (
            /* Error codes table */
            <div>
              <h2 className="text-xl font-bold mb-1">Error Codes</h2>
              <p className="text-sm text-muted mb-6">
                All errors follow the standard envelope with{" "}
                <code className="text-xs font-mono text-accent">success: false</code>.
              </p>

              {/* Error envelope example */}
              <CodeBlock
                label="Error envelope"
                code={JSON.stringify(
                  {
                    success: false,
                    error: {
                      code: "INVALID_ADDRESS",
                      message: "Invalid Ethereum address format",
                    },
                  },
                  null,
                  2
                )}
              />

              <div className="mt-6 overflow-x-auto rounded-xl border border-card-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-card-border bg-card text-left">
                      <th className="px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">
                        HTTP
                      </th>
                      <th className="px-5 py-3 text-xs text-muted font-medium uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorCodes.map((e) => (
                      <tr key={e.code} className="border-b border-card-border/50 last:border-0">
                        <td className="px-5 py-3">
                          <code className="font-mono text-xs text-accent">{e.code}</code>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-mono text-xs font-semibold ${statusColors[e.status] ?? "text-muted"}`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted text-xs">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Endpoint section */
            <div>
              {/* Section header */}
              <div className="mb-6 flex items-center gap-3">
                <span className="text-accent">{current.icon}</span>
                <h2 className="text-xl font-bold">{current.label}</h2>
                <span className="rounded-full border border-card-border px-2 py-0.5 text-xs text-muted">
                  {current.endpoints.length} endpoint{current.endpoints.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Response format callout (shown once in Health) */}
              {activeSection === "health" && (
                <div className="mb-6 rounded-xl border border-card-border bg-card/60 p-5 space-y-4">
                  <p className="text-sm font-semibold">Response Envelope</p>
                  <p className="text-xs text-muted">
                    Every response is wrapped in a standard envelope. Pagination metadata is
                    available in the <code className="font-mono text-accent">meta</code> field when
                    applicable.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <CodeBlock
                      label="Success"
                      code={JSON.stringify(
                        {
                          success: true,
                          data: {},
                          meta: {
                            pagination: { page: 1, limit: 20, total: 100, totalPages: 5 },
                            cached: false,
                          },
                        },
                        null,
                        2
                      )}
                    />
                    <CodeBlock
                      label="Error"
                      code={JSON.stringify(
                        {
                          success: false,
                          error: {
                            code: "INVALID_ADDRESS",
                            message: "Invalid Ethereum address format",
                          },
                        },
                        null,
                        2
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Endpoint cards */}
              <div className="space-y-3">
                {current.endpoints.map((ep) => (
                  <EndpointCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
