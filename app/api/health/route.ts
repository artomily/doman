/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Simple endpoint to check API and database health.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors } from '@/lib/api-response';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational',
      },
      version: '1.0.0',
    });
  } catch (error) {
    return errors.internal('Health check failed', {
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
