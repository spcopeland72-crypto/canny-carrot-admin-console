/**
 * Comprehensive Customer Form Component
 * Handles create and edit with all customer fields
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import type { CustomerFormData, CustomerStatus } from '../types';

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    postcode: initialData?.postcode || '',
    notifications: initialData?.notifications ?? true,
    emailMarketing: initialData?.emailMarketing ?? false,
    smsMarketing: initialData?.smsMarketing ?? false,
    favouriteCategories: initialData?.favouriteCategories || [],
    preferredBusinesses: initialData?.preferredBusinesses || [],
    referralCode: initialData?.referralCode || '',
    status: initialData?.status || 'pending',
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
    renewalDate: initialData?.renewalDate || '',
    onboardingCompleted: initialData?.onboardingCompleted || false,
    notes: initialData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(formData.favouriteCategories || []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, favouriteCategories: selectedCategories });
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [
    'Cafe', 'Restaurant', 'Bakers', 'Butcher', 'Hairdresser',
    'Boutique', 'Flower shop', 'Dog groomers', 'Window cleaner', 'Gardener'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(v) => updateField('name', v)}
        placeholder="Customer name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(v) => updateField('email', v)}
        placeholder="customer@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(v) => updateField('phone', v)}
        placeholder="+44 123 456 7890"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={styles.input}
        value={formData.dateOfBirth}
        onChangeText={(v) => updateField('dateOfBirth', v)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Postcode</Text>
      <TextInput
        style={styles.input}
        value={formData.postcode}
        onChangeText={(v) => updateField('postcode', v)}
        placeholder="Postcode"
      />

      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <View style={styles.switchRow}>
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={formData.notifications}
          onValueChange={(v) => updateField('notifications', v)}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Email Marketing</Text>
        <Switch
          value={formData.emailMarketing}
          onValueChange={(v) => updateField('emailMarketing', v)}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>SMS Marketing</Text>
        <Switch
          value={formData.smsMarketing}
          onValueChange={(v) => updateField('smsMarketing', v)}
        />
      </View>

      <Text style={styles.label}>Favourite Categories</Text>
      <View style={styles.pickerContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.pickerOption,
              selectedCategories.includes(category) && styles.pickerOptionSelected,
            ]}
            onPress={() => toggleCategory(category)}>
            <Text
              style={[
                styles.pickerOptionText,
                selectedCategories.includes(category) && styles.pickerOptionTextSelected,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Referral</Text>
      
      <Text style={styles.label}>Referral Code</Text>
      <TextInput
        style={styles.input}
        value={formData.referralCode}
        onChangeText={(v) => updateField('referralCode', v)}
        placeholder="Referral code"
        autoCapitalize="none"
      />

      <Text style={styles.sectionTitle}>Status & Lifecycle</Text>
      
      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerContainer}>
        {(['pending', 'active', 'renewal_due', 'suspended', 'closed', 'exiting'] as CustomerStatus[]).map((status) => (
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
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Save Changes'}
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

export default CustomerForm;




