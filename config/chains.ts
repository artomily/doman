/**
 * Blockchain Chain Configuration
 *
 * Configuration for various blockchain networks supported by Doman.
 * Currently supports Base Sepolia (testnet) with plans for Base Mainnet.
 */

import { type Chain } from 'viem';

/**
 * Base Sepolia Testnet Configuration
 */
export const baseSepolia: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5082216,
    },
  },
  testnet: true,
};

/**
 * Base Mainnet Configuration (for future use)
 */
export const baseMainnet: Chain = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
    public: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 283830,
    },
  },
};

/**
 * Get chain by chain ID
 */
export function getChainById(chainId: number): Chain | null {
  switch (chainId) {
    case baseSepolia.id:
      return baseSepolia;
    case baseMainnet.id:
      return baseMainnet;
    default:
      return null;
  }
}

/**
 * Get chain from environment variable
 */
export function getCurrentChain(): Chain {
  const chainId = parseInt(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || '84532', 10);
  const chain = getChainById(chainId);

  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return chain;
}

/**
 * Get block explorer URL for address/transaction
 */
export function getExplorerUrl(type: 'address' | 'tx', value: string): string {
  const chain = getCurrentChain();
  const baseUrl = chain.blockExplorers?.default.url;

  if (!baseUrl) {
    throw new Error('Block explorer not configured for current chain');
  }

  return `${baseUrl}/${type}/${value}`;
}

/**
 * Check if current chain is testnet
 */
export function isTestnet(): boolean {
  const chain = getCurrentChain();
  return chain.testnet ?? false;
}

// Re-export types
export type { Chain };
