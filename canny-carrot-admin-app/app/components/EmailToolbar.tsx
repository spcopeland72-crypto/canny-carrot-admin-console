'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EmailToolbarProps {
  onRefresh?: () => void
  selectedCount?: number
  totalCount?: number
}

export function EmailToolbar({ 
  onRefresh, 
  selectedCount = 0,
  totalCount = 0 
}: EmailToolbarProps) {
  const [showSelectMenu, setShowSelectMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  return (
    <>
      <div className="h-12 bg-white flex items-center justify-between px-2 border-b border-[#f0f0f0]">
        {/* Left Section */}
        <div className="flex items-center gap-0">
          {/* Select All Checkbox */}
          <DropdownMenu open={showSelectMenu} onOpenChange={setShowSelectMenu}>
            <DropdownMenuTrigger asChild>
              <button className="h-9 px-2 hover:bg-[#f1f3f4] rounded flex items-center gap-1">
                <div className="h-5 w-5 rounded border border-[#5f6368] flex items-center justify-center" />
                <span className="text-[#5f6368] text-xs">▼</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>None</DropdownMenuItem>
              <DropdownMenuItem>Read</DropdownMenuItem>
              <DropdownMenuItem>Unread</DropdownMenuItem>
              <DropdownMenuItem>Starred</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center"
            title="Refresh"
          >
            <span className="text-[#5f6368] text-lg">↻</span>
          </button>

          {/* More Menu (3-dot) */}
          <DropdownMenu open={showMoreMenu} onOpenChange={setShowMoreMenu}>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-xl">⋮</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Mark all as read</DropdownMenuItem>
              <DropdownMenuItem>Mark all as unread</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Select all</DropdownMenuItem>
              <DropdownMenuItem>Deselect all</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCount > 0 && (
            <>
              <div className="w-px h-6 bg-[#e8eaed] mx-2" />
              
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-base">📦</span>
              </button>
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-base">🗑</span>
              </button>
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-base">✉</span>
              </button>
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-base">⏰</span>
              </button>
              <button className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <span className="text-[#5f6368] text-base">🏷</span>
              </button>

              <span className="text-[13px] text-[#5f6368] ml-2">
                {selectedCount} selected
              </span>
            </>
          )}
        </div>

        {/* Right Section - Pagination */}
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-[#5f6368] mr-2">
            1-{Math.min(50, totalCount)} of {totalCount.toLocaleString()}
          </span>
          <button 
            className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed" 
            disabled
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-[#5f6368]" />
          </button>
          <button 
            className="h-9 w-9 hover:bg-[#f1f3f4] rounded-full flex items-center justify-center"
            title="Next"
          >
            <ChevronRight className="w-4 h-4 text-[#5f6368]" />
          </button>
        </div>
      </div>
    </>
  )
}
