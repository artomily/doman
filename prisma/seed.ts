/**
 * Prisma Seed Script
 *
 * Populates the database with initial data for development.
 * Run with: npx prisma db seed
 */

import { PrismaClient, AddressStatus, AddressCategory, DataSource, RiskLevel } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed addresses for testing
 */
const seedAddresses = [
  // Known legitimate dApps on Base
  {
    address: '0x4200000000000000000000000000000000000006',
    name: 'WETH on Base',
    chain: 'base',
    status: AddressStatus.LEGIT,
    riskScore: 0,
    category: AddressCategory.OTHER,
    source: DataSource.ADMIN,
    description: 'Wrapped Ether on Base',
    url: 'https://base.org',
    logoUrl: null,
    tvl: null,
    verifiedBy: '0x0000000000000000000000000000000000000000',
  },
  {
    address: '0x4200000000000000000000000000000000000010',
    name: 'Aerodrome Finance',
    chain: 'base',
    status: AddressStatus.LEGIT,
    riskScore: 5,
    category: AddressCategory.DEX,
    source: DataSource.ADMIN,
    description: 'DEX and liquidity protocol on Base',
    url: 'https://aerodrome.finance',
    logoUrl: null,
    tvl: 1500000,
    verifiedBy: '0x0000000000000000000000000000000000000000',
  },
  // Example scam addresses (for testing)
  {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    name: 'Fake Airdrop Drainer',
    chain: 'base',
    status: AddressStatus.SCAM,
    riskScore: 95,
    category: AddressCategory.DRAINER,
    source: DataSource.ADMIN,
    description: 'Fake airdrop that drains tokens',
    url: 'https://fake-airdrop.scam',
    logoUrl: null,
    tvl: null,
    verifiedBy: '0x0000000000000000000000000000000000000000',
  },
  {
    address: '0xcafebabecafebabecafebabecafebabecafebabe',
    name: 'Phishing Site Contract',
    chain: 'base',
    status: AddressStatus.SCAM,
    riskScore: 88,
    category: AddressCategory.PHISHING,
    source: DataSource.ADMIN,
    description: 'Known phishing contract',
    url: 'https://phishing-site.scam',
    logoUrl: null,
    tvl: null,
    verifiedBy: '0x0000000000000000000000000000000000000000',
  },
  // Suspicious addresses
  {
    address: '0x5555555555555555555555555555555555555555',
    name: 'Suspicious Token',
    chain: 'base',
    status: AddressStatus.SUSPICIOUS,
    riskScore: 65,
    category: AddressCategory.IMPOSTER,
    source: DataSource.SCANNER,
    description: 'Token with suspicious patterns detected',
    url: null,
    logoUrl: null,
    tvl: null,
    verifiedBy: null,
  },
];

/**
 * Seed tags
 */
const seedTags = [
  { address: '0x4200000000000000000000000000000000000010', tag: 'verified', taggedBy: 'system' },
  { address: '0x4200000000000000000000000000000000000010', tag: 'defi', taggedBy: 'system' },
  { address: '0x4200000000000000000000000000000000000010', tag: 'dex', taggedBy: 'system' },
  { address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', tag: 'scam', taggedBy: 'system' },
  { address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', tag: 'drainer', taggedBy: 'system' },
  { address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', tag: 'phishing', taggedBy: 'system' },
  { address: '0xcafebabecafebabecafebabecafebabecafebabe', tag: 'scam', taggedBy: 'system' },
  { address: '0xcafebabecafebabecafebabecafebabecafebabe', tag: 'phishing', taggedBy: 'system' },
  { address: '0x5555555555555555555555555555555555555555', tag: 'suspicious', taggedBy: 'system' },
  { address: '0x5555555555555555555555555555555555555555', tag: 'high-risk', taggedBy: 'system' },
];

/**
 * Seed reports
 */
const seedReports = [
  {
    reporterAddress: '0x1111111111111111111111111111111111111111',
    reason: 'This contract is a known token drainer. Approves unlimited tokens and transfers them to the owner.',
    evidenceUrl: 'https://basescan.org/tx/0x1234567890abcdef',
    category: AddressCategory.DRAINER,
  },
  {
    reporterAddress: '0x2222222222222222222222222222222222222222',
    reason: 'Imposter token pretending to be a legitimate project. Similar name but different contract address.',
    evidenceUrl: null,
    category: AddressCategory.IMPOSTER,
  },
];

/**
 * Seed contract scans
 */
const seedScans = [
  {
    bytecodeHash: '0xabcd1234567890',
    riskScore: 95,
    riskLevel: RiskLevel.CRITICAL,
    patterns: [
      { name: 'Unlimited Approve', severity: 'HIGH', description: 'Unlimited token approval detected' },
      { name: 'Self-Destruct', severity: 'CRITICAL', description: 'Self-destruct capability found' },
      { name: 'Honeypot Pattern', severity: 'CRITICAL', description: 'Known honeypot bytecode signature' },
    ],
    isVerified: true,
    scanDuration: 2450,
  },
  {
    bytecodeHash: '0xfedcba0987654321',
    riskScore: 88,
    riskLevel: RiskLevel.HIGH,
    patterns: [
      { name: 'Hidden Transfer From', severity: 'HIGH', description: 'Unsafe transfer implementation' },
      { name: 'Delegate Call', severity: 'MEDIUM', description: 'Delegate call to arbitrary address' },
    ],
    isVerified: true,
    scanDuration: 1800,
  },
];

/**
 * Seed user profiles
 */
const seedUserProfiles = [
  {
    address: '0x1111111111111111111111111111111111111111',
    ensName: 'alice.eth',
    reportsSubmitted: 15,
    reportsVerified: 12,
    reputation: 150,
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    ensName: 'bob.eth',
    reportsSubmitted: 8,
    reportsVerified: 7,
    reputation: 85,
  },
];

/**
 * Seed external sources data
 * Note: address is used to find the address ID, not stored directly
 */
const seedExternalSourcesData = [
  {
    address: '0x4200000000000000000000000000000000000010',
    source: 'defillama',
    sourceId: 'aerodrome',
    sourceUrl: 'https://llama.fi/protocol/aerodrome',
    rawData: { category: 'DEX', chain: 'Base', tvl: 1500000 },
  },
  {
    address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    source: 'scamsniffer',
    sourceId: 'fake-airdrop-12345',
    sourceUrl: 'https://github.com/scamsniffer/scam-database',
    rawData: { type: 'drainer', dateAdded: '2024-01-15' },
  },
];

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (for development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.vote.deleteMany();
    await prisma.report.deleteMany();
    await prisma.addressTag.deleteMany();
    await prisma.contractScan.deleteMany();
    await prisma.externalSource.deleteMany();
    await prisma.syncLog.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.address.deleteMany();
  }

  // Seed addresses
  console.log('📍 Seeding addresses...');
  const createdAddresses = [];
  for (const addressData of seedAddresses) {
    const address = await prisma.address.upsert({
      where: { address: addressData.address },
      update: {},
      create: addressData,
    });
    createdAddresses.push(address);
  }

  // Seed tags
  console.log('🏷️  Seeding tags...');
  for (const tag of seedTags) {
    const address = createdAddresses.find((a) => a.address === tag.address);
    if (address) {
      await prisma.addressTag.upsert({
        where: {
          addressId_tag: {
            addressId: address.id,
            tag: tag.tag,
          },
        },
        update: {},
        create: {
          addressId: address.id,
          tag: tag.tag,
          taggedBy: tag.taggedBy,
        },
      });
    }
  }

  // Seed reports
  console.log('📝 Seeding reports...');
  const scamAddresses = createdAddresses.filter((a) => a.status === AddressStatus.SCAM);
  for (let i = 0; i < seedReports.length; i++) {
    const reportData = seedReports[i];
    const address = scamAddresses[i % scamAddresses.length];
    if (address) {
      await prisma.report.create({
        data: {
          ...reportData,
          addressId: address.id,
        },
      });
    }
  }

  // Seed contract scans
  console.log('🔍 Seeding contract scans...');
  for (let i = 0; i < seedScans.length; i++) {
    const scanData = seedScans[i];
    const address = createdAddresses.find(
      (a) => a.status === AddressStatus.SCAM || a.status === AddressStatus.SUSPICIOUS
    );
    if (address) {
      await prisma.contractScan.create({
        data: {
          ...scanData,
          addressId: address.id,
        },
      });
    }
  }

  // Seed user profiles
  console.log('👤 Seeding user profiles...');
  for (const profile of seedUserProfiles) {
    await prisma.userProfile.upsert({
      where: { address: profile.address },
      update: {},
      create: profile,
    });
  }

  // Seed external sources
  console.log('🔗 Seeding external sources...');
  for (const sourceData of seedExternalSourcesData) {
    const address = createdAddresses.find((a) => a.address === sourceData.address);
    if (address) {
      await prisma.externalSource.upsert({
        where: {
          addressId_source_sourceId: {
            addressId: address.id,
            source: sourceData.source,
            sourceId: sourceData.sourceId || '',
          },
        },
        update: {},
        create: {
          source: sourceData.source,
          sourceId: sourceData.sourceId,
          sourceUrl: sourceData.sourceUrl,
          rawData: sourceData.rawData,
          addressId: address.id,
        },
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`   - ${createdAddresses.length} addresses`);
  console.log(`   - ${seedTags.length} tags`);
  console.log(`   - ${seedReports.length} reports`);
  console.log(`   - ${seedScans.length} contract scans`);
  console.log(`   - ${seedUserProfiles.length} user profiles`);
  console.log(`   - ${seedExternalSourcesData.length} external sources`);
}

/**
 * Execute seed
 */
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
