-- Update ContractType enum
ALTER TYPE "ContractType" RENAME VALUE 'TOKEN' TO 'TOKEN_20';
ALTER TYPE "ContractType" ADD VALUE 'TOKEN_721';
ALTER TYPE "ContractType" ADD VALUE 'TOKEN_1155';
ALTER TYPE "ContractType" ADD VALUE 'AIRDROP';
ALTER TYPE "ContractType" ADD VALUE 'MINTER';
ALTER TYPE "ContractType" ADD VALUE 'DRAINER';
ALTER TYPE "ContractType" ADD VALUE 'PHISHING';
ALTER TYPE "ContractType" ADD VALUE 'IMPOSTER';
ALTER TYPE "ContractType" ADD VALUE 'ROUTER';
ALTER TYPE "ContractType" ADD VALUE 'VAULT';
ALTER TYPE "ContractType" ADD VALUE 'FACTORY';

-- Add new columns to addresses table
ALTER TABLE "addresses" ADD COLUMN "displayName" VARCHAR(255);
ALTER TABLE "addresses" ADD COLUMN "website" VARCHAR(2048);
ALTER TABLE "addresses" ADD COLUMN "twitter" VARCHAR(255);
ALTER TABLE "addresses" ADD COLUMN "telegram" VARCHAR(255);
ALTER TABLE "addresses" ADD COLUMN "discord" VARCHAR(255);
ALTER TABLE "addresses" ADD COLUMN "firstSeenAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "addresses" ADD COLUMN "lastSeenAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS "addresses_contractType_idx" ON "addresses"("contractType");
CREATE INDEX IF NOT EXISTS "addresses_firstSeenAt_idx" ON "addresses"("firstSeenAt");
CREATE INDEX IF NOT EXISTS "addresses_lastSeenAt_idx" ON "addresses"("lastSeenAt");
CREATE INDEX IF NOT EXISTS "addresses_status_firstSeenAt_idx" ON "addresses"("status", "firstSeenAt");

-- Add new columns to contract_scans table
ALTER TABLE "contract_scans" ADD COLUMN "bytecodeLength" INTEGER;
ALTER TABLE "contract_scans" ADD COLUMN "detectedSignatures" JSONB;
ALTER TABLE "contract_scans" ADD COLUMN "isProxy" BOOLEAN DEFAULT false;
ALTER TABLE "contract_scans" ADD COLUMN "proxyType" VARCHAR(50);
ALTER TABLE "contract_scans" ADD COLUMN "implementationAddress" VARCHAR(42);

-- Create index for new columns
CREATE INDEX IF NOT EXISTS "contract_scans_bytecodeHash_idx" ON "contract_scans"("bytecodeHash");
CREATE INDEX IF NOT EXISTS "contract_scans_isProxy_idx" ON "contract_scans"("isProxy");

-- Add new columns to external_sources table
ALTER TABLE "external_sources" ADD COLUMN "confidence" SMALLINT;
ALTER TABLE "external_sources" ADD COLUMN "category" VARCHAR(100);
ALTER TABLE "external_sources" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "external_sources" ADD COLUMN "firstSeenAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "external_sources" ADD COLUMN "lastSeenAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for external_sources
CREATE INDEX IF NOT EXISTS "external_sources_source_category_idx" ON "external_sources"("source", "category");
CREATE INDEX IF NOT EXISTS "external_sources_confidence_idx" ON "external_sources"("confidence");

-- Create scam_domain_addresses table for domain-to-address mapping
CREATE TABLE IF NOT EXISTS "scam_domain_addresses" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "firstSeenAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_domain_addresses_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "scam_domain_addresses_domainId_addressId_key" ON "scam_domain_addresses"("domainId", "addressId");
CREATE INDEX IF NOT EXISTS "scam_domain_addresses_domainId_idx" ON "scam_domain_addresses"("domainId");
CREATE INDEX IF NOT EXISTS "scam_domain_addresses_addressId_idx" ON "scam_domain_addresses"("addressId");
CREATE INDEX IF NOT EXISTS "scam_domain_addresses_address_idx" ON "scam_domain_addresses"("address");
CREATE INDEX IF NOT EXISTS "scam_domain_addresses_isPrimary_idx" ON "scam_domain_addresses"("isPrimary");

-- Add index to scam_domains
CREATE INDEX IF NOT EXISTS "scam_domains_category_idx" ON "scam_domains"("category");

-- Create contract_signatures table
CREATE TABLE IF NOT EXISTS "contract_signatures" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "selector" VARCHAR(10) NOT NULL,
    "functionName" VARCHAR(255),
    "signature" VARCHAR(255),
    "riskLevel" VARCHAR(20),
    "isMalicious" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_signatures_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "contract_signatures_addressId_selector_key" ON "contract_signatures"("addressId", "selector");
CREATE INDEX IF NOT EXISTS "contract_signatures_selector_idx" ON "contract_signatures"("selector");
CREATE INDEX IF NOT EXISTS "contract_signatures_addressId_idx" ON "contract_signatures"("addressId");
CREATE INDEX IF NOT EXISTS "contract_signatures_isMalicious_idx" ON "contract_signatures"("isMalicious");

-- Drop user_watchlist table if exists (not needed)
DROP TABLE IF EXISTS "user_watchlist" CASCADE;

-- Add foreign key constraints
ALTER TABLE "scam_domain_addresses" ADD CONSTRAINT "scam_domain_addresses_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "scam_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scam_domain_addresses" ADD CONSTRAINT "scam_domain_addresses_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
