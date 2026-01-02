import { NextRequest, NextResponse } from 'next/server';
import { customerData } from '@/src/services/dataAccess';
import type { CustomerFormData } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await customerData.getById(params.id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    console.error('[API] Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData: Partial<CustomerFormData> = await request.json();
    console.log(`[API] Updating customer ${params.id}:`, formData);
    
    const updated = await customerData.update(params.id, formData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] ✅ Customer updated successfully: ${params.id}`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API] Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await customerData.delete(params.id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error('[API] Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

