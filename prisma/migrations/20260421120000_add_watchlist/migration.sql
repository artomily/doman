-- CreateTable: watchlists
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "userAddress" VARCHAR(42) NOT NULL,
    "addressId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for watchlists
CREATE UNIQUE INDEX "watchlists_userAddress_addressId_key" ON "watchlists"("userAddress", "addressId");
CREATE INDEX "watchlists_userAddress_idx" ON "watchlists"("userAddress");

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
