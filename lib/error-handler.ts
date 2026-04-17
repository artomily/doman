/**
 * Error Handler Middleware
 *
 * Centralized error handling for API routes.
 * Provides consistent error responses and logging.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HTTP_STATUS, ERROR_CODES } from '@/lib/constants';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Application Error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = HTTP_STATUS.BAD_REQUEST,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('[API Error]:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INVALID_REQUEST,
          message: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        },
      },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    const errorResponse: {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    } = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details !== undefined) {
      errorResponse.error.details = error.details;
    }

    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_REQUEST,
            message: 'Resource already exists',
            details: { field: prismaError.meta?.target },
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'Record not found',
          },
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Foreign key constraint failed',
          },
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
  }

  // Generic internal server error
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error ? error.message : 'Unknown error'
            : 'An unexpected error occurred',
      },
    },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling<T>(
  handler: (request: Request) => Promise<NextResponse>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
