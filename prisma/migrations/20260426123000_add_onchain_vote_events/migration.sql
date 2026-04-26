DO $$
BEGIN
    CREATE TYPE "TargetType" AS ENUM ('ADDRESS', 'ENS', 'DOMAIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "onchain_vote_events" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" VARCHAR(42) NOT NULL,
    "txHash" VARCHAR(66) NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockTimestamp" TIMESTAMPTZ(6),
    "reporterAddress" VARCHAR(42) NOT NULL,
    "targetId" VARCHAR(66) NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "reasonHash" VARCHAR(66) NOT NULL,
    "isScam" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onchain_vote_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "onchain_vote_events_txHash_logIndex_key"
ON "onchain_vote_events"("txHash", "logIndex");

CREATE INDEX IF NOT EXISTS "onchain_vote_events_chainId_blockNumber_idx"
ON "onchain_vote_events"("chainId", "blockNumber");

CREATE INDEX IF NOT EXISTS "onchain_vote_events_targetId_targetType_idx"
ON "onchain_vote_events"("targetId", "targetType");

CREATE INDEX IF NOT EXISTS "onchain_vote_events_reporterAddress_idx"
ON "onchain_vote_events"("reporterAddress");

CREATE INDEX IF NOT EXISTS "onchain_vote_events_reasonHash_idx"
ON "onchain_vote_events"("reasonHash");
