/**
 * Comprehensive Customer Management Page
 * Full CRUD and lifecycle management for customers
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
import CustomerForm from './CustomerForm';
import { customerData } from '../services/dataAccess';
import type { CustomerRecord, CustomerFormData } from '../types';

interface AdminCustomersPageProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({
  currentScreen,
  onNavigate,
  onBack,
}) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'renewal_due' | 'suspended' | 'closed' | 'exiting'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await customerData.getAll();
    setCustomers(data);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer: CustomerRecord) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: CustomerFormData) => {
    try {
      if (editingCustomer) {
        await customerData.update(editingCustomer.profile.id, formData);
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await customerData.create(formData);
        Alert.alert('Success', 'Customer created successfully');
      }
      setShowForm(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
      console.error(error);
    }
  };

  const handleOnboard = async (id: string) => {
    Alert.alert(
      'Onboard Customer',
      'Are you sure you want to onboard this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Onboard',
          onPress: async () => {
            await customerData.onboard(id);
            Alert.alert('Success', 'Customer onboarded successfully');
            await loadCustomers();
          },
        },
      ]
    );
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
            await customerData.renew(id, renewalDate || undefined);
            Alert.alert('Success', 'Customer renewed successfully');
            await loadCustomers();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSuspend = async (id: string) => {
    Alert.prompt(
      'Suspend Customer',
      'Enter reason for suspension:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          onPress: async (reason) => {
            await customerData.suspend(id, reason || undefined);
            Alert.alert('Success', 'Customer suspended');
            await loadCustomers();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleUnsubscribe = async (id: string) => {
    Alert.prompt(
      'Unsubscribe Customer',
      'Enter reason for unsubscription:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: async (reason) => {
            await customerData.unsubscribe(id, reason || undefined);
            Alert.alert('Success', 'Customer unsubscribed');
            await loadCustomers();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleClose = async (id: string) => {
    Alert.prompt(
      'Close Customer Account',
      'Enter reason for closing account:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async (reason) => {
            await customerData.close(id, reason || undefined);
            Alert.alert('Success', 'Customer account closed');
            await loadCustomers();
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to permanently delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await customerData.delete(id);
            Alert.alert('Success', 'Customer deleted');
            await loadCustomers();
          },
        },
      ]
    );
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      (customer.profile.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.profile.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.profile.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || customer.status === filter;
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

  return (
    <PageTemplate
      title="Customer Management"
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      onBack={onBack}>
      <View style={styles.content}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>+ Create Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
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

        {/* Customer List */}
        <ScrollView style={styles.list}>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No customers found</Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <View key={customer.profile.id} style={[styles.customerCard, isTablet && styles.customerCardTablet]}>
                <View style={styles.customerHeader}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>
                      {customer.profile.name || `Customer ${customer.profile.id.slice(-6)}`}
                    </Text>
                    {customer.profile.email && (
                      <Text style={styles.customerDetail}>{customer.profile.email}</Text>
                    )}
                    {customer.profile.phone && (
                      <Text style={styles.customerDetail}>{customer.profile.phone}</Text>
                    )}
                    {customer.profile.postcode && (
                      <Text style={styles.customerDetail}>{customer.profile.postcode}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => setShowActions(showActions === customer.profile.id ? null : customer.profile.id)}>
                    <Text style={styles.moreButtonText}>⋮</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.customerMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Status: </Text>
                    <Text style={[styles.metaValue, { color: getStatusColor(customer.status) }]}>
                      {customer.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.metaDetail}>Joined: {customer.joinDate}</Text>
                  {customer.renewalDate && (
                    <Text style={styles.metaDetail}>Renewal: {customer.renewalDate}</Text>
                  )}
                  {customer.stats && (
                    <>
                      <Text style={styles.metaDetail}>Total Scans: {customer.stats.totalScans}</Text>
                      <Text style={styles.metaDetail}>
                        Rewards: {customer.stats.totalRewardsEarned} earned, {customer.stats.totalRewardsRedeemed} redeemed
                      </Text>
                      <Text style={styles.metaDetail}>
                        Businesses Visited: {customer.stats.businessesVisited.length}
                      </Text>
                    </>
                  )}
                  {customer.profile.preferences && (
                    <View style={styles.preferencesRow}>
                      <Text style={styles.metaDetail}>
                        Notifications: {customer.profile.preferences.notifications ? '✓' : '✗'} | 
                        Email: {customer.profile.preferences.emailMarketing ? '✓' : '✗'} | 
                        SMS: {customer.profile.preferences.smsMarketing ? '✓' : '✗'}
                      </Text>
                    </View>
                  )}
                </View>

                {showActions === customer.profile.id && (
                  <View style={styles.actionsMenu}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { handleEdit(customer); setShowActions(null); }}>
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    {customer.status === 'pending' && (
                      <TouchableOpacity style={styles.actionItem} onPress={() => { handleOnboard(customer.profile.id); setShowActions(null); }}>
                        <Text style={styles.actionText}>Onboard</Text>
                      </TouchableOpacity>
                    )}
                    {customer.status === 'renewal_due' && (
                      <TouchableOpacity style={styles.actionItem} onPress={() => { handleRenew(customer.profile.id); setShowActions(null); }}>
                        <Text style={styles.actionText}>Renew</Text>
                      </TouchableOpacity>
                    )}
                    {customer.status === 'active' && (
                      <>
                        <TouchableOpacity style={styles.actionItem} onPress={() => { handleSuspend(customer.profile.id); setShowActions(null); }}>
                          <Text style={styles.actionText}>Suspend</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => { handleUnsubscribe(customer.profile.id); setShowActions(null); }}>
                          <Text style={styles.actionText}>Unsubscribe</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity style={styles.actionItem} onPress={() => { handleClose(customer.profile.id); setShowActions(null); }}>
                      <Text style={[styles.actionText, styles.dangerText]}>Close Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => { handleDelete(customer.profile.id); setShowActions(null); }}>
                      <Text style={[styles.actionText, styles.dangerText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowForm(false); setEditingCustomer(null); }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCustomer ? 'Edit Customer' : 'Create Customer'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setShowForm(false); setEditingCustomer(null); }}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <CustomerForm
            initialData={editingCustomer ? {
              name: editingCustomer.profile.name,
              email: editingCustomer.profile.email,
              phone: editingCustomer.profile.phone,
              dateOfBirth: editingCustomer.profile.dateOfBirth,
              postcode: editingCustomer.profile.postcode,
              notifications: editingCustomer.profile.preferences?.notifications ?? true,
              emailMarketing: editingCustomer.profile.preferences?.emailMarketing ?? false,
              smsMarketing: editingCustomer.profile.preferences?.smsMarketing ?? false,
              favouriteCategories: editingCustomer.profile.favouriteCategories,
              preferredBusinesses: editingCustomer.profile.preferredBusinesses,
              referralCode: editingCustomer.profile.referralCode,
              status: editingCustomer.status,
              joinDate: editingCustomer.joinDate,
              renewalDate: editingCustomer.renewalDate,
              onboardingCompleted: editingCustomer.onboardingCompleted,
              notes: editingCustomer.notes,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingCustomer(null); }}
            mode={editingCustomer ? 'edit' : 'create'}
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
  customerCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  customerCardTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  customerMeta: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metaDetail: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: 2,
  },
  preferencesRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionsMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  actionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  dangerText: {
    color: '#DC3545',
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

export default AdminCustomersPage;

