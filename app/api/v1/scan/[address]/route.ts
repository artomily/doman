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
import { resolveInput } from '@/lib/viem';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address: rawInput } = await params;
    const input = decodeURIComponent(rawInput).trim();

    // Optional: wallet address of the user performing the check
    const checkerAddress = request.nextUrl.searchParams.get('checker') ?? undefined;

    if (!input || input.length < 2) {
      return errors.validation('Input must be at least 2 characters');
    }

    if (input.length > 253) {
      return errors.validation('Input too long', { maxLength: 253 });
    }

    const { inputType, resolvedAddress } = await resolveInput(input);

    if (inputType === 'domain') {
      const result = await scanDomain(input, checkerAddress);
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

    const result = await scanContract(address, checkerAddress);
    return apiSuccess({
      ...result,
      inputType,
      resolvedAddress: inputType === 'ens' ? address : undefined,
      displayInput: inputType === 'ens' ? input : undefined,
    });
  });
}
