import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/src/services/redis';
import type { CustomerRecord } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get customer data from Redis via API server
    // Force fresh read by using cache-busting query param (ignored but ensures no caching)
    const customerKey = REDIS_KEYS.customer(customerId);
    
    // Add small delay if this is a verification read (check for _verify query param)
    const url = new URL(request.url);
    if (url.searchParams.has('_verify')) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for verification reads
    }
    
    const customerData = await redis.get(customerKey);

    if (!customerData) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer: CustomerRecord = JSON.parse(customerData);

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error('[API] Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();
    const updatedCustomer: CustomerRecord = body;

    // Validate customer ID matches
    if (updatedCustomer.profile.id !== customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID mismatch' },
        { status: 400 }
      );
    }

    // Write customer data to Redis via API server
    const customerKey = REDIS_KEYS.customer(customerId);
    const customerDataStr = JSON.stringify(updatedCustomer);
    
    console.log(`[API] Updating customer ${customerId} in Redis via API server`);
    if (updatedCustomer.profile.name) {
      console.log(`[API] Writing name: "${updatedCustomer.profile.name}"`);
    }
    await redis.set(customerKey, customerDataStr);

    // Retry verification with increasing delays to handle Redis propagation and serverless instance isolation
    let verifyData: string | null = null;
    let verified: CustomerRecord | null = null;
    const maxRetries = 10; // Increased from 5 to handle serverless propagation
    const initialDelay = 50; // Start with 50ms
    const maxDelay = 1000; // Cap at 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Exponential backoff: 50ms, 100ms, 150ms, 200ms, 250ms, 300ms, 350ms, 400ms, 500ms, 1000ms
      const delay = Math.min(initialDelay * attempt, maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Force a fresh read by using EXISTS first to ensure key exists, then GET
      const exists = await redis.exists(customerKey);
      if (!exists) {
        console.log(`[API] Verification attempt ${attempt}: Key does not exist yet`);
        continue;
      }
      
      verifyData = await redis.get(customerKey);
      if (verifyData) {
        try {
          verified = JSON.parse(verifyData) as CustomerRecord;
          if (updatedCustomer.profile.name) {
            console.log(`[API] Verification attempt ${attempt}: Read back name: "${verified.profile.name || 'undefined'}" (Expected: "${updatedCustomer.profile.name}")`);
            
            // If names match, verification succeeded
            if (verified.profile.name === updatedCustomer.profile.name) {
              console.log(`[API] ✅ Verification succeeded on attempt ${attempt} after ${delay}ms delay`);
              break;
            }
          } else {
            // No name to verify, just check data exists
            console.log(`[API] ✅ Verification succeeded on attempt ${attempt} - data exists`);
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
        const errorMsg = updatedCustomer.profile.name 
          ? `Failed to verify customer update after ${maxRetries} attempts (total delay: ${maxRetries * (initialDelay + maxDelay) / 2}ms). Expected name: "${updatedCustomer.profile.name}", but read back: "${verified?.profile.name || 'null'}". This indicates the Redis write may not have persisted correctly or there is a serverless instance isolation issue.`
          : `Failed to verify customer update after ${maxRetries} attempts. Data not found after write.`;
        console.error(`[API] ❌ Verification failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    }

    if (!verifyData || !verified) {
      throw new Error('Failed to verify customer update - data not found after write');
    }
    
    console.log(`[API] Successfully updated customer ${customerId}`);

    return NextResponse.json({
      success: true,
      data: verified,
    });
  } catch (error: any) {
    console.error('[API] Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}


