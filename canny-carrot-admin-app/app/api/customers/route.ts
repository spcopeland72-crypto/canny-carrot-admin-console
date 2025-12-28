import { NextResponse } from 'next/server';
import { customerData } from '@/src/services/dataAccess';

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

