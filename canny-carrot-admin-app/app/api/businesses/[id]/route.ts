import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/src/services/redis';
import type { BusinessRecord } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;

    // Get business data from Redis via API server
    const businessKey = REDIS_KEYS.business(businessId);
    const businessData = await redis.get(businessKey);

    if (!businessData) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const business: BusinessRecord = JSON.parse(businessData);

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error: any) {
    console.error('[API] Error fetching business:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch business' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;
    const body = await request.json();
    const updatedBusiness: BusinessRecord = body;

    // Validate business ID matches
    if (updatedBusiness.profile.id !== businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID mismatch' },
        { status: 400 }
      );
    }

    // Write business data to Redis via API server
    const businessKey = REDIS_KEYS.business(businessId);
    const businessData = JSON.stringify(updatedBusiness);
    
    console.log(`[API] Updating business ${businessId} in Redis via API server`);
    await redis.set(businessKey, businessData);

    // Verify the write succeeded by reading it back
    const verifyData = await redis.get(businessKey);
    if (!verifyData) {
      throw new Error('Failed to verify business update - data not found after write');
    }

    const verified: BusinessRecord = JSON.parse(verifyData);
    console.log(`[API] Successfully updated business ${businessId}`);

    return NextResponse.json({
      success: true,
      data: verified,
    });
  } catch (error: any) {
    console.error('[API] Error updating business:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update business' },
      { status: 500 }
    );
  }
}

