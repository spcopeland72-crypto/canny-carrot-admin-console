'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BusinessRecord } from '@/src/types';
import AdminLayout from '@/app/components/AdminLayout';
import BusinessDetailForm from '@/app/components/BusinessDetailForm';

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusiness = async () => {
      if (!businessId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/businesses/${businessId}`);
        const result = await response.json();
        
        if (result.success) {
          setBusiness(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch business');
        }
      } catch (error: any) {
        console.error('[Business Detail] Error loading business:', error);
        setError(`Failed to load business: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusiness();
  }, [businessId]);

  const handleSave = async (updatedBusiness: BusinessRecord) => {
    try {
      // TODO: Implement update API endpoint
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBusiness),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBusiness(result.data);
        // Optionally navigate back
        // router.push('/');
      } else {
        throw new Error(result.error || 'Failed to update business');
      }
    } catch (error: any) {
      console.error('[Business Detail] Error saving business:', error);
      alert(`Failed to save: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <AdminLayout currentView="Members">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading business...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !business) {
    return (
      <AdminLayout currentView="Members">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Business not found'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentView="Members">
      <div className="flex-1 overflow-y-auto">
        <BusinessDetailForm
          business={business}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
}

