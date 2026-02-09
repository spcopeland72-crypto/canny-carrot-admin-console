/**
 * Email Toolbar - Exact copy of Auroxeon email toolbar
 * Adapted for React Native
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <View style={styles.toolbar}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {/* Select All Checkbox */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowSelectMenu(true)}>
          <View style={styles.checkbox} />
          <Text style={styles.chevronDown}>▼</Text>
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRefresh}>
          <Text style={styles.iconText}>↻</Text>
        </TouchableOpacity>

        {/* More Menu (3-dot) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowMoreMenu(true)}>
          <Text style={styles.iconText}>⋮</Text>
        </TouchableOpacity>

        {selectedCount > 0 && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>📦</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>✉</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>⏰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🏷</Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>
              {selectedCount} selected
            </Text>
          </>
        )}
      </View>

      {/* Right Section - Pagination */}
      <View style={styles.rightSection}>
        <Text style={styles.paginationText}>
          1-{Math.min(50, totalCount)} of {totalCount.toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.iconButton} disabled>
          <Text style={[styles.iconText, { opacity: 0.3 }]}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Select Menu Modal */}
      <Modal
        visible={showSelectMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSelectMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSelectMenu(false)}>
          <View style={styles.menuContent} onStartShouldSetResponder={() => true}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onSelectAll?.(); setShowSelectMenu(false); }}>
              <Text style={styles.menuItemText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onDeselectAll?.(); setShowSelectMenu(false); }}>
              <Text style={styles.menuItemText}>None</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowSelectMenu(false)}>
              <Text style={styles.menuItemText}>Read</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowSelectMenu(false)}>
              <Text style={styles.menuItemText}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowSelectMenu(false)}>
              <Text style={styles.menuItemText}>Starred</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}>
          <View style={styles.menuContent} onStartShouldSetResponder={() => true}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onAdd?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onDelete?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onSortBy?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Sort by</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { onSelectAll?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Select all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onDeselectAll?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Deselect all</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { onSettings?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onKeyboardShortcuts?.(); setShowMoreMenu(false); }}>
              <Text style={styles.menuItemText}>Keyboard shortcuts</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#dadce0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 36,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5f6368',
  },
  chevronDown: {
    fontSize: 12,
    color: '#5f6368',
    marginLeft: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#5f6368',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e8eaed',
    marginHorizontal: 8,
  },
  selectedCount: {
    fontSize: 13,
    color: '#5f6368',
    marginLeft: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationText: {
    fontSize: 12,
    color: '#5f6368',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 16,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 14,
    color: '#202124',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e8eaed',
    marginVertical: 4,
  },
});

