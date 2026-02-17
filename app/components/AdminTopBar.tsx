'use client';

interface AdminTopBarProps {
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  totalCount?: number;
}

export function AdminTopBar({ searchQuery, onSearchChange, totalCount = 0 }: AdminTopBarProps) {
  return (
    <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86]"
          />
        </div>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500 shrink-0">{totalCount} items</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#0E7C86] flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
      </div>
    </header>
  );
}
