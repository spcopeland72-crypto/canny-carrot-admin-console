'use client'

import Image from 'next/image'
import { Search, X, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/src/lib/utils'

interface AdminTopBarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onRefresh?: () => void
}

export function AdminTopBar({ 
  searchQuery = '', 
  onSearchChange,
  onRefresh 
}: AdminTopBarProps) {
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
  }

  return (
    <div className="flex items-center px-4 py-3 bg-white border-b-2 border-[#e8eaed] min-h-[64px] shadow-[0_1px_2px_0_rgba(60,64,67,.3),0_2px_6px_2px_rgba(60,64,67,.15)]">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 pr-4">
        <Image
          src="/assets/logo.png"
          alt="Canny Carrot"
          width={196}
          height={72}
          className="object-contain"
          priority
        />
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-white border-2 border-[#dadce0] px-4 h-12 max-w-[720px] w-full">
          <Search className="w-5 h-5 text-[#5F6368] mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 h-full text-sm text-[#202124] outline-none font-['Arial',sans-serif]"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="p-1 mr-1 flex-shrink-0"
            >
              <X className="w-4 h-4 text-[#5F6368]" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions - Refresh only (no 3 dots) */}
      <div className="flex items-center flex-shrink-0 ml-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-3 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-[#5F6368]" />
          </button>
        )}
      </div>
    </div>
  )
}

