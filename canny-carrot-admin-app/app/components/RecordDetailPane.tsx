'use client';

import React from 'react';
import type { BusinessRecord, CustomerRecord } from '@/src/types';

interface RecordDetailPaneProps {
  record: BusinessRecord | CustomerRecord;
  type: 'member' | 'customer';
  onBack: () => void;
}

export const RecordDetailPane: React.FC<RecordDetailPaneProps> = ({ record, type, onBack }) => {
  const isMember = type === 'member';
  const memberRecord = isMember ? (record as BusinessRecord) : null;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.profile.name || `${isMember ? 'Member' : 'Customer'} ${record.profile.id.slice(-8)}`}
          </h1>
          {record.profile.email && (
            <p className="text-gray-600 mt-1">{record.profile.email}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Information */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="mt-1 text-gray-900">{record.profile.id}</p>
              </div>
              {record.profile.name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-gray-900">{record.profile.name}</p>
                </div>
              )}
              {record.profile.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{record.profile.email}</p>
                </div>
              )}
              {record.profile.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900">{record.profile.phone}</p>
                </div>
              )}
              {record.profile.postcode && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Postcode</label>
                  <p className="mt-1 text-gray-900">{record.profile.postcode}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </p>
              </div>
              {record.profile.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(record.profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Member-specific Information */}
          {isMember && memberRecord && memberRecord.subscriptionTier && (
            <section className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tier</label>
                  <p className="mt-1 text-gray-900 capitalize">{memberRecord.subscriptionTier}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

