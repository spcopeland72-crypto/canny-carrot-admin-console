import { NextRequest, NextResponse } from 'next/server';
import { businessData } from '@/src/services/dataAccess';
import type { BusinessFormData, BusinessRecord } from '@/src/types';
import { getEffectiveStatus, statusSortOrder } from '@/src/lib/businessStatus';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/businesses - Fetching all businesses from Redis');
    let businesses = await businessData.getAll();
    console.log(`[API] GET /api/businesses - Found ${businesses.length} businesses`);

    // Sort: RENEWAL first, then ACTIVE, then PENDING, then ARCHIVED
    businesses = businesses.sort((a: BusinessRecord, b: BusinessRecord) => {
      const orderA = statusSortOrder(getEffectiveStatus(a as any));
      const orderB = statusSortOrder(getEffectiveStatus(b as any));
      return orderA - orderB;
    });

    // Add cache headers to prevent caching
    return NextResponse.json(
      { success: true, data: businesses },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Error fetching businesses:', error);
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
    const formData: BusinessFormData = await request.json();
    console.log('[API] Creating new business:', formData);
    
    const newBusiness = await businessData.create(formData);
    console.log('[API] ✅ Business created successfully:', newBusiness.profile.id);
    return NextResponse.json({ success: true, data: newBusiness }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating business:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


