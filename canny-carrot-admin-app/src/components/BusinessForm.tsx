/**
 * Comprehensive Business Form Component
 * Handles create and edit with all business fields
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { Colors } from '../constants/Colors';
import type { BusinessFormData, SubscriptionTier, BusinessStatus } from '../types';

interface BusinessFormProps {
  initialData?: Partial<BusinessFormData>;
  onSubmit: (data: BusinessFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const BusinessForm: React.FC<BusinessFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<BusinessFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    contactName: initialData?.contactName || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    postcode: initialData?.postcode || '',
    country: initialData?.country || 'UK',
    businessType: initialData?.businessType || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    companyNumber: initialData?.companyNumber || '',
    teamSize: initialData?.teamSize || '',
    website: initialData?.website || '',
    facebook: initialData?.facebook || '',
    instagram: initialData?.instagram || '',
    twitter: initialData?.twitter || '',
    tiktok: initialData?.tiktok || '',
    linkedin: initialData?.linkedin || '',
    subscriptionTier: initialData?.subscriptionTier || 'bronze',
    status: initialData?.status || 'pending',
    CRMIntegration: initialData?.CRMIntegration || false,
    notificationsOptIn: initialData?.notificationsOptIn || false,
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
    renewalDate: initialData?.renewalDate || '',
    onboardingCompleted: initialData?.onboardingCompleted || false,
    notes: initialData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessTypeInputValue, setBusinessTypeInputValue] = useState(initialData?.businessType || '');
  const [businessTypeSuggestions, setBusinessTypeSuggestions] = useState<string[]>([]);
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);
  const businessTypeInputRef = useRef<TextInput>(null);

  // Sync input value when initialData changes
  useEffect(() => {
    if (initialData?.businessType) {
      setBusinessTypeInputValue(initialData.businessType);
    }
  }, [initialData?.businessType]);

  // Filter business types based on input
  useEffect(() => {
    if (businessTypeInputValue.trim() === '') {
      setBusinessTypeSuggestions([]);
      setShowBusinessTypeDropdown(false);
    } else {
      const filtered = businessTypes.filter(type =>
        type.toLowerCase().includes(businessTypeInputValue.toLowerCase())
      );
      setBusinessTypeSuggestions(filtered);
      // Always show dropdown if there are suggestions and user is typing
      if (filtered.length > 0) {
        setShowBusinessTypeDropdown(true);
      } else {
        setShowBusinessTypeDropdown(false);
      }
    }
  }, [businessTypeInputValue]);

  // Close dropdown when scrolling (to prevent it covering other fields)
  const handleScroll = () => {
    if (showBusinessTypeDropdown) {
      setShowBusinessTypeDropdown(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', 'Failed to save business');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof BusinessFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const businessTypes = [
    'Cafe', 'Restaurant', 'Bakers', 'Butcher', 'Hairdresser',
    'Boutique', 'Flower shop', 'Dog groomers', 'Window cleaner', 'Gardener', 'Other'
  ];
  
  const handleBusinessTypeSelect = (type: string) => {
    setBusinessTypeInputValue(type);
    updateField('businessType', type);
    setShowBusinessTypeDropdown(false);
    // Blur the input to ensure dropdown closes
    businessTypeInputRef.current?.blur();
  };

  const categories = [
    'Food & Drink', 'Retail', 'Beauty', 'Services', 'Entertainment', 'Other'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Text style={styles.label}>Business Name *</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        placeholder="Enter business name"
      />

      <Text style={styles.label}>Contact Name *</Text>
      <TextInput
        style={styles.input}
        value={formData.contactName}
        onChangeText={(v) => updateField('contactName', v)}
        placeholder="Enter contact name"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(v) => updateField('email', v)}
        placeholder="business@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone *</Text>
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(v) => updateField('phone', v)}
        placeholder="+44 123 456 7890"
        keyboardType="phone-pad"
      />

      <Text style={styles.sectionTitle}>Address</Text>
      
      <Text style={styles.label}>Address Line 1 *</Text>
      <TextInput
        style={styles.input}
        value={formData.addressLine1}
        onChangeText={(v) => updateField('addressLine1', v)}
        placeholder="Street address"
      />

      <Text style={styles.label}>Address Line 2</Text>
      <TextInput
        style={styles.input}
        value={formData.addressLine2}
        onChangeText={(v) => updateField('addressLine2', v)}
        placeholder="Apartment, suite, etc."
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        value={formData.city}
        onChangeText={(v) => updateField('city', v)}
        placeholder="City"
      />

      <Text style={styles.label}>Postcode *</Text>
      <TextInput
        style={styles.input}
        value={formData.postcode}
        onChangeText={(v) => updateField('postcode', v)}
        placeholder="Postcode"
      />

      <Text style={styles.label}>Country</Text>
      <TextInput
        style={styles.input}
        value={formData.country}
        onChangeText={(v) => updateField('country', v)}
        placeholder="Country"
      />

      <Text style={styles.sectionTitle}>Business Details</Text>
      
      <Text style={styles.label}>Business Type</Text>
      <View style={styles.autocompleteContainer}>
        <TextInput
          ref={businessTypeInputRef}
          style={styles.autocompleteInput}
          value={businessTypeInputValue}
          onChangeText={(text) => {
            setBusinessTypeInputValue(text);
            updateField('businessType', text);
          }}
          onFocus={() => {
            // Show dropdown if there are suggestions when focused
            if (businessTypeSuggestions.length > 0) {
              setShowBusinessTypeDropdown(true);
            }
          }}
          onBlur={() => {
            // Close dropdown when input loses focus
            // Small delay to allow selection to register first
            setTimeout(() => {
              setShowBusinessTypeDropdown(false);
            }, 150);
          }}
          placeholder="Type to search or enter a business type..."
          placeholderTextColor={Colors.text?.secondary || Colors.neutral?.[400] || '#999'}
        />
        {showBusinessTypeDropdown && businessTypeSuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={businessTypeSuggestions}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    handleBusinessTypeSelect(item);
                    // Force close immediately
                    setShowBusinessTypeDropdown(false);
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
        {formData.businessType && !businessTypes.some(type => 
          type.toLowerCase() === formData.businessType.toLowerCase()
        ) && (
          <Text style={styles.newTypeWarning}>
            ⚠️ New business type - will be reviewed
          </Text>
        )}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.pickerOption,
              formData.category === cat && styles.pickerOptionSelected,
            ]}
            onPress={() => updateField('category', cat)}>
            <Text
              style={[
                styles.pickerOptionText,
                formData.category === cat && styles.pickerOptionTextSelected,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.description}
        onChangeText={(v) => updateField('description', v)}
        placeholder="Business description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Company Number</Text>
      <TextInput
        style={styles.input}
        value={formData.companyNumber}
        onChangeText={(v) => updateField('companyNumber', v)}
        placeholder="Company registration number"
      />

      <Text style={styles.label}>Team Size</Text>
      <TextInput
        style={styles.input}
        value={formData.teamSize}
        onChangeText={(v) => updateField('teamSize', v)}
        placeholder="Number of employees"
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Online Presence</Text>
      
      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        value={formData.website}
        onChangeText={(v) => updateField('website', v)}
        placeholder="https://example.com"
        keyboardType="url"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Facebook</Text>
      <TextInput
        style={styles.input}
        value={formData.facebook}
        onChangeText={(v) => updateField('facebook', v)}
        placeholder="Facebook URL"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Instagram</Text>
      <TextInput
        style={styles.input}
        value={formData.instagram}
        onChangeText={(v) => updateField('instagram', v)}
        placeholder="Instagram handle"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Twitter/X</Text>
      <TextInput
        style={styles.input}
        value={formData.twitter}
        onChangeText={(v) => updateField('twitter', v)}
        placeholder="Twitter handle"
        autoCapitalize="none"
      />

      <Text style={styles.label}>TikTok</Text>
      <TextInput
        style={styles.input}
        value={formData.tiktok}
        onChangeText={(v) => updateField('tiktok', v)}
        placeholder="TikTok handle"
        autoCapitalize="none"
      />

      <Text style={styles.label}>LinkedIn</Text>
      <TextInput
        style={styles.input}
        value={formData.linkedin}
        onChangeText={(v) => updateField('linkedin', v)}
        placeholder="LinkedIn URL"
        autoCapitalize="none"
      />

      <Text style={styles.sectionTitle}>Subscription & Status</Text>
      
      <Text style={styles.label}>Subscription Tier</Text>
      <View style={styles.pickerContainer}>
        {(['bronze', 'silver', 'gold'] as SubscriptionTier[]).map((tier) => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.pickerOption,
              formData.subscriptionTier === tier && styles.pickerOptionSelected,
            ]}
            onPress={() => updateField('subscriptionTier', tier)}>
            <Text
              style={[
                styles.pickerOptionText,
                formData.subscriptionTier === tier && styles.pickerOptionTextSelected,
              ]}>
              {tier.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        {(['pending', 'active', 'renewal_due', 'suspended', 'closed', 'exiting'] as BusinessStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.pickerOption,
              formData.status === status && styles.pickerOptionSelected,
            ]}
            onPress={() => updateField('status', status)}>
            <Text
              style={[
                styles.pickerOptionText,
                formData.status === status && styles.pickerOptionTextSelected,
              ]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Join Date</Text>
      <TextInput
        style={styles.input}
        value={formData.joinDate}
        onChangeText={(v) => updateField('joinDate', v)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Renewal Date</Text>
      <TextInput
        style={styles.input}
        value={formData.renewalDate}
        onChangeText={(v) => updateField('renewalDate', v)}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>CRM Integration</Text>
        <Switch
          value={formData.CRMIntegration}
          onValueChange={(v) => updateField('CRMIntegration', v)}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Notifications Opt-In</Text>
        <Switch
          value={formData.notificationsOptIn}
          onValueChange={(v) => updateField('notificationsOptIn', v)}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Onboarding Completed</Text>
        <Switch
          value={formData.onboardingCompleted}
          onValueChange={(v) => updateField('onboardingCompleted', v)}
        />
      </View>

      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.notes}
        onChangeText={(v) => updateField('notes', v)}
        placeholder="Admin notes..."
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Business' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  pickerOptionTextSelected: {
    color: Colors.background,
  },
  autocompleteContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  autocompleteInput: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    color: Colors.text.primary,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  suggestionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  newTypeWarning: {
    marginTop: 4,
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral[200],
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BusinessForm;

