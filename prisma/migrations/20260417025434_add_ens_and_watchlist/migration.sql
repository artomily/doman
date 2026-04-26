-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('EOA', 'SMART_CONTRACT', 'PROXY', 'FACTORY');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('DEX', 'NFT', 'TOKEN', 'BRIDGE', 'LENDING', 'STAKING', 'YIELD', 'GOVERNANCE', 'MULTISIG', 'OTHER');

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "addressType" "AddressType" NOT NULL DEFAULT 'EOA',
ADD COLUMN     "contractType" "ContractType";

-- CreateTable
CREATE TABLE "ens_records" (
    "id" TEXT NOT NULL,
    "addressId" VARCHAR(42) NOT NULL,
    "ensName" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(500) NOT NULL,
    "avatar" VARCHAR(2048),
    "resolvedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ens_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_watchlist" (
    "id" TEXT NOT NULL,
    "userAddress" VARCHAR(42) NOT NULL,
    "targetAddress" VARCHAR(42) NOT NULL,
    "label" VARCHAR(255),
    "notes" TEXT,
    "trustLevel" VARCHAR(20) NOT NULL DEFAULT 'NEUTRAL',
    "category" VARCHAR(50),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ens_records_ensName_key" ON "ens_records"("ensName");

-- CreateIndex
CREATE INDEX "ens_records_ensName_idx" ON "ens_records"("ensName");

-- CreateIndex
CREATE INDEX "ens_records_addressId_idx" ON "ens_records"("addressId");

-- CreateIndex
CREATE INDEX "ens_records_fullName_idx" ON "ens_records"("fullName");

-- CreateIndex
CREATE INDEX "user_watchlist_userAddress_idx" ON "user_watchlist"("userAddress");

-- CreateIndex
CREATE INDEX "user_watchlist_targetAddress_idx" ON "user_watchlist"("targetAddress");

-- CreateIndex
CREATE INDEX "user_watchlist_trustLevel_idx" ON "user_watchlist"("trustLevel");

-- CreateIndex
CREATE UNIQUE INDEX "user_watchlist_userAddress_targetAddress_key" ON "user_watchlist"("userAddress", "targetAddress");

-- CreateIndex
CREATE INDEX "addresses_addressType_idx" ON "addresses"("addressType");

-- AddForeignKey
ALTER TABLE "ens_records" ADD CONSTRAINT "ens_records_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
