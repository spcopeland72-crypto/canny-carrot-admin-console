'use client'

import { useState } from 'react'
import { EmailListItem } from './EmailListItem'
import { EmptyState } from '@/src/components/common/empty-state'
import { Users } from 'lucide-react'

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

interface EmailListProps {
  items: ListItem[]
  emptyMessage?: string
  onItemPress?: (item: ListItem) => void
}

export function EmailList({ items, emptyMessage = 'No items found', onItemPress }: EmailListProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleSelectItem = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No items"
        description={emptyMessage}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {items.map((item) => (
        <EmailListItem 
          key={item.id} 
          item={item}
          isSelected={selectedItems.has(item.id)}
          onSelect={(selected) => handleSelectItem(item.id, selected)}
          onPress={() => onItemPress?.(item)}
        />
      ))}
    </div>
  )
}
