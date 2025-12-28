'use client'

import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/src/lib/utils'

interface AdminTopBarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  totalCount?: number
}

export function AdminTopBar({ 
  searchQuery = '', 
  onSearchChange,
  totalCount = 0
}: AdminTopBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [showMenuModal, setShowMenuModal] = useState(false)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <div className="flex flex-col bg-white border-b-2 border-[#e8eaed] shadow-[0_1px_2px_0_rgba(60,64,67,.3),0_2px_6px_2px_rgba(60,64,67,.15)]">
      {/* Top Bar Main Row */}
      <div className="flex items-center px-4 py-3 min-h-[64px]">
        {/* Logo - Top Left (first element) */}
        <div className="flex items-center flex-shrink-0 pr-4" style={{ flex: 0 }}>
          <img
            src="/assets/logo.png"
            alt="Canny Carrot Rewards"
            width={196}
            height={72}
            className="object-contain"
            style={{ display: 'block', maxHeight: '72px', width: 'auto' }}
          />
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-white border-2 border-[#dadce0] px-4 h-12 max-w-[720px] w-full">
            <Search className="w-5 h-5 text-[#5F6368] mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 h-full text-sm text-[#202124] outline-none font-['Arial',sans-serif]"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="p-1 mr-1 flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#5F6368]" />
              </button>
            )}
            {/* Orange Lightning Bolt Filter */}
            <button className="p-1 ml-1 flex-shrink-0" title="Filter">
              <span className="text-lg">⚡</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-shrink-0 ml-4 gap-0">
          {/* Menu Icon */}
          <button
            className="p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Menu"
          >
            <span className="text-xl text-[#5F6368]">☰</span>
          </button>

          {/* Question Mark */}
          <button
            className="p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Help"
          >
            <span className="text-xl text-[#5F6368]">?</span>
          </button>

          {/* Settings Gear */}
          <button
            className="p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <span className="text-xl text-[#5F6368]">⚙</span>
          </button>

          {/* 9-Dot Grid */}
          <button
            onClick={() => setShowMenuModal(!showMenuModal)}
            className="p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors relative"
            title="More"
          >
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
              <div className="w-1 h-1 bg-[#5F6368] rounded-full"></div>
            </div>
          </button>

          {/* Admin Account Circle */}
          <button
            className="ml-2 min-w-[32px] min-h-[32px] flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Admin Account"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pagination Row */}
      <div className="flex items-center justify-end px-4 pb-2">
        <span className="text-xs text-[#5f6368] mr-2">
          1-{Math.min(50, totalCount)} of {totalCount.toLocaleString()}
        </span>
        <button
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-[#5f6368]" />
        </button>
        <button
          className="p-1 rounded hover:bg-gray-100"
          title="Next"
        >
          <ChevronRight className="w-4 h-4 text-[#5f6368]" />
        </button>
      </div>

      {/* Menu Modal */}
      {showMenuModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenuModal(false)}
          />
          <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg z-50 min-w-[200px] border border-gray-200">
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Add
            </button>
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Delete
            </button>
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Sort by
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Select all
            </button>
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Deselect all
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100 border-b border-gray-100">
              Settings
            </button>
            <button className="w-full px-4 py-3 text-left text-sm text-[#202124] hover:bg-gray-100">
              Keyboard shortcuts
            </button>
          </div>
        </>
      )}
    </div>
  )
}

