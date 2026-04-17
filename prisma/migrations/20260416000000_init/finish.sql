-- Migration tracking table for Prisma
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" SERIAL PRIMARY KEY,
    "checksum" VARCHAR(64),
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Record this migration
INSERT INTO "_prisma_migrations" ("checksum", "migration_name", "started_at")
VALUES ('', '20260416000000_init', CURRENT_TIMESTAMP);
