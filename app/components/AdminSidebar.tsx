'use client';

import type { ViewType } from './AdminLayout';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange?: (view: ViewType) => void;
  membersCount?: number;
}

const navItems: { view: ViewType; label: string }[] = [
  { view: 'Members', label: 'Members' },
  { view: 'Customers', label: 'Customers' },
];

export function AdminSidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  membersCount = 0,
}: AdminSidebarProps) {
  return (
    <aside
      className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-200 ${
        isOpen ? 'w-56' : 'w-0 overflow-hidden'
      }`}
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Admin</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-200 text-gray-600"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-2">
            {navItems.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => onViewChange?.(view)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  currentView === view
                    ? 'bg-[#0E7C86] text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="block truncate">{label}</span>
                {view === 'Members' && membersCount > 0 && (
                  <span className="block text-xs opacity-80 mt-0.5">{membersCount} total</span>
                )}
              </button>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
