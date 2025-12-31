import { NextResponse } from 'next/server';
import { redis } from '@/src/services/redis';

/**
 * Test harness: Scan all Redis keys and read their values
 * Matches the actual database structure - no dependency on SETs
 */
export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      categories: {}
    };

    // Scan all keys by pattern to match database structure
    const patterns = [
      'business:*',
      'businesses:*',
      'customer:*',
      'customers:*',
      'signup:*',
      'signups:*',
      'pending:*',
      'email:*',
      'stats:*',
      'test:*'
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      const category = pattern.replace(':*', '');
      
      if (!results.categories[category]) {
        results.categories[category] = {
          keys: [],
          records: [],
          sets: [],
          lists: [],
          strings: []
        };
      }

      // Read each key to determine its type and value
      for (const key of keys) {
        // Skip nested keys (like business:123:rewards) for now - focus on top-level
        if (key.split(':').length > 2 && !key.includes(':all') && !key.includes(':email:')) {
          continue;
        }

        try {
          // Try to determine key type by attempting different reads
          const value = await redis.get(key);
          
          if (value !== null) {
            // It's a string value - try to parse as JSON
            try {
              const parsed = JSON.parse(value);
              if (parsed.profile || parsed.id) {
                // It's a business/customer record
                results.categories[category].records.push({
                  key,
                  type: 'record',
                  id: parsed.profile?.id || parsed.id,
                  name: parsed.profile?.name || 'N/A',
                  email: parsed.profile?.email || 'N/A',
                  status: parsed.status || 'N/A',
                  data: parsed
                });
              } else {
                // It's a string value
                results.categories[category].strings.push({
                  key,
                  type: 'string',
                  value: value.length > 200 ? value.substring(0, 200) + '...' : value
                });
              }
            } catch {
              // Not JSON, just a string
              results.categories[category].strings.push({
                key,
                type: 'string',
                value: value.length > 200 ? value.substring(0, 200) + '...' : value
              });
            }
          } else {
            // Might be a SET or LIST
            try {
              const members = await redis.smembers(key);
              if (members.length > 0) {
                results.categories[category].sets.push({
                  key,
                  type: 'set',
                  memberCount: members.length,
                  members: members.slice(0, 10) // First 10 members
                });
              }
            } catch {
              // Not a set, might be a list or other type
              results.categories[category].keys.push({
                key,
                type: 'unknown',
                note: 'Could not determine type'
              });
            }
          }
        } catch (error: any) {
          results.categories[category].keys.push({
            key,
            type: 'error',
            error: error.message
          });
        }
      }
    }

    // Summary statistics
    results.summary = {
      totalCategories: Object.keys(results.categories).length,
      totalRecords: Object.values(results.categories).reduce((sum: number, cat: any) => sum + cat.records.length, 0),
      totalSets: Object.values(results.categories).reduce((sum: number, cat: any) => sum + cat.sets.length, 0),
      totalStrings: Object.values(results.categories).reduce((sum: number, cat: any) => sum + cat.strings.length, 0),
    };

    // Business-specific analysis
    if (results.categories.business) {
      results.businessAnalysis = {
        totalRecords: results.categories.business.records.length,
        recordsInSet: 0, // Will calculate below
        recordsNotInSet: [],
        setMembers: []
      };

      // Check businesses:all set
      const businessesAllSet = results.categories.businesses?.sets.find((s: any) => s.key === 'businesses:all');
      if (businessesAllSet) {
        results.businessAnalysis.setMembers = businessesAllSet.members;
        results.businessAnalysis.recordsInSet = businessesAllSet.memberCount;

        // Find records not in set
        const setMemberIds = new Set(businessesAllSet.members);
        results.businessAnalysis.recordsNotInSet = results.categories.business.records.filter((r: any) => {
          const id = r.key.replace('business:', '');
          return !setMemberIds.has(id);
        }).map((r: any) => ({
          id: r.id,
          name: r.name,
          key: r.key,
          status: r.status
        }));
      }
    }

    // Customer-specific analysis
    if (results.categories.customer) {
      results.customerAnalysis = {
        totalRecords: results.categories.customer.records.length,
        recordsInSet: 0,
        recordsNotInSet: [],
        setMembers: []
      };

      const customersAllSet = results.categories.customers?.sets.find((s: any) => s.key === 'customers:all');
      if (customersAllSet) {
        results.customerAnalysis.setMembers = customersAllSet.members;
        results.customerAnalysis.recordsInSet = customersAllSet.memberCount;

        const setMemberIds = new Set(customersAllSet.members);
        results.customerAnalysis.recordsNotInSet = results.categories.customer.records.filter((r: any) => {
          const id = r.key.replace('customer:', '');
          return !setMemberIds.has(id);
        }).map((r: any) => ({
          id: r.id,
          name: r.name,
          key: r.key,
          status: r.status
        }));
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error: any) {
    console.error('[Debug Scan] Error scanning Redis:', error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

