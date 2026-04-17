/**
 * Viem Client Configuration
 *
 * Configures Viem clients for interacting with Base Sepolia blockchain.
 * - Public client: For reading blockchain data (getCode, readContract, etc.)
 * - Wallet client: For server-side contract writes (with private key)
 *
 * IMPORTANT: Wallet client should ONLY be used on the server-side.
 * Never expose private keys to the client.
 */

import { createPublicClient, createWalletClient, http, type Chain, type PublicClient, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';

/**
 * Validate required environment variables
 */
function validateEnv(): {
  rpcUrl: string;
  privateKey?: `0x${string}`;
} {
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error('NEXT_PUBLIC_BASE_RPC_URL is not defined');
  }

  const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}` | undefined;

  // Validate private key format if provided
  if (privateKey && !privateKey.startsWith('0x')) {
    throw new Error('WALLET_PRIVATE_KEY must start with 0x');
  }

  if (privateKey && privateKey.length !== 66) {
    throw new Error('WALLET_PRIVATE_KEY must be 66 characters (0x + 64 hex chars)');
  }

  return { rpcUrl, privateKey };
}

/**
 * Custom Base Sepolia chain configuration with additional metadata
 */
export const baseSepoliaConfig: Chain = {
  ...baseSepolia,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

const { rpcUrl, privateKey } = validateEnv();

/**
 * Public Client
 *
 * Used for reading blockchain data:
 * - getCode() - Get contract bytecode for scanning
 * - readContract() - Read contract state
 * - getBalance() - Get address balance
 * - etc.
 */
export const publicClient = createPublicClient({
  chain: baseSepoliaConfig,
  transport: http(rpcUrl, {
    timeout: 30_000, // 30 second timeout
    retryCount: 3,
  }),
});

/**
 * Wallet Client (Server-Side Only!)
 *
 * Used for server-side contract writes:
 * - writeContract() - Write to smart contracts
 * - sendTransaction() - Send transactions
 *
 * WARNING: Never use this on the client-side. The private key
 * would be exposed in the browser bundle.
 */
export const walletClient = privateKey
  ? createWalletClient({
    chain: baseSepoliaConfig,
    transport: http(rpcUrl, {
      timeout: 30_000,
      retryCount: 3,
    }),
    account: privateKey,
  })
  : null;

/**
 * Ethereum Client for ENS Resolution
 *
 * ENS (Ethereum Name Service) is deployed on Ethereum mainnet.
 * Cloudflare's gateway is used as it properly supports ENS resolution.
 *
 * For production, consider using Infura or Alchemy with their web3 API gateways.
 */
export const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com', {
    timeout: 30_000,
    retryCount: 3,
  }),
});

/**
 * Check if address is a valid Ethereum address
 * Accepts variable length addresses (EOA addresses can be shorter)
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(address) && address.length >= 2 && address.length <= 42;
}

/**
 * Get contract bytecode
 * Returns null if address has no code (EOA)
 */
export async function getBytecode(address: string): Promise<`0x${string}` | null> {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address format');
  }

  try {
    const bytecode = await publicClient.getCode({
      address: address as `0x${string}`,
    });

    // No code means it's an EOA (Externally Owned Account)
    if (bytecode === '0x' || bytecode === undefined) {
      return null;
    }

    return bytecode;
  } catch (error) {
    throw new Error(`Failed to get bytecode: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get bytecode hash for similarity detection
 */
export async function getBytecodeHash(address: string): Promise<string | null> {
  const bytecode = await getBytecode(address);
  if (!bytecode) return null;

  // Simple hash: first 10 bytes + last 10 bytes for quick comparison
  const trimmed = bytecode.slice(2, 20) + bytecode.slice(-20);
  return `0x${trimmed}` as `0x${string}`;
}

/**
 * Check if address is a contract (has bytecode)
 */
export async function isContract(address: string): Promise<boolean> {
  const bytecode = await getBytecode(address);
  return bytecode !== null && bytecode !== '0x';
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(txHash: string) {
  if (!txHash.startsWith('0x') || txHash.length !== 66) {
    throw new Error('Invalid transaction hash format');
  }

  return publicClient.getTransactionReceipt({
    hash: txHash as `0x${string}`,
  });
}

/**
 * Re-export types for convenience
 */
export type { Chain, PublicClient, WalletClient };

// ============================================
// ENS / INPUT TYPE DETECTION
// ============================================

export type ScanInputType = 'address' | 'ens' | 'domain';

/**
 * Detect whether the user input is a 0x address, ENS name, or plain domain.
 */
export function detectInputType(input: string): ScanInputType {
  const trimmed = input.trim().toLowerCase();
  if (/^0x[a-f0-9]{1,40}$/.test(trimmed)) return 'address';
  if (trimmed.endsWith('.eth')) return 'ens';
  return 'domain';
}

/**
 * Resolve an ENS name to its underlying Ethereum address.
 * Uses mainnet ENS registry (ENS only works on mainnet, not testnet).
 * Returns null if the name has no resolver or no address record.
 */
export async function resolveEns(ensName: string): Promise<`0x${string}` | null> {
  try {
    const address = await mainnetClient.getEnsAddress({
      name: ensName,
    });
    return address ?? null;
  } catch {
    return null;
  }
}

/**
 * Given any user input (address / ENS / domain) return its normalised
 * address (0x…) and detected input type.  Returns null address for domains
 * so callers can perform a database-only lookup instead of a chain lookup.
 */
export async function resolveInput(input: string): Promise<{
  inputType: ScanInputType;
  resolvedAddress: string | null;
}> {
  const type = detectInputType(input);

  if (type === 'address') {
    return { inputType: 'address', resolvedAddress: input.trim() };
  }

  if (type === 'ens') {
    const resolved = await resolveEns(input.trim());
    return { inputType: 'ens', resolvedAddress: resolved };
  }

  // domain – no on-chain resolution; caller searches the database by url field
  return { inputType: 'domain', resolvedAddress: null };
}
