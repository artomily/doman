/**
 * User Profile Endpoint
 * GET /api/v1/leaderboard/[address]
 *
 * Get detailed profile and reputation for a specific user.
 */

import { NextRequest } from 'next/server';
import { apiSuccess, errors, withErrorHandler } from '@/lib/api-response';
import { getUserProfile, upsertUserProfile } from '@/services/leaderboard-service';
import { addressSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address } = await params;

    // Validate address format
    const validationResult = addressSchema.safeParse(address);
    if (!validationResult.success) {
      return errors.validation('Invalid address format', validationResult.error.errors);
    }

    const profile = await getUserProfile(address);

    if (!profile) {
      return errors.notFound('User profile not found');
    }

    return apiSuccess(profile);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  return withErrorHandler(async () => {
    const { address } = await params;

    // Validate address format
    const validationResult = addressSchema.safeParse(address);
    if (!validationResult.success) {
      return errors.validation('Invalid address format', validationResult.error.errors);
    }

    const body = await request.json();

    // Update profile
    const profile = await upsertUserProfile({
      address,
      ensName: body.ensName,
    });

    return apiSuccess(profile, {
      message: 'Profile updated successfully',
    });
  });
}
