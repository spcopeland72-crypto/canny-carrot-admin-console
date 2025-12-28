/**
 * Email Client Style Layout for Admin Panel
 * Mimics Auroxeon email client UI with sidebar navigation and top action bar
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { businessData } from '../services/dataAccess';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Try to load logo - handle both web and native
let logoImage: any = null;
if (typeof require !== 'undefined') {
  try {
    logoImage = require('../../assets/logo.png');
  } catch (e) {
    // Logo not found, will show text only
    logoImage = null;
  }
}

interface EmailClientLayoutProps {
  currentView: 'Members' | 'Customers' | 'Apps' | 'Website' | 'Sent' | 'Drafts' | 'Trash' | 'Archive';
  onViewChange: (view: string) => void;
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  topActions?: React.ReactNode;
  onRefresh?: () => void;
  onFilter?: () => void;
  onSettings?: () => void;
  onAdminAccount?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onSortBy?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onKeyboardShortcuts?: () => void;
}

const EmailClientLayout: React.FC<EmailClientLayoutProps> = ({
  currentView,
  onViewChange,
  children,
  searchQuery = '',
  onSearchChange,
  topActions,
  onRefresh,
  onFilter,
  onSettings,
  onAdminAccount,
  onAdd,
  onDelete,
  onSortBy,
  onSelectAll,
  onDeselectAll,
  onKeyboardShortcuts,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showThreeDotModal, setShowThreeDotModal] = useState(false);

  const [isMoreExpanded, setIsMoreExpanded] = useState(false);

  const menuItems = [
    { id: 'Members', label: 'Members', iconType: 'inbox' },
    { id: 'Customers', label: 'Customers', iconType: 'star' },
    { id: 'Apps', label: 'Apps', iconType: 'clock' },
    { id: 'Website', label: 'Website', iconType: 'send' },
    { id: 'Drafts', label: 'Drafts', iconType: 'filetext' },
  ];

  const moreItems = [
    { id: 'Archive', label: 'Archive', iconType: 'archive' },
    { id: 'Trash', label: 'Trash', iconType: 'trash' },
  ];

  // Get count for Members view - removed auto-refresh, only show count when explicitly loaded
  const [membersCount, setMembersCount] = React.useState<number | undefined>(undefined);

  // Render lineart icons (Auroxeon style)
  const renderIcon = (iconType: string, isActive: boolean) => {
    const iconColor = isActive ? '#001d35' : '#5f6368';
    const iconSize = 20;
    
    switch (iconType) {
      case 'inbox':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M22 12h-6l-2 3h-8l-2-3H2" />
            <Path d="M2 12V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" />
          </Svg>
        );
      case 'star':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </Svg>
        );
      case 'clock':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
          </Svg>
        );
      case 'send':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M22 2L11 13" />
            <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </Svg>
        );
      case 'filetext':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <Path d="M14 2v6h6" />
            <Path d="M16 13H8" />
            <Path d="M16 17H8" />
            <Path d="M10 9H8" />
          </Svg>
        );
      case 'archive':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M21 8v13H3V8" />
            <Path d="M1 3h22v5H1z" />
            <Path d="M10 12h4" />
          </Svg>
        );
      case 'trash':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={2}>
            <Path d="M3 6h18" />
            <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Top Bar - Email Client Style */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {logoImage && (
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          )}
        </View>
        
        <View style={styles.topBarCenter}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={Colors.text.light}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => onSearchChange?.('')} style={styles.searchClearButton}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onFilter} style={styles.filterButton}>
              <Text style={styles.filterIcon}>⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.topBarRight}>
          {topActions || (
            <>
              {/* Grid/App Launcher Icon */}
              <TouchableOpacity 
                style={styles.topIconButton}
                onPress={() => {}}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.topIcon}>☰</Text>
              </TouchableOpacity>

              {/* Help/Question Mark Icon */}
              <TouchableOpacity 
                style={styles.topIconButton}
                onPress={() => {}}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.topIcon}>?</Text>
              </TouchableOpacity>

              {/* Settings/Gear Icon */}
              <TouchableOpacity 
                style={styles.topIconButton}
                onPress={onSettings || (() => {})}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.topIcon}>⚙</Text>
              </TouchableOpacity>

              {/* 9-Dot Grid Menu */}
              <TouchableOpacity 
                style={styles.topIconButton}
                onPress={() => setShowThreeDotModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <View style={styles.nineDotGrid}>
                  <View style={styles.dotRow}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                  <View style={styles.dotRow}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                  <View style={styles.dotRow}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Admin Account Icon */}
              <TouchableOpacity 
                style={styles.adminIconButton}
                onPress={onAdminAccount || (() => {})}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <View style={styles.adminIconCircle}>
                  <Text style={styles.adminIconText}>A</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Sidebar - Email Client Style */}
        <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
          <TouchableOpacity
            style={styles.sidebarToggle}
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Text style={styles.sidebarToggleText}>{sidebarCollapsed ? '→' : '←'}</Text>
          </TouchableOpacity>
          
          {!sidebarCollapsed && (
            <ScrollView style={styles.sidebarContent}>
              <View style={styles.sidebarNav}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      currentView === item.id && styles.menuItemActive,
                    ]}
                    onPress={() => onViewChange(item.id)}>
                    <View style={styles.menuItemIconContainer}>
                      {renderIcon(item.iconType, currentView === item.id)}
                    </View>
                    <Text
                      style={[
                        styles.menuItemText,
                        currentView === item.id && styles.menuItemTextActive,
                      ]}>
                      {item.label}
                    </Text>
                    {item.id === 'Members' && membersCount !== undefined && membersCount > 0 && (
                      <Text style={styles.menuItemCount}>
                        {membersCount > 999 ? '999+' : membersCount}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
                
                {/* More Items Toggle */}
                <TouchableOpacity
                  style={styles.moreToggle}
                  onPress={() => setIsMoreExpanded(!isMoreExpanded)}>
                  <View style={styles.menuItemIconContainer}>
                    <Text style={[styles.chevronIcon, !isMoreExpanded && styles.chevronIconCollapsed]}>▼</Text>
                  </View>
                  <Text style={styles.menuItemText}>More</Text>
                </TouchableOpacity>

                {isMoreExpanded && (
                  <>
                    {moreItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.menuItem,
                          currentView === item.id && styles.menuItemActive,
                        ]}
                        onPress={() => onViewChange(item.id)}>
                        <View style={styles.menuItemIconContainer}>
                          {renderIcon(item.iconType, currentView === item.id)}
                        </View>
                        <Text
                          style={[
                            styles.menuItemText,
                            currentView === item.id && styles.menuItemTextActive,
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {children}
        </View>
      </View>

      {/* 3-Dot Menu Modal */}
      <Modal
        visible={showThreeDotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThreeDotModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThreeDotModal(false)}>
          <View style={styles.threeDotModalContent} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onAdd) onAdd();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onDelete) onDelete();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onSortBy) onSortBy();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Sort by</Text>
            </TouchableOpacity>
            
            <View style={styles.modalMenuDivider} />
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onSelectAll) onSelectAll();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Select all</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onDeselectAll) onDeselectAll();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Deselect all</Text>
            </TouchableOpacity>
            
            <View style={styles.modalMenuDivider} />
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onSettings) onSettings();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={() => {
                if (onKeyboardShortcuts) onKeyboardShortcuts();
                setShowThreeDotModal(false);
              }}>
              <Text style={styles.modalMenuItemText}>Keyboard shortcuts</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#e8eaed',
    minHeight: 64,
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
    paddingRight: 16,
  },
  logo: {
    width: 196,
    height: 72,
  },
  topBarCenter: {
    flex: 1,
    marginHorizontal: 0,
    marginLeft: 300,
    maxWidth: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#dadce0',
    flex: 1,
    height: 48,
    maxWidth: 720,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  searchIcon: {
    fontSize: 20,
    color: '#5F6368',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    color: '#202124',
    height: '100%',
    fontFamily: 'Arial, sans-serif',
  },
  searchClearButton: {
    padding: 4,
    marginRight: 4,
  },
  searchClearText: {
    fontSize: 16,
    color: '#5F6368',
  },
  filterButton: {
    padding: 4,
  },
  filterIcon: {
    fontSize: 16,
    color: '#5F6368',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    flex: 0,
    justifyContent: 'flex-end',
    marginLeft: 16,
  },
  topIconButton: {
    padding: 12,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  topIcon: {
    fontSize: 20,
    color: '#5F6368',
    fontFamily: 'Arial, sans-serif',
  },
  nineDotGrid: {
    width: 20,
    height: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5F6368',
  },
  adminIconButton: {
    marginLeft: 8,
  },
  adminIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  adminIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Arial, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  threeDotModalContent: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  modalMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalMenuItemText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  modalMenuDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 4,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 256,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 2,
    borderRightColor: '#dadce0',
  },
  sidebarCollapsed: {
    width: 50,
  },
  sidebarToggle: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#dadce0',
  },
  sidebarToggleText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarNav: {
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
    marginVertical: 0.5,
    minHeight: 40,
  },
  menuItemActive: {
    backgroundColor: '#d3e3fd',
    borderRadius: 0,
  },
  menuItemIconContainer: {
    width: 20,
    height: 20,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    color: '#202124',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#001d35',
    fontWeight: '500',
  },
  menuItemCount: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '500',
    marginLeft: 8,
  },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    marginVertical: 0.5,
  },
  chevronIcon: {
    fontSize: 16,
    color: '#5f6368',
    transform: [{ rotate: '0deg' }],
  },
  chevronIconCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },
  contentArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default EmailClientLayout;

