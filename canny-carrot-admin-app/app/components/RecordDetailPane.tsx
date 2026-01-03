'use client';

import { useState } from 'react';
import type { BusinessRecord, CustomerRecord, CustomerStatus, BusinessStatus, SubscriptionTier } from '@/src/types';

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
  
  const initialFormData = isMember && memberRecord
    ? {
        name: memberRecord.profile.name || '',
        email: memberRecord.profile.email || '',
        phone: memberRecord.profile.phone || '',
        contactName: memberRecord.profile.contactName || '',
        addressLine1: memberRecord.profile.addressLine1 || '',
        addressLine2: memberRecord.profile.addressLine2 || '',
        city: memberRecord.profile.city || '',
        postcode: memberRecord.profile.postcode || '',
        country: memberRecord.profile.country || 'UK',
        businessType: memberRecord.profile.businessType || '',
        category: memberRecord.profile.category || '',
        description: memberRecord.profile.description || '',
        companyNumber: memberRecord.profile.companyNumber || '',
        teamSize: memberRecord.profile.teamSize || '',
        website: memberRecord.profile.website || '',
        facebook: memberRecord.profile.socialMedia?.facebook || '',
        instagram: memberRecord.profile.socialMedia?.instagram || '',
        twitter: memberRecord.profile.socialMedia?.twitter || '',
        tiktok: memberRecord.profile.socialMedia?.tiktok || '',
        linkedin: memberRecord.profile.socialMedia?.linkedin || '',
        subscriptionTier: memberRecord.subscriptionTier || 'bronze',
        status: memberRecord.status || 'pending',
        CRMIntegration: memberRecord.profile.CRMIntegration ?? false,
        notificationsOptIn: memberRecord.profile.notificationsOptIn ?? false,
        joinDate: memberRecord.joinDate || '',
        renewalDate: memberRecord.renewalDate || '',
        onboardingCompleted: memberRecord.onboardingCompleted || false,
        notes: memberRecord.notes || '',
        // Customer-only fields (always present but empty for members)
        dateOfBirth: '',
        notifications: true,
        emailMarketing: false,
        smsMarketing: false,
        favouriteCategories: [] as string[],
        referralCode: '',
      }
    : {
        name: customerRecord?.profile.name || '',
        email: customerRecord?.profile.email || '',
        phone: customerRecord?.profile.phone || '',
        dateOfBirth: customerRecord?.profile.dateOfBirth || '',
        postcode: customerRecord?.profile.postcode || '',
        notifications: customerRecord?.profile.preferences?.notifications ?? true,
        emailMarketing: customerRecord?.profile.preferences?.emailMarketing ?? false,
        smsMarketing: customerRecord?.profile.preferences?.smsMarketing ?? false,
        favouriteCategories: customerRecord?.profile.favouriteCategories || [],
        referralCode: customerRecord?.profile.referralCode || '',
        status: customerRecord?.status || 'pending',
        joinDate: customerRecord?.joinDate || '',
        renewalDate: customerRecord?.renewalDate || '',
        onboardingCompleted: customerRecord?.onboardingCompleted || false,
        notes: customerRecord?.notes || '',
        // Member-only fields (always present but empty for customers)
        contactName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: '',
        businessType: '',
        category: '',
        description: '',
        companyNumber: '',
        teamSize: '',
        website: '',
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
        linkedin: '',
        subscriptionTier: 'bronze' as SubscriptionTier,
        CRMIntegration: false,
        notificationsOptIn: false,
      };

  const [formData, setFormData] = useState<any>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    if (!isMember) {
      setFormData((prev: any) => ({
        ...prev,
        favouriteCategories: prev.favouriteCategories.includes(category)
          ? prev.favouriteCategories.filter((c: string) => c !== category)
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
              contactName: formData.contactName,
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2,
              city: formData.city,
              postcode: formData.postcode,
              country: formData.country,
              businessType: formData.businessType,
              category: formData.category,
              description: formData.description,
              companyNumber: formData.companyNumber,
              teamSize: formData.teamSize,
              website: formData.website,
              socialMedia: {
                facebook: formData.facebook,
                instagram: formData.instagram,
                twitter: formData.twitter,
                tiktok: formData.tiktok,
                linkedin: formData.linkedin,
              },
              CRMIntegration: formData.CRMIntegration,
              notificationsOptIn: formData.notificationsOptIn,
            },
            subscriptionTier: formData.subscriptionTier,
            status: formData.status,
            joinDate: formData.joinDate,
            renewalDate: formData.renewalDate,
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
                {isMember ? 'Business Name' : 'Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isMember && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

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

        {/* Address - Members only */}
        {isMember && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => updateField('addressLine2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* Business Details - Members only */}
        {isMember && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Number
                </label>
                <input
                  type="text"
                  value={formData.companyNumber}
                  onChange={(e) => updateField('companyNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <input
                  type="text"
                  value={formData.teamSize}
                  onChange={(e) => updateField('teamSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* Online Presence - Members only */}
        {isMember && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Presence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => updateField('twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok
                </label>
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => updateField('tiktok', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
        )}

        {/* Subscription - Members only */}
        {isMember && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => updateField('subscriptionTier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bronze">BRONZE</option>
                  <option value="silver">SILVER</option>
                  <option value="gold">GOLD</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Settings - Members only */}
        {isMember && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.CRMIntegration}
                  onChange={(e) => updateField('CRMIntegration', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  CRM Integration
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notificationsOptIn}
                  onChange={(e) => updateField('notificationsOptIn', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Notifications Opt-In
                </label>
              </div>
            </div>
          </section>
        )}

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
