import { NextRequest, NextResponse } from 'next/server';
import { businessData } from '@/src/services/dataAccess';
import type { BusinessFormData } from '@/src/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const business = await businessData.getById(params.id);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: business });
  } catch (error: any) {
    console.error('[API] Error fetching business:', error);
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
    const formData: Partial<BusinessFormData> = await request.json();
    console.log(`[API] Updating business ${params.id}:`, formData);
    
    const updated = await businessData.update(params.id, formData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] ✅ Business updated successfully: ${params.id}`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API] Error updating business:', error);
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
    const deleted = await businessData.delete(params.id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error('[API] Error deleting business:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

