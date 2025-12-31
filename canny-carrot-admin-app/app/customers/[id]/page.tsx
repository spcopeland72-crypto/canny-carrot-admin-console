'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { CustomerRecord } from '@/src/types';
import AdminLayout from '@/app/components/AdminLayout';
import CustomerDetailForm from '@/app/components/CustomerDetailForm';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/customers/${customerId}`);
        const result = await response.json();
        
        if (result.success) {
          setCustomer(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch customer');
        }
      } catch (error: any) {
        console.error('[Customer Detail] Error loading customer:', error);
        setError(`Failed to load customer: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  const handleSave = async (updatedCustomer: CustomerRecord) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomer(result.data);
        // Optionally navigate back
        // router.push('/');
      } else {
        throw new Error(result.error || 'Failed to update customer');
      }
    } catch (error: any) {
      console.error('[Customer Detail] Error saving customer:', error);
      alert(`Failed to save: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <AdminLayout currentView="Customers">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !customer) {
    return (
      <AdminLayout currentView="Customers">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Customer not found'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentView="Customers">
      <div className="flex-1 overflow-y-auto">
        <CustomerDetailForm
          customer={customer}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
}

