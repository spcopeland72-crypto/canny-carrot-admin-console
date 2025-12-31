'use client';

import { useState } from 'react';
import type { CustomerRecord, CustomerStatus } from '@/src/types';
import { Button } from '@/src/components/ui/button';

interface CustomerDetailFormProps {
  customer: CustomerRecord;
  onSave: (customer: CustomerRecord) => Promise<void>;
  onCancel: () => void;
}

const categories = [
  'Food & Drink', 'Retail', 'Beauty', 'Services', 'Entertainment', 'Other'
];

export default function CustomerDetailForm({ customer, onSave, onCancel }: CustomerDetailFormProps) {
  const [formData, setFormData] = useState({
    name: customer.profile.name || '',
    email: customer.profile.email || '',
    phone: customer.profile.phone || '',
    dateOfBirth: customer.profile.dateOfBirth || '',
    postcode: customer.profile.postcode || '',
    notifications: customer.profile.preferences?.notifications ?? true,
    emailMarketing: customer.profile.preferences?.emailMarketing ?? false,
    smsMarketing: customer.profile.preferences?.smsMarketing ?? false,
    favouriteCategories: customer.profile.favouriteCategories || [],
    preferredBusinesses: customer.profile.preferredBusinesses || [],
    referralCode: customer.profile.referralCode || '',
    status: customer.status || 'pending' as CustomerStatus,
    joinDate: customer.joinDate || '',
    renewalDate: customer.renewalDate || '',
    onboardingCompleted: customer.onboardingCompleted || false,
    notes: customer.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      favouriteCategories: prev.favouriteCategories.includes(category)
        ? prev.favouriteCategories.filter(c => c !== category)
        : [...prev.favouriteCategories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      alert('Please fill in email');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedCustomer: CustomerRecord = {
        ...customer,
        profile: {
          ...customer.profile,
          name: formData.name || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          postcode: formData.postcode || undefined,
          preferences: {
            notifications: formData.notifications,
            emailMarketing: formData.emailMarketing,
            smsMarketing: formData.smsMarketing,
          },
          favouriteCategories: formData.favouriteCategories,
          preferredBusinesses: formData.preferredBusinesses,
          referralCode: formData.referralCode || undefined,
        },
        status: formData.status,
        joinDate: formData.joinDate,
        renewalDate: formData.renewalDate,
        onboardingCompleted: formData.onboardingCompleted,
        notes: formData.notes,
      };

      await onSave(updatedCustomer);
    } catch (error: any) {
      alert(`Failed to save: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{customer.profile.name || customer.profile.email}</h1>
        <p className="text-sm text-gray-500">Customer ID: {customer.profile.id}</p>
      </div>

      {/* Basic Information */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => updateField('postcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => updateField('notifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Notifications
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.emailMarketing}
              onChange={(e) => updateField('emailMarketing', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Email Marketing
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.smsMarketing}
              onChange={(e) => updateField('smsMarketing', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              SMS Marketing
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Favourite Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formData.favouriteCategories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Referral */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referral Code
          </label>
          <input
            type="text"
            value={formData.referralCode}
            onChange={(e) => updateField('referralCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Status & Lifecycle */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Lifecycle</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as CustomerStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">PENDING</option>
              <option value="active">ACTIVE</option>
              <option value="renewal_due">RENEWAL DUE</option>
              <option value="suspended">SUSPENDED</option>
              <option value="closed">CLOSED</option>
              <option value="exiting">EXITING</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Join Date
            </label>
            <input
              type="date"
              value={formData.joinDate ? formData.joinDate.split('T')[0] : ''}
              onChange={(e) => updateField('joinDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renewal Date
            </label>
            <input
              type="date"
              value={formData.renewalDate ? formData.renewalDate.split('T')[0] : ''}
              onChange={(e) => updateField('renewalDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.onboardingCompleted}
              onChange={(e) => updateField('onboardingCompleted', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Onboarding Completed
            </label>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Admin notes..."
        />
      </section>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

