/**
 * Utility Functions
 *
 * Common helper functions used across the application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Merge Tailwind CSS classes with clsx
 * Prevents class conflicts and allows conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// ADDRESS UTILITIES
// ============================================

/**
 * Format Ethereum address for display
 * @example formatAddress("0x1234...5678") => "0x1234...5678"
 * @example formatAddress("0x1234567890abcdef1234567890abcdef12345678", 6, 4) => "0x1234...5678"
 */
export function formatAddress(address: string, firstChars: number = 6, lastChars: number = 4): string {
  if (!address || address.length < 10) return address;

  const start = address.slice(0, firstChars);
  const end = address.slice(-lastChars);

  return `${start}...${end}`;
}

/**
 * Validate and normalize Ethereum address to checksum format
 */
export function normalizeAddress(address: string): string {
  const normalized = address.toLowerCase().trim();
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    throw new Error('Invalid address format');
  }
  return normalized;
}

/**
 * Generate address color based on address hash
 * Useful for generating consistent avatars/backgrounds
 */
export function getAddressColor(address: string): string {
  const hash = address.slice(2, 10); // First 4 bytes
  const num = parseInt(hash, 16);

  const hue = num % 360;
  const saturation = 60 + (num % 20); // 60-80%
  const lightness = 45 + (num % 15); // 45-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert string to slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Format number with compact notation (K, M, B, T)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format currency (USD)
 */
export function formatCurrency(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format TVL in millions/billions
 */
export function formatTVL(tvl: number | null | undefined): string {
  if (tvl === null || tvl === undefined) return 'N/A';

  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  }

  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }

  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(2)}K`;
  }

  return `$${tvl.toFixed(2)}`;
}

/**
 * Parse string to number with fallback
 */
export function parseNumber(value: string | undefined | null, fallback: number = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Check if date is recent (within specified hours)
 */
export function isRecent(date: Date | string, hours: number = 24): boolean {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);
  return diffHours <= hours;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ============================================
// COLLECTION UTILITIES
// ============================================

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Group array by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ============================================
// PROMISE UTILITIES
// ============================================

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await delay(waitTime);
      }
    }
  }

  throw lastError;
}

// ============================================
// URL UTILITIES
// ============================================

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Parse URL without throwing
 */
export function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

// ============================================
// ERROR UTILITIES
// ============================================

/**
 * Create standardized error object
 */
export function createError(
  code: string,
  message: string,
  details?: unknown
): { code: string; message: string; details?: unknown } {
  return { code, message, details };
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}
