import { NextRequest, NextResponse } from 'next/server';
import { customerData } from '@/src/services/dataAccess';
import type { CustomerFormData } from '@/src/types';

export async function GET() {
  try {
    const customers = await customerData.getAll();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('[API] Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
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


