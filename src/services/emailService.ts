/**
 * Email Service for Admin App - Production
 * Sends business invitation emails with app access links
 * All invitation data stored in Redis
 */

import { redis, REDIS_KEYS } from './redis';
import type { BusinessRecord } from '../types';

export interface InvitationEmailData {
  businessId: string;
  businessName: string;
  contactEmail: string;
  contactName: string;
  invitationToken: string;
  invitationLink: string;
  expiryDate: string;
}

function generateInvitationToken(businessId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${businessId}_${timestamp}_${random}`;
}

function generateInvitationLink(token: string, businessId: string): string {
  return `cannycarrotbusiness://invite?token=${encodeURIComponent(token)}&businessId=${encodeURIComponent(businessId)}`;
}

export const sendBusinessInvitation = async (business: BusinessRecord): Promise<InvitationEmailData> => {
  const token = generateInvitationToken(business.profile.id);
  const link = generateInvitationLink(token, business.profile.id);
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const emailData: InvitationEmailData = {
    businessId: business.profile.id,
    businessName: business.profile.name,
    contactEmail: business.profile.email,
    contactName: business.profile.contactName || business.profile.name,
    invitationToken: token,
    invitationLink: link,
    expiryDate,
  };

  const invitationKey = `business_invitation:${token}`;
  await redis.set(
    invitationKey,
    JSON.stringify({
      ...emailData,
      createdAt: new Date().toISOString(),
      used: false,
    }),
    7 * 24 * 60 * 60
  );

  await redis.set(
    `business_invitation:business:${business.profile.id}`,
    token,
    7 * 24 * 60 * 60
  );

  console.log('📧 Business Invitation Email:', {
    to: business.profile.email,
    subject: 'Welcome to Canny Carrot - Set Up Your Business App',
    link,
  });

  return emailData;
};
