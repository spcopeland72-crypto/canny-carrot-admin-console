/**
 * Email List Item - Exact copy of Auroxeon email list item
 * Adapted for React Native
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isMobile = width < 640;

interface EmailListItemProps {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview?: string;
  date: Date | string;
  isSelected?: boolean;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  onSelect?: (selected: boolean) => void;
  onPress?: () => void;
  onStarPress?: () => void;
}

export const EmailListItem: React.FC<EmailListItemProps> = ({
  senderName,
  senderEmail,
  subject,
  preview,
  date,
  isSelected = false,
  isRead = true,
  isStarred = false,
  hasAttachments = false,
  onSelect,
  onPress,
  onStarPress,
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const displayName = senderName || senderEmail;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        !isRead && !isSelected && styles.containerUnread,
        isRead && !isSelected && styles.containerRead,
      ]}
      onPress={onPress}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}>
      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            (!isHovered && !isSelected && isMobile) && styles.checkboxHidden,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onSelect?.(!isSelected);
          }}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* Star */}
      <TouchableOpacity
        style={styles.starButton}
        onPress={(e) => {
          e.stopPropagation();
          onStarPress?.();
        }}>
        <Text style={[styles.star, isStarred && styles.starFilled]}>
          {isStarred ? '★' : '☆'}
        </Text>
      </TouchableOpacity>

      {/* Important marker (Hidden on mobile) */}
      {!isMobile && (
        <View style={styles.importantMarker}>
          <Text style={styles.importantIcon}>⭐</Text>
        </View>
      )}

      {/* Sender Name - Hidden on mobile */}
      {!isMobile && (
        <View style={styles.senderContainer}>
          <Text
            style={[
              styles.senderName,
              !isRead ? styles.senderNameUnread : styles.senderNameRead,
            ]}
            numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      )}

      {/* Subject & Preview */}
      <View style={styles.subjectContainer}>
        {isMobile ? (
          <>
            <Text
              style={[
                styles.senderNameMobile,
                !isRead ? styles.senderNameUnread : styles.senderNameRead,
              ]}
              numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.subjectMobile} numberOfLines={1}>
              {subject}
            </Text>
          </>
        ) : (
          <View style={styles.subjectRow}>
            <Text
              style={[
                styles.subject,
                !isRead ? styles.subjectUnread : styles.subjectRead,
              ]}
              numberOfLines={1}>
              {subject}
            </Text>
            {preview && !isMobile && (
              <Text style={styles.preview} numberOfLines={1}>
                - {truncateText(preview, 80)}
              </Text>
            )}
          </View>
        )}
        {hasAttachments && (
          <Text style={styles.attachmentIcon}>📎</Text>
        )}
      </View>

      {/* Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingHorizontal: isMobile ? 4 : 8,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#dadce0',
  },
  containerSelected: {
    backgroundColor: '#c2e7ff',
  },
  containerUnread: {
    backgroundColor: '#FFFFFF',
  },
  containerRead: {
    backgroundColor: '#f5f5f5',
  },
  checkboxContainer: {
    width: isMobile ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5f6368',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxHidden: {
    opacity: 0,
  },
  checkmark: {
    fontSize: 12,
    color: '#5f6368',
  },
  starButton: {
    width: isMobile ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  star: {
    fontSize: isMobile ? 16 : 20,
    color: '#5f6368',
  },
  starFilled: {
    color: '#f9ab00',
  },
  importantMarker: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  importantIcon: {
    fontSize: 20,
    color: 'transparent',
  },
  senderContainer: {
    width: isTablet ? 200 : 150,
    flexShrink: 0,
    minWidth: 0,
  },
  senderName: {
    fontSize: isMobile ? 13 : 14,
    color: '#5f6368',
  },
  senderNameRead: {
    fontWeight: 'normal',
  },
  senderNameUnread: {
    fontWeight: 'bold',
    color: '#202124',
  },
  senderNameMobile: {
    fontSize: 13,
    color: '#5f6368',
  },
  subjectContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobile ? 4 : 8,
  },
  subjectRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    minWidth: 0,
  },
  subject: {
    fontSize: isMobile ? 13 : 14,
    color: '#202124',
  },
  subjectRead: {
    fontWeight: 'normal',
  },
  subjectUnread: {
    fontWeight: 'bold',
  },
  subjectMobile: {
    fontSize: 13,
    color: '#202124',
  },
  preview: {
    fontSize: isMobile ? 12 : 13,
    color: '#5f6368',
    flexShrink: 1,
  },
  attachmentIcon: {
    fontSize: isMobile ? 12 : 16,
    color: '#5f6368',
    flexShrink: 0,
  },
  dateContainer: {
    flexShrink: 0,
    width: isMobile ? 48 : 80,
    alignItems: 'flex-end',
    paddingRight: isMobile ? 4 : 8,
  },
  date: {
    fontSize: isMobile ? 11 : 12,
    color: '#5f6368',
  },
});

