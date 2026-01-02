'use client';

import { useState, useEffect } from 'react';
import type { BusinessRecord, CustomerRecord } from '@/src/types';
import AdminLayout from '@/app/components/AdminLayout';
import { EmailToolbar } from './components/EmailToolbar';

type ViewType = 'Members' | 'Customers' | 'Apps' | 'Website' | 'Drafts' | 'Archive' | 'Trash';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('Members');
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentView === 'Members') {
          const response = await fetch('/api/businesses', {
            cache: 'no-store',
          });
          const result = await response.json();
          if (result.success) {
            setBusinesses(result.data || []);
            console.log('[Admin] Initial load: businesses:', result.data?.length || 0);
          } else {
            throw new Error(result.error || 'Failed to fetch businesses');
          }
        } else if (currentView === 'Customers') {
          const response = await fetch('/api/customers', {
            cache: 'no-store',
          });
          const result = await response.json();
          if (result.success) {
            setCustomers(result.data || []);
            console.log('[Admin] Initial load: customers:', result.data?.length || 0);
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

  // Filter data based on search query
  const filteredData = (currentView === 'Members' ? businesses : customers).filter((item) => {
    if (!searchQuery) return true
    const name = item.profile.name?.toLowerCase() || ''
    const email = item.profile.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  // Data is ready to render directly - same approach as dump page

  const handleRefresh = () => {
    console.log('[Admin] Refresh button clicked');
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Add cache-busting timestamp to ensure fresh data
        const timestamp = Date.now();
        if (currentView === 'Members') {
          console.log('[Admin] Fetching businesses from API...');
          const response = await fetch(`/api/businesses?_t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          console.log('[Admin] Businesses API response status:', response.status);
          const result = await response.json();
          console.log('[Admin] Businesses API result:', { success: result.success, count: result.data?.length || 0 });
          if (result.success) {
            setBusinesses(result.data || []);
            console.log('[Admin] ✅ Businesses updated:', result.data?.length || 0, 'items');
          } else {
            throw new Error(result.error || 'Failed to fetch businesses');
          }
        } else {
          console.log('[Admin] Fetching customers from API...');
          const response = await fetch(`/api/customers?_t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          console.log('[Admin] Customers API response status:', response.status);
          const result = await response.json();
          console.log('[Admin] Customers API result:', { success: result.success, count: result.data?.length || 0 });
          if (result.success) {
            setCustomers(result.data || []);
            console.log('[Admin] ✅ Customers updated:', result.data?.length || 0, 'items');
          } else {
            throw new Error(result.error || 'Failed to fetch customers');
          }
        }
      } catch (error: any) {
        console.error('[Admin] ❌ Error refreshing:', error);
        setError(`Failed to refresh: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  };

  return (
    <AdminLayout
      currentView={currentView}
      onViewChange={(view) => setCurrentView(view)}
      membersCount={businesses.length}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRefresh={handleRefresh}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <EmailToolbar
        onRefresh={handleRefresh}
        totalCount={filteredData.length}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-500 italic">
            {currentView === 'Members' ? 'No businesses found' : 'No customers found'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentView === 'Members' ? (
            // Render businesses - same approach as dump page
            filteredData.map((business, idx) => {
              const record = business as BusinessRecord;
              return (
                <div 
                  key={record.profile?.id || idx} 
                  className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => console.log('Business clicked:', record.profile?.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900 mb-1">
                        {record.profile?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {record.profile?.email || 'N/A'}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Status: <span className="font-semibold">{record.status || 'N/A'}</span></span>
                        <span>Tier: <span className="font-semibold">{record.subscriptionTier || 'N/A'}</span></span>
                        <span className="font-mono text-xs">{record.profile?.id || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.profile?.createdAt 
                        ? new Date(record.profile.createdAt).toLocaleDateString() 
                        : record.joinDate 
                        ? new Date(record.joinDate).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Render customers - same approach as dump page
            filteredData.map((customer, idx) => {
              const record = customer as CustomerRecord;
              return (
                <div 
                  key={record.profile?.id || idx} 
                  className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => console.log('Customer clicked:', record.profile?.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900 mb-1">
                        {record.profile?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {record.profile?.email || 'N/A'}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Status: <span className="font-semibold">{record.status || 'N/A'}</span></span>
                        {record.profile?.phone && (
                          <span>Phone: {record.profile.phone}</span>
                        )}
                        <span className="font-mono text-xs">{record.profile?.id || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {record.profile?.createdAt 
                        ? new Date(record.profile.createdAt).toLocaleDateString() 
                        : record.joinDate 
                        ? new Date(record.joinDate).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </AdminLayout>
  );
}
