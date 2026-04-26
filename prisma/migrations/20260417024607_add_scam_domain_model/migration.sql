/*
  Warnings:

  - The `status` column on the `addresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `addresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `source` column on the `addresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `riskLevel` on the `contract_scans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vote` on the `votes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AddressStatus" AS ENUM ('LEGIT', 'SCAM', 'SUSPICIOUS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AddressCategory" AS ENUM ('DEFI', 'NFT', 'BRIDGE', 'DEX', 'LENDING', 'PHISHING', 'DRAINER', 'AIRDROP_SCAM', 'RUGPULL', 'IMPOSTER', 'OTHER');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('COMMUNITY', 'SCANNER', 'EXTERNAL', 'SEED', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('FOR', 'AGAINST');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "address_tags" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "status",
ADD COLUMN     "status" "AddressStatus" NOT NULL DEFAULT 'UNKNOWN',
DROP COLUMN "category",
ADD COLUMN     "category" "AddressCategory" NOT NULL DEFAULT 'OTHER',
DROP COLUMN "source",
ADD COLUMN     "source" "DataSource" NOT NULL DEFAULT 'SEED',
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "contract_scans" DROP COLUMN "riskLevel",
ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "external_sources" ALTER COLUMN "syncedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "category",
ADD COLUMN     "category" "AddressCategory" NOT NULL DEFAULT 'OTHER',
DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "sync_logs" ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "vote",
ADD COLUMN     "vote" "VoteType" NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "scam_domains" (
    "id" TEXT NOT NULL,
    "domain" VARCHAR(500) NOT NULL,
    "name" VARCHAR(255),
    "category" VARCHAR(50) NOT NULL DEFAULT 'PHISHING',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "source" VARCHAR(50) NOT NULL DEFAULT 'scamsniffer',
    "description" TEXT,
    "riskScore" SMALLINT NOT NULL DEFAULT 80,
    "rawData" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "scam_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scam_domains_domain_key" ON "scam_domains"("domain");

-- CreateIndex
CREATE INDEX "scam_domains_domain_idx" ON "scam_domains"("domain");

-- CreateIndex
CREATE INDEX "scam_domains_status_idx" ON "scam_domains"("status");

-- CreateIndex
CREATE INDEX "scam_domains_source_idx" ON "scam_domains"("source");

-- CreateIndex
CREATE INDEX "scam_domains_riskScore_idx" ON "scam_domains"("riskScore");

-- CreateIndex
CREATE INDEX "addresses_status_idx" ON "addresses"("status");

-- CreateIndex
CREATE INDEX "addresses_category_idx" ON "addresses"("category");

-- CreateIndex
CREATE INDEX "addresses_source_idx" ON "addresses"("source");

-- CreateIndex
CREATE INDEX "addresses_source_chain_status_idx" ON "addresses"("source", "chain", "status");

-- CreateIndex
CREATE INDEX "addresses_status_riskScore_idx" ON "addresses"("status", "riskScore");

-- CreateIndex
CREATE INDEX "contract_scans_riskLevel_idx" ON "contract_scans"("riskLevel");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_reporterAddress_status_createdAt_idx" ON "reports"("reporterAddress", "status", "createdAt");

-- CreateIndex
CREATE INDEX "reports_status_votesFor_votesAgainst_idx" ON "reports"("status", "votesFor", "votesAgainst");

-- CreateIndex
CREATE INDEX "user_profiles_reputation_idx" ON "user_profiles"("reputation");

-- CreateIndex
CREATE INDEX "user_profiles_reportsSubmitted_idx" ON "user_profiles"("reportsSubmitted");

-- CreateIndex
CREATE INDEX "user_profiles_reportsVerified_idx" ON "user_profiles"("reportsVerified");
