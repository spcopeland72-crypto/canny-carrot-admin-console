import { NextRequest, NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/src/services/redis';
import type { CustomerRecord } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get customer data directly from Redis
    const customerKey = REDIS_KEYS.customer(customerId);
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

    // Write customer data directly to Redis
    const customerKey = REDIS_KEYS.customer(customerId);
    const customerDataStr = JSON.stringify(updatedCustomer);
    
    console.log(`[Admin] Updating customer ${customerId} in Redis`);
    if (updatedCustomer.profile.name) {
      console.log(`[Admin] Writing name: "${updatedCustomer.profile.name}"`);
    }
    await redis.set(customerKey, customerDataStr);

    // Verify write immediately - should work first time with direct Redis connection
    const verifyData = await redis.get(customerKey);
    if (!verifyData) {
      throw new Error('Failed to verify customer update - data not found after write');
    }
    
    const verified = JSON.parse(verifyData) as CustomerRecord;
    
    // Verify name matches if name was provided
    if (updatedCustomer.profile.name && verified.profile.name !== updatedCustomer.profile.name) {
      throw new Error(`Customer update verification failed. Expected name: "${updatedCustomer.profile.name}", but read back: "${verified.profile.name}".`);
    }
    
    console.log(`[Admin] ✅ Successfully updated customer ${customerId}`);

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


