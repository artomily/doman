/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiting for API endpoints.
 * For production, use Upstash Redis or Vercel KV for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // First request or window expired
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Within window, check limit
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  // For authenticated requests, could use user ID instead
  // For now, use IP address
  return ip;
}

/**
 * Rate limit configuration for different endpoint types
 */
export const rateLimitConfig = {
  // Strict limits for write operations
  strict: {
    requests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Medium limits for expensive read operations
  medium: {
    requests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  // Loose limits for cheap read operations
  loose: {
    requests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: Request,
  config: keyof typeof rateLimitConfig = 'loose'
): Promise<{ allowed: boolean } & { retryAfter?: number }> {
  const identifier = getRateLimitIdentifier(request);
  const { requests, windowMs } = rateLimitConfig[config];

  const result = checkRateLimit(identifier, requests, windowMs);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Middleware-style rate limiter for Next.js route handlers
 */
export function withRateLimit(config: keyof typeof rateLimitConfig = 'loose') {
  return async (request: Request) => {
    const result = await applyRateLimit(request, config);

    if (!result.allowed) {
      return {
        allowed: false,
        retryAfter: result.retryAfter,
      };
    }

    return { allowed: true };
  };
}
