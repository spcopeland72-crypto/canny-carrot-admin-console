'use client'

import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { useState } from 'react'
import { cn } from '@/src/lib/utils'
import { useRouter } from 'next/navigation'
import { 
  InboxIcon, 
  StarIcon, 
  ClockIcon, 
  SendIcon, 
  MailIcon,
  FileTextIcon, 
  ArchiveIcon, 
  TrashIcon 
} from './AdminSidebarIcons'
import type { ViewType } from './AdminLayout'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentView?: ViewType
  onViewChange?: (view: ViewType) => void
  membersCount?: number
}

const menuItems = [
  { id: 'Members' as ViewType, label: 'Members', icon: InboxIcon },
  { id: 'Customers' as ViewType, label: 'Customers', icon: StarIcon },
  { id: 'Apps' as ViewType, label: 'Apps', icon: ClockIcon },
  { id: 'Website' as ViewType, label: 'Website', icon: SendIcon },
  { id: 'Email' as ViewType, label: 'Email', icon: MailIcon },
  { id: 'Drafts' as ViewType, label: 'Drafts', icon: FileTextIcon },
]

const moreItems = [
  { id: 'Archive' as ViewType, label: 'Archive', icon: ArchiveIcon },
  { id: 'Trash' as ViewType, label: 'Trash', icon: TrashIcon },
]

export function AdminSidebar({ 
  isOpen = true, 
  onClose, 
  currentView = 'Members',
  onViewChange,
  membersCount = 0
}: AdminSidebarProps) {
  const router = useRouter()
  const [isMoreExpanded, setIsMoreExpanded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        'bg-white flex flex-col h-full transition-all duration-300 z-50 border-r-2 border-[#dadce0]',
        'fixed lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'w-[50px]' : 'w-64'
      )}>
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 flex items-center justify-center border-b-2 border-[#dadce0]"
        >
          <span className="text-lg text-[#616161]">
            {sidebarCollapsed ? '→' : '←'}
          </span>
        </button>

        {!sidebarCollapsed && (
          <ScrollArea className="flex-1">
            <nav className="py-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange?.(item.id)}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-2 transition-all h-10 my-0.5',
                      isActive
                        ? 'bg-[#d3e3fd]'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-5 h-5 mr-4 flex-shrink-0 flex items-center justify-center">
                        <Icon isActive={isActive} />
                      </div>
                      <span className={cn(
                        'text-sm flex-1',
                        isActive ? 'text-[#001d35] font-medium' : 'text-[#202124]'
                      )}>
                        {item.label}
                      </span>
                    </div>
                    {item.id === 'Members' && membersCount !== undefined && membersCount > 0 && (
                      <span className={cn(
                        'text-xs ml-2 tabular-nums flex-shrink-0',
                        isActive ? 'text-[#001d35] font-semibold' : 'text-[#5f6368]'
                      )}>
                        {membersCount > 999 ? '999+' : membersCount}
                      </span>
                    )}
                  </button>
                )
              })}

              {/* More Toggle */}
              <button
                onClick={() => setIsMoreExpanded(!isMoreExpanded)}
                className="flex items-center w-full px-4 py-2 h-10 my-0.5 hover:bg-gray-100"
              >
                <div className="w-5 h-5 mr-4 flex-shrink-0 flex items-center justify-center">
                  <ChevronDown className={cn(
                    'w-4 h-4 text-[#5f6368] transition-transform',
                    !isMoreExpanded && '-rotate-90'
                  )} />
                </div>
                <span className="text-sm text-[#202124]">More</span>
              </button>

              {/* More Items */}
              {isMoreExpanded && (
                <>
                  {moreItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentView === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => onViewChange?.(item.id)}
                        className={cn(
                          'flex items-center w-full px-4 py-2 transition-all h-10 my-0.5',
                          isActive
                            ? 'bg-[#d3e3fd]'
                            : 'hover:bg-gray-100'
                        )}
                      >
                        <div className="w-5 h-5 mr-4 flex-shrink-0 flex items-center justify-center">
                          <Icon isActive={isActive} />
                        </div>
                        <span className={cn(
                          'text-sm',
                          isActive ? 'text-[#001d35] font-medium' : 'text-[#202124]'
                        )}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </nav>
          </ScrollArea>
        )}
      </aside>
    </>
  )
}

