import React, {useState} from 'react';
import { View, Text } from 'react-native';
import EmailClientLayout from './src/components/EmailClientLayout';
import { EmailList } from './src/components/EmailList';
import { EmailToolbar } from './src/components/EmailToolbar';
import { businessData, customerData } from './src/services/dataAccess';
import { Colors } from './src/constants/Colors';
import type { BusinessRecord, CustomerRecord } from './src/types';

type ViewType = 'Members' | 'Customers' | 'Apps' | 'Website' | 'Sent' | 'Drafts' | 'Trash' | 'Archive';

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<ViewType>('Members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewType);
    setSelectedItem(null);
    setSearchQuery('');
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item.id);
    // In the future, this could open a detail view
  };

  // Top bar action handlers
  const handleRefresh = () => {
    // Force immediate reload of current view data
    setIsLoading(true);
    setError(null);
    const loadData = async () => {
      try {
        if (currentView === 'Members') {
          const data = await businessData.getAll();
          console.log('[App] Refreshed businesses from Redis:', data.length);
          setBusinesses(data || []);
        } else if (currentView === 'Customers') {
          const data = await customerData.getAll();
          console.log('[App] Refreshed customers from Redis:', data.length);
          setCustomers(data || []);
        }
      } catch (error: any) {
        console.error('[App] Error refreshing data:', error);
        setError(`Failed to refresh: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  };

  const handleFilter = () => {
    // TODO: Open filter modal/dialog
    console.log('Filter clicked');
  };

  const handleSettings = () => {
    // TODO: Open settings page/modal
    console.log('Settings clicked');
  };

  const handleAdminAccount = () => {
    // TODO: Open admin account edit page/modal
    console.log('Admin account clicked');
  };

  const handleAdd = () => {
    // TODO: Open add/create dialog based on current view
    if (currentView === 'Members') {
      console.log('Add business');
    } else if (currentView === 'Customers') {
      console.log('Add customer');
    }
  };

  const handleDelete = () => {
    // TODO: Delete selected items
    if (selectedItem) {
      console.log('Delete selected item:', selectedItem);
    }
  };

  const handleSortBy = () => {
    // TODO: Open sort options modal
    console.log('Sort by clicked');
  };

  const handleSelectAll = () => {
    // TODO: Select all items in current view
    console.log('Select all');
  };

  const handleDeselectAll = () => {
    setSelectedItem(null);
    console.log('Deselect all');
  };

  const handleKeyboardShortcuts = () => {
    // TODO: Show keyboard shortcuts modal
    console.log('Keyboard shortcuts clicked');
  };

  // Get businesses for Members view
  const [businesses, setBusinesses] = React.useState<BusinessRecord[]>([]);
  const [customers, setCustomers] = React.useState<CustomerRecord[]>([]);

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data when view changes
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentView === 'Members') {
          const data = await businessData.getAll();
          console.log('[App] Loaded businesses from Redis:', data.length);
          setBusinesses(data || []);
        } else if (currentView === 'Customers') {
          const data = await customerData.getAll();
          console.log('[App] Loaded customers from Redis:', data.length);
          setCustomers(data || []);
        }
      } catch (error: any) {
        console.error('[App] Error loading data from Redis:', error);
        const errorMessage = error?.message || 'Failed to load data from database';
        setError(`Database Error: ${errorMessage}. Please ensure the API server is running and Redis is connected.`);
        
        // Set empty arrays on error
        if (currentView === 'Members') {
          setBusinesses([]);
        } else if (currentView === 'Customers') {
          setCustomers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load immediately when view changes
    loadData();
  }, [currentView]);

  // Convert businesses to email list format (Auroxeon style)
  const businessListItems = businesses
    .filter((business) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        business.profile.name.toLowerCase().includes(query) ||
        business.profile.email.toLowerCase().includes(query) ||
        business.status.toLowerCase().includes(query)
      );
    })
    .map((business) => ({
      id: business.profile.id,
      senderName: business.profile.name,
      senderEmail: business.profile.email,
      subject: `${business.profile.name} - ${business.subscriptionTier.charAt(0).toUpperCase() + business.subscriptionTier.slice(1)}`,
      preview: `${business.status.replace('_', ' ')} • ${business.profile.businessType || 'Business'}`,
      date: business.createdAt || new Date(),
      isRead: business.status !== 'pending',
      isStarred: false,
      hasAttachments: false,
    }));

  // Convert customers to email list format (Auroxeon style)
  const customerListItems = customers
    .filter((customer) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        customer.profile.name.toLowerCase().includes(query) ||
        customer.profile.email.toLowerCase().includes(query) ||
        customer.status.toLowerCase().includes(query)
      );
    })
    .map((customer) => ({
      id: customer.profile.id,
      senderName: customer.profile.name,
      senderEmail: customer.profile.email,
      subject: customer.profile.name,
      preview: `${customer.status.replace('_', ' ')} • Customer`,
      date: customer.createdAt || new Date(),
      isRead: customer.status !== 'pending',
      isStarred: false,
      hasAttachments: false,
    }));

  const getCurrentItems = () => {
    if (currentView === 'Members') {
      return businessListItems;
    } else if (currentView === 'Customers') {
      return customerListItems;
    }
    return [];
  };

  const getTotalCount = () => {
    if (currentView === 'Members') {
      return businesses.length;
    } else if (currentView === 'Customers') {
      return customers.length;
    }
    return 0;
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#FF6B6B', marginBottom: 10, fontWeight: 'bold' }}>
            Database Connection Error
          </Text>
          <Text style={{ fontSize: 14, color: '#616161', textAlign: 'center', paddingHorizontal: 20 }}>
            {error}
          </Text>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 20, textAlign: 'center', paddingHorizontal: 20 }}>
            Please check your browser console for details. Ensure the Canny Carrot API server is running on port 3001.
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 16, color: '#616161' }}>
            Loading from database...
          </Text>
        </View>
      );
    }

    if (currentView === 'Members' || currentView === 'Customers') {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <EmailToolbar
            onRefresh={handleRefresh}
            selectedCount={selectedItem ? 1 : 0}
            totalCount={getTotalCount()}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onSortBy={handleSortBy}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onSettings={handleSettings}
            onKeyboardShortcuts={handleKeyboardShortcuts}
          />
          <EmailList
            items={getCurrentItems()}
            emptyMessage={currentView === 'Members' ? 'No businesses found' : 'No customers found'}
            onItemPress={handleItemClick}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 16, color: '#616161' }}>
            {currentView} view coming soon
          </Text>
        </View>
      );
    }
  };

  return (
    <EmailClientLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRefresh={handleRefresh}
      onFilter={handleFilter}
      onSettings={handleSettings}
      onAdminAccount={handleAdminAccount}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onSortBy={handleSortBy}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      onKeyboardShortcuts={handleKeyboardShortcuts}>
      {renderContent()}
    </EmailClientLayout>
  );
}

export default App;

