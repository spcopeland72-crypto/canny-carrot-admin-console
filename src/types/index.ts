/**
 * Admin App Type Definitions
 * Comprehensive types for managing businesses and customers
 */

export type BusinessStatus = 'pending' | 'active' | 'renewal' | 'renewal_due' | 'suspended' | 'closed' | 'exiting' | 'ARCHIVED' | 'PENDING' | 'ACTIVE' | 'RENEWAL';
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
  rewards?: { live: any[]; draft: any[]; archived: any[] };
  campaigns?: { live: any[]; draft: any[]; archived: any[] };
  customerCount?: number;
  totalScans?: number;
}

export type CustomerStatus = 'pending' | 'active' | 'renewal_due' | 'suspended' | 'closed' | 'exiting';

export interface CustomerProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  postcode?: string;
  preferences?: {
    notifications?: boolean;
    emailMarketing?: boolean;
    smsMarketing?: boolean;
  };
  favouriteCategories?: string[];
  preferredBusinesses?: string[];
  referralCode?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface BusinessFormData {
  name: string;
  email: string;
  phone: string;
  contactName: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  postcode: string;
  country?: string;
  businessType: string;
  category: string;
  description?: string;
  companyNumber?: string;
  teamSize?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  subscriptionTier: SubscriptionTier;
  status: BusinessStatus;
  CRMIntegration: boolean;
  notificationsOptIn: boolean;
  logo?: string;
  additionalFiles?: string[];
  joinDate: string;
  renewalDate?: string;
  onboardingCompleted: boolean;
  notes?: string;
}

export interface CustomerFormData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  postcode?: string;
  notifications: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  favouriteCategories?: string[];
  preferredBusinesses?: string[];
  referralCode?: string;
  status: CustomerStatus;
  joinDate: string;
  renewalDate?: string;
  onboardingCompleted: boolean;
  notes?: string;
}
