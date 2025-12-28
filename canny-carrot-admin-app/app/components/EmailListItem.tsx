'use client'

import { Star, Paperclip } from 'lucide-react'
import { cn, formatDate, truncateText } from '@/src/lib/utils'
import { Checkbox } from '@/src/components/ui/checkbox'
import { useState } from 'react'

interface ListItem {
  id: string
  senderName: string
  senderEmail: string
  subject: string
  preview?: string
  date: Date | string
  isRead?: boolean
  isStarred?: boolean
  hasAttachments?: boolean
}

interface EmailListItemProps {
  item: ListItem
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onPress?: () => void
}

export function EmailListItem({ item, isSelected, onSelect, onPress }: EmailListItemProps) {
  const [isStarred, setIsStarred] = useState(item.isStarred || false)
  const [isHovered, setIsHovered] = useState(false)

  const isRead = item.isRead !== false

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsStarred(!isStarred)
  }

  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center gap-1 md:gap-2 px-1 md:px-2 py-0 border-b border-[#f0f0f0] cursor-pointer hover:shadow-sm transition-all group min-h-[46px]',
        isSelected && 'bg-[#c2e7ff]',
        !isRead && !isSelected && 'bg-white',
        isRead && !isSelected && 'bg-[#f5f5f5]'
      )}
    >
      {/* Checkbox */}
      <div 
        className="flex items-center justify-center w-8 md:w-10 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(checked as boolean)}
          className={cn(
            !isHovered && !isSelected && 'opacity-0 md:opacity-100'
          )}
        />
      </div>

      {/* Star */}
      <button
        onClick={handleStarClick}
        className="flex-shrink-0 hover:scale-110 transition-transform w-8 md:w-10 flex items-center justify-center"
        type="button"
      >
        <Star
          className={cn(
            'w-4 md:w-5 h-4 md:h-5',
            isStarred
              ? 'fill-[#f9ab00] text-[#f9ab00]'
              : 'text-[#5f6368] hover:text-[#202124]'
          )}
        />
      </button>

      {/* Important marker (Hidden on mobile) */}
      <div className="w-10 items-center justify-center hidden md:flex flex-shrink-0">
        <svg className="w-5 h-5 text-transparent hover:text-[#5f6368] cursor-pointer" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2l2.4,7.4h7.6l-6,4.6l2.3,7.4l-6.3-4.6l-6.3,4.6l2.3-7.4l-6-4.6h7.6z"/>
        </svg>
      </div>

      {/* Sender Name - Hidden on mobile */}
      <div className="w-[150px] lg:w-[200px] flex-shrink-0 min-w-0 hidden sm:block">
        <span
          className={cn(
            'text-[13px] md:text-[14px] truncate block',
            !isRead ? 'font-bold text-[#202124]' : 'font-normal text-[#5f6368]'
          )}
        >
          {item.senderName || item.senderEmail}
        </span>
      </div>

      {/* Subject & Preview */}
      <div className="flex-1 min-w-0 flex items-center gap-1 md:gap-2">
        <div className="flex-1 min-w-0">
          {/* Mobile: Show sender name + subject */}
          <div className="block sm:hidden">
            <div className={cn(
              'text-[13px] truncate',
              !isRead ? 'font-bold text-[#202124]' : 'font-normal text-[#5f6368]'
            )}>
              {item.senderName || item.senderEmail}
            </div>
            <div className="text-[13px] text-[#202124] truncate">
              {item.subject}
            </div>
          </div>
          
          {/* Desktop: Show subject + preview */}
          <div className="hidden sm:flex items-baseline gap-2">
            <span
              className={cn(
                'text-[13px] md:text-[14px] truncate',
                !isRead ? 'font-bold text-[#202124]' : 'font-normal text-[#202124]'
              )}
            >
              {item.subject}
            </span>
            {item.preview && (
              <span className="text-[12px] md:text-[13px] text-[#5f6368] truncate hidden lg:inline">
                - {truncateText(item.preview, 80)}
              </span>
            )}
          </div>
        </div>
        
        {item.hasAttachments && (
          <Paperclip className="w-3 md:w-4 h-3 md:h-4 text-[#5f6368] flex-shrink-0" />
        )}
      </div>

      {/* Date */}
      <div className="flex-shrink-0 text-[11px] md:text-[12px] text-[#5f6368] w-12 md:w-20 text-right pr-1 md:pr-2">
        {formatDate(item.date)}
      </div>
    </div>
  )
}
