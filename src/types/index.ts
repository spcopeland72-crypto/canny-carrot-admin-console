/**
 * Admin App Type Definitions
 * Comprehensive types for managing businesses and customers
 */

// ============================================
// BUSINESS TYPES
// ============================================

export type BusinessStatus = 'pending' | 'active' | 'renewal_due' | 'suspended' | 'closed' | 'exiting';
export type SubscriptionTier = 'bronze' | 'silver' | 'gold';

export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  logo?: string;
  additionalFiles?: string[];
  companyQRCode?: string;
  companyNumber?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
  };
  category?: string;
  description?: string;
  businessType?: string;
  contactName?: string;
  teamSize?: string;
  CRMIntegration?: boolean;
  notificationsOptIn?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessRecord {
  profile: BusinessProfile;
  subscriptionTier: SubscriptionTier;
  status: BusinessStatus;
  joinDate: string;
  renewalDate?: string;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  onboardingCompleted: boolean;
  onboardingDate?: string;
  exitDate?: string;
  exitReason?: string;
  notes?: string;
  rewards?: {
    live: any[];
    draft: any[];
    archived: any[];
  };
  campaigns?: {
    live: any[];
    draft: any[];
    archived: any[];
  };
  customerCount?: number;
  totalScans?: number;
}

// ============================================
// CUSTOMER TYPES
// ============================================

export type CustomerStatus = 'pending' | 'active' | 'renewal_due' | 'suspended' | 'closed' | 'exiting';

export interface CustomerProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  postcode?: string;
  preferences?: {
    notifications: boolean;
    emailMarketing: boolean;
    smsMarketing: boolean;
  };
  favouriteCategories?: string[];
  preferredBusinesses?: string[];
  referralCode?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  profile: CustomerProfile;
  status: CustomerStatus;
  joinDate: string;
  renewalDate?: string;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  onboardingCompleted: boolean;
  onboardingDate?: string;
  exitDate?: string;
  exitReason?: string;
  notes?: string;
  activeRewards?: any[];
  earnedRewards?: any[];
  redeemedRewards?: any[];
  activeCampaigns?: any[];
  earnedCampaigns?: any[];
  redeemedCampaigns?: any[];
  stats?: {
    totalScans: number;
    totalRewardsEarned: number;
    totalRewardsRedeemed: number;
    totalCampaignsEarned: number;
    totalCampaignsRedeemed: number;
    businessesVisited: string[];
  };
}

// ============================================
// ADMIN ACTION TYPES
// ============================================

export type LifecycleAction = 
  | 'create'
  | 'onboard'
  | 'edit'
  | 'manage'
  | 'renew'
  | 'suspend'
  | 'unsubscribe'
  | 'close'
  | 'delete';

export interface AdminAction {
  type: LifecycleAction;
  entityType: 'business' | 'customer';
  entityId: string;
  timestamp: string;
  adminId: string;
  notes?: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface BusinessFormData {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  contactName: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  postcode: string;
  country?: string;
  
  // Business Details
  businessType: string;
  category: string;
  description?: string;
  companyNumber?: string;
  teamSize?: string;
  
  // Online Presence
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  
  // Subscription
  subscriptionTier: SubscriptionTier;
  status: BusinessStatus;
  
  // Settings
  CRMIntegration: boolean;
  notificationsOptIn: boolean;
  
  // Files
  logo?: string;
  additionalFiles?: string[];
  
  // Lifecycle
  joinDate: string;
  renewalDate?: string;
  onboardingCompleted: boolean;
  notes?: string;
}

export interface CustomerFormData {
  // Basic Info
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  postcode?: string;
  
  // Preferences
  notifications: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  
  // Interests
  favouriteCategories?: string[];
  preferredBusinesses?: string[];
  
  // Referral
  referralCode?: string;
  
  // Status
  status: CustomerStatus;
  
  // Lifecycle
  joinDate: string;
  renewalDate?: string;
  onboardingCompleted: boolean;
  notes?: string;
}




