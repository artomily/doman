/**
 * Prisma Client Singleton
 *
 * In development, React Fast Refresh/Hot Module Replacement can create
 * multiple instances of Prisma Client, which leads to database connection
 * pool exhaustion. This singleton pattern ensures only one instance exists.
 *
 * In production, a single Prisma Client instance is reused across
 * serverless function invocations for optimal performance.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 5_000,
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

/**
 * Helper function to disconnect Prisma (useful in tests)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Type-safe Prisma transaction helper
 */
export async function withTransaction<T>(
  callback: (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}
