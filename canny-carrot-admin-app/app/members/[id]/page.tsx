'use client';

import { useParams } from 'next/navigation';

export default function MemberTestPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Member Test Page</h1>
        <p className="text-lg text-gray-600 mb-8">This is a test page for member ID: <strong>{id}</strong></p>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">Member detail view would go here.</p>
        </div>
      </div>
    </div>
  );
}

