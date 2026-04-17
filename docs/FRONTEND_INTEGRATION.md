# Frontend Integration Guide

**Version:** 1.1  
**Date:** 2026-04-17  
**API Version:** v1

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Code Examples](#code-examples)
5. [TypeScript Types](#typescript-types)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Base URL

**Development:** `http://localhost:3000`  
**Production:** `https://your-api.vercel.app`

### API Prefix

All endpoints are under `/api/v1/`:

```
http://localhost:3000/api/v1/health
http://localhost:3000/api/v1/stats
http://localhost:3000/api/v1/address/0x...
```

---

## 📡 API Endpoints

### Health Check

```typescript
GET /api/health
```

**Response:**
```typescript
{
  success: true,
  data: {
    status: "healthy",
    timestamp: "2026-04-17T10:00:00Z",
    services: {
      database: "connected",
      api: "operational"
    },
    version: "1.0.0"
  }
}
```

### Statistics

```typescript
GET /api/v1/stats
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalAddresses: 503,
    legitCount: 2,
    scamCount: 500,
    suspiciousCount: 1,
    unknownCount: 0,
    totalReports: 2,
    verifiedReports: 0,
    pendingReports: 2,
    topCategories: [
      { category: "PHISHING", count: 499 },
      { category: "DEX", count: 1 }
    ],
    recentScams: ["0x...", "0x..."],
    scansToday: 10
  }
}
```

### Address Lookup

```typescript
GET /api/v1/address/[address]
```

**Parameters:**
- `address` (path) - Ethereum address (0x...)

**Response:**
```typescript
{
  success: true,
  data: {
    address: "0x4200000000000000000000000000000000006",
    name: "WETH",
    status: "LEGIT",
    riskScore: 5,
    category: "TOKEN_20",
    description: null,
    url: null,
    logoUrl: null,
    tvl: null,
    verifiedBy: null,
    verifiedAt: null,
    tags: ["verified", "defi"],
    reportCount: 0,
    lastScanned: "2026-04-17T10:00:00Z",
    createdAt: "2026-04-17T10:00:00Z",
    updatedAt: "2026-04-17T10:00:00Z"
  }
}
```

### Contract Scan

```typescript
GET /api/v1/scan/[address]
```

**Parameters:**
- `address` (path) - Contract address to scan

**Response:**
```typescript
{
  success: true,
  data: {
    address: "0x4200000000000000000000000000000000006",
    riskScore: 100,
    riskLevel: "CRITICAL",
    isVerified: false,
    patterns: [
      {
        name: "Self-Destruct Capability",
        severity: "CRITICAL",
        description: "Contract contains self-destruct opcode"
      },
      {
        name: "Delegate Call",
        severity: "MEDIUM",
        description: "Contract uses delegatecall"
      }
    ],
    similarScams: [
      {
        address: "0xdeadbeef...",
        name: "Fake Airdrop Drainer",
        similarity: 0.85
      }
    ],
    reportCount: 0,
    scanDuration: 3290,
    scannedAt: "2026-04-17T10:00:00Z"
  }
}
```

### Check Domain

```typescript
GET /api/v1/check-domain?domain=example.com
```

**Query Parameters:**
- `domain` (required) - Domain to check

**Response:**
```typescript
{
  success: true,
  data: {
    domain: "example.com",
    isScam: false,
    riskScore: 0,
    category: "UNKNOWN",
    checkedAt: "2026-04-17T10:00:00Z"
  }
}
```

### Scam Domains List

```typescript
GET /api/v1/scam-domains?page=1&limit=20
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)
- `search` (optional) - Search by domain name
- `status` (optional) - Filter by status

**Response:**
```typescript
{
  success: true,
  data: {
    data: [
      {
        domain: "phishing-site.scam",
        name: "phishing-site.scam",
        category: "PHISHING",
        riskScore: 90,
        status: "ACTIVE",
        source: "scamsniffer",
        createdAt: "2026-04-17T10:00:00Z"
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1522,
      totalPages: 77
    }
  }
}
```

### Search

```typescript
GET /api/v1/search?q=uniswap&limit=20
```

**Query Parameters:**
- `q` (required) - Search query
- `limit` (optional) - Max results (default: 20)

**Response:**
```typescript
{
  success: true,
  "data": [
    {
      address: "0x...",
      name: "Uniswap",
      status: "LEGIT",
      riskScore: 5,
      category: "DEX"
    }
  ],
  "meta": {
    "meta": {
      "query": "uniswap",
      "count": 1,
      "type": "all"
    }
  }
}
```

### Reports

```typescript
GET /api/v1/reports?page=1&limit=20
```

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `status` (optional) - Filter by status (PENDING, VERIFIED, REJECTED)

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: "cmo2ke24x000sqzku8f5ezq26",
      addressId: "cmo2kdtf20003qzku7equdbqt",
      reporterAddress: "0x2222222222222222222222222222222222222",
      reason: "Imposter token pretending to be legitimate",
      evidenceUrl: null,
      category: "IMPOSTER",
      status: "PENDING",
      votesFor: 0,
      votesAgainst: 0,
      txHash: null,
      resolvedAt: null,
      createdAt: "2026-04-17T10:00:00Z",
      address: {
        address: "0xcafebabecafebabecafebabecafebabecafebabe",
        name: "Phishing Site Contract",
        status: "SCAM",
        category: "PHISHING"
      }
    }
  ],
  "meta": {
    "meta": {
      "pagination": {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      }
    }
  }
}
```

### Submit Report

```typescript
POST /api/v1/report
Content-Type: application/json
```

**Request Body:**
```typescript
{
  address: "0x5678...efgh",
  reason: "Token drainer, stolen funds",
  category: "DRAINER",
  evidenceUrl: "https://basescan.org/tx/0x...",
  reporterAddress: "0xuser..."
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "cmo2ke24x000sqzku8f5ezq26",
    status: "PENDING",
    message: "Report submitted successfully"
  }
}
```

### Vote on Report

```typescript
POST /api/v1/reports/[id]/vote
Content-Type: application/json
```

**Request Body:**
```typescript
{
  vote: "FOR",
  voterAddress: "0xuser..."
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    reportId: "cmo2ke24x000sqzku8f5ezq26",
    votesFor: 1,
    votesAgainst: 0,
    status: "PENDING"
  }
}
```

### Leaderboard

```typescript
GET /api/v1/leaderboard?period=all&page=1&limit=50
```

**Query Parameters:**
- `period` (optional) - all | week | month
- `category` (optional) - Filter by category
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```typescript
{
  success: true,
  data: [
    {
      address: "0x1111111111111111111111111111111111111",
      ens: "alice.eth",
      reputation: 10,
      rank: 1,
      stats: {
        reportsSubmitted: 0,
        accurateVotes: 0,
        totalVotes: 0,
        accuracy: 0
      }
    }
  ],
  "meta": {
    "meta": {
      "pagination": {
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1
      },
      "filters": {
        period: "all",
        category: "all"
      }
    }
  }
}
```

### dApps Directory

```typescript
GET /api/v1/dapps?page=1&limit=20&sortBy=tvl&sortOrder=desc
```

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `sortBy` (optional) - tvl | name | createdAt
- `sortOrder` (optional) - asc | desc
- `verifiedOnly` (optional) - Show only verified dApps
- `list` (optional) - popular | trending (special lists)

**Response:**
```typescript
{
  success: true,
  data: [],
  "meta": {
    "meta": {
      "pagination": {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      "filters": {
        "sortBy": "tvl",
        "sortOrder": "desc",
        "verifiedOnly": false
      }
    }
  }
}
```

### Address Tags

```typescript
GET /api/v1/address-tags?address=0x...&tag=suspicious&page=1&limit=20
```

**Query Parameters:**
- `address` (optional) - Filter by address
- `tag` (optional) - Search by tag name
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Response:**
```typescript
{
  success: true,
  data: {
    data: [
      {
        id: "cmo33gute000214cxnbeelu2c",
        tag: "suspicious",
        taggedBy: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
        createdAt: "2026-04-17T16:00:09.984Z",
        address: {
          address: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
          name: null,
          status: "UNKNOWN",
          riskScore: 0
        }
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    }
  }
}
```

### Get Tags for Address

```typescript
GET /api/v1/address/[address]/tags
```

**Response:**
```typescript
{
  success: true,
  data: {
    data: [
      {
        tag: "suspicious",
        taggedBy: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
        createdAt: "2026-04-17T16:00:09.984Z"
      }
    ],
    address: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
    count: 1
  }
}
```

### Create Address Tag

```typescript
POST /api/v1/address-tags
Content-Type: application/json
```

**Request Body:**
```typescript
{
  address: "0x5678...efgh",
  tag: "suspicious",
  taggedBy: "0xuser..."
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "cmo33gute000214cxnbeelu2c",
    tag: "suspicious",
    taggedBy: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
    createdAt: "2026-04-17T16:00:09.984Z"
  },
  meta: {
    message: "Tag created successfully"
  }
}
```

### Delete Address Tag

```typescript
DELETE /api/v1/address/[address]/tags?tag=suspicious
```

**Query Parameters:**
- `tag` (required) - Tag to delete

**Response:**
```typescript
{
  success: true,
  data: {
    message: "Tag deleted successfully",
    address: "0xd2818dcc8fc9555b20777722e315592fe799e6cc",
    tag: "suspicious"
  }
}
```

---

## 🔐 Authentication

Most endpoints are **public** and don't require authentication.

**Protected Endpoints:**
- `POST /api/v1/sync` - Requires `Authorization: Bearer {CRON_SECRET}` header

---

## 💻 Code Examples

### React / Next.js

#### Fetch Wrapper

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  return data as ApiResponse<T>;
}
```

#### Address Lookup Component

```typescript
// components/AddressChecker.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface AddressData {
  address: string;
  name: string | null;
  status: 'LEGIT' | 'SCAM' | 'SUSPICIOUS' | 'UNKNOWN';
  riskScore: number;
  category: string;
  tags: string[];
}

export function AddressChecker({ address }: { address: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AddressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAddress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall<{ data: AddressData }>(
        `/api/v1/address/${address}`
      );

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Failed to check address');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkAddress} disabled={loading}>
        {loading ? 'Checking...' : 'Check Address'}
      </button>

      {data && (
        <div className={`p-4 rounded ${
          data.status === 'SCAM' ? 'bg-red-100' :
          data.status === 'LEGIT' ? 'bg-green-100' :
          'bg-yellow-100'
        }`}>
          <h3>{data.name || data.address}</h3>
          <p>Status: {data.status}</p>
          <p>Risk Score: {data.riskScore}/100</p>
          <p>Category: {data.category}</p>
          {data.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {data.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-200 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

#### Domain Checker Component

```typescript
// components/DomainChecker.tsx
'use client';

import { useState } from 'react';
import { apiCall } from '@/lib/api';

export function DomainChecker() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDomain = async () => {
    if (!domain) return;

    setLoading(true);
    try {
      const response = await apiCall<{ data: { isScam: boolean; riskScore: number } }>(
        `/api/v1/check-domain?domain=${encodeURIComponent(domain)}`
      );

      if (response.success) {
        setResult(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter domain (e.g., metamask.io)"
        className="border p-2 rounded"
      />
      <button
        onClick={checkDomain}
        disabled={loading}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Checking...' : 'Check Domain'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${
          result.isScam ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {result.isScam ? (
            <p>⚠️ This domain is flagged as a SCAM!</p>
          ) : (
            <p>✅ This domain appears safe</p>
          )}
          <p>Risk Score: {result.riskScore}/100</p>
        </div>
      )}
    </div>
  );
}
```

#### Address Tags Component

```typescript
// components/AddressTags.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface AddressTag {
  id: string;
  tag: string;
  taggedBy: string;
  createdAt: string;
}

interface AddressTagsProps {
  address: string;
}

export function AddressTags({ address }: AddressTagsProps) {
  const [tags, setTags] = useState<AddressTag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    const response = await apiCall<{ data: { data: AddressTag[] } }>(
      `/api/v1/address/${address}/tags`
    );
    if (response.success) {
      setTags(response.data.data);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    setLoading(true);
    try {
      const response = await apiCall<{ data: AddressTag }>(
        '/api/v1/address-tags',
        {
          method: 'POST',
          body: JSON.stringify({
            address,
            tag: newTag.trim(),
            taggedBy: '0xuser...', // User's wallet address
          }),
        }
      );

      if (response.success) {
        setTags([...tags, response.data]);
        setNewTag('');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tag: string) => {
    await fetch(`/api/v1/address/${address}/tags?tag=${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    });
    setTags(tags.filter((t) => t.tag !== tag));
  };

  useEffect(() => {
    fetchTags();
  }, [address]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Address Tags</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="border p-2 rounded flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <button
            onClick={addTag}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Tag'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
            >
              {tag.tag}
              <button
                onClick={() => deleteTag(tag.tag)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <p className="text-gray-500 text-sm">No tags yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### Stats Widget

```typescript
// components/StatsWidget.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';

interface Stats {
  totalAddresses: number;
  scamCount: number;
  legitCount: number;
  totalReports: number;
}

export function StatsWidget() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await apiCall<{ data: Stats }>(
        '/api/v1/stats'
      );
      if (response.success) {
        setStats(response.data);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-600">Total Addresses</p>
        <p className="text-2xl font-bold">{stats.totalAddresses}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-600">Scams Detected</p>
        <p className="text-2xl font-bold text-red-600">{stats.scamCount}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-600">Legitimate</p>
        <p className="text-2xl font-bold text-green-600">{stats.legitCount}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-600">Reports</p>
        <p className="text-2xl font-bold">{stats.totalReports}</p>
      </div>
    </div>
  );
}
```

### Vue 3 / Nuxt

```vue
<!-- composables/useApi.ts -->
<script setup lang="ts">
const API_BASE_URL = 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export function useApi() {
  const apiCall = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    return await response.json();
  };

  return { apiCall };
}
```

```vue
<!-- components/AddressScanner.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

const address = ref('');
const result = ref(null);
const loading = ref(false);

const { apiCall } = useApi();

const scanAddress = async () => {
  if (!address.value) return;

  loading.value = true;
  try {
    const response = await apiCall(`/api/v1/scan/${address.value}`);
    if (response.success) {
      result.value = response.data;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <input 
      v-model="address" 
      placeholder="Enter contract address"
      class="border p-2 rounded"
    />
    <button 
      @click="scanAddress" 
      :disabled="loading"
      class="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      {{ loading ? 'Scanning...' : 'Scan' }}
    </button>

    <div v-if="result" class="mt-4 p-4 border rounded">
      <div class="flex justify-between">
        <span>Risk Score:</span>
        <span :class="result.riskScore > 70 ? 'text-red-600' : 'text-green-600'">
          {{ result.riskScore }}/100
        </span>
      </div>
      <div>Risk Level: {{ result.riskLevel }}</div>
      
      <div v-if="result.patterns?.length" class="mt-4">
        <h4 class="font-bold">Detected Patterns:</h4>
        <ul class="list-disc list-inside">
          <li v-for="pattern in result.patterns" :key="pattern.name">
            <span :class="{
              'text-red-600': pattern.severity === 'CRITICAL',
              'text-orange-600': pattern.severity === 'HIGH',
              'text-yellow-600': pattern.severity === 'MEDIUM'
            }">
              {{ pattern.name }} ({{ pattern.severity }})
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
```

---

## 📝 TypeScript Types

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Address Types
export type AddressStatus = 'LEGIT' | 'SCAM' | 'SUSPICIOUS' | 'UNKNOWN';
export type AddressCategory = 
  | 'TOKEN_20' 
  | 'TOKEN_721' 
  | 'TOKEN_1155' 
  | 'BRIDGE' 
  | 'DEX' 
  | 'LENDING' 
  | 'STAKING' 
  | 'YIELD' 
  | 'GOVERNANCE' 
  | 'MULTISIG' 
  | 'AIRDROP' 
  | 'MINTER' 
  | 'DRAINER' 
  | 'PHISHING' 
  | 'IMPOSTER' 
  | 'ROUTER' 
  | 'VAULT' 
  | 'FACTORY' 
  | 'OTHER';

export interface Address {
  id: string;
  address: string;
  name: string | null;
  chain: string;
  status: AddressStatus;
  riskScore: number;
  category: AddressCategory;
  description: string | null;
  url: string | null;
  logoUrl: string | null;
  tvl: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  tags: string[];
  reportCount: number;
  lastScanned: string | null;
  createdAt: string;
  updatedAt: string;
}

// Scan Types
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScanPattern {
  name: string;
  severity: RiskLevel;
  description: string;
}

export interface ScanResult {
  address: string;
  riskScore: number;
  riskLevel: RiskLevel;
  isVerified: boolean;
  patterns: ScanPattern[];
  similarScams: SimilarScam[];
  reportCount: number;
  scanDuration: number;
  scannedAt: string;
}

export interface SimilarScam {
  address: string;
  name: string;
  similarity: number;
}

// Domain Types
export interface ScamDomain {
  domain: string;
  name: string;
  category: string;
  riskScore: number;
  status: string;
  source: string;
  createdAt: string;
}

// Report Types
export type ReportStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DISPUTED';

export interface Report {
  id: string;
  addressId: string;
  reporterAddress: string;
  reason: string;
  evidenceUrl: string | null;
  category: string;
  status: ReportStatus;
  votesFor: number;
  votesAgainst: number;
  txHash: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  address: {
    address: string;
    name: string | null;
    status: AddressStatus;
    category: string;
  };
}

// Stats Types
export interface Stats {
  totalAddresses: number;
  legitCount: number;
  scamCount: number;
  suspiciousCount: number;
  unknownCount: number;
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  recentScams: string[];
  scansToday: number;
  updatedAt: string;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Address Tags
export interface AddressTag {
  id: string;
  tag: string;
  taggedBy: string | null;
  createdAt: string;
}

export interface AddressTagWithAddress extends AddressTag {
  address: {
    address: string;
    name: string | null;
    status: AddressStatus;
    riskScore: number;
  };
}

export interface AddressTagsResponse {
  data: AddressTag[];
  address: string;
  count: number;
}
```

---

## ⚠️ Error Handling

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: "INVALID_ADDRESS",
    message: "Invalid Ethereum address format"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_ADDRESS` | Invalid Ethereum address format |
| `ADDRESS_NOT_FOUND` | Address not found in database |
| `NOT_FOUND` | Resource not found |
| `INVALID_REQUEST` | Invalid request parameters |
| `INTERNAL_ERROR` | Server error |
| `RATE_LIMITED` | Too many requests |

### Error Handling Example

```typescript
async function safeApiCall<T>(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    if (!data.success) {
      // Handle API error
      console.error('API Error:', data.error);
      return null;
    }

    return data.data as T;
  } catch (error) {
    // Handle network error
    console.error('Network error:', error);
    return null;
  }
}
```

---

## ✅ Best Practices

### 1. Loading States

Always show loading indicators during API calls:

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

### 2. Error Boundaries

Wrap components in error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <AddressChecker />
</ErrorBoundary>
```

### 3. Data Caching

Cache API responses to reduce load:

```typescript
const STALE_TIME = 60000; // 1 minute

const fetchWithCache = async (url: string) => {
  const cached = localStorage.getItem(url);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < STALE_TIME) {
      return data;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  localStorage.setItem(url, JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  return data;
};
```

### 4. Rate Limiting

Implement client-side rate limiting:

```typescript
const rateLimiter = new Map<string, number[]>();

const checkRateLimit = (key: string, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const requests = rateLimiter.get(key) || [];
  
  // Remove old requests outside window
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limited
  }
  
  validRequests.push(now);
  rateLimiter.set(key, validRequests);
  return true;
};
```

### 5. Input Validation

Validate user input before API calls:

```typescript
import { addressSchema } from '@/lib/validations';

const handleAddressCheck = (input: string) => {
  const result = addressSchema.safeParse(input);
  
  if (!result.success) {
    setError('Invalid address format');
    return;
  }
  
  // Proceed with API call
  checkAddress(result.data);
};
```

---

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Get stats
curl http://localhost:3000/api/v1/stats

# Check address
curl http://localhost:3000/api/v1/address/0x4200000000000000000000000000000000006

# Scan contract
curl http://localhost:3000/api/v1/scan/0x4200000000000000000000000000000000006

# Check domain
curl "http://localhost:3000/api/v1/check-domain?domain=metamask.io"

# Get scam domains
curl http://localhost:3000/api/v1/scam-domains?limit=10
```

---

## 📚 Additional Resources

- **Postman Collection:** `postman/Wallo-API-Collection.postman_collection.json`
- **Full API Documentation:** See all endpoints in PRD
- **Type Definitions:** `types/api.ts`

---

## 🆘 Support

For issues or questions:
1. Check the API health endpoint
2. Review error messages
3. Check console for network errors
4. Verify API URL configuration

**API Status:** http://localhost:3000/api/health
