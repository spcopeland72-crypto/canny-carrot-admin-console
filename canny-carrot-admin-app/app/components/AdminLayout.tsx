'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

type ViewType = 'Members' | 'Customers' | 'Apps' | 'Website' | 'Drafts' | 'Archive' | 'Trash'

interface AdminLayoutProps {
  children: React.ReactNode
  currentView?: ViewType
  onViewChange?: (view: ViewType) => void
  membersCount?: number
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onRefresh?: () => void
}

export default function AdminLayout({
  children,
  currentView = 'Members',
  onViewChange,
  membersCount = 0,
  searchQuery = '',
  onSearchChange,
  onRefresh,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#FFFFFF] overflow-hidden">
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
        {/* Top Bar */}
        <AdminTopBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#FFFFFF]">
          {children}
        </main>
      </div>
    </div>
  )
}

