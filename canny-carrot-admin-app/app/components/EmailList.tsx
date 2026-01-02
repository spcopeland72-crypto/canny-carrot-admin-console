'use client';

import React from 'react';

interface ListItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview?: string;
  date: Date | string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
}

interface EmailListProps {
  items: ListItem[];
  emptyMessage?: string;
  onItemPress?: (item: ListItem) => void;
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (days < 7) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

export const EmailList: React.FC<EmailListProps> = ({
  items,
  emptyMessage = 'No items found',
  onItemPress,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemPress?.(item)}
          className={`flex items-center px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
            item.isRead ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="w-10 flex items-center justify-center flex-shrink-0">
            <input type="checkbox" className="w-4 h-4" />
          </div>
          <div className="w-10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl text-gray-600">{item.isStarred ? '★' : '☆'}</span>
          </div>
          <div className="flex-1 min-w-0 px-4">
            <div className="font-medium text-gray-900 truncate">{item.subject}</div>
          </div>
          {item.preview && (
            <div className="flex-shrink-0 text-right text-sm text-gray-600 px-4">
              {item.preview}
            </div>
          )}
          <div className="flex-shrink-0 text-sm text-gray-500 w-20 text-right">
            {formatDate(item.date)}
          </div>
        </div>
      ))}
    </div>
  );
};
