/**
 * Contract / ENS / Domain Scan Endpoint
 * GET /api/v1/scan/[address]
 *
 * Accepts:
 *   - 0x… Ethereum address (wallet or contract)
 *   - ENS name (e.g. vitalik.eth)  → resolved to address then scanned
 *   - Domain / URL (e.g. uniswap.org) → database lookup
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { scanContract, scanDomain } from '@/services/scanner-service';
import { resolveInput, isSolanaAddress } from '@/lib/viem';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address: rawInput } = await params;
    const input = decodeURIComponent(rawInput).trim();

    // Optional: wallet address of the user performing the check
    const checkerAddress = request.nextUrl.searchParams.get('checker') ?? undefined;
    const chainIdParam = request.nextUrl.searchParams.get('chainId');
    const chainId = chainIdParam ? parseInt(chainIdParam, 10) : undefined;

    if (chainIdParam && chainId !== 8453 && chainId !== 84532) {
      return errors.validation('Unsupported chainId. Use 8453 (Base) or 84532 (Base Sepolia).');
    }

    if (!input || input.length < 2) {
      return errors.validation('Input must be at least 2 characters');
    }

    if (input.length > 253) {
      return errors.validation('Input too long', { maxLength: 253 });
    }

    // Detect non-EVM chains before resolving
    if (isSolanaAddress(input)) {
      return errors.validation(
        'Solana addresses are not supported. DOMAN is designed for Base chain (EVM) only.',
        { chain: 'solana', supported: ['base', 'base-sepolia'] }
      );
    }

    const { inputType, resolvedAddress } = await resolveInput(input);

    if (inputType === 'domain') {
      const result = await scanDomain(input, checkerAddress);
      // Record domain search in SearchHistory
      prisma.searchHistory.create({
        data: {
          checkerAddress: checkerAddress ?? null,
          searchType: 'domain',
          query: input,
          resolvedTo: null,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          result: result as any,
        },
      }).catch(() => {});
      return apiSuccess(result);
    }

    // ENS or address – need a resolved 0x address
    const address = resolvedAddress ?? input;

    if (!/^0x[a-fA-F0-9]{1,40}$/.test(address)) {
      if (inputType === 'ens') {
        return errors.validation('ENS name could not be resolved to an address');
      }
      return errors.invalidAddress([{ message: 'Invalid Ethereum address format' }]);
    }

    const result = await scanContract(address, checkerAddress, chainId);

    // Record ENS query in SearchHistory
    if (inputType === 'ens') {
      prisma.searchHistory.create({
        data: {
          checkerAddress: checkerAddress ?? null,
          searchType: 'ens',
          query: input,
          resolvedTo: address,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          result: result as any,
        },
      }).catch(() => {});
    }

    return apiSuccess({
      ...result,
      inputType,
      resolvedAddress: inputType === 'ens' ? address : undefined,
      displayInput: inputType === 'ens' ? input : undefined,
    });
  });
}
