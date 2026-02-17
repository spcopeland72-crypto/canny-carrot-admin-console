/**
 * Admin Data Access Layer - Production
 * All operations commit to Redis database - single source of truth
 */

import { redis, REDIS_KEYS, getApiBaseUrl } from './redis';
import type { BusinessRecord, CustomerRecord, BusinessFormData, CustomerFormData, LifecycleAction } from '../types';
import { sendBusinessInvitation } from './emailService';

/**
 * Normalize Redis business doc to BusinessRecord.
 * Matches scripts/list-all-emails.ts: business?.profile?.email || business?.email, business?.profile?.name || business?.name.
 * Supports both nested (profile) and flat (root) fields.
 */
function normalizeBusinessRecord(raw: Record<string, unknown>, fallbackId: string): BusinessRecord | null {
  const profile = (raw.profile as Record<string, unknown> | undefined) ?? {};
  const resolved = (profile.id ?? raw.id ?? fallbackId) as string;
  const id = (resolved && String(resolved).trim()) ? resolved : fallbackId;
  if (!id) return null;
  return {
    profile: {
      id,
      name: (profile.name ?? raw.name ?? raw.businessName ?? '') as string,
      email: (profile.email ?? raw.email ?? '') as string,
      phone: (profile.phone ?? raw.phone ?? '') as string,
      addressLine1: (profile.addressLine1 ?? raw.addressLine1) as string | undefined,
      addressLine2: (profile.addressLine2 ?? raw.addressLine2) as string | undefined,
      city: (profile.city ?? raw.city) as string | undefined,
      postcode: (profile.postcode ?? raw.postcode) as string | undefined,
      country: (profile.country ?? raw.country) as string | undefined,
      businessType: (profile.businessType ?? raw.businessType) as string | undefined,
      contactName: (profile.contactName ?? raw.contactName) as string | undefined,
      category: (profile.category ?? raw.category) as string | undefined,
      description: (profile.description ?? raw.description) as string | undefined,
      website: (profile.website ?? raw.website) as string | undefined,
      socialMedia: (profile.socialMedia ?? raw.socialMedia) as Record<string, unknown> | undefined,
      companyNumber: (profile.companyNumber ?? raw.companyNumber) as string | undefined,
      teamSize: (profile.teamSize ?? raw.teamSize) as string | undefined,
      CRMIntegration: (profile.CRMIntegration ?? raw.CRMIntegration) as boolean | undefined,
      notificationsOptIn: (profile.notificationsOptIn ?? raw.notificationsOptIn) as boolean | undefined,
      createdAt: (profile.createdAt ?? raw.createdAt) as string | undefined,
      updatedAt: (profile.updatedAt ?? raw.updatedAt) as string | undefined,
    },
    subscriptionTier: (raw.subscriptionTier ?? 'silver') as BusinessRecord['subscriptionTier'],
    status: (raw.status ?? 'pending') as BusinessRecord['status'],
    joinDate: (raw.joinDate ?? raw.createdAt ?? new Date().toISOString()) as string,
    renewalDate: raw.renewalDate as string | undefined,
    onboardingCompleted: (raw.onboardingCompleted ?? false) as boolean,
    rewards: (raw.rewards ?? { live: [], draft: [], archived: [] }) as BusinessRecord['rewards'],
    campaigns: (raw.campaigns ?? { live: [], draft: [], archived: [] }) as BusinessRecord['campaigns'],
    customerCount: (raw.customerCount ?? 0) as number,
    totalScans: (raw.totalScans ?? 0) as number,
    ...(raw as Partial<BusinessRecord>),
  };
}

/**
 * Normalize Redis customer doc to CustomerRecord.
 * Matches scripts/list-all-emails.ts: customer?.profile?.email || customer?.email, customer?.profile?.name || customer?.name.
 * Scripts use flat schema (id, email, firstName, lastName) — name = firstName + ' ' + lastName when no profile/name.
 */
function normalizeCustomerRecord(raw: Record<string, unknown>, fallbackId: string): CustomerRecord | null {
  const profile = (raw.profile as Record<string, unknown> | undefined) ?? {};
  const id = (profile.id ?? raw.id ?? fallbackId) as string;
  if (!id) return null;
  const flatName = [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() || undefined;
  return {
    profile: {
      id,
      name: (profile.name ?? raw.name ?? flatName) as string | undefined,
      email: (profile.email ?? raw.email) as string | undefined,
      phone: (profile.phone ?? raw.phone) as string | undefined,
      dateOfBirth: (profile.dateOfBirth ?? raw.dateOfBirth) as string | undefined,
      postcode: (profile.postcode ?? raw.postcode) as string | undefined,
      preferences: (profile.preferences ?? raw.preferences) as CustomerRecord['profile']['preferences'],
      createdAt: (profile.createdAt ?? raw.createdAt ?? new Date().toISOString()) as string,
      updatedAt: (profile.updatedAt ?? raw.updatedAt ?? new Date().toISOString()) as string,
    },
    status: (raw.status ?? 'pending') as CustomerRecord['status'],
    joinDate: (raw.joinDate ?? raw.createdAt ?? new Date().toISOString()) as string,
    onboardingCompleted: (raw.onboardingCompleted ?? false) as boolean,
    ...(raw as Partial<CustomerRecord>),
  };
}

// ============================================
// BUSINESS OPERATIONS - Redis
// ============================================

/** Get all business IDs by UUID only: businesses:all set first, then KEYS business:* fallback. Never use email index for listing. */
async function getBusinessIdsForList(): Promise<string[]> {
  const setIds = await redis.smembers(REDIS_KEYS.businessList());
  let keysIds: string[] = [];
  try {
    const keys = await redis.keys('business:*');
    if (Array.isArray(keys)) {
      keysIds = keys
        .filter((k) => typeof k === 'string' && k.startsWith('business:') && k.split(':').length === 2)
        .map((k) => (k as string).slice(9));
    }
  } catch {
    // KEYS not available or failed; use set only
  }
  // Prefer businesses:all (UUID set); merge so any business:* doc key not in set still appears
  const merged = [...new Set([...setIds, ...keysIds])];
  if (setIds.length > 0 && keysIds.length > setIds.length) {
    console.log(`[businessData.getAll] businesses:all had ${setIds.length} ids; KEYS added ${merged.length - setIds.length} more`);
  }
  return merged;
}

export const businessData = {
  /**
   * Get all businesses from Redis. Uses businesses:all set + KEYS business:* fallback so businesses
   * that exist in Redis but were never added to the set (e.g. The Stables, Cafe Maison) still appear.
   */
  getAll: async (): Promise<BusinessRecord[]> => {
    try {
      const businessIds = await getBusinessIdsForList();
      if (businessIds.length === 0) {
        console.log('[businessData.getAll] No businesses found in Redis');
        return [];
      }

      const businessKeys = businessIds.map((id) => REDIS_KEYS.business(id));
      console.log(`[businessData.getAll] Fetching ${businessIds.length} businesses with keys:`, businessKeys.slice(0, 5));
      const businessDataStrings = await redis.mget(businessKeys);
      
      const businesses: BusinessRecord[] = [];
      for (let i = 0; i < businessDataStrings.length; i++) {
        if (businessDataStrings[i]) {
          try {
            const raw = JSON.parse(businessDataStrings[i]!) as Record<string, unknown>;
            const fallbackId = businessIds[i] ?? '';
            let business = normalizeBusinessRecord(raw, fallbackId);
            if (!business && fallbackId) {
              /* Always include when parsed: use key as profile.id when normalizer returned null */
              business = {
                profile: { id: fallbackId, name: '', email: '', phone: '' },
                subscriptionTier: 'silver',
                status: 'pending',
                joinDate: new Date().toISOString(),
                onboardingCompleted: false,
                rewards: { live: [], draft: [], archived: [] },
                campaigns: { live: [], draft: [], archived: [] },
                customerCount: 0,
                totalScans: 0,
              };
              console.log(`[businessData.getAll] Included business (minimal) using key: ${fallbackId}`);
            }
            if (business) {
              if (!business.profile?.id && fallbackId) {
                business = { ...business, profile: { ...business.profile, id: fallbackId } };
              }
              businesses.push(business);
              console.log(`[businessData.getAll] Loaded business: ${business.profile?.name || fallbackId} (${business.profile?.id || fallbackId})`);
            }
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
   * Get single business by ID from Redis. Normalizes so flat or nested docs both work.
   */
  getById: async (id: string): Promise<BusinessRecord | null> => {
    try {
      const data = await redis.get(REDIS_KEYS.business(id));
      if (!data) return null;
      const raw = JSON.parse(data) as Record<string, unknown>;
      return normalizeBusinessRecord(raw, id);
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
      await redis.set(REDIS_KEYS.business(id), JSON.stringify(updated));
      
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

/** Get all customer IDs: from customers:all set, then add any from KEYS customer:* (top-level only). */
async function getCustomerIdsForList(): Promise<string[]> {
  const setIds = await redis.smembers(REDIS_KEYS.customerList());
  let keysIds: string[] = [];
  try {
    const keys = await redis.keys('customer:*');
    if (Array.isArray(keys)) {
      keysIds = keys
        .filter((k) => typeof k === 'string' && k.startsWith('customer:') && k.split(':').length === 2)
        .map((k) => (k as string).slice(9));
    }
  } catch {
    // KEYS not available or failed
  }
  return [...new Set([...setIds, ...keysIds])];
}

export const customerData = {
  /**
   * Get all customers from Redis. Uses customers:all set + KEYS customer:* fallback so all records appear.
   */
  getAll: async (): Promise<CustomerRecord[]> => {
    try {
      const customerIds = await getCustomerIdsForList();
      if (customerIds.length === 0) {
        console.log('[customerData.getAll] No customers found in Redis');
        return [];
      }

      const customerKeys = customerIds.map((id) => REDIS_KEYS.customer(id));
      const customerDataStrings = await redis.mget(customerKeys);
      
      const customers: CustomerRecord[] = [];
      for (let i = 0; i < customerDataStrings.length; i++) {
        if (customerDataStrings[i]) {
          try {
            const raw = JSON.parse(customerDataStrings[i]!) as Record<string, unknown>;
            const customer = normalizeCustomerRecord(raw, customerIds[i]);
            if (customer?.profile?.id) {
              customers.push(customer);
            } else {
              console.warn(`[customerData.getAll] Skipped customer ${customerIds[i]}: missing profile.id`);
            }
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
   * Get single customer by ID from Redis. Normalizes so flat (id, email, firstName, lastName) or nested both work.
   */
  getById: async (id: string): Promise<CustomerRecord | null> => {
    try {
      const data = await redis.get(REDIS_KEYS.customer(id));
      if (!data) return null;
      const raw = JSON.parse(data) as Record<string, unknown>;
      return normalizeCustomerRecord(raw, id);
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
      await redis.set(REDIS_KEYS.customer(id), JSON.stringify(updated));
      
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

// ============================================
// SYSTEM NOTIFICATIONS (sys admin messaging)
// ============================================

export interface SystemNotification {
  id: string;
  type: string;
  severity: 'info' | 'warn' | 'error';
  timestamp: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
  source?: string;
}

export const systemNotifications = {
  getList: async (params?: { limit?: number; offset?: number; severity?: string }): Promise<{ notifications: SystemNotification[]; total: number }> => {
    const base = getApiBaseUrl();
    const q = new URLSearchParams();
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.offset != null) q.set('offset', String(params.offset));
    if (params?.severity) q.set('severity', params.severity);
    const url = `${base}/api/v1/system/notifications${q.toString() ? `?${q}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`System notifications API error: ${res.status}`);
    const data = await res.json();
    return { notifications: data.notifications ?? [], total: data.total ?? 0 };
  },
};
