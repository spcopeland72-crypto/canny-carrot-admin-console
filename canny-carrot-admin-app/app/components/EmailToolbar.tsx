'use client';

import React from 'react';

interface EmailToolbarProps {
  onRefresh?: () => void;
  selectedCount?: number;
  totalCount?: number;
  onAdd?: () => void;
  onDelete?: () => void;
  onSortBy?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onSettings?: () => void;
  onKeyboardShortcuts?: () => void;
}

export const EmailToolbar: React.FC<EmailToolbarProps> = ({
  onRefresh,
  selectedCount = 0,
  totalCount = 0,
  onAdd,
  onDelete,
  onSortBy,
  onSelectAll,
  onDeselectAll,
  onSettings,
  onKeyboardShortcuts,
}) => {
  return (
    <div className="h-12 bg-white flex items-center justify-between px-2 border-b-2 border-gray-300">
      {/* Left Section */}
      <div className="flex items-center gap-1">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Refresh"
        >
          <span className="text-base text-gray-600">↻</span>
        </button>

        {selectedCount > 0 && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <span className="text-sm text-gray-600 ml-2">
              {selectedCount} selected
            </span>
          </>
        )}
      </div>

      {/* Right Section - Pagination */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-600 mr-2">
          1-{Math.min(50, totalCount)} of {totalCount.toLocaleString()}
        </span>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center opacity-30 cursor-not-allowed"
          disabled
        >
          <span className="text-base text-gray-600">◀</span>
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <span className="text-base text-gray-600">▶</span>
        </button>
      </div>
    </div>
  );
};

