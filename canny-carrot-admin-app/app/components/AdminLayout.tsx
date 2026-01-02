'use client';

import React from 'react';

export type ViewType = 'Members' | 'Customers' | 'Apps' | 'Website' | 'Drafts' | 'Archive' | 'Trash';

interface AdminLayoutProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  membersCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  currentView,
  onViewChange,
  membersCount,
  searchQuery,
  onSearchChange,
  onRefresh,
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          {(['Members', 'Customers', 'Apps', 'Website'] as ViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`px-4 py-2 border-b-2 ${
                currentView === view
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {view} {view === 'Members' && `(${membersCount})`}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}


