/**
 * API Response Helpers
 *
 * Standardized response builders for API routes.
 * Ensures consistent response format across all endpoints.
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
import { HTTP_STATUS, ERROR_CODES } from '@/lib/constants';
export { withErrorHandling, AppError } from '@/lib/error-handler';

/**
 * Create a success response
 */
export function apiSuccess<T>(
  data: T,
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    cached?: boolean;
    [key: string]: any; // Allow additional meta properties
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return NextResponse.json(response);
}

/**
 * Create an error response
 */
export function apiError(
  code: string,
  message: string,
  details?: unknown,
  status: number = HTTP_STATUS.BAD_REQUEST
): NextResponse<ApiErrorResponse> {
  const errorObj: {
    code: string;
    message: string;
    details?: unknown;
  } = {
    code,
    message,
  };

  if (details !== undefined) {
    errorObj.details = details;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: errorObj,
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const errors = {
  // Validation errors
  validation: (message: string, details?: unknown) =>
    apiError(ERROR_CODES.INVALID_REQUEST, message, details, HTTP_STATUS.BAD_REQUEST),

  // Not found errors
  notFound: (resource: string = 'Resource') =>
    apiError(ERROR_CODES.NOT_FOUND, `${resource} not found`, undefined, HTTP_STATUS.NOT_FOUND),

  // Address errors
  invalidAddress: (details?: unknown) =>
    apiError(ERROR_CODES.INVALID_ADDRESS, 'Invalid Ethereum address format', details, HTTP_STATUS.BAD_REQUEST),

  addressNotFound: (address: string) =>
    apiError(ERROR_CODES.ADDRESS_NOT_FOUND, `Address ${address} not found`, undefined, HTTP_STATUS.NOT_FOUND),

  // Report errors
  reportNotFound: (id: string) =>
    apiError(ERROR_CODES.REPORT_NOT_FOUND, `Report ${id} not found`, undefined, HTTP_STATUS.NOT_FOUND),

  reportAlreadyVoted: () =>
    apiError(ERROR_CODES.REPORT_ALREADY_VOTED, 'You have already voted on this report', undefined, HTTP_STATUS.BAD_REQUEST),

  insufficientReputation: () =>
    apiError(ERROR_CODES.INSUFFICIENT_REPUTATION, 'You need more reputation to vote', undefined, HTTP_STATUS.FORBIDDEN),

  // Scan errors
  scanTimeout: () =>
    apiError(ERROR_CODES.SCAN_TIMEOUT, 'Scan operation timed out', undefined, HTTP_STATUS.REQUEST_TIMEOUT),

  scanFailed: (details?: unknown) =>
    apiError(ERROR_CODES.SCAN_FAILED, 'Contract scan failed', details, HTTP_STATUS.INTERNAL_SERVER_ERROR),

  // Authentication errors
  unauthorized: (message: string = 'Unauthorized') =>
    apiError(ERROR_CODES.UNAUTHORIZED, message, undefined, HTTP_STATUS.UNAUTHORIZED),

  forbidden: (message: string = 'Forbidden') =>
    apiError(ERROR_CODES.FORBIDDEN, message, undefined, HTTP_STATUS.FORBIDDEN),

  // Rate limiting
  rateLimited: (details?: { retryAfter?: number }) =>
    apiError(
      ERROR_CODES.RATE_LIMITED,
      'Too many requests',
      details,
      HTTP_STATUS.TOO_MANY_REQUESTS
    ),

  // Server errors
  internal: (message: string = 'Internal server error', details?: unknown) =>
    apiError(ERROR_CODES.INTERNAL_ERROR, message, details, HTTP_STATUS.INTERNAL_SERVER_ERROR),
};

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((error) => {
    console.error('API Error:', error);

    // Handle AppError (application-level errors with explicit status codes)
    if (error?.name === 'AppError') {
      return apiError(error.code, error.message, error.details, error.statusCode);
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return errors.validation('Resource already exists', { field: error.meta?.target });
    }

    if (error.code === 'P2025') {
      return errors.notFound('Record');
    }

    if (error.code === 'P2000') {
      return errors.validation('Input value too long for field', { field: error.meta?.column_name });
    }

    if (error.code === 'P2003') {
      return errors.validation('Related record not found', { field: error.meta?.field_name });
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return errors.validation('Invalid input format', error.errors);
    }

    // Default error
    return errors.internal(
      process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    );
  });
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  schema: {
    page?: number;
    limit?: number;
    [key: string]: unknown;
  }
): T {
  const params: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    const numValue = Number(value);
    params[key] = isNaN(numValue) ? value : numValue;
  }

  // Apply defaults
  if (schema.page !== undefined && !params.page) {
    params.page = schema.page;
  }
  if (schema.limit !== undefined && !params.limit) {
    params.limit = schema.limit;
  }

  return params as T;
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
