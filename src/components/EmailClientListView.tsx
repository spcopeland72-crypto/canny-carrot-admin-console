/**
 * Email Client Style List View
 * Displays businesses or customers in an email list format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: string;
  badgeColor?: string;
  isSelected?: boolean;
  isRead?: boolean;
  timestamp?: string;
}

interface EmailClientListViewProps {
  items: ListItem[];
  onItemClick: (item: ListItem) => void;
  onItemSelect?: (item: ListItem) => void;
  emptyMessage?: string;
}

const EmailClientListView: React.FC<EmailClientListViewProps> = ({
  items,
  onItemClick,
  onItemSelect,
  emptyMessage = 'No items found',
}) => {
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
        <TouchableOpacity
          key={item.id}
          style={[
            styles.listItem,
            item.isSelected && styles.listItemSelected,
            !item.isRead && styles.listItemUnread,
          ]}
          onPress={() => onItemClick(item)}
          onLongPress={() => onItemSelect && onItemSelect(item)}>
          <View style={styles.listItemContent}>
            <View style={styles.listItemMain}>
              <Text
                style={[
                  styles.listItemTitle,
                  !item.isRead && styles.listItemTitleUnread,
                ]}
                numberOfLines={1}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={styles.listItemSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              )}
            </View>
            <View style={styles.listItemMeta}>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    item.badgeColor && { backgroundColor: item.badgeColor + '20', borderColor: item.badgeColor },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      item.badgeColor && { color: item.badgeColor },
                    ]}>
                    {item.badge}
                  </Text>
                </View>
              )}
              {item.metadata && (
                <Text style={styles.metadata}>{item.metadata}</Text>
              )}
              {item.timestamp && (
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    backgroundColor: Colors.background,
  },
  listItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  listItemUnread: {
    backgroundColor: Colors.neutral[50],
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemMain: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  listItemTitleUnread: {
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  listItemMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  metadata: {
    fontSize: 12,
    color: Colors.text.light,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.text.light,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});

export default EmailClientListView;




