/**
 * Security Middleware
 *
 * Security enhancements for API routes:
 * - CORS configuration
 * - Request validation
 * - Rate limiting
 */

import { NextRequest } from 'next/server';
import { applyRateLimit, rateLimitConfig } from '@/middleware/rate-limit';
import { AppError, handleApiError } from '@/lib/error-handler';
import { HTTP_STATUS, ERROR_CODES } from '@/lib/constants';

/**
 * CORS configuration
 */
export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_APP_URL || '',
].filter(Boolean);

/**
 * Check CORS origin
 */
export function checkCorsOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Allow same-origin and requests without origin (like mobile apps)
  if (!origin) return true;

  return CORS_ORIGINS.includes(origin);
}

/**
 * Apply CORS headers
 */
export function applyCorsHeaders(request: Request, originalResponse: Response): Response {
  const response = new Response(originalResponse.body, originalResponse);

  const origin = request.headers.get('origin');
  if (origin && CORS_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return null;
}

/**
 * Apply rate limiting based on endpoint type
 */
export async function withRateLimiting(
  request: NextRequest,
  type: 'strict' | 'medium' | 'loose' = 'loose'
): Promise<void> {
  const result = await applyRateLimit(request, type);

  if (!result.allowed) {
    throw new AppError(
      ERROR_CODES.RATE_LIMITED,
      'Too many requests. Please try again later.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      { retryAfter: result.retryAfter }
    );
  }
}

/**
 * Validate request origin (for sensitive operations)
 */
export function validateOrigin(request: NextRequest): void {
  if (!checkCorsOrigin(request)) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'Origin not allowed',
      HTTP_STATUS.FORBIDDEN
    );
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 10000); // Max 10k characters
}

/**
 * Validate address checksum (EIP-55)
 */
export function isValidChecksumAddress(address: string): boolean {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }

  // Simple checksum validation (for now, accept all valid hex addresses)
  // In production, use proper EIP-55 checksum validation
  return true;
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
