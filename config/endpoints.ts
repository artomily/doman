/**
 * External API Endpoints Configuration
 *
 * Configuration for external APIs used for data syncing and validation.
 */

import { EXTERNAL_APIS } from '@/lib/constants';

// ============================================
// DEFI LLAMA
// ============================================

export const defiLlamaConfig = {
  baseUrl: EXTERNAL_APIS.DEFILLAMA.BASE_URL,
  endpoints: {
    protocols: EXTERNAL_APIS.DEFILLAMA.PROTOCOLS_ENDPOINT,
  },
  timeout: EXTERNAL_APIS.DEFILLAMA.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Doman-Scam-Detector/1.0',
  },
  /**
   * Get all protocols from DeFiLlama
   * @returns Full URL for protocols endpoint
   */
  getProtocolsUrl(): string {
    return `${this.baseUrl}${this.endpoints.protocols}`;
  },
  /**
   * Get protocols filtered by chain
   * @param chain - Chain name (e.g., 'Base')
   */
  getProtocolsByChainUrl(chain: string = 'Base'): string {
    return `${this.getProtocolsUrl()}?chain=${chain}`;
  },
};

// ============================================
// SCAM SNIFFER
// ============================================

export const scamSnifferConfig = {
  repoUrl: EXTERNAL_APIS.SCAMSNIFFER.REPO_URL,
  rawUrl: EXTERNAL_APIS.SCAMSNIFFER.RAW_URL,
  timeout: EXTERNAL_APIS.SCAMSNIFFER.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Doman-Scam-Detector/1.0',
  },
  files: {
    // Main scam database file
    scams: 'scams.json',
    // Phishing database
    phishing: 'phishing.json',
    // Drainers database
    drainers: 'drainers.json',
  },
  /**
   * Get raw file URL from GitHub
   * @param filename - File name in repository
   */
  getFileUrl(filename: string): string {
    return `${this.rawUrl}/${filename}`;
  },
  /**
   * Get repository URL for cloning
   */
  getRepoUrl(): string {
    return this.repoUrl;
  },
};

// ============================================
// CRYPTO SCAM DB
// ============================================

export const cryptoScamDbConfig = {
  baseUrl: EXTERNAL_APIS.CRYPTOSCAMDB.BASE_URL,
  timeout: EXTERNAL_APIS.CRYPTOSCAMDB.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Doman-Scam-Detector/1.0',
  },
  endpoints: {
    // List all scams
    list: '/scams',
    // Get scam by ID
    byId: (id: string) => `/scams/${id}`,
    // Search scams
    search: '/search',
    // Get recent scams
    recent: '/scams/recent',
  },
  /**
   * Get full URL for an endpoint
   */
  getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  },
};

// ============================================
// BASE REGISTRY
// ============================================

export const baseRegistryConfig = {
  baseUrl: EXTERNAL_APIS.BASE_REGISTRY.BASE_URL,
  timeout: EXTERNAL_APIS.BASE_REGISTRY.TIMEOUT,
  headers: {
    'Content-Type': 'text/html',
    'User-Agent': 'Doman-Scam-Detector/1.0',
  },
  endpoints: {
    // Official dApp directory
    dapps: '/ecosystem',
    // Bridges directory
    bridges: '/bridges',
  },
  /**
   * Get full URL for an endpoint
   */
  getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  },
};

// ============================================
// BASESCAN (BLOCK EXPLORER)
// ============================================

export const baseScanConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASESCAN_URL || 'https://sepolia.basescan.org',
  apiKey: process.env.BASESCAN_API_KEY,
  timeout: 10_000,
  /**
   * Get contract source code verification status
   * @param address - Contract address
   */
  getContractUrl(address: string): string {
    return `${this.baseUrl}/address/${address}#code`;
  },
  /**
   * Get transaction URL
   * @param txHash - Transaction hash
   */
  getTransactionUrl(txHash: string): string {
    return `${this.baseUrl}/tx/${txHash}`;
  },
  /**
   * Get address URL
   * @param address - Address
   */
  getAddressUrl(address: string): string {
    return `${this.baseUrl}/address/${address}`;
  },
  /**
   * Check if contract is verified
   * Note: This requires web scraping or BaseScan API
   */
  isContractVerified(address: string): boolean {
    // This would require actual implementation with BaseScan API
    // For now, return true if the contract has source code on BaseScan
    return false;
  },
};

// ============================================
// API HEALTH CHECK
// ============================================

export const apiHealthCheck = {
  /**
   * Check if external API is accessible
   */
  async checkApiHealth(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  },
  /**
   * Check all external APIs health
   */
  async checkAllApis(): Promise<Record<string, boolean>> {
    const results = await Promise.allSettled([
      this.checkApiHealth(defiLlamaConfig.baseUrl),
      this.checkApiHealth(baseScanConfig.baseUrl),
    ]);

    return {
      defiLlama: results[0].status === 'fulfilled' ? results[0].value : false,
      baseScan: results[1].status === 'fulfilled' ? results[1].value : false,
    };
  },
};

// ============================================
// EXPORT ALL CONFIGS
// ============================================

export const externalApiConfigs = {
  defiLlama: defiLlamaConfig,
  scamSniffer: scamSnifferConfig,
  cryptoScamDb: cryptoScamDbConfig,
  baseRegistry: baseRegistryConfig,
  baseScan: baseScanConfig,
} as const;
