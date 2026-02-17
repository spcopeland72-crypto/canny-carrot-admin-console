import { NextRequest, NextResponse } from 'next/server';
import { customerData } from '@/src/services/dataAccess';
import type { CustomerFormData } from '@/src/types';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/customers - Fetching all customers from Redis');
    const customers = await customerData.getAll();
    console.log(`[API] GET /api/customers - Found ${customers.length} customers`);
    
    // Add cache headers to prevent caching
    return NextResponse.json(
      { success: true, data: customers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: CustomerFormData = await request.json();
    console.log('[API] Creating new customer:', formData);
    
    const newCustomer = await customerData.create(formData);
    console.log('[API] ✅ Customer created successfully:', newCustomer.profile.id);
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


