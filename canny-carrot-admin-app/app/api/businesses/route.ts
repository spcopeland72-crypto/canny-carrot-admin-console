import { NextResponse } from 'next/server';
import { businessData } from '@/src/services/dataAccess';

export async function GET() {
  try {
    const businesses = await businessData.getAll();
    return NextResponse.json({ success: true, data: businesses });
  } catch (error: any) {
    console.error('[API] Error fetching businesses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

