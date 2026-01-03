'use client';

import { useState } from 'react';
import type { BusinessRecord, CustomerRecord, CustomerStatus } from '@/src/types';

interface RecordDetailPaneProps {
  record: BusinessRecord | CustomerRecord;
  type: 'member' | 'customer';
  onBack: () => void;
}

const categories = [
  'Food & Drink', 'Retail', 'Beauty', 'Services', 'Entertainment', 'Other'
];

export const RecordDetailPane: React.FC<RecordDetailPaneProps> = ({ record, type, onBack }) => {
  const isMember = type === 'member';
  const memberRecord = isMember ? (record as BusinessRecord) : null;
  const customerRecord = !isMember ? (record as CustomerRecord) : null;
  
  const [formData, setFormData] = useState({
    name: record.profile.name || '',
    email: record.profile.email || '',
    phone: record.profile.phone || '',
    dateOfBirth: customerRecord?.profile.dateOfBirth || '',
    postcode: record.profile.postcode || '',
    notifications: customerRecord?.profile.preferences?.notifications ?? true,
    emailMarketing: customerRecord?.profile.preferences?.emailMarketing ?? false,
    smsMarketing: customerRecord?.profile.preferences?.smsMarketing ?? false,
    favouriteCategories: customerRecord?.profile.favouriteCategories || [],
    referralCode: customerRecord?.profile.referralCode || '',
    status: record.status,
    joinDate: record.joinDate || '',
    renewalDate: customerRecord?.renewalDate || '',
    onboardingCompleted: record.onboardingCompleted || false,
    notes: record.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    if (!isMember) {
      setFormData(prev => ({
        ...prev,
        favouriteCategories: prev.favouriteCategories.includes(category)
          ? prev.favouriteCategories.filter(c => c !== category)
          : [...prev.favouriteCategories, category]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email && !isMember) {
      alert('Please fill in email');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isMember && memberRecord) {
        const response = await fetch(`/api/businesses/${memberRecord.profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...memberRecord,
            profile: {
              ...memberRecord.profile,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              postcode: formData.postcode,
            },
            status: formData.status,
            joinDate: formData.joinDate,
            onboardingCompleted: formData.onboardingCompleted,
            notes: formData.notes,
          }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to update');
      } else if (!isMember && customerRecord) {
        const updatedCustomer: CustomerRecord = {
          ...customerRecord,
          profile: {
            ...customerRecord.profile,
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
            referralCode: formData.referralCode || undefined,
          },
          status: formData.status,
          joinDate: formData.joinDate,
          renewalDate: formData.renewalDate,
          onboardingCompleted: formData.onboardingCompleted,
          notes: formData.notes,
        };
        const response = await fetch(`/api/customers/${customerRecord.profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCustomer),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to update');
      }
      onBack();
    } catch (error: any) {
      alert(`Failed to save: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.profile.name || record.profile.email || `${isMember ? 'Member' : 'Customer'} ${record.profile.id.slice(-8)}`}
            </h1>
            <p className="text-sm text-gray-500">{isMember ? 'Member' : 'Customer'} ID: {record.profile.id}</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back
          </button>
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
                Email {!isMember && '*'}
              </label>
              <input
                type="email"
                required={!isMember}
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

            {!isMember && (
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
            )}

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

        {/* Preferences - Customer only */}
        {!isMember && (
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
        )}

        {/* Referral - Customer only */}
        {!isMember && (
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
        )}

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
                onChange={(e) => updateField('status', e.target.value)}
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

            {!isMember && (
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
            )}

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
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
