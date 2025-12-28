'use client'

import { useState, Suspense } from 'react'
import { AdminSidebar } from './AdminSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  currentView?: 'Members' | 'Customers'
  onViewChange?: (view: 'Members' | 'Customers') => void
  membersCount?: number
}

export default function AdminLayout({
  children,
  currentView = 'Members',
  onViewChange,
  membersCount = 0,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f6f8fc] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={onViewChange}
        membersCount={membersCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={<div className="h-14 md:h-16 bg-white border-b border-[#e8eaed]" />}>
          {/* Header */}
          <div className="h-14 md:h-16 bg-white border-b border-[#e8eaed] flex items-center px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded hover:bg-gray-100 mr-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              {currentView === 'Members' ? 'Business Members' : 'Customers'}
            </h2>
          </div>
        </Suspense>
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}

