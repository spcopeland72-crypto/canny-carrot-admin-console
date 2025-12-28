/**
 * Comprehensive Business Management Page
 * Full CRUD and lifecycle management for businesses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import PageTemplate from './PageTemplate';
import BusinessForm from './BusinessForm';
import { businessData } from '../services/dataAccess';
import { sendBusinessInvitation } from '../services/emailService';
import type { BusinessRecord, BusinessFormData } from '../types';

interface AdminBusinessesPageProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AdminBusinessesPage: React.FC<AdminBusinessesPageProps> = ({
  currentScreen,
  onNavigate,
  onBack,
}) => {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'renewal_due' | 'suspended' | 'closed' | 'exiting'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessRecord | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateDate, setActivateDate] = useState<string>('');
  const [activateOption, setActivateOption] = useState<'now' | 'date'>('now');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    const data = await businessData.getAll();
    setBusinesses(data);
  };

  const handleCreate = () => {
    setEditingBusiness(null);
    setShowForm(true);
  };

  const handleEdit = (business: BusinessRecord) => {
    setEditingBusiness(business);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: BusinessFormData) => {
    try {
      if (editingBusiness) {
        await businessData.update(editingBusiness.profile.id, formData);
        Alert.alert('Success', 'Business updated successfully');
      } else {
        const newBusiness = await businessData.create(formData);
        Alert.alert(
          'Business Created Successfully!',
          `An invitation email has been sent to ${formData.email}.\n\nInvitation link: ${(newBusiness as any).invitationLink || 'Check console for link'}\n\nPlease share this link with the business contact.`,
          [{ text: 'OK' }]
        );
        // Also log the invitation link for easy access
        const invitationLink = (newBusiness as any).invitationLink;
        if (invitationLink) {
          console.log('📧 Business Invitation Link:', invitationLink);
          console.log('📋 Copy this link to share with the business:', invitationLink);
        }
      }
      setShowForm(false);
      setEditingBusiness(null);
      await loadBusinesses();
    } catch (error) {
      Alert.alert('Error', 'Failed to save business');
      console.error(error);
    }
  };

  const handleActivateClick = () => {
    setShowActionsModal(false);
    setShowActivateModal(true);
    setActivateOption('now');
    setActivateDate('');
  };

  const handleActivateConfirm = async () => {
    if (!selectedBusiness) return;
    
    const activationDate = activateOption === 'now' 
      ? new Date().toISOString().split('T')[0]
      : activateDate;
    
    if (activateOption === 'date' && !activateDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    // Update business status to active
    const updatedBusiness = await businessData.update(selectedBusiness.profile.id, { 
      status: 'active',
      activationDate: activationDate,
    } as any);
    
    // If activating "Now", send invitation email with app link
    if (activateOption === 'now' && updatedBusiness) {
      try {
        const invitationData = await sendBusinessInvitation(updatedBusiness);
        Alert.alert(
          'Business Activated',
          `Business activated successfully!\n\nAn invitation email with app access link has been sent to:\n${updatedBusiness.profile.email}\n\nInvitation link: ${invitationData.invitationLink}`,
          [{ text: 'OK' }]
        );
        console.log('📧 Activation email sent to:', updatedBusiness.profile.email);
        console.log('📱 Invitation link:', invitationData.invitationLink);
      } catch (error) {
        console.error('Error sending activation email:', error);
        Alert.alert(
          'Business Activated',
          'Business activated successfully, but there was an error sending the invitation email. Please check the console for details.'
        );
      }
    } else {
      Alert.alert('Success', `Business will be activated on ${activationDate}`);
    }
    
    setShowActivateModal(false);
    setSelectedBusiness(null);
    await loadBusinesses();
  };

  const handleRenew = async (id: string) => {
    Alert.prompt(
      'Process Renewal',
      'Enter renewal date (YYYY-MM-DD) or leave blank for 1 year from today:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: async (renewalDate) => {
            await businessData.renew(id, renewalDate || undefined);
            Alert.alert('Success', 'Business renewed successfully');
            await loadBusinesses();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSuspend = async (id: string) => {
    Alert.alert(
      'Suspend Business',
      'This will close business access to their account and set status to suspended. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            await businessData.suspend(id, 'Business access suspended by admin');
            Alert.alert('Success', 'Business suspended and access closed');
            await loadBusinesses();
          },
        },
      ]
    );
  };

  const handleUnsubscribe = async (id: string) => {
    Alert.prompt(
      'Unsubscribe Business',
      'Enter reason for unsubscription:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: async (reason) => {
            await businessData.unsubscribe(id, reason || undefined);
            Alert.alert('Success', 'Business unsubscribed');
            await loadBusinesses();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleClose = async (id: string) => {
    Alert.alert(
      'Close Business Account',
      'This will archive business details, remove business access to account, and remove business from active lists. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: async () => {
            await businessData.close(id, 'Account closed by admin');
            Alert.alert('Success', 'Business account closed and archived');
            await loadBusinesses();
          },
        },
      ]
    );
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Business',
      'Are you sure you want to permanently delete this business? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await businessData.delete(id);
            Alert.alert('Success', 'Business deleted');
            await loadBusinesses();
          },
        },
      ]
    );
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch =
      business.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.profile.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For 'all' filter, exclude closed businesses unless specifically filtering for them
    // Closed businesses are archived and should not appear in active lists
    if (filter === 'all') {
      return matchesSearch && business.status !== 'closed';
    }
    
    const matchesFilter = business.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.accent;
      case 'pending': return Colors.secondary;
      case 'renewal_due': return '#FFA500';
      case 'suspended': return '#FF6B6B';
      case 'closed': return Colors.neutral[500];
      case 'exiting': return '#DC3545';
      default: return Colors.text.secondary;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return Colors.text.secondary;
    }
  };

  return (
    <PageTemplate
      title="Business Management"
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      onBack={onBack}>
      <View style={styles.content}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>+ Create Business</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.light}
        />

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {(['all', 'pending', 'active', 'renewal_due', 'suspended', 'closed', 'exiting'] as const).map(
            (filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  filter === filterOption && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(filterOption)}>
                <Text
                  style={[
                    styles.filterText,
                    filter === filterOption && styles.filterTextActive,
                  ]}>
                  {filterOption.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>

        {/* Business List */}
        <View style={styles.list}>
          {filteredBusinesses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No businesses found</Text>
            </View>
          ) : (
            filteredBusinesses.map((business) => (
              <View key={business.profile.id} style={styles.businessRow}>
                <Text style={styles.businessName}>{business.profile.name}</Text>
                <Text style={[styles.badge, { backgroundColor: getStatusColor(business.status) + '20', color: getStatusColor(business.status) }]}>
                  {business.status.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={[styles.badge, { backgroundColor: getSubscriptionColor(business.subscriptionTier) + '20', color: getSubscriptionColor(business.subscriptionTier) }]}>
                  {business.subscriptionTier.charAt(0).toUpperCase() + business.subscriptionTier.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => { setSelectedBusiness(business); setShowActionsModal(true); }}>
                  <Text style={styles.dots}>⋯</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setShowActionsModal(false); setSelectedBusiness(null); }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setShowActionsModal(false); setSelectedBusiness(null); }}>
          <View style={styles.actionsModalContent}>
            <View style={styles.actionsModalHeader}>
              <Text style={styles.actionsModalTitle}>
                {selectedBusiness?.profile.name || 'Business Actions'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => { setShowActionsModal(false); setSelectedBusiness(null); }}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsModalBody}>
              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  if (selectedBusiness) {
                    handleEdit(selectedBusiness);
                  }
                  setShowActionsModal(false);
                  setSelectedBusiness(null);
                }}>
                <Text style={styles.modalActionText}>Edit Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={handleActivateClick}>
                <Text style={styles.modalActionText}>Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  if (selectedBusiness) {
                    handleSuspend(selectedBusiness.profile.id);
                  }
                  setShowActionsModal(false);
                  setSelectedBusiness(null);
                }}>
                <Text style={styles.modalActionText}>Suspend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionItem, styles.modalActionItemDanger]}
                onPress={() => {
                  if (selectedBusiness) {
                    handleClose(selectedBusiness.profile.id);
                  }
                  setShowActionsModal(false);
                  setSelectedBusiness(null);
                }}>
                <Text style={[styles.modalActionText, styles.modalActionTextDanger]}>Close Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Activate Modal */}
      <Modal
        visible={showActivateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setShowActivateModal(false); setSelectedBusiness(null); }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setShowActivateModal(false); setSelectedBusiness(null); }}>
          <View style={styles.actionsModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.actionsModalHeader}>
              <Text style={styles.actionsModalTitle}>Activate Account</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => { setShowActivateModal(false); setSelectedBusiness(null); }}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsModalBody}>
              <TouchableOpacity
                style={[styles.modalActionItem, activateOption === 'now' && styles.modalActionItemActive]}
                onPress={() => setActivateOption('now')}>
                <Text style={styles.modalActionText}>Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionItem, activateOption === 'date' && styles.modalActionItemActive]}
                onPress={() => setActivateOption('date')}>
                <Text style={styles.modalActionText}>Set Date</Text>
              </TouchableOpacity>
              {activateOption === 'date' && (
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={activateDate}
                    onChangeText={setActivateDate}
                    placeholderTextColor={Colors.text.light}
                  />
                </View>
              )}
              <TouchableOpacity
                style={[styles.modalActionItem, styles.modalActionItemPrimary]}
                onPress={handleActivateConfirm}>
                <Text style={[styles.modalActionText, styles.modalActionTextPrimary]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowForm(false); setEditingBusiness(null); }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingBusiness ? 'Edit Business' : 'Create Business'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setShowForm(false); setEditingBusiness(null); }}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <BusinessForm
            initialData={editingBusiness ? {
              name: editingBusiness.profile.name,
              email: editingBusiness.profile.email,
              phone: editingBusiness.profile.phone,
              contactName: editingBusiness.profile.contactName,
              addressLine1: editingBusiness.profile.addressLine1,
              addressLine2: editingBusiness.profile.addressLine2,
              city: editingBusiness.profile.city,
              postcode: editingBusiness.profile.postcode,
              country: editingBusiness.profile.country,
              businessType: editingBusiness.profile.businessType,
              category: editingBusiness.profile.category,
              description: editingBusiness.profile.description,
              companyNumber: editingBusiness.profile.companyNumber,
              teamSize: editingBusiness.profile.teamSize,
              website: editingBusiness.profile.website,
              facebook: editingBusiness.profile.socialMedia?.facebook,
              instagram: editingBusiness.profile.socialMedia?.instagram,
              twitter: editingBusiness.profile.socialMedia?.twitter,
              tiktok: editingBusiness.profile.socialMedia?.tiktok,
              linkedin: editingBusiness.profile.socialMedia?.linkedin,
              subscriptionTier: editingBusiness.subscriptionTier,
              status: editingBusiness.status,
              CRMIntegration: editingBusiness.profile.CRMIntegration,
              notificationsOptIn: editingBusiness.profile.notificationsOptIn,
              joinDate: editingBusiness.joinDate,
              renewalDate: editingBusiness.renewalDate,
              onboardingCompleted: editingBusiness.onboardingCompleted,
              notes: editingBusiness.notes,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingBusiness(null); }}
            mode={editingBusiness ? 'edit' : 'create'}
          />
        </View>
      </Modal>
    </PageTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
    width: '100%',
  },
  headerActions: {
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.background,
  },
  list: {
    flex: 1,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 4,
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  businessName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 12,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
    textTransform: 'uppercase',
  },
  dots: {
    fontSize: 18,
    color: Colors.text.secondary,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsModalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  actionsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  actionsModalBody: {
    padding: 8,
  },
  modalActionItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalActionItemDanger: {
    borderBottomWidth: 0,
  },
  modalActionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  modalActionTextDanger: {
    color: '#DC3545',
  },
  modalActionItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  modalActionItemPrimary: {
    backgroundColor: Colors.primary,
    marginTop: 8,
    borderRadius: 8,
  },
  modalActionTextPrimary: {
    color: Colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dateInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateInput: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    color: Colors.text.primary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.background,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.background,
    fontWeight: 'bold',
  },
});

export default AdminBusinessesPage;

