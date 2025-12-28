'use client'

import { 
  Users, 
  UserCircle,
  X,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { useState } from 'react'
import { cn } from '@/src/lib/utils'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentView?: 'Members' | 'Customers'
  onViewChange?: (view: 'Members' | 'Customers') => void
  membersCount?: number
}

export function AdminSidebar({ 
  isOpen = true, 
  onClose, 
  currentView = 'Members',
  onViewChange,
  membersCount = 0
}: AdminSidebarProps) {
  const router = useRouter()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'border-r border-[#e8eaed] bg-white flex flex-col h-full transition-all duration-300 z-50',
        'fixed lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'w-64'
      )}>
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between px-2 py-2 border-b border-[#e8eaed] lg:border-0">
          <div 
            className="flex items-center cursor-pointer px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => router.push('/')}
          >
            <h1 className="text-xl font-bold text-blue-600">Canny Carrot</h1>
            <span className="ml-2 text-sm text-gray-500">Admin</span>
          </div>

          {/* Close button (Mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-[#5f6368]" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-0.5 py-2">
            <button
              onClick={() => onViewChange?.('Members')}
              className={cn(
                'flex items-center justify-between w-full px-4 py-2 rounded-r-full transition-all group h-10',
                currentView === 'Members'
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'hover:bg-[#f1f3f4] text-[#202124]'
              )}
            >
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5" />
                <span className="text-[14px]">Members</span>
              </div>
              {membersCount > 0 && (
                <span className="text-xs text-gray-500">{membersCount}</span>
              )}
            </button>

            <button
              onClick={() => onViewChange?.('Customers')}
              className={cn(
                'flex items-center justify-between w-full px-4 py-2 rounded-r-full transition-all group h-10',
                currentView === 'Customers'
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'hover:bg-[#f1f3f4] text-[#202124]'
              )}
            >
              <div className="flex items-center gap-4">
                <UserCircle className="w-5 h-5" />
                <span className="text-[14px]">Customers</span>
              </div>
            </button>
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}

