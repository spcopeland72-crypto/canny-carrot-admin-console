/**
 * Email List - Exact copy of Auroxeon email list
 * Adapted for React Native
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { EmailListItem } from './EmailListItem';

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

export const EmailList: React.FC<EmailListProps> = ({
  items,
  emptyMessage = 'No items found',
  onItemPress,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [starredItems, setStarredItems] = useState<Set<string>>(new Set());

  const handleSelect = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleStar = (itemId: string) => {
    setStarredItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      {items.map((item) => (
        <EmailListItem
          key={item.id}
          id={item.id}
          senderName={item.senderName}
          senderEmail={item.senderEmail}
          subject={item.subject}
          preview={item.preview}
          date={item.date}
          isSelected={selectedItems.has(item.id)}
          isRead={item.isRead}
          isStarred={starredItems.has(item.id) || item.isStarred}
          hasAttachments={item.hasAttachments}
          onSelect={(selected) => handleSelect(item.id, selected)}
          onPress={() => onItemPress?.(item)}
          onStarPress={() => handleStar(item.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
  },
});




