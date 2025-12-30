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
    // Force fresh read by using cache-busting query param (ignored but ensures no caching)
    const businessKey = REDIS_KEYS.business(businessId);
    
    // Add small delay if this is a verification read (check for _verify query param)
    const url = new URL(request.url);
    if (url.searchParams.has('_verify')) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for verification reads
    }
    
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

    // Retry verification with increasing delays to handle Redis propagation and serverless instance isolation
    let verifyData: string | null = null;
    let verified: BusinessRecord | null = null;
    const maxRetries = 10; // Increased from 5 to handle serverless propagation
    const initialDelay = 50; // Start with 50ms
    const maxDelay = 1000; // Cap at 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Exponential backoff: 50ms, 100ms, 150ms, 200ms, 250ms, 300ms, 350ms, 400ms, 500ms, 1000ms
      const delay = Math.min(initialDelay * attempt, maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Force a fresh read by using EXISTS first to ensure key exists, then GET
      const exists = await redis.exists(businessKey);
      if (!exists) {
        console.log(`[API] Verification attempt ${attempt}: Key does not exist yet`);
        continue;
      }
      
      verifyData = await redis.get(businessKey);
      if (verifyData) {
        try {
          verified = JSON.parse(verifyData) as BusinessRecord;
          console.log(`[API] Verification attempt ${attempt}: Read back name: "${verified.profile.name}" (Expected: "${updatedBusiness.profile.name}")`);
          
          // If names match, verification succeeded
          if (verified.profile.name === updatedBusiness.profile.name) {
            console.log(`[API] ✅ Verification succeeded on attempt ${attempt} after ${delay}ms delay`);
            break;
          }
        } catch (parseError) {
          console.error(`[API] Verification attempt ${attempt}: Failed to parse JSON:`, parseError);
          continue;
        }
      } else {
        console.log(`[API] Verification attempt ${attempt}: Data is null`);
      }
      
      if (attempt === maxRetries) {
        const errorMsg = `Failed to verify business update after ${maxRetries} attempts (total delay: ${maxRetries * (initialDelay + maxDelay) / 2}ms). Expected name: "${updatedBusiness.profile.name}", but read back: "${verified?.profile.name || 'null'}". This indicates the Redis write may not have persisted correctly or there is a serverless instance isolation issue.`;
        console.error(`[API] ❌ Verification failed: ${errorMsg}`);
        // Throw error - write verification failed
        throw new Error(errorMsg);
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

