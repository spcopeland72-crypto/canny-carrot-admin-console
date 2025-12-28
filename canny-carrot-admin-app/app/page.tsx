'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { BusinessRecord, CustomerRecord } from '@/src/types';
import AdminLayout, { type ViewType } from './components/AdminLayout';
import { EmailList } from './components/EmailList';
import { EmailToolbar } from './components/EmailToolbar';

export default function Home() {
  const router = useRouter();
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

  // Filter data based on search query
  const filteredData = (currentView === 'Members' ? businesses : customers).filter((item) => {
    if (!searchQuery) return true
    const name = item.profile.name?.toLowerCase() || ''
    const email = item.profile.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  // Convert businesses/customers to EmailList format
  const listItems = filteredData.map((item) => {
    const record = item as BusinessRecord | CustomerRecord;
    return {
      id: record.profile.id,
      senderName: record.profile.name || 'N/A',
      senderEmail: record.profile.email || 'N/A',
      subject: currentView === 'Members' 
        ? (record as BusinessRecord).profile.name 
        : (record as CustomerRecord).profile.name || 'Customer',
      preview: currentView === 'Members'
        ? `Status: ${(record as BusinessRecord).status} | Tier: ${(record as BusinessRecord).subscriptionTier || 'N/A'}`
        : `Status: ${(record as CustomerRecord).status}`,
      date: record.profile.createdAt || record.joinDate || new Date(),
      isRead: record.status !== 'pending',
      isStarred: false,
      hasAttachments: false,
    };
  });

  const handleRefresh = () => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (currentView === 'Members') {
          const response = await fetch('/api/businesses');
          const result = await response.json();
          if (result.success) {
            setBusinesses(result.data || []);
          }
        } else {
          const response = await fetch('/api/customers');
          const result = await response.json();
          if (result.success) {
            setCustomers(result.data || []);
          }
        }
      } catch (error: any) {
        console.error('[Admin] Error refreshing:', error);
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
      totalCount={listItems.length}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      <EmailToolbar
        onRefresh={handleRefresh}
        totalCount={listItems.length}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <EmailList
          items={listItems}
          emptyMessage={
            currentView === 'Members'
              ? 'No businesses found'
              : 'No customers found'
          }
          onItemPress={(item) => {
            if (currentView === 'Members') {
              router.push(`/businesses/${item.id}`);
            } else if (currentView === 'Customers') {
              router.push(`/customers/${item.id}`);
            }
          }}
        />
      )}
    </AdminLayout>
  );
}
