/**
 * Admin Data Access Layer - Production
 * All operations commit to Redis database - single source of truth
 */

import { redis, REDIS_KEYS } from './redis';
import { sendBusinessInvitation } from './emailService';
import type { BusinessRecord, CustomerRecord, BusinessFormData, CustomerFormData, LifecycleAction } from '../types';

// ============================================
// BUSINESS OPERATIONS - Redis
// ============================================

export const businessData = {
  /**
   * Get all businesses from Redis
   */
  getAll: async (): Promise<BusinessRecord[]> => {
    try {
      // Get all business IDs from the businesses:all set
      const businessIds = await redis.smembers(REDIS_KEYS.businessList());
      
      if (businessIds.length === 0) {
        console.log('[businessData.getAll] No businesses found in Redis');
        return [];
      }

      // Fetch all business records in parallel
      const businessKeys = businessIds.map(id => REDIS_KEYS.business(id));
      console.log(`[businessData.getAll] Fetching ${businessIds.length} businesses with keys:`, businessKeys.slice(0, 5));
      const businessDataStrings = await redis.mget(businessKeys);
      
      const businesses: BusinessRecord[] = [];
      for (let i = 0; i < businessDataStrings.length; i++) {
        if (businessDataStrings[i]) {
          try {
            const business = JSON.parse(businessDataStrings[i]!) as BusinessRecord;
            businesses.push(business);
            console.log(`[businessData.getAll] Loaded business: ${business.profile.name} (${businessIds[i]})`);
          } catch (parseError) {
            console.error(`Error parsing business ${businessIds[i]}:`, parseError);
            console.error(`Raw data:`, businessDataStrings[i]?.substring(0, 200));
          }
        } else {
          console.warn(`[businessData.getAll] No data found for business ID: ${businessIds[i]}`);
        }
      }

      console.log(`[businessData.getAll] Loaded ${businesses.length} businesses from Redis (expected ${businessIds.length})`);
      return businesses;
    } catch (error) {
      console.error('[businessData.getAll] Error fetching businesses from Redis:', error);
      throw error; // Fail fast in production
    }
  },

  /**
   * Get single business by ID from Redis
   */
  getById: async (id: string): Promise<BusinessRecord | null> => {
    try {
      const data = await redis.get(REDIS_KEYS.business(id));
      if (!data) return null;
      return JSON.parse(data) as BusinessRecord;
    } catch (error) {
      console.error(`[businessData.getById] Error fetching business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new business - commits to Redis
   */
  create: async (formData: BusinessFormData): Promise<BusinessRecord> => {
    try {
      const now = new Date().toISOString();
      const businessId = `business_${Date.now()}`;
      
      const newBusiness: BusinessRecord = {
        profile: {
          id: businessId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          contactName: formData.contactName,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country || 'UK',
          businessType: formData.businessType,
          category: formData.category,
          description: formData.description,
          companyNumber: formData.companyNumber,
          teamSize: formData.teamSize,
          website: formData.website,
          socialMedia: {
            facebook: formData.facebook,
            instagram: formData.instagram,
            twitter: formData.twitter,
            tiktok: formData.tiktok,
            linkedin: formData.linkedin,
          },
          logo: formData.logo,
          additionalFiles: formData.additionalFiles,
          CRMIntegration: formData.CRMIntegration,
          notificationsOptIn: formData.notificationsOptIn,
          createdAt: now,
          updatedAt: now,
        },
        subscriptionTier: formData.subscriptionTier,
        status: formData.status,
        joinDate: formData.joinDate || now,
        renewalDate: formData.renewalDate,
        onboardingCompleted: formData.onboardingCompleted,
        notes: formData.notes,
        rewards: { live: [], draft: [], archived: [] },
        campaigns: { live: [], draft: [], archived: [] },
        customerCount: 0,
        totalScans: 0,
      };

      // Commit to Redis
      await redis.set(REDIS_KEYS.business(businessId), JSON.stringify(newBusiness));
      
      // Add to businesses:all set
      await redis.sadd(REDIS_KEYS.businessList(), businessId);
      
      // Add email index for lookup
      if (formData.email) {
        await redis.set(REDIS_KEYS.businessByEmail(formData.email), businessId);
      }

      // Log action to Redis
      await logAction('create', 'business', businessId);
      
      // Send invitation email
      let invitationLink = '';
      try {
        const invitationData = await sendBusinessInvitation(newBusiness);
        invitationLink = invitationData.invitationLink;
        console.log('✅ Invitation email sent to:', newBusiness.profile.email);
        console.log('📱 Invitation link:', invitationLink);
      } catch (error) {
        console.error('Error sending invitation email:', error);
        // Don't fail business creation if email fails
      }
      
      return { ...newBusiness, invitationLink } as any;
    } catch (error) {
      console.error('[businessData.create] Error creating business:', error);
      throw error;
    }
  },

  /**
   * Update business - commits to Redis
   */
  update: async (id: string, formData: Partial<BusinessFormData>): Promise<BusinessRecord | null> => {
    try {
      const existing = await businessData.getById(id);
      if (!existing) {
        throw new Error(`Business ${id} not found`);
      }

      const updated: BusinessRecord = {
        ...existing,
        profile: {
          ...existing.profile,
          ...(formData.name && { name: formData.name }),
          ...(formData.email && { email: formData.email }),
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.contactName && { contactName: formData.contactName }),
          ...(formData.addressLine1 && { addressLine1: formData.addressLine1 }),
          ...(formData.addressLine2 !== undefined && { addressLine2: formData.addressLine2 }),
          ...(formData.city && { city: formData.city }),
          ...(formData.postcode && { postcode: formData.postcode }),
          ...(formData.country && { country: formData.country }),
          ...(formData.businessType && { businessType: formData.businessType }),
          ...(formData.category && { category: formData.category }),
          ...(formData.description !== undefined && { description: formData.description }),
          ...(formData.companyNumber !== undefined && { companyNumber: formData.companyNumber }),
          ...(formData.teamSize !== undefined && { teamSize: formData.teamSize }),
          ...(formData.website !== undefined && { website: formData.website }),
          ...(formData.facebook !== undefined && { 
            socialMedia: { ...existing.profile.socialMedia, facebook: formData.facebook }
          }),
          ...(formData.instagram !== undefined && { 
            socialMedia: { ...existing.profile.socialMedia, instagram: formData.instagram }
          }),
          ...(formData.twitter !== undefined && { 
            socialMedia: { ...existing.profile.socialMedia, twitter: formData.twitter }
          }),
          ...(formData.tiktok !== undefined && { 
            socialMedia: { ...existing.profile.socialMedia, tiktok: formData.tiktok }
          }),
          ...(formData.linkedin !== undefined && { 
            socialMedia: { ...existing.profile.socialMedia, linkedin: formData.linkedin }
          }),
          ...(formData.logo !== undefined && { logo: formData.logo }),
          ...(formData.additionalFiles !== undefined && { additionalFiles: formData.additionalFiles }),
          ...(formData.CRMIntegration !== undefined && { CRMIntegration: formData.CRMIntegration }),
          ...(formData.notificationsOptIn !== undefined && { notificationsOptIn: formData.notificationsOptIn }),
          updatedAt: new Date().toISOString(),
        },
        ...(formData.subscriptionTier && { subscriptionTier: formData.subscriptionTier }),
        ...(formData.status && { status: formData.status }),
        ...(formData.renewalDate !== undefined && { renewalDate: formData.renewalDate }),
        ...(formData.onboardingCompleted !== undefined && { onboardingCompleted: formData.onboardingCompleted }),
        ...(formData.notes !== undefined && { notes: formData.notes }),
      };

      // Commit to Redis
      console.log(`[businessData.update] Updating business ${id} in Redis`);
      await redis.set(REDIS_KEYS.business(id), JSON.stringify(updated));
      
      // VERIFY: Read back to confirm it was saved
      const verified = await redis.get(REDIS_KEYS.business(id));
      if (!verified) {
        throw new Error(`CRITICAL: Business update not verified - data not found in Redis after write`);
      }
      const verifiedBusiness = JSON.parse(verified);
      if (verifiedBusiness.profile.id !== id) {
        throw new Error(`CRITICAL: Business ID mismatch after update - expected ${id}, got ${verifiedBusiness.profile.id}`);
      }
      console.log(`[businessData.update] ✅ VERIFIED: Business update saved to Redis: ${id}`);
      
      // Update email index if email changed
      if (formData.email && formData.email !== existing.profile.email) {
        if (existing.profile.email) {
          await redis.del(REDIS_KEYS.businessByEmail(existing.profile.email));
        }
        await redis.set(REDIS_KEYS.businessByEmail(formData.email), id);
      }

      await logAction('edit', 'business', id);
      return updated;
    } catch (error) {
      console.error(`[businessData.update] Error updating business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Onboard business (activate)
   */
  onboard: async (id: string): Promise<BusinessRecord | null> => {
    try {
      const now = new Date().toISOString();
      const updated = await businessData.update(id, {
        status: 'active',
        onboardingCompleted: true,
        onboardingDate: now,
      } as any);
      await logAction('onboard', 'business', id);
      return updated;
    } catch (error) {
      console.error(`[businessData.onboard] Error onboarding business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Renew business subscription
   */
  renew: async (id: string, renewalDate?: string): Promise<BusinessRecord | null> => {
    try {
      const business = await businessData.getById(id);
      if (!business) throw new Error(`Business ${id} not found`);

      const nextRenewal = renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const updated = await businessData.update(id, {
        status: 'active',
        lastRenewalDate: business.renewalDate || new Date().toISOString(),
        renewalDate: nextRenewal,
        nextRenewalDate: nextRenewal,
      } as any);
      await logAction('renew', 'business', id);
      return updated;
    } catch (error) {
      console.error(`[businessData.renew] Error renewing business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Suspend business
   */
  suspend: async (id: string, reason?: string): Promise<BusinessRecord | null> => {
    try {
      const business = await businessData.getById(id);
      if (!business) throw new Error(`Business ${id} not found`);

      const updated = await businessData.update(id, {
        status: 'suspended',
        suspendedAt: new Date().toISOString(),
        notes: reason ? `${business.notes || ''}\nSuspended: ${reason}` : business.notes,
      } as any);
      await logAction('suspend', 'business', id, reason);
      return updated;
    } catch (error) {
      console.error(`[businessData.suspend] Error suspending business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Unsubscribe business
   */
  unsubscribe: async (id: string, reason?: string): Promise<BusinessRecord | null> => {
    try {
      const business = await businessData.getById(id);
      if (!business) throw new Error(`Business ${id} not found`);

      const updated = await businessData.update(id, {
        status: 'exiting',
        notes: reason ? `${business.notes || ''}\nUnsubscribed: ${reason}` : business.notes,
      } as any);
      await logAction('unsubscribe', 'business', id, reason);
      return updated;
    } catch (error) {
      console.error(`[businessData.unsubscribe] Error unsubscribing business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Close business account
   */
  close: async (id: string, reason?: string): Promise<BusinessRecord | null> => {
    try {
      const business = await businessData.getById(id);
      if (!business) throw new Error(`Business ${id} not found`);

      const now = new Date().toISOString();
      const updated = await businessData.update(id, {
        status: 'closed',
        exitDate: now,
        exitReason: reason,
        archived: true,
        archivedAt: now,
        notes: reason ? `${business.notes || ''}\nClosed: ${reason}` : business.notes,
      } as any);
      
      // Remove from active businesses set (if needed)
      // Keep in Redis for historical data, just mark as closed
      
      await logAction('close', 'business', id, reason);
      return updated;
    } catch (error) {
      console.error(`[businessData.close] Error closing business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete business - removes from Redis
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      const business = await businessData.getById(id);
      if (!business) throw new Error(`Business ${id} not found`);

      // Delete business record
      await redis.del(REDIS_KEYS.business(id));
      
      // Remove from businesses:all set
      await redis.srem(REDIS_KEYS.businessList(), id);
      
      // Remove email index
      if (business.profile.email) {
        await redis.del(REDIS_KEYS.businessByEmail(business.profile.email));
      }

      await logAction('delete', 'business', id);
      return true;
    } catch (error) {
      console.error(`[businessData.delete] Error deleting business ${id}:`, error);
      throw error;
    }
  },
};

// ============================================
// CUSTOMER OPERATIONS - Redis
// ============================================

export const customerData = {
  /**
   * Get all customers from Redis
   */
  getAll: async (): Promise<CustomerRecord[]> => {
    try {
      const customerIds = await redis.smembers(REDIS_KEYS.customerList());
      
      if (customerIds.length === 0) {
        console.log('[customerData.getAll] No customers found in Redis');
        return [];
      }

      const customerKeys = customerIds.map(id => REDIS_KEYS.customer(id));
      const customerDataStrings = await redis.mget(customerKeys);
      
      const customers: CustomerRecord[] = [];
      for (let i = 0; i < customerDataStrings.length; i++) {
        if (customerDataStrings[i]) {
          try {
            const customer = JSON.parse(customerDataStrings[i]!) as CustomerRecord;
            customers.push(customer);
          } catch (parseError) {
            console.error(`Error parsing customer ${customerIds[i]}:`, parseError);
          }
        }
      }

      console.log(`[customerData.getAll] Loaded ${customers.length} customers from Redis`);
      return customers;
    } catch (error) {
      console.error('[customerData.getAll] Error fetching customers from Redis:', error);
      throw error;
    }
  },

  /**
   * Get single customer by ID from Redis
   */
  getById: async (id: string): Promise<CustomerRecord | null> => {
    try {
      const data = await redis.get(REDIS_KEYS.customer(id));
      if (!data) return null;
      return JSON.parse(data) as CustomerRecord;
    } catch (error) {
      console.error(`[customerData.getById] Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new customer - commits to Redis
   */
  create: async (formData: CustomerFormData): Promise<CustomerRecord> => {
    try {
      const now = new Date().toISOString();
      const customerId = `customer_${Date.now()}`;
      
      const newCustomer: CustomerRecord = {
        profile: {
          id: customerId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          postcode: formData.postcode,
          preferences: {
            notifications: formData.notifications,
            emailMarketing: formData.emailMarketing,
            smsMarketing: formData.smsMarketing,
          },
          favouriteCategories: formData.favouriteCategories,
          preferredBusinesses: formData.preferredBusinesses,
          referralCode: formData.referralCode,
          createdAt: now,
          updatedAt: now,
        },
        status: formData.status,
        joinDate: formData.joinDate || now,
        renewalDate: formData.renewalDate,
        onboardingCompleted: formData.onboardingCompleted,
        notes: formData.notes,
        activeRewards: [],
        earnedRewards: [],
        redeemedRewards: [],
        activeCampaigns: [],
        earnedCampaigns: [],
        redeemedCampaigns: [],
        stats: {
          totalScans: 0,
          totalRewardsEarned: 0,
          totalRewardsRedeemed: 0,
          totalCampaignsEarned: 0,
          totalCampaignsRedeemed: 0,
          businessesVisited: [],
        },
      };

      // Commit to Redis
      await redis.set(REDIS_KEYS.customer(customerId), JSON.stringify(newCustomer));
      
      // Add to customers:all set
      await redis.sadd(REDIS_KEYS.customerList(), customerId);
      
      // Add email index
      if (formData.email) {
        await redis.set(REDIS_KEYS.customerByEmail(formData.email), customerId);
      }

      await logAction('create', 'customer', customerId);
      return newCustomer;
    } catch (error) {
      console.error('[customerData.create] Error creating customer:', error);
      throw error;
    }
  },

  /**
   * Update customer - commits to Redis
   */
  update: async (id: string, formData: Partial<CustomerFormData>): Promise<CustomerRecord | null> => {
    try {
      const existing = await customerData.getById(id);
      if (!existing) {
        throw new Error(`Customer ${id} not found`);
      }

      const updated: CustomerRecord = {
        ...existing,
        profile: {
          ...existing.profile,
          ...(formData.name !== undefined && { name: formData.name }),
          ...(formData.email !== undefined && { email: formData.email }),
          ...(formData.phone !== undefined && { phone: formData.phone }),
          ...(formData.dateOfBirth !== undefined && { dateOfBirth: formData.dateOfBirth }),
          ...(formData.postcode !== undefined && { postcode: formData.postcode }),
          ...(formData.notifications !== undefined || formData.emailMarketing !== undefined || formData.smsMarketing !== undefined) && {
            preferences: {
              notifications: formData.notifications ?? existing.profile.preferences?.notifications ?? false,
              emailMarketing: formData.emailMarketing ?? existing.profile.preferences?.emailMarketing ?? false,
              smsMarketing: formData.smsMarketing ?? existing.profile.preferences?.smsMarketing ?? false,
            },
          },
          ...(formData.favouriteCategories !== undefined && { favouriteCategories: formData.favouriteCategories }),
          ...(formData.preferredBusinesses !== undefined && { preferredBusinesses: formData.preferredBusinesses }),
          ...(formData.referralCode !== undefined && { referralCode: formData.referralCode }),
          updatedAt: new Date().toISOString(),
        },
        ...(formData.status && { status: formData.status }),
        ...(formData.renewalDate !== undefined && { renewalDate: formData.renewalDate }),
        ...(formData.onboardingCompleted !== undefined && { onboardingCompleted: formData.onboardingCompleted }),
        ...(formData.notes !== undefined && { notes: formData.notes }),
      };

      // Commit to Redis
      console.log(`[customerData.update] Updating customer ${id} in Redis`);
      await redis.set(REDIS_KEYS.customer(id), JSON.stringify(updated));
      
      // VERIFY: Read back to confirm it was saved
      const verified = await redis.get(REDIS_KEYS.customer(id));
      if (!verified) {
        throw new Error(`CRITICAL: Customer update not verified - data not found in Redis after write`);
      }
      const verifiedCustomer = JSON.parse(verified);
      if (verifiedCustomer.profile.id !== id) {
        throw new Error(`CRITICAL: Customer ID mismatch after update - expected ${id}, got ${verifiedCustomer.profile.id}`);
      }
      console.log(`[customerData.update] ✅ VERIFIED: Customer update saved to Redis: ${id}`);
      
      // Update email index if email changed
      if (formData.email && formData.email !== existing.profile.email) {
        if (existing.profile.email) {
          await redis.del(REDIS_KEYS.customerByEmail(existing.profile.email));
        }
        await redis.set(REDIS_KEYS.customerByEmail(formData.email), id);
      }

      await logAction('edit', 'customer', id);
      return updated;
    } catch (error) {
      console.error(`[customerData.update] Error updating customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Onboard customer (activate)
   */
  onboard: async (id: string): Promise<CustomerRecord | null> => {
    try {
      const now = new Date().toISOString();
      const updated = await customerData.update(id, {
        status: 'active',
        onboardingCompleted: true,
        onboardingDate: now,
      } as any);
      await logAction('onboard', 'customer', id);
      return updated;
    } catch (error) {
      console.error(`[customerData.onboard] Error onboarding customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Renew customer
   */
  renew: async (id: string, renewalDate?: string): Promise<CustomerRecord | null> => {
    try {
      const customer = await customerData.getById(id);
      if (!customer) throw new Error(`Customer ${id} not found`);

      const nextRenewal = renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const updated = await customerData.update(id, {
        status: 'active',
        lastRenewalDate: customer.renewalDate || new Date().toISOString(),
        renewalDate: nextRenewal,
        nextRenewalDate: nextRenewal,
      } as any);
      await logAction('renew', 'customer', id);
      return updated;
    } catch (error) {
      console.error(`[customerData.renew] Error renewing customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Suspend customer
   */
  suspend: async (id: string, reason?: string): Promise<CustomerRecord | null> => {
    try {
      const customer = await customerData.getById(id);
      if (!customer) throw new Error(`Customer ${id} not found`);

      const updated = await customerData.update(id, {
        status: 'suspended',
        notes: reason ? `${customer.notes || ''}\nSuspended: ${reason}` : customer.notes,
      } as any);
      await logAction('suspend', 'customer', id, reason);
      return updated;
    } catch (error) {
      console.error(`[customerData.suspend] Error suspending customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Unsubscribe customer
   */
  unsubscribe: async (id: string, reason?: string): Promise<CustomerRecord | null> => {
    try {
      const customer = await customerData.getById(id);
      if (!customer) throw new Error(`Customer ${id} not found`);

      const updated = await customerData.update(id, {
        status: 'exiting',
        notes: reason ? `${customer.notes || ''}\nUnsubscribed: ${reason}` : customer.notes,
      } as any);
      await logAction('unsubscribe', 'customer', id, reason);
      return updated;
    } catch (error) {
      console.error(`[customerData.unsubscribe] Error unsubscribing customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Close customer account
   */
  close: async (id: string, reason?: string): Promise<CustomerRecord | null> => {
    try {
      const customer = await customerData.getById(id);
      if (!customer) throw new Error(`Customer ${id} not found`);

      const now = new Date().toISOString();
      const updated = await customerData.update(id, {
        status: 'closed',
        exitDate: now,
        exitReason: reason,
        notes: reason ? `${customer.notes || ''}\nClosed: ${reason}` : customer.notes,
      } as any);
      await logAction('close', 'customer', id, reason);
      return updated;
    } catch (error) {
      console.error(`[customerData.close] Error closing customer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete customer - removes from Redis
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      const customer = await customerData.getById(id);
      if (!customer) throw new Error(`Customer ${id} not found`);

      // Delete customer record
      await redis.del(REDIS_KEYS.customer(id));
      
      // Remove from customers:all set
      await redis.srem(REDIS_KEYS.customerList(), id);
      
      // Remove email index
      if (customer.profile.email) {
        await redis.del(REDIS_KEYS.customerByEmail(customer.profile.email));
      }

      await logAction('delete', 'customer', id);
      return true;
    } catch (error) {
      console.error(`[customerData.delete] Error deleting customer ${id}:`, error);
      throw error;
    }
  },
};

// ============================================
// ACTION LOGGING - Redis
// ============================================

const logAction = async (
  action: LifecycleAction,
  entityType: 'business' | 'customer',
  entityId: string,
  notes?: string
): Promise<void> => {
  try {
    const logEntry = {
      type: action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      adminId: 'admin_1', // In production, get from auth session
      notes,
    };

    // Store in Redis list
    await redis.set(
      `${REDIS_KEYS.actionLog()}:${Date.now()}:${entityId}`,
      JSON.stringify(logEntry)
    );
  } catch (error) {
    console.error('[logAction] Error logging action to Redis:', error);
    // Don't throw - logging failure shouldn't break the operation
  }
};
