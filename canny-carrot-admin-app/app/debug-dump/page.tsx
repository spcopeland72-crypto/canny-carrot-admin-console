'use client';

import { useState, useEffect } from 'react';

interface DatabaseDump {
  businesses: any[];
  customers: any[];
  timestamp: string;
  businessesCount: number;
  customersCount: number;
}

export default function DebugDumpPage() {
  const [data, setData] = useState<DatabaseDump | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDump = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch businesses and customers in parallel
      const [businessesRes, customersRes] = await Promise.all([
        fetch('/api/businesses?_dump=1', { cache: 'no-store' }),
        fetch('/api/customers?_dump=1', { cache: 'no-store' }),
      ]);

      const businessesData = await businessesRes.json();
      const customersData = await customersRes.json();

      const dump: DatabaseDump = {
        businesses: businessesData.success ? businessesData.data : [],
        customers: customersData.success ? customersData.data : [],
        timestamp: new Date().toISOString(),
        businessesCount: businessesData.success ? businessesData.data?.length || 0 : 0,
        customersCount: customersData.success ? customersData.data?.length || 0 : 0,
      };

      setData(dump);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch database dump');
      console.error('[DebugDump] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDump();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDump();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Database Dump</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Database Dump</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
          <button
            onClick={fetchDump}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Database Dump - Full Redis Contents</h1>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Auto-refresh (5s)</span>
              </label>
              <button
                onClick={fetchDump}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="text-sm text-blue-600 font-semibold mb-1">Businesses</div>
              <div className="text-2xl font-bold text-blue-900">
                {data?.businessesCount || 0}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-sm text-green-600 font-semibold mb-1">Customers</div>
              <div className="text-2xl font-bold text-green-900">
                {data?.customersCount || 0}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Never'}
          </div>
        </div>

        {/* Businesses Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Businesses ({data?.businessesCount || 0})</h2>
          
          {data?.businessesCount === 0 ? (
            <p className="text-gray-500 italic">No businesses found in database</p>
          ) : (
            <div className="space-y-4">
              {data?.businesses.map((business, idx) => (
                <div key={business.profile?.id || idx} className="border border-gray-200 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <div className="text-sm text-gray-500">ID</div>
                      <div className="font-mono text-sm">{business.profile?.id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-semibold">{business.status || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-semibold">{business.profile?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div>{business.profile?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Subscription Tier</div>
                      <div>{business.subscriptionTier || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="text-sm">
                        {business.profile?.createdAt 
                          ? new Date(business.profile.createdAt).toLocaleString() 
                          : business.joinDate 
                          ? new Date(business.joinDate).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      View Full JSON
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(business, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customers Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Customers ({data?.customersCount || 0})</h2>
          
          {data?.customersCount === 0 ? (
            <p className="text-gray-500 italic">No customers found in database</p>
          ) : (
            <div className="space-y-4">
              {data?.customers.map((customer, idx) => (
                <div key={customer.profile?.id || idx} className="border border-gray-200 rounded p-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <div className="text-sm text-gray-500">ID</div>
                      <div className="font-mono text-sm">{customer.profile?.id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-semibold">{customer.status || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-semibold">{customer.profile?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div>{customer.profile?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div>{customer.profile?.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="text-sm">
                        {customer.profile?.createdAt 
                          ? new Date(customer.profile.createdAt).toLocaleString() 
                          : customer.joinDate 
                          ? new Date(customer.joinDate).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      View Full JSON
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(customer, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">How to Compare with UI:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
            <li>Note the counts above: Businesses: {data?.businessesCount || 0}, Customers: {data?.customersCount || 0}</li>
            <li>Go to the main admin page and check what counts are shown there</li>
            <li>Compare the list of IDs and names between this dump and the UI</li>
            <li>If counts differ, check browser console for API errors</li>
            <li>Enable auto-refresh to see if data changes over time</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

