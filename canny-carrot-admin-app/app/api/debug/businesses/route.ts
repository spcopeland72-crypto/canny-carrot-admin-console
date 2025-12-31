import { NextResponse } from 'next/server';
import { redis, REDIS_KEYS } from '@/src/services/redis';

/**
 * Diagnostic endpoint to compare business records
 * Shows what's in businesses:all SET vs what business keys actually exist
 */
export async function GET() {
  try {
    // Get all business IDs from the SET
    const setBusinessIds = await redis.smembers(REDIS_KEYS.businessList());
    
    // Get all business keys directly using pattern scan
    const allBusinessKeys = await redis.keys('business:*');
    // Filter out non-record keys (like business:email:*, business:123:rewards, etc.)
    const businessRecordKeys = allBusinessKeys.filter(key => {
      // Match pattern: business:business_* (timestamp-based IDs)
      // Exclude: business:email:*, business:*:rewards, business:*:campaigns, businesses:all, etc.
      return /^business:business_\d+/.test(key) && 
             !key.includes(':email:') && 
             !key.includes(':rewards') && 
             !key.includes(':campaigns') &&
             !key.includes(':customers');
    });
    
    // Extract IDs from keys
    const actualBusinessIds = businessRecordKeys.map(key => key.replace('business:', ''));
    
    // Get records for comparison
    const setRecords: any[] = [];
    const actualRecords: any[] = [];
    
    // Records from SET
    for (const id of setBusinessIds) {
      const key = REDIS_KEYS.business(id);
      const data = await redis.get(key);
      if (data) {
        try {
          const record = JSON.parse(data);
          setRecords.push({
            id,
            key,
            name: record.profile?.name || 'N/A',
            email: record.profile?.email || 'N/A',
            status: record.status || 'N/A',
            inSet: true,
            record: record
          });
        } catch (e) {
          setRecords.push({ id, key, error: 'Parse error', inSet: true });
        }
      }
    }
    
    // Records from direct key scan
    for (const key of businessRecordKeys) {
      const id = key.replace('business:', '');
      if (!setBusinessIds.includes(id)) {
        const data = await redis.get(key);
        if (data) {
          try {
            const record = JSON.parse(data);
            actualRecords.push({
              id,
              key,
              name: record.profile?.name || 'N/A',
              email: record.profile?.email || 'N/A',
              status: record.status || 'N/A',
              inSet: false,
              record: record
            });
          } catch (e) {
            actualRecords.push({ id, key, error: 'Parse error', inSet: false });
          }
        }
      }
    }
    
    // Find "Clare's cakes" and "test" records
    const claresCakes = [...setRecords, ...actualRecords].find(r => 
      r.name?.toLowerCase().includes("clare") || r.name?.toLowerCase().includes("cakes")
    );
    const testRecord = [...setRecords, ...actualRecords].find(r => 
      r.name?.toLowerCase() === "test"
    );
    
    return NextResponse.json({
      success: true,
      summary: {
        inSet: setBusinessIds.length,
        actualKeys: businessRecordKeys.length,
        missingFromSet: actualRecords.length,
        totalFound: setRecords.length + actualRecords.length
      },
      inSet: setRecords,
      missingFromSet: actualRecords,
      comparison: {
        claresCakes: claresCakes ? {
          id: claresCakes.id,
          name: claresCakes.name,
          inSet: claresCakes.inSet,
          keyFormat: claresCakes.key,
          idFormat: claresCakes.id,
          structure: {
            hasProfile: !!claresCakes.record?.profile,
            profileKeys: claresCakes.record?.profile ? Object.keys(claresCakes.record.profile) : [],
            topLevelKeys: Object.keys(claresCakes.record || {})
          }
        } : null,
        testRecord: testRecord ? {
          id: testRecord.id,
          name: testRecord.name,
          inSet: testRecord.inSet,
          keyFormat: testRecord.key,
          idFormat: testRecord.id,
          structure: {
            hasProfile: !!testRecord.record?.profile,
            profileKeys: testRecord.record?.profile ? Object.keys(testRecord.record.profile) : [],
            topLevelKeys: Object.keys(testRecord.record || {})
          }
        } : null,
        otherRecords: actualRecords.slice(0, 3).map(r => ({
          id: r.id,
          name: r.name,
          inSet: r.inSet,
          keyFormat: r.key,
          idFormat: r.id,
          structure: {
            hasProfile: !!r.record?.profile,
            profileKeys: r.record?.profile ? Object.keys(r.record.profile) : [],
            topLevelKeys: Object.keys(r.record || {})
          }
        }))
      }
    });
  } catch (error: any) {
    console.error('[Debug] Error comparing businesses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

