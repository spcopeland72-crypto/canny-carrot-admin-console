'use client';

import React from 'react';
import Image from 'next/image';

export type ViewType = 'Members' | 'Customers' | 'Apps' | 'Website' | 'Email' | 'Drafts' | 'Archive' | 'Trash';

interface AdminLayoutProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  membersCount: number;
  customersCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  children: React.ReactNode;
}

// Sidebar navigation items
const sidebarItems: Array<{ view: ViewType; label: string; icon: string }> = [
  { view: 'Members', label: 'Members', icon: '👥' },
  { view: 'Customers', label: 'Customers', icon: '👤' },
  { view: 'Apps', label: 'Apps', icon: '📱' },
  { view: 'Website', label: 'Website', icon: '🌐' },
  { view: 'Email', label: 'Email', icon: '✉️' },
  { view: 'Drafts', label: 'Drafts', icon: '📝' },
  { view: 'Archive', label: 'Archive', icon: '📦' },
  { view: 'Trash', label: 'Trash', icon: '🗑️' },
];

export default function AdminLayout({
  currentView,
  onViewChange,
  membersCount,
  customersCount,
  searchQuery,
  onSearchChange,
  onRefresh,
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Top Bar */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center" style={{ flex: 0, display: 'block' }}>
            <Image
              src="/assets/logo.png"
              alt="Canny Carrot"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                currentView === item.view
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.view === 'Members' && (
                <span className="ml-auto text-sm text-gray-500">({membersCount})</span>
              )}
              {item.view === 'Customers' && (
                <span className="ml-auto text-sm text-gray-500">({customersCount})</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onRefresh}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}


