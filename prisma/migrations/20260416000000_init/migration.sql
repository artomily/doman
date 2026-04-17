-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "name" VARCHAR(255),
    "chain" VARCHAR(50) NOT NULL DEFAULT 'base',
    "status" VARCHAR(10) NOT NULL DEFAULT 'UNKNOWN',
    "riskScore" SMALLINT NOT NULL DEFAULT 0,
    "category" VARCHAR(15) NOT NULL DEFAULT 'OTHER',
    "source" VARCHAR(10) NOT NULL DEFAULT 'SEED',
    "description" TEXT,
    "url" VARCHAR(2048),
    "logoUrl" VARCHAR(2048),
    "tvl" DECIMAL(20,2),
    "verifiedBy" VARCHAR(42),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "reporterAddress" VARCHAR(42) NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceUrl" VARCHAR(2048),
    "category" VARCHAR(15) NOT NULL DEFAULT 'OTHER',
    "status" VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    "votesFor" INTEGER NOT NULL DEFAULT 0,
    "votesAgainst" INTEGER NOT NULL DEFAULT 0,
    "txHash" VARCHAR(66) UNIQUE,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "voterAddress" VARCHAR(42) NOT NULL,
    "vote" VARCHAR(5) NOT NULL,
    "txHash" VARCHAR(66) UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_scans" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "bytecodeHash" VARCHAR(66),
    "riskScore" SMALLINT NOT NULL,
    "riskLevel" VARCHAR(10) NOT NULL,
    "patterns" JSONB NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "scannerVersion" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "scanDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_tags" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "tag" VARCHAR(100) NOT NULL,
    "taggedBy" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "address_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_sources" (
    "id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "sourceId" VARCHAR(255),
    "sourceUrl" VARCHAR(2048),
    "rawData" JSONB,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "recordsAdded" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "ensName" VARCHAR(255),
    "reportsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "reportsVerified" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addresses_address_key" ON "addresses"("address");

-- CreateIndex
CREATE INDEX "addresses_status_idx" ON "addresses"("status");

-- CreateIndex
CREATE INDEX "addresses_category_idx" ON "addresses"("category");

-- CreateIndex
CREATE INDEX "addresses_riskScore_idx" ON "addresses"("riskScore");

-- CreateIndex
CREATE INDEX "addresses_source_idx" ON "addresses"("source");

-- CreateIndex
CREATE INDEX "addresses_chain_idx" ON "addresses"("chain");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_reporterAddress_idx" ON "reports"("reporterAddress");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "reports_addressId_idx" ON "reports"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_reportId_voterAddress_key" ON "votes"("reportId", "voterAddress");

-- CreateIndex
CREATE INDEX "votes_voterAddress_idx" ON "votes"("voterAddress");

-- CreateIndex
CREATE INDEX "contract_scans_riskLevel_idx" ON "contract_scans"("riskLevel");

-- CreateIndex
CREATE INDEX "contract_scans_createdAt_idx" ON "contract_scans"("createdAt");

-- CreateIndex
CREATE INDEX "contract_scans_addressId_idx" ON "contract_scans"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "address_tags_addressId_tag_key" ON "address_tags"("addressId", "tag");

-- CreateIndex
CREATE INDEX "address_tags_tag_idx" ON "address_tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "external_sources_addressId_source_sourceId_key" ON "external_sources"("addressId", "source", "sourceId");

-- CreateIndex
CREATE INDEX "external_sources_source_idx" ON "external_sources"("source");

-- CreateIndex
CREATE INDEX "sync_logs_source_idx" ON "sync_logs"("source");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_idx" ON "sync_logs"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_address_key" ON "user_profiles"("address");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_scans" ADD CONSTRAINT "contract_scans_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_tags" ADD CONSTRAINT "address_tags_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_sources" ADD CONSTRAINT "external_sources_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
