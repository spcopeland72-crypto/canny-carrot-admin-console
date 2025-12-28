'use client';

import { useState, useEffect } from 'react';
import type { BusinessRecord, CustomerRecord } from '@/src/types';

type ViewType = 'Members' | 'Customers';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('Members');
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentView === 'Members') {
          const response = await fetch('/api/businesses');
          const result = await response.json();
          if (result.success) {
            setBusinesses(result.data || []);
          } else {
            throw new Error(result.error || 'Failed to fetch businesses');
          }
        } else if (currentView === 'Customers') {
          const response = await fetch('/api/customers');
          const result = await response.json();
          if (result.success) {
            setCustomers(result.data || []);
          } else {
            throw new Error(result.error || 'Failed to fetch customers');
          }
        }
      } catch (error: any) {
        console.error('[Admin] Error loading data:', error);
        setError(`Failed to load data: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Canny Carrot Admin</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('Members')}
                className={`px-4 py-2 rounded ${
                  currentView === 'Members'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setCurrentView('Customers')}
                className={`px-4 py-2 rounded ${
                  currentView === 'Customers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Customers
              </button>
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentView === 'Members' && businesses.map((business) => (
                  <tr key={business.profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {business.profile.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.profile.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.status}
                    </td>
                  </tr>
                ))}
                {currentView === 'Customers' && customers.map((customer) => (
                  <tr key={customer.profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.profile.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.profile.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {currentView === 'Members' && businesses.length === 0 && (
              <div className="text-center py-12 text-gray-500">No businesses found</div>
            )}
            {currentView === 'Customers' && customers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No customers found</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

