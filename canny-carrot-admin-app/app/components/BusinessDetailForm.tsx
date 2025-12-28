'use client';

import { useState, useEffect, useRef } from 'react';
import type { BusinessRecord, SubscriptionTier, BusinessStatus } from '@/src/types';
import { Button } from '@/src/components/ui/button';

interface BusinessDetailFormProps {
  business: BusinessRecord;
  onSave: (business: BusinessRecord) => Promise<void>;
  onCancel: () => void;
}

const businessTypes = [
  'Cafe', 'Restaurant', 'Bakers', 'Butcher', 'Hairdresser',
  'Boutique', 'Flower shop', 'Dog groomers', 'Window cleaner', 'Gardener', 'Other'
];

const categories = [
  'Food & Drink', 'Retail', 'Beauty', 'Services', 'Entertainment', 'Other'
];

export default function BusinessDetailForm({ business, onSave, onCancel }: BusinessDetailFormProps) {
  const [formData, setFormData] = useState({
    name: business.profile.name || '',
    email: business.profile.email || '',
    phone: business.profile.phone || '',
    contactName: business.profile.contactName || '',
    addressLine1: business.profile.addressLine1 || '',
    addressLine2: business.profile.addressLine2 || '',
    city: business.profile.city || '',
    postcode: business.profile.postcode || '',
    country: business.profile.country || 'UK',
    businessType: business.profile.businessType || '',
    category: business.profile.category || '',
    description: business.profile.description || '',
    companyNumber: business.profile.companyNumber || '',
    teamSize: business.profile.teamSize || '',
    website: business.profile.website || '',
    facebook: business.profile.socialMedia?.facebook || '',
    instagram: business.profile.socialMedia?.instagram || '',
    twitter: business.profile.socialMedia?.twitter || '',
    tiktok: business.profile.socialMedia?.tiktok || '',
    linkedin: business.profile.socialMedia?.linkedin || '',
    subscriptionTier: business.subscriptionTier || 'bronze' as SubscriptionTier,
    status: business.status || 'pending' as BusinessStatus,
    joinDate: business.joinDate || '',
    renewalDate: business.renewalDate || '',
    CRMIntegration: business.profile.CRMIntegration || false,
    notificationsOptIn: business.profile.notificationsOptIn || false,
    onboardingCompleted: business.onboardingCompleted || false,
    notes: business.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessTypeInput, setBusinessTypeInput] = useState(formData.businessType);
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);
  const businessTypeRef = useRef<HTMLInputElement>(null);

  const filteredBusinessTypes = businessTypes.filter(type =>
    type.toLowerCase().includes(businessTypeInput.toLowerCase())
  );

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedBusiness: BusinessRecord = {
        ...business,
        profile: {
          ...business.profile,
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
      };

      await onSave(updatedBusiness);
    } catch (error: any) {
      alert(`Failed to save: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{business.profile.name}</h1>
        <p className="text-sm text-gray-500">Business ID: {business.profile.id}</p>
      </div>

      {/* Basic Information */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name *
            </label>
            <input
              type="text"
              required
              value={formData.contactName}
              onChange={(e) => updateField('contactName', e.target.value)}
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
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
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
              Postcode *
            </label>
            <input
              type="text"
              required
              value={formData.postcode}
              onChange={(e) => updateField('postcode', e.target.value)}
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

      {/* Business Details */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <input
              ref={businessTypeRef}
              type="text"
              value={businessTypeInput}
              onChange={(e) => {
                setBusinessTypeInput(e.target.value);
                updateField('businessType', e.target.value);
                setShowBusinessTypeDropdown(true);
              }}
              onFocus={() => {
                if (filteredBusinessTypes.length > 0) setShowBusinessTypeDropdown(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowBusinessTypeDropdown(false), 200);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showBusinessTypeDropdown && filteredBusinessTypes.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredBusinessTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setBusinessTypeInput(type);
                      updateField('businessType', type);
                      setShowBusinessTypeDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
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
              rows={4}
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
              type="number"
              value={formData.teamSize}
              onChange={(e) => updateField('teamSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Online Presence */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Presence</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
              type="text"
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
              type="text"
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
              type="text"
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
              type="text"
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
              type="text"
              value={formData.linkedin}
              onChange={(e) => updateField('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Subscription & Status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Tier
            </label>
            <select
              value={formData.subscriptionTier}
              onChange={(e) => updateField('subscriptionTier', e.target.value as SubscriptionTier)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bronze">BRONZE</option>
              <option value="silver">SILVER</option>
              <option value="gold">GOLD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as BusinessStatus)}
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
              value={formData.joinDate}
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
              value={formData.renewalDate}
              onChange={(e) => updateField('renewalDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

