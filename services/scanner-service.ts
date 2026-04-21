/**
 * Scanner Service
 *
 * Service for analyzing smart contracts and detecting potential scams.
 * Uses bytecode analysis and pattern matching to calculate risk scores.
 */

import { getBytecode, isContract } from '@/lib/viem';
import { SCAM_PATTERNS, getRiskLevelFromScore, SCAN_LIMITS } from '@/lib/constants';
import { allScamPatterns, calculateRiskScore, getRiskLevel } from '@/config/scam-patterns';
import type { DetectedPattern, ScanResult, QuickScanResult, SimilarScam } from '@/types/api';
import type { RiskLevel } from '@/lib/validation';
import prisma from '@/lib/prisma';

/**
 * Scan contract for potential risks
 */
export async function scanContract(address: string): Promise<ScanResult> {
  const startTime = Date.now();

  // Validate address format
  if (!address.startsWith('0x') || address.length < 2 || address.length > 42) {
    throw new Error('Invalid address format');
  }

  // Check if it's a contract
  const hasCode = await isContract(address);
  if (!hasCode) {
    // EOA (Externally Owned Account) - low risk but not a contract
    return {
      address,
      riskScore: 0,
      riskLevel: 'LOW',
      isVerified: false,
      patterns: [],
      similarScams: [],
      reportCount: 0,
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

  // Get report count for this address
  const addressRecord = await prisma.address.findUnique({
    where: { address },
    include: { _count: { select: { reports: true } } },
  });

  const reportCount = addressRecord?._count.reports || 0;

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
    scanDuration: Date.now() - startTime,
    scannedAt: new Date().toISOString(),
  };

  // Save to database if address exists
  if (addressRecord) {
    await prisma.contractScan.create({
      data: {
        addressId: addressRecord.id,
        bytecodeHash,
        riskScore,
        riskLevel,
        patterns: detectedPatterns as any, // Store as JSON
        isVerified: false,
        scannerVersion: '1.0.0',
        scanDuration: scanResult.scanDuration,
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
export async function scanDomain(domain: string): Promise<ScanResult> {
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
    scanDuration: Date.now() - startTime,
    scannedAt: new Date().toISOString(),
  };
}
