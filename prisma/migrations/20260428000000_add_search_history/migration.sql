-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "checkerAddress" VARCHAR(42),
    "searchType" VARCHAR(20) NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "resolvedTo" VARCHAR(500),
    "riskScore" SMALLINT NOT NULL DEFAULT 0,
    "riskLevel" VARCHAR(20) NOT NULL DEFAULT 'LOW',
    "result" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_history_checkerAddress_idx" ON "search_history"("checkerAddress");

-- CreateIndex
CREATE INDEX "search_history_searchType_idx" ON "search_history"("searchType");

-- CreateIndex
CREATE INDEX "search_history_createdAt_idx" ON "search_history"("createdAt");

-- CreateIndex
CREATE INDEX "search_history_checkerAddress_createdAt_idx" ON "search_history"("checkerAddress", "createdAt");
