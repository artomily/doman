/**
 * Wagmi v3 Configuration
 *
 * Client-side wallet and contract interaction for Base / Base Sepolia.
 * Uses injected() for MetaMask and coinbaseWallet() for Coinbase Wallet.
 */

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://sepolia.base.org'
    ),
  },
  ssr: true,
});

export { base, baseSepolia };
