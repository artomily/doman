/**
 * Scanner Service
 *
 * Service for analyzing smart contracts and detecting potential scams.
 * Uses bytecode analysis and pattern matching to calculate risk scores.
 */

import { getBytecode, isContract, getScanClient } from '@/lib/viem';
import { SCAN_LIMITS } from '@/lib/constants';
import { allScamPatterns, calculateRiskScore, getRiskLevel } from '@/config/scam-patterns';
import type { DetectedPattern, ScanResult, QuickScanResult, SimilarScam } from '@/types/api';
import type { RiskLevel } from '@/lib/validation';
import type { AddressType, ContractType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { WHITELISTED_CONTRACTS } from '@/config/contracts';

/** Upsert a UserProfile row so the wallet is tracked. */
async function trackChecker(checkerAddress: string) {
  await prisma.userProfile.upsert({
    where: { address: checkerAddress },
    create: { address: checkerAddress },
    update: {},
  });
}

/**
 * Check if a contract should skip scanning
 * Returns true if:
 * 1. Contract is in whitelist (known good)
 * 2. Contract is already in DB marked as LEGIT
 * 3. Contract source is verified on block explorer
 */
async function shouldSkipScanning(address: string): Promise<boolean> {
  const normalizedAddress = address.toLowerCase() as `0x${string}`;

  // Check whitelist first (fastest)
  const isWhitelisted = WHITELISTED_CONTRACTS.some(
    (addr) => addr.toLowerCase() === normalizedAddress
  );
  if (isWhitelisted) return true;

  // Check database for existing trusted records
  const dbRecord = await prisma.address.findUnique({
    where: { address: normalizedAddress },
    select: { status: true, verifiedBy: true, verifiedAt: true },
  });

  // If already marked as LEGIT or verified, skip scanning
  if (dbRecord?.status === 'LEGIT' || dbRecord?.verifiedBy) {
    return true;
  }

  return false;
}

/**
 * Get safe result for whitelisted/verified addresses
 */
async function getSafeContractResult(address: string, startTime: number): Promise<ScanResult> {
  const normalizedAddress = address.toLowerCase() as `0x${string}`;

  // Fetch reports and votes from DB
  const addressRecord = await prisma.address.findUnique({
    where: { address: normalizedAddress },
    include: { _count: { select: { reports: true } } },
  });

  const reportCount = addressRecord?._count.reports ?? 0;

  const voteAggregates = await prisma.report.aggregate({
    where: { address: { address: normalizedAddress } },
    _sum: { votesFor: true, votesAgainst: true },
  });

  const votesFor = voteAggregates._sum.votesFor ?? 0;
  const votesAgainst = voteAggregates._sum.votesAgainst ?? 0;

  return {
    address: normalizedAddress,
    riskScore: 0,
    riskLevel: 'LOW',
    isVerified: true,
    patterns: [],
    similarScams: [],
    reportCount,
    votesFor,
    votesAgainst,
    scanDuration: Date.now() - startTime,
    scannedAt: new Date().toISOString(),
  };
}


async function saveTrustedAddress(address: string): Promise<void> {
  const normalizedAddress = address.toLowerCase() as `0x${string}`;

  await prisma.address.upsert({
    where: { address: normalizedAddress },
    update: { status: 'LEGIT', verifiedAt: new Date() },
    create: {
      address: normalizedAddress,
      addressType: 'SMART_CONTRACT',
      status: 'LEGIT',
      category: 'DEFI',
      riskScore: 0,
      source: 'SCANNER',
      verifiedAt: new Date(),
    },
  });
}

/**
 * Scan contract for potential risks
 */
export async function scanContract(
  address: string,
  checkerAddress?: string,
  chainId?: number
): Promise<ScanResult> {
  const startTime = Date.now();

  // Validate address format
  if (!address.startsWith('0x') || address.length < 2 || address.length > 42) {
    throw new Error('Invalid address format');
  }

  const normalizedAddress = address.toLowerCase() as `0x${string}`;

  // Check if address should skip scanning (whitelisted or verified)
  if (await shouldSkipScanning(normalizedAddress)) {
    await saveTrustedAddress(normalizedAddress);
    return await getSafeContractResult(normalizedAddress, startTime);
  }

  // Detect address type first
  const addressTypeInfo = await detectAddressType(address, chainId);
  // Check if it's a contract
  const hasCode = await isContract(address, chainId);

  if (!hasCode) {
    // EOA (Externally Owned Account) - low risk but not a contract
    // Update address record with EOA type
    if (checkerAddress) await trackChecker(checkerAddress);
    const eoaRecord = await prisma.address.upsert({
      where: { address },
      update: { addressType: 'EOA' },
      create: {
        address,
        addressType: 'EOA',
        status: 'UNKNOWN',
        riskScore: 0,
        source: 'SCANNER',
      },
    });

    await prisma.contractScan.create({
      data: {
        addressId: eoaRecord.id,
        checkerAddress: checkerAddress ?? null,
        riskScore: 0,
        riskLevel: 'LOW',
        patterns: [],
        isVerified: false,
        isProxy: false,
        scannerVersion: '1.0.0',
        scanDuration: Date.now() - startTime,
      },
    });

    return {
      address,
      riskScore: 0,
      riskLevel: 'LOW',
      isVerified: false,
      patterns: [],
      similarScams: [],
      reportCount: 0,
      votesFor: 0,
      votesAgainst: 0,
      scanDuration: Date.now() - startTime,
      scannedAt: new Date().toISOString(),
    };
  }

  // Get bytecode for analysis
  const bytecode = await getBytecode(address, chainId);
  if (!bytecode) {
    throw new Error('Failed to get bytecode');
  }

  // Detect patterns
  const { detectedPatterns, matchedPatterns } = await detectPatterns(bytecode);

  // Calculate risk score from matched patterns
  const riskScore = calculateRiskScore(matchedPatterns);
  const riskLevel = getRiskLevel(riskScore) as RiskLevel;

  if (checkerAddress) await trackChecker(checkerAddress);

  // Upsert address record so ContractScan can always be saved (needed for history)
  const addressRecord = await prisma.address.upsert({
    where: { address },
    create: { address, status: 'UNKNOWN', riskScore, category: 'OTHER', source: 'SCANNER' },
    update: {},
    include: { _count: { select: { reports: true } } },
  });

  const reportCount = addressRecord._count.reports;

  const voteAggregates = await prisma.report.aggregate({
    where: { addressId: addressRecord.id },
    _sum: { votesFor: true, votesAgainst: true },
  });

  const votesFor = voteAggregates._sum.votesFor ?? 0;
  const votesAgainst = voteAggregates._sum.votesAgainst ?? 0;

  // Find similar scams (by bytecode hash)
  const bytecodeHash = bytecode.slice(2, 42); // First 20 bytes for comparison
  const similarScams = await findSimilarScams(bytecodeHash, address);

  // Cache scan result in database
  const scanResult = {
    address,
    riskScore,
    riskLevel,
    isVerified: false,
    patterns: detectedPatterns,
    similarScams,
    reportCount,
    votesFor,
    votesAgainst,
    scanDuration: Date.now() - startTime,
    scannedAt: new Date().toISOString(),
  };

  // Save to database if address exists
  if (addressRecord) {
    await prisma.contractScan.create({
      data: {
        addressId: addressRecord.id,
        checkerAddress: checkerAddress ?? null,
        bytecodeHash,
        bytecodeLength: bytecode.length / 2 - 1, // Convert hex length to bytes
        riskScore,
        riskLevel,
        patterns: detectedPatterns as any, // Store as JSON
        isVerified: false,
        isProxy: addressTypeInfo.isProxy,
        proxyType: addressTypeInfo.proxyType,
        implementationAddress: addressTypeInfo.implementationAddress,
        scannerVersion: '1.0.0',
        scanDuration: scanResult.scanDuration,
      },
    });

    // Update address with detected type
    await prisma.address.update({
      where: { id: addressRecord.id },
      data: {
        addressType: addressTypeInfo.addressType,
        contractType: addressTypeInfo.contractType,
        lastSeenAt: new Date(),
      },
    });
  } else {
    // Create address record if it doesn't exist
    await prisma.address.create({
      data: {
        address,
        addressType: addressTypeInfo.addressType,
        contractType: addressTypeInfo.contractType,
        status: riskScore > 70 ? 'SUSPICIOUS' : 'UNKNOWN',
        riskScore,
        source: 'SCANNER',
      },
    });
  }

  return scanResult;
}

/**
 * Quick scan for basic risk assessment
 */
export async function quickScan(address: string): Promise<QuickScanResult> {
  try {
    // Check if address exists in database
    const addressData = await prisma.address.findUnique({
      where: { address },
      include: {
        _count: { select: { reports: true } },
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            riskScore: true,
            riskLevel: true,
            createdAt: true,
          },
        },
      },
    });

    // If exists and has recent scan, return cached result
    if (addressData?.scans[0]) {
      const lastScan = addressData.scans[0];
      const scanAge = Date.now() - lastScan.createdAt.getTime();

      // Use cached scan if less than 1 hour old
      if (scanAge < 60 * 60 * 1000) {
        return {
          address,
          riskScore: lastScan.riskScore,
          riskLevel: lastScan.riskLevel,
          status: addressData.status,
          hasReports: addressData._count.reports > 0,
          lastScanned: lastScan.createdAt.toISOString(),
        };
      }
    }

    // Perform full scan
    const scanResult = await scanContract(address);

    return {
      address,
      riskScore: scanResult.riskScore,
      riskLevel: scanResult.riskLevel,
      status: addressData?.status || 'UNKNOWN',
      hasReports: scanResult.reportCount > 0,
      lastScanned: scanResult.scannedAt,
    };
  } catch (error) {
    // If scan fails, return basic info
    return {
      address,
      riskScore: 50, // Medium risk for unknown
      riskLevel: 'MEDIUM',
      status: 'UNKNOWN',
      hasReports: false,
    };
  }
}

/**
 * Detect address type (EOA, SMART_CONTRACT, PROXY, FACTORY)
 */
export async function detectAddressType(address: string, chainId?: number): Promise<{
  addressType: AddressType;
  contractType?: ContractType;
  isProxy: boolean;
  proxyType?: string;
  implementationAddress?: string;
}> {
  // Check if it's a contract
  const hasCode = await isContract(address, chainId);

  if (!hasCode) {
    return {
      addressType: 'EOA',
      isProxy: false,
    };
  }

  // Get bytecode for further analysis
  const bytecode = await getBytecode(address, chainId);
  if (!bytecode) {
    return {
      addressType: 'SMART_CONTRACT',
      isProxy: false,
    };
  }

  // Check for proxy patterns
  const proxyInfo = await detectProxy(bytecode, address, chainId);

  // Detect contract type based on bytecode and function selectors
  const contractType = await detectContractType(bytecode);

  // Check if it's a factory
  const isFactory = await isFactoryContract(bytecode);

  return {
    addressType: proxyInfo.isProxy ? 'PROXY' : isFactory ? 'FACTORY' : 'SMART_CONTRACT',
    contractType,
    isProxy: proxyInfo.isProxy,
    proxyType: proxyInfo.proxyType,
    implementationAddress: proxyInfo.implementationAddress,
  };
}

/**
 * Detect if contract is a proxy and get proxy info
 */
async function detectProxy(bytecode: `0x${string}`, address: string, chainId?: number): Promise<{
  isProxy: boolean;
  proxyType?: string;
  implementationAddress?: string;
}> {
  // ERC1967 Proxy detection slots
  const ERC1967_IMPLEMENTATION_SLOT =
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

  try {
    // Check ERC1967 implementation slot
    const implementationSlot = await getScanClient(chainId).getStorageAt({
      address: address as `0x${string}`,
      slot: ERC1967_IMPLEMENTATION_SLOT,
    });

    if (implementationSlot && implementationSlot !== '0x' && implementationSlot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      // It's an ERC1967 proxy
      const implAddress = '0x' + implementationSlot.slice(26, 66);
      return {
        isProxy: true,
        proxyType: 'ERC1967',
        implementationAddress: implAddress,
      };
    }

    // Check for Gnosis Safe proxy pattern
    if (bytecode.includes('0xd9e67be')) { // Gnosis Safe master copy signature
      return {
        isProxy: true,
        proxyType: 'GNOSIS_SAFE',
      };
    }

    // Check for UUPS (Universal Upgradeable Proxy Standard)
    if (bytecode.includes('0x5c60da1')) { // UUPS upgrade function selector
      return {
        isProxy: true,
        proxyType: 'UUPS',
      };
    }

    // Check for Beacon Proxy
    if (bytecode.includes('506257cdf')) {
      return {
        isProxy: true,
        proxyType: 'BEACON',
      };
    }

    return { isProxy: false };
  } catch (error) {
    console.error('Proxy detection failed:', error);
    return { isProxy: false };
  }
}

/**
 * Detect contract type based on bytecode and function signatures
 */
async function detectContractType(bytecode: `0x${string}`): Promise<ContractType> {
  // Common function signatures (first 4 bytes)
  const signatures: Record<string, ContractType> = {
    // Token signatures
    '0xfb3bdb41': 'TOKEN_20', // transfer
    '0xa9059cbb': 'TOKEN_20', // transfer
    '0x23b872dd': 'TOKEN_20', // transferFrom
    '0x095ea7b3': 'TOKEN_20', // approve
    '0x70a08231': 'TOKEN_20', // balanceOf
    '0x18160ddd': 'TOKEN_20', // totalSupply
    '0x7ff36ab5': 'TOKEN_20', // mint (ERC20)

    // DEX Router
    '0xded9372f': 'DEX', // exactInputSingle
    '0x414bf389': 'DEX', // exactInput
    '0xdb3e2198': 'DEX', // exactOutputSingle
    '0x09b81346': 'DEX', // exactOutput
    '0x38ed1739': 'DEX', // uniswap V2 swapExactTokensForTokens
    '0x8803dbee': 'DEX', // uniswap V2 swapTokensForExactTokens

    // NFT signatures
    '0x42842e0e': 'TOKEN_721', // ERC721 getApproved
    '0xb88d4fde': 'TOKEN_721', // ERC721 setApprovalForAll
    '0xa22cb465': 'TOKEN_721', // ERC721 safeTransferFrom
    '0x6352211e': 'TOKEN_721', // ERC721 ownerOf

    // Multi-token (1155)
    '0x8f28a919': 'TOKEN_1155', // ERC1155 balanceOfBatch
    '0xe5eb36c8': 'TOKEN_1155', // ERC1155 setApprovalForAll
    '0xf242432a': 'TOKEN_1155', // ERC1155 safeTransferFrom

    // Bridge
    '0x26135f06': 'BRIDGE', // bridge (common selector)
    '0x114f3236': 'BRIDGE', // bridge (layerZero)

    // Lending
    '0x4531c1f4': 'LENDING', // deposit (compound/aave)
    '0x7d2768d3': 'LENDING', // withdraw (compound)

    // Staking/Yield
    '0x1a6b7620': 'STAKING', // stake (common)
    '0x84d7a10a': 'STAKING', // withdraw (staking)
    '0x3d18b513': 'YIELD', // harvest (yield farming)

    // Governance / reporting (ScamReporter)
    '0xbbd89cfb': 'GOVERNANCE', // submitReport(bytes32,bool)
    '0xb5dd6284': 'GOVERNANCE', // submitVote(uint8,bytes32,bytes32,bool)
    '0xaadc3b72': 'GOVERNANCE', // hasVoted(bytes32,address)
    '0x75f76021': 'GOVERNANCE', // addressToTargetId(address)
  };

  // Check bytecode length - very short contracts might be proxies or factories
  if (bytecode.length < 200) {
    return 'FACTORY';
  }

  // Scan bytecode for function signatures
  let detectedType: ContractType | null = null;

  for (const [signature, type] of Object.entries(signatures)) {
    if (bytecode.includes(signature.slice(2))) {
      detectedType = type;
      break;
    }
  }

  return detectedType || 'OTHER';
}

/**
 * Check if contract is a factory
 */
async function isFactoryContract(bytecode: `0x${string}`): Promise<boolean> {
  // Factory contracts typically have specific patterns
  const factoryPatterns = [
    '0x5c60da1', // create (common in factories)
    '0xf23a6e61', // createPair (uniswap factory)
    '0xc9e65276', // create2 (CREATE2 opcode is common in factories)
  ];

  for (const pattern of factoryPatterns) {
    if (bytecode.includes(pattern)) {
      return true;
    }
  }

  return false;
}

function normalizeHex(value: string): string {
  return value.toLowerCase().replace(/^0x/, '');
}

function extractOpcodeSet(bytecode: `0x${string}`): Set<string> {
  const data = normalizeHex(bytecode);
  const opcodes = new Set<string>();
  let i = 0;

  while (i + 1 < data.length) {
    const opcodeHex = data.slice(i, i + 2);
    opcodes.add(`0x${opcodeHex}`);
    const opcode = Number.parseInt(opcodeHex, 16);
    i += 2;

    // Skip push data to avoid false positives from embedded constants
    if (!Number.isNaN(opcode) && opcode >= 0x60 && opcode <= 0x7f) {
      const pushBytes = opcode - 0x5f;
      i += pushBytes * 2;
    }
  }

  return opcodes;
}

/**
 * Detect patterns in bytecode
 */
async function detectPatterns(bytecode: `0x${string}`): Promise<{
  detectedPatterns: DetectedPattern[];
  matchedPatterns: (typeof allScamPatterns)[number][];
}> {
  const detectedPatterns: DetectedPattern[] = [];
  const matchedPatterns: (typeof allScamPatterns)[number][] = [];
  const normalizedBytecode = normalizeHex(bytecode);
  const opcodeSet = extractOpcodeSet(bytecode);

  const addMatch = (pattern: (typeof allScamPatterns)[number]) => {
    if (matchedPatterns.some((existing) => existing.id === pattern.id)) return;
    matchedPatterns.push(pattern);
    detectedPatterns.push({
      name: pattern.name,
      severity: pattern.severity,
      description: pattern.description,
    });
  };

  const matchesOpcode = (pattern: string | string[]) => {
    const values = Array.isArray(pattern) ? pattern : [pattern];
    return values.some((value) => opcodeSet.has(`0x${normalizeHex(value)}`));
  };

  const matchesBytecode = (pattern: string | string[]) => {
    const values = Array.isArray(pattern) ? pattern : [pattern];
    return values.some((value) => normalizedBytecode.includes(normalizeHex(value)));
  };

  for (const pattern of allScamPatterns) {
    if (pattern.detector === 'opcode' && matchesOpcode(pattern.pattern)) {
      addMatch(pattern);
    }

    if (pattern.detector === 'bytecode' && matchesBytecode(pattern.pattern)) {
      addMatch(pattern);
    }
  }

  return { detectedPatterns, matchedPatterns };
}

/**
 * Find similar contracts by bytecode hash
 */
async function findSimilarScams(bytecodeHash: string, excludeAddress: string): Promise<SimilarScam[]> {
  if (!bytecodeHash) return [];
  const normalizedExclude = excludeAddress.toLowerCase();

  const similarScans = await prisma.contractScan.findMany({
    where: {
      bytecodeHash,
      address: { address: { not: normalizedExclude } },
    },
    take: 5,
    distinct: ['addressId'],
    select: {
      address: {
        select: {
          address: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return similarScans.map((scan) => ({
    address: scan.address.address,
    name: scan.address.name,
    similarity: 1,
  }));
}

/**
 * Batch scan multiple addresses
 */
export async function batchScan(addresses: string[]): Promise<{ address: string; riskScore: number; riskLevel: RiskLevel }[]> {
  if (addresses.length > SCAN_LIMITS.MAX_BATCH_SIZE) {
    throw new Error(`Maximum batch size is ${SCAN_LIMITS.MAX_BATCH_SIZE}`);
  }

  const results = await Promise.all(
    addresses.map(async (address) => {
      try {
        const result = await quickScan(address);
        return {
          address: result.address,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
        };
      } catch {
        return {
          address,
          riskScore: 50,
          riskLevel: 'MEDIUM' as RiskLevel,
        };
      }
    })
  );

  return results;
}

/**
 * Scan a domain/URL for potential scam patterns.
 * Performs a database lookup by the `url` field and returns a risk assessment.
 */
export async function scanDomain(domain: string, checkerAddress?: string): Promise<ScanResult> {
  const startTime = Date.now();
  const normalised = domain.trim().toLowerCase().replace(/^https?:\/\//, '');

  // Search DB by url field (contains match) or by name
  const dbMatch = await prisma.address.findFirst({
    where: {
      OR: [
        { url: { contains: normalised, mode: 'insensitive' } },
        { name: { contains: normalised, mode: 'insensitive' } },
      ],
    },
    select: {
      riskScore: true,
      verifiedBy: true,
      _count: { select: { reports: true } },
    },
  });

  if (dbMatch) {
    const riskScore = dbMatch.riskScore;
    const riskLevel = getRiskLevel(riskScore) as RiskLevel;
    return {
      address: normalised,
      inputType: 'domain',
      riskScore,
      riskLevel,
      isVerified: !!dbMatch.verifiedBy,
      patterns: [],
      similarScams: [],
      reportCount: dbMatch._count.reports,
      votesFor: 0,
      votesAgainst: 0,
      scanDuration: Date.now() - startTime,
      scannedAt: new Date().toISOString(),
    };
  }

  // Not in database – treat as unknown, low risk
  return {
    address: normalised,
    inputType: 'domain',
    riskScore: 0,
    riskLevel: 'LOW',
    isVerified: false,
    patterns: [],
    similarScams: [],
    reportCount: 0,
    votesFor: 0,
    votesAgainst: 0,
    scanDuration: Date.now() - startTime,
    scannedAt: new Date().toISOString(),
  };
}
