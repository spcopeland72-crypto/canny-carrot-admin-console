import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/src/services/redis';
import type { BusinessRecord } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;

    // Get business data from Redis
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

