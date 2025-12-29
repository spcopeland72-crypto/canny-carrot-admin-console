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
    console.log(`[API] Writing name: "${updatedBusiness.profile.name}"`);
    await redis.set(businessKey, businessData);

    // Retry verification with increasing delays to handle Redis propagation
    let verifyData: string | null = null;
    let verified: BusinessRecord | null = null;
    const maxRetries = 5;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const delay = 100 * attempt; // 100ms, 200ms, 300ms, 400ms, 500ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      verifyData = await redis.get(businessKey);
      if (verifyData) {
        verified = JSON.parse(verifyData) as BusinessRecord;
        console.log(`[API] Verification attempt ${attempt}: Read back name: "${verified.profile.name}"`);
        
        // If names match, verification succeeded
        if (verified.profile.name === updatedBusiness.profile.name) {
          console.log(`[API] ✅ Verification succeeded on attempt ${attempt}`);
          break;
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`[API] ❌ Verification failed after ${maxRetries} attempts. Expected: "${updatedBusiness.profile.name}", Got: "${verified?.profile.name || 'null'}"`);
        // Throw error - write verification failed
        throw new Error(`Failed to verify business update after ${maxRetries} attempts. Expected name: "${updatedBusiness.profile.name}", but read back: "${verified?.profile.name || 'null'}". This indicates the Redis write may not have persisted correctly.`);
      }
    }

    if (!verifyData || !verified) {
      throw new Error('Failed to verify business update - data not found after write');
    }
    
    // Final check - verify name matches
    if (verified.profile.name !== updatedBusiness.profile.name) {
      throw new Error(`Business update verification failed. Expected name: "${updatedBusiness.profile.name}", but read back: "${verified.profile.name}". Redis write may not have persisted.`);
    }
    
    console.log(`[API] Successfully updated business ${businessId} - verified name: "${verified.profile.name}"`);

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

