# Browser Extension Integration Guide

**Version:** 1.1  
**Date:** 2026-04-17  
**API Version:** v1  
**Manifest Version:** 3

---

## 📋 Table of Contents

1. [Extension Architecture](#extension-architecture)
2. [Manifest Setup](#manifest-setup)
3. [Permission Requirements](#permission-requirements)
4. [Component Structure](#component-structure)
5. [Content Scripts](#content-scripts)
6. [Background Service Worker](#background-service-worker)
7. [Popup UI](#popup-ui)
8. [Message Passing](#message-passing)
9. [Address Detection](#address-detection)
10. [Domain Checking](#domain-checking)
11. [Code Examples](#code-examples)
12. [TypeScript Types](#typescript-types)
13. [Best Practices](#best-practices)

---

## 🏗️ Extension Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Wallo Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Popup     │  │   Content   │  │  Background │          │
│  │   UI        │  │   Scripts   │  │  Worker     │          │
│  │             │  │             │  │             │          │
│  │ - Search    │  │ - Detect    │  │ - API Cache │          │
│  │ - Results   │  │   addresses │  │ - Storage   │          │
│  │ - Settings  │  │ - Inject    │  │ - Sync      │          │
│  └──────┬──────┘  │   warnings │  │ - Rate      │          │
│         │         └──────┬──────┘  │   Limit     │          │
│         │                │         └──────┬──────┘          │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          ▼                                   │
│                   ┌─────────────┐                            │
│                   │ Wallo API   │                            │
│                   │ /api/v1/*   │                            │
│                   └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Manifest Setup

### manifest.json (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "Wallo - Web3 Scam Detector",
  "version": "1.0.0",
  "description": "Protect yourself from Web3 scams on Base chain",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://*/*",
    "http://localhost:3000/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    },
    "default_title": "Wallo - Check this address"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["injected.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 🔐 Permission Requirements

| Permission | Purpose |
|------------|---------|
| `storage` | Cache API responses, user settings |
| `activeTab` | Detect addresses on current page |
| `scripting` | Inject warning banners dynamically |
| `host_permissions` | Access Wallo API, detect on all sites |

### Why These Permissions?

- **storage**: Store cached scam data locally for faster lookups
- **activeTab**: Read DOM to find Ethereum addresses on current page
- **scripting**: Inject warning UI when scam detected
- **host_permissions**: Check domains against scam database

---

## 📁 Component Structure

```
wallo-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── background.js
├── background.js.map
├── content.js
├── content.css
├── injected.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── utils/
│   ├── api.ts
│   ├── detector.ts
│   └── storage.ts
└── types/
    └── index.ts
```

---

## 📜 Content Scripts

Content scripts run in the context of web pages and can:

- Detect Ethereum addresses in the DOM
- Inject warning banners for scam addresses
- Highlight legitimate addresses
- Monitor for dynamically added content

### Content Script Template

```typescript
// content.ts
import { detectAddresses } from './utils/detector';
import { checkAddress } from './utils/api';
import { injectWarning } from './utils/ui';

// Configuration
const CHECK_INTERVAL = 2000; // Check every 2 seconds
const CACHE_DURATION = 60000; // Cache results for 1 minute

const addressCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

/**
 * Check if address is scam from cache
 */
function getCachedResult(address: string): any | null {
  const cached = addressCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

/**
 * Cache address check result
 */
function setCachedResult(address: string, data: any): void {
  addressCache.set(address, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Process detected addresses
 */
async function processAddresses(addresses: string[]): Promise<void> {
  for (const address of addresses) {
    // Check cache first
    const cached = getCachedResult(address);
    if (cached) {
      if (cached.isScam || cached.riskScore > 50) {
        injectWarning(address, cached);
      }
      continue;
    }

    // Check via API
    try {
      const result = await checkAddress(address);
      setCachedResult(address, result);

      if (result.isScam || result.riskScore > 50) {
        injectWarning(address, result);
      }
    } catch (error) {
      console.error(`Failed to check address ${address}:`, error);
    }
  }
}

/**
 * Initialize content script
 */
function init(): void {
  console.log('Wallo content script initialized');

  // Initial scan
  const addresses = detectAddresses();
  processAddresses(addresses);

  // Watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }

    if (shouldScan) {
      const addresses = detectAddresses();
      processAddresses(addresses);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Periodic scan
  setInterval(() => {
    const addresses = detectAddresses();
    processAddresses(addresses);
  }, CHECK_INTERVAL);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

## 🔄 Background Service Worker

The background service worker handles:

- API requests with caching
- Data synchronization
- Rate limiting
- Cross-tab communication

### Background Worker Template

```typescript
// background.ts
import { checkAddress, checkDomain } from './utils/api';

// Cache configuration
const CACHE_KEY = 'wallo_cache';
const CACHE_DURATION = 3600000; // 1 hour

// In-memory cache for faster access
let memoryCache = new Map<string, any>();

/**
 * Initialize cache from storage
 */
async function initCache(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(CACHE_KEY);
    if (result[CACHE_KEY]) {
      memoryCache = new Map(Object.entries(result[CACHE_KEY]));
    }
  } catch (error) {
    console.error('Failed to initialize cache:', error);
  }
}

/**
 * Save cache to storage
 */
async function saveCache(): Promise<void> {
  try {
    const cacheObj = Object.fromEntries(memoryCache);
    await chrome.storage.local.set({
      [CACHE_KEY]: cacheObj
    });
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
}

/**
 * Get cached value
 */
function getCached(key: string): any | null {
  const entry = memoryCache.get(key);
  if (entry) {
    const { data, timestamp } = entry;
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    memoryCache.delete(key);
  }
  return null;
}

/**
 * Set cached value
 */
function setCached(key: string, data: any): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  saveCache(); // Debounce in production
}

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, data } = message;

  switch (type) {
    case 'CHECK_ADDRESS':
      handleCheckAddress(data.address)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true; // Async response

    case 'CHECK_DOMAIN':
      handleCheckDomain(data.domain)
        .then(sendResponse)
        .catch(error => sendResponse({ error: error.message }));
      return true;

    case 'CLEAR_CACHE':
      memoryCache.clear();
      chrome.storage.local.remove(CACHE_KEY);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

/**
 * Handle address check with caching
 */
async function handleCheckAddress(address: string): Promise<any> {
  const cacheKey = `address_${address}`;

  // Check cache
  const cached = getCached(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // API call
  const result = await checkAddress(address);
  setCached(cacheKey, result);

  return { ...result, cached: false };
}

/**
 * Handle domain check with caching
 */
async function handleCheckDomain(domain: string): Promise<any> {
  const cacheKey = `domain_${domain}`;

  // Check cache
  const cached = getCached(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // API call
  const result = await checkDomain(domain);
  setCached(cacheKey, result);

  return { ...result, cached: false };
}

/**
 * Check current tab's domain on navigation
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;

      // Check domain in background
      handleCheckDomain(domain).then(result => {
        if (result.isScam || result.riskScore > 70) {
          // Send warning to content script
          chrome.tabs.sendMessage(tabId, {
            type: 'SCAM_DOMAIN_DETECTED',
            data: result
          });
        }
      });
    } catch (error) {
      // Invalid URL, ignore
    }
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Wallo extension installed');
  initCache();
});

// Initialize on startup
initCache();
```

---

## 🎨 Popup UI

The popup provides quick access to:

- Address checker
- Current page status
- Settings
- Statistics

### popup.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wallo - Web3 Scam Detector</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <img src="icons/icon48.png" alt="Wallo" class="logo">
      <h1>Wallo</h1>
    </header>

    <!-- Search Section -->
    <div class="search-section">
      <input
        type="text"
        id="addressInput"
        placeholder="Enter address or ENS..."
        class="search-input"
      />
      <button id="searchBtn" class="search-btn">
        <span class="btn-text">Check</span>
      </button>
    </div>

    <!-- Results Section -->
    <div id="results" class="results hidden">
      <!-- Dynamic content -->
    </div>

    <!-- Page Status -->
    <div class="page-status">
      <h3>Current Page</h3>
      <div id="pageStatus" class="status-loading">
        Checking...
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Scams Detected</span>
        <span id="scamCount" class="stat-value">-</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Addresses Checked</span>
        <span id="checkCount" class="stat-value">-</span>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <button id="settingsBtn" class="footer-btn">Settings</button>
      <button id="clearCacheBtn" class="footer-btn">Clear Cache</button>
    </footer>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

### popup.ts

```typescript
// popup.ts
const API_BASE = 'http://localhost:3000';

// DOM Elements
const addressInput = document.getElementById('addressInput') as HTMLInputElement;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;
const resultsDiv = document.getElementById('results') as HTMLDivElement;
const pageStatusDiv = document.getElementById('pageStatus') as HTMLDivElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;

/**
 * Check address via API
 */
async function checkAddress(address: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/address/${address}`);
  const data = await response.json();
  return data;
}

/**
 * Display scan results
 */
function displayResults(data: any): void {
  resultsDiv.classList.remove('hidden');

  const { address, name, status, riskScore, category } = data.data;

  const statusColor = status === 'SCAM' ? 'red' :
                      status === 'LEGIT' ? 'green' :
                      status === 'SUSPICIOUS' ? 'yellow' : 'gray';

  const riskLevel = riskScore > 70 ? 'HIGH' :
                    riskScore > 40 ? 'MEDIUM' : 'LOW';

  resultsDiv.innerHTML = `
    <div class="result-card status-${statusColor}">
      <div class="result-header">
        <h3>${name || address.slice(0, 10)}...</h3>
        <span class="status-badge status-${statusColor}">${status}</span>
      </div>

      <div class="result-body">
        <div class="result-row">
          <span>Risk Score:</span>
          <div class="risk-bar">
            <div class="risk-fill" style="width: ${riskScore}%; background: ${getRiskColor(riskScore)}"></div>
            <span class="risk-value">${riskScore}/100</span>
          </div>
        </div>

        <div class="result-row">
          <span>Risk Level:</span>
          <span class="risk-level">${riskLevel}</span>
        </div>

        <div class="result-row">
          <span>Category:</span>
          <span>${category}</span>
        </div>

        <div class="result-row">
          <span>Address:</span>
          <span class="address-text">${address}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="action-btn" data-action="copy">Copy Address</button>
        <button class="action-btn" data-action="basescan">View on BaseScan</button>
      </div>
    </div>
  `;

  // Add event listeners to action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action;
      handleAction(action, address);
    });
  });
}

/**
 * Get risk color
 */
function getRiskColor(score: number): string {
  if (score > 70) return '#ef4444';
  if (score > 40) return '#f59e0b';
  return '#10b981';
}

/**
 * Handle action button clicks
 */
function handleAction(action: string, address: string): void {
  switch (action) {
    case 'copy':
      navigator.clipboard.writeText(address);
      showToast('Address copied!');
      break;
    case 'basescan':
      chrome.tabs.create({ url: `https://sepolia.basescan.org/address/${address}` });
      break;
  }
}

/**
 * Show toast notification
 */
function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

/**
 * Get current tab info
 */
async function getCurrentTabInfo(): Promise<any> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url) return null;

  // Check page status via background script
  const response = await chrome.runtime.sendMessage({
    type: 'GET_PAGE_STATUS',
    data: { url: tab.url }
  });

  return response;
}

/**
 * Search button handler
 */
searchBtn.addEventListener('click', async () => {
  const address = addressInput.value.trim();

  if (!address) {
    showToast('Please enter an address');
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = 'Checking...';

  try {
    const result = await checkAddress(address);

    if (result.success) {
      displayResults(result);
    } else {
      showToast(result.error?.message || 'Check failed');
    }
  } catch (error) {
    showToast('Network error');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Check';
  }
});

/**
 * Clear cache handler
 */
clearCacheBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
  showToast('Cache cleared');
});

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Load stats from storage
  const stats = await chrome.storage.local.get(['scamCount', 'checkCount']);
  document.getElementById('scamCount')!.textContent = stats.scamCount || '0';
  document.getElementById('checkCount')!.textContent = stats.checkCount || '0';

  // Get current page status
  const pageInfo = await getCurrentTabInfo();
  if (pageInfo) {
    pageStatusDiv.className = `status-${pageInfo.isScam ? 'danger' : 'safe'}`;
    pageStatusDiv.textContent = pageInfo.isScam
      ? `⚠️ Scam detected: ${pageInfo.reason}`
      : '✅ No scams detected';
  } else {
    pageStatusDiv.textContent = 'Unable to check page';
  }
}

init();
```

---

## 📨 Message Passing

Communication between extension components:

### From Content Script to Background

```typescript
// content.ts
chrome.runtime.sendMessage({
  type: 'CHECK_ADDRESS',
  data: { address: '0x1234...' }
}, (response) => {
  console.log('Address check result:', response);
});
```

### From Background to Content Script

```typescript
// background.ts
chrome.tabs.sendMessage(tabId, {
  type: 'SCAM_DETECTED',
  data: { address: '0x1234...', riskScore: 90 }
});
```

### From Popup to Background

```typescript
// popup.ts
chrome.runtime.sendMessage({
  type: 'GET_PAGE_STATUS',
  data: { url: currentTab.url }
}, (response) => {
  console.log('Page status:', response);
});
```

---

## 🔍 Address Detection

Detect Ethereum addresses on web pages:

### Detector Utility

```typescript
// utils/detector.ts

/**
 * Ethereum address regex
 * Matches 0x followed by 40 hex characters
 */
const ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

/**
 * ENS name regex
 */
const ENS_REGEX = /[a-zA-Z0-9-]+\.eth/g;

/**
 * Detect all Ethereum addresses in the current page
 */
export function detectAddresses(): string[] {
  const addresses = new Set<string>();

  // Scan text content
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script and style tags
        const parent = node.parentElement;
        if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node: Text | null;
  while (node = treeWalker.nextNode() as Text) {
    const matches = node.textContent?.matchAll(ADDRESS_REGEX);
    if (matches) {
      for (const match of matches) {
        addresses.add(match[0]);
      }
    }
  }

  // Scan attributes (href, data-address, etc.)
  const elements = document.querySelectorAll('[href], [data-address], [data-to], [data-from]');
  elements.forEach(el => {
    const href = el.getAttribute('href');
    if (href) {
      const matches = href.matchAll(ADDRESS_REGEX);
      for (const match of matches) {
        addresses.add(match[0]);
      }
    }

    ['data-address', 'data-to', 'data-from'].forEach(attr => {
      const value = el.getAttribute(attr);
      if (value && ADDRESS_REGEX.test(value)) {
        addresses.add(value);
      }
    });
  });

  return Array.from(addresses);
}

/**
 * Detect ENS names
 */
export function detectENSNames(): string[] {
  const ensNames = new Set<string>();

  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let node: Text | null;
  while (node = treeWalker.nextNode() as Text) {
    const matches = node.textContent?.matchAll(ENS_REGEX);
    if (matches) {
      for (const match of matches) {
        ensNames.add(match[0]);
      }
    }
  }

  return Array.from(ensNames);
}

/**
 * Get element containing address
 */
export function getAddressElement(address: string): Element | null {
  const elements = document.querySelectorAll('*');
  for (const el of elements) {
    if (el.textContent?.includes(address)) {
      return el;
    }
  }
  return null;
}
```

---

## 🌐 Domain Checking

Check if current domain is a known phishing site:

```typescript
// utils/domainChecker.ts

const API_BASE = 'http://localhost:3000';

/**
 * Check if current page domain is a scam
 */
export async function checkCurrentDomain(): Promise<any> {
  const domain = window.location.hostname;

  try {
    const response = await fetch(
      `${API_BASE}/api/v1/check-domain?domain=${encodeURIComponent(domain)}`
    );
    const data = await response.json();

    if (data.success) {
      return {
        domain,
        isScam: data.data.isScam,
        riskScore: data.data.riskScore,
        category: data.data.category
      };
    }

    return null;
  } catch (error) {
    console.error('Domain check failed:', error);
    return null;
  }
}

/**
 * Show full page warning for scam sites
 */
export function showScamWarning(data: any): void {
  // Create warning overlay
  const overlay = document.createElement('div');
  overlay.id = 'wallo-scam-warning';
  overlay.innerHTML = `
    <div class="wallo-warning-container">
      <div class="wallo-warning-icon">⚠️</div>
      <h1>WARNING: This site may be a scam!</h1>
      <p class="wallo-warning-domain">${data.domain}</p>
      <p class="wallo-warning-reason">
        Risk Score: ${data.riskScore}/100<br>
        Category: ${data.category}
      </p>
      <div class="wallo-warning-actions">
        <button id="wallo-leave-site" class="wallo-btn wallo-btn-danger">
          Leave this site
        </button>
        <button id="wallo-ignore-warning" class="wallo-btn wallo-btn-secondary">
          I understand, continue
        </button>
      </div>
      <p class="wallo-warning-disclaimer">
        This warning is provided by Wallo. Always verify URLs before connecting
        your wallet or signing transactions.
      </p>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #wallo-scam-warning {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .wallo-warning-container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
    }
    .wallo-warning-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    .wallo-warning-container h1 {
      color: #dc2626;
      margin-bottom: 10px;
    }
    .wallo-warning-domain {
      font-size: 18px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 20px;
    }
    .wallo-warning-reason {
      color: #6b7280;
      margin-bottom: 30px;
    }
    .wallo-warning-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
    }
    .wallo-btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
    }
    .wallo-btn-danger {
      background: #dc2626;
      color: white;
    }
    .wallo-btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .wallo-warning-disclaimer {
      font-size: 12px;
      color: #9ca3af;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Event listeners
  document.getElementById('wallo-leave-site')?.addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('wallo-ignore-warning')?.addEventListener('click', () => {
    overlay.remove();
    // Store in session storage to not show again
    sessionStorage.setItem('wallo-warning-dismissed', data.domain);
  });
}

/**
 * Initialize domain checker
 */
export async function initDomainChecker(): Promise<void> {
  // Check if already dismissed
  const dismissed = sessionStorage.getItem('wallo-warning-dismissed');
  if (dismissed === window.location.hostname) {
    return;
  }

  const result = await checkCurrentDomain();

  if (result && result.isScam) {
    showScamWarning(result);
  }
}
```

---

## 💻 Code Examples

### API Utility for Extension

```typescript
// utils/api.ts

const API_BASE = 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Check address via Wallo API
 */
export async function checkAddress(address: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/address/${address}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Scan contract via Wallo API
 */
export async function scanContract(address: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/scan/${address}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Check domain via Wallo API
 */
export async function checkDomain(domain: string): Promise<any> {
  const response = await fetch(
    `${API_BASE}/api/v1/check-domain?domain=${encodeURIComponent(domain)}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Get platform stats
 */
export async function getStats(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/stats`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Submit scam report
 */
export async function submitReport(reportData: {
  address: string;
  reason: string;
  category: string;
  reporterAddress: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Create address tag
 */
export async function createAddressTag(data: {
  address: string;
  tag: string;
  taggedBy?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/address-tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result: ApiResponse<any> = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Request failed');
  }

  return result.data;
}

/**
 * Get tags for address
 */
export async function getAddressTags(address: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/address/${address}/tags`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

/**
 * Delete address tag
 */
export async function deleteAddressTag(address: string, tag: string): Promise<any> {
  const response = await fetch(
    `${API_BASE}/api/v1/address/${address}/tags?tag=${encodeURIComponent(tag)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ApiResponse<any> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}
```

---

## 📝 TypeScript Types

```typescript
// types/index.ts

export interface WalloMessage {
  type: MessageType;
  data: any;
}

export type MessageType =
  | 'CHECK_ADDRESS'
  | 'CHECK_DOMAIN'
  | 'GET_PAGE_STATUS'
  | 'SCAM_DETECTED'
  | 'SCAM_DOMAIN_DETECTED'
  | 'CLEAR_CACHE';

export interface AddressCheckResult {
  address: string;
  name: string | null;
  status: 'LEGIT' | 'SCAM' | 'SUSPICIOUS' | 'UNKNOWN';
  riskScore: number;
  category: string;
  tags: string[];
  reportCount: number;
  cached: boolean;
}

export interface DomainCheckResult {
  domain: string;
  isScam: boolean;
  riskScore: number;
  category: string;
  cached: boolean;
}

export interface ScanResult {
  address: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isVerified: boolean;
  patterns: ScanPattern[];
  similarScams: SimilarScam[];
  reportCount: number;
}

export interface ScanPattern {
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface SimilarScam {
  address: string;
  name: string;
  similarity: number;
}

export interface ExtensionState {
  scamCount: number;
  checkCount: number;
  lastSync: number | null;
  settings: ExtensionSettings;
}

export interface ExtensionSettings {
  enableAutoCheck: boolean;
  showWarnings: boolean;
  riskThreshold: number;
  enabledNetworks: string[];
}

export interface CachedData {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

// Address Tags
export interface AddressTag {
  id: string;
  tag: string;
  taggedBy: string | null;
  createdAt: string;
}

export interface AddressTagsResponse {
  data: AddressTag[];
  address: string;
  count: number;
}
```

---

## ✅ Best Practices

### 1. Performance Optimization

```typescript
// Debounce rapid checks
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Use with address detection
const debouncedCheck = debounce(processAddresses, 500);
```

### 2. Memory Management

```typescript
// Clear old cache entries
function cleanCache(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > maxAge) {
      memoryCache.delete(key);
    }
  }
}

// Run periodically
setInterval(cleanCache, 60 * 60 * 1000); // Every hour
```

### 3. Error Handling

```typescript
// Always handle errors gracefully
async function safeCheck(address: string): Promise<any | null> {
  try {
    return await checkAddress(address);
  } catch (error) {
    console.error(`Check failed for ${address}:`, error);

    // Track error for analytics
    chrome.storage.local.get(['errors'], (result) => {
      const errors = result.errors || [];
      errors.push({
        address,
        error: error instanceof Error ? error.message : 'Unknown',
        timestamp: Date.now()
      });
      chrome.storage.local.set({ errors });
    });

    return null;
  }
}
```

### 4. User Privacy

```typescript
// Don't send unnecessary data
function sanitizeAddress(address: string): string {
  // Return only first and last 4 characters
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Always ask for permission before sensitive actions
async function requestPermission(action: string): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = confirm(
      `Wallo wants to: ${action}\n\nDo you allow this action?`
    );
    resolve(confirmed);
  });
}
```

### 5. Accessibility

```typescript
// Add ARIA labels to injected elements
function injectWarning(address: string, data: any): void {
  const warning = document.createElement('div');
  warning.setAttribute('role', 'alert');
  warning.setAttribute('aria-live', 'polite');
  warning.setAttribute('aria-label', `Scam warning for ${address}`);
  // ...
}

// Keyboard navigation
warning.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    // Activate warning
  }
});
```

---

## 🚀 Building & Distribution

### Build Configuration

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Create ZIP for Chrome Web Store
npm run package
```

### package.json scripts

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "package": "zip -r wallo-extension.zip dist/ -x '*.map'"
  }
}
```

### Web Store Listing

- **Title:** Wallo - Web3 Scam Detector for Base Chain
- **Description:** Protect yourself from Web3 scams. Detect malicious addresses, phishing sites, and risky contracts on Base chain.
- **Categories:** Security, Productivity, Tools
- **Permissions:** storage, activeTab, scripting

---

## 📚 Additional Resources

- **Frontend Integration Guide:** `FRONTEND_INTEGRATION.md`
- **API Documentation:** See all endpoints in PRD
- **Postman Collection:** `postman/Wallo-API-Collection.postman_collection.json`
- **Chrome Extension Docs:** https://developer.chrome.com/docs/extensions

---

## 🆘 Support

For extension-specific issues:
1. Check browser console for errors
2. Verify API is accessible
3. Clear extension cache
4. Check background worker status in chrome://extensions

**API Status:** http://localhost:3000/api/health
