/**
 * Scanner Service
 *
 * Service for analyzing smart contracts and detecting potential scams.
 * Uses bytecode analysis and pattern matching to calculate risk scores.
 */

import { getBytecode, isContract, publicClient } from '@/lib/viem';
import { SCAM_PATTERNS, getRiskLevelFromScore, SCAN_LIMITS } from '@/lib/constants';
import { allScamPatterns, calculateRiskScore, getRiskLevel } from '@/config/scam-patterns';
import type { DetectedPattern, ScanResult, QuickScanResult, SimilarScam } from '@/types/api';
import type { RiskLevel } from '@/lib/validation';
import type { AddressType, ContractType } from '@prisma/client';
import prisma from '@/lib/prisma';

/** Upsert a UserProfile row so the wallet is tracked. */
async function trackChecker(checkerAddress: string) {
  await prisma.userProfile.upsert({
    where: { address: checkerAddress },
    create: { address: checkerAddress },
    update: {},
  });
}

/**
 * Scan contract for potential risks
 */
export async function scanContract(address: string, checkerAddress?: string): Promise<ScanResult> {
  const startTime = Date.now();

  // Validate address format
  if (!address.startsWith('0x') || address.length < 2 || address.length > 42) {
    throw new Error('Invalid address format');
  }

  // Detect address type first
  const addressTypeInfo = await detectAddressType(address);

  // Check if it's a contract
  const hasCode = await isContract(address);
  if (!hasCode) {
    // EOA (Externally Owned Account) - low risk but not a contract
    // Update address record with EOA type
    await prisma.address.upsert({
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
  const bytecode = await getBytecode(address);
  if (!bytecode) {
    throw new Error('Failed to get bytecode');
  }

  // Detect patterns
  const detectedPatterns = await detectPatterns(bytecode);

  // Calculate risk score from patterns
  const calculatedRiskScore = detectedPatterns.reduce((total, pattern) => {
    const severityScore = { LOW: 10, MEDIUM: 25, HIGH: 50, CRITICAL: 80 };
    return total + (severityScore[pattern.severity] || 10);
  }, 0);

  // Cap at 100
  const riskScore = Math.min(calculatedRiskScore, 100);
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
export async function detectAddressType(address: string): Promise<{
  addressType: AddressType;
  contractType?: ContractType;
  isProxy: boolean;
  proxyType?: string;
  implementationAddress?: string;
}> {
  // Check if it's a contract
  const hasCode = await isContract(address);

  if (!hasCode) {
    return {
      addressType: 'EOA',
      isProxy: false,
    };
  }

  // Get bytecode for further analysis
  const bytecode = await getBytecode(address);
  if (!bytecode) {
    return {
      addressType: 'SMART_CONTRACT',
      isProxy: false,
    };
  }

  // Check for proxy patterns
  const proxyInfo = await detectProxy(bytecode, address);

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
async function detectProxy(bytecode: `0x${string}`, address: string): Promise<{
  isProxy: boolean;
  proxyType?: string;
  implementationAddress?: string;
}> {
  // ERC1967 Proxy detection slots
  const ERC1967_IMPLEMENTATION_SLOT =
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

  try {
    // Check ERC1967 implementation slot
    const implementationSlot = await publicClient.getStorageAt({
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

/**
 * Detect patterns in bytecode
 */
async function detectPatterns(bytecode: `0x${string}`): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Check for known opcode patterns
  // Self-destruct (0xff)
  if (bytecode.includes('ff')) {
    const selfDestructPattern = allScamPatterns.find((p) => p.id === 'selfdestruct');
    if (selfDestructPattern) {
      patterns.push({
        name: selfDestructPattern.name,
        severity: selfDestructPattern.severity,
        description: selfDestructPattern.description,
      });
    }
  }

  // Delegate call (0xf4)
  if (bytecode.includes('f4')) {
    const delegateCallPattern = allScamPatterns.find((p) => p.id === 'delegatecall');
    if (delegateCallPattern) {
      patterns.push({
        name: delegateCallPattern.name,
        severity: delegateCallPattern.severity,
        description: delegateCallPattern.description,
      });
    }
  }

  // Check for function selectors (first 4 bytes of calldata)
  // This is simplified - in production would use proper bytecode analysis

  // Check if bytecode is very short (might be a proxy)
  if (bytecode.length < 100) {
    const proxyPattern = allScamPatterns.find((p) => p.id === 'upgradeable_proxy');
    if (proxyPattern) {
      patterns.push({
        name: proxyPattern.name,
        severity: proxyPattern.severity,
        description: proxyPattern.description,
      });
    }
  }

  // Check for specific bytecode signatures
  // ERC1967 proxy implementation slot
  if (bytecode.includes('360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')) {
    const beaconProxyPattern = allScamPatterns.find((p) => p.id === 'beacon_proxy');
    if (beaconProxyPattern) {
      patterns.push({
        name: beaconProxyPattern.name,
        severity: beaconProxyPattern.severity,
        description: beaconProxyPattern.description,
      });
    }
  }

  return patterns;
}

/**
 * Find similar contracts by bytecode hash
 */
async function findSimilarScams(bytecodeHash: string, excludeAddress: string): Promise<SimilarScam[]> {
  // Find addresses with high risk scores
  const similarAddresses = await prisma.address.findMany({
    where: {
      address: { not: excludeAddress },
      riskScore: { gte: 70 }, // High risk addresses
      status: { in: ['SCAM', 'SUSPICIOUS'] },
    },
    take: 5,
    select: {
      address: true,
      name: true,
      riskScore: true,
    },
    orderBy: { riskScore: 'desc' },
  });

  // Calculate similarity based on risk score difference
  return similarAddresses.map((addr) => ({
    address: addr.address,
    name: addr.name,
    similarity: 1 - (Math.abs(addr.riskScore - 80) / 100), // Simple similarity metric
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
    include: {
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
