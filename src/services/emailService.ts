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

/**
 * Generate a secure invitation token
 */
export const generateInvitationToken = (businessId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${businessId}_${timestamp}_${random}`;
};

/**
 * Generate invitation link for business app
 */
export const generateInvitationLink = (token: string, businessId: string): string => {
  // Business app deep link format: cannycarrotbusiness://invite?token=XXX&businessId=YYY
  return `cannycarrotbusiness://invite?token=${encodeURIComponent(token)}&businessId=${encodeURIComponent(businessId)}`;
};

/**
 * Send business invitation email
 * Stores invitation in Redis
 */
export const sendBusinessInvitation = async (business: BusinessRecord): Promise<InvitationEmailData> => {
  const token = generateInvitationToken(business.profile.id);
  const link = generateInvitationLink(token, business.profile.id);
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const emailData: InvitationEmailData = {
    businessId: business.profile.id,
    businessName: business.profile.name,
    contactEmail: business.profile.email,
    contactName: business.profile.contactName || business.profile.name,
    invitationToken: token,
    invitationLink: link,
    expiryDate,
  };

  // Store invitation in Redis
  const invitationKey = `business_invitation:${token}`;
  await redis.set(
    invitationKey,
    JSON.stringify({
      ...emailData,
      createdAt: new Date().toISOString(),
      used: false,
    }),
    7 * 24 * 60 * 60 // 7 days expiry
  );

  // Also store by businessId for lookup
  await redis.set(
    `business_invitation:business:${business.profile.id}`,
    token,
    7 * 24 * 60 * 60
  );

  // In production, send actual email via API
  // For now, log it - in production this would call your email service
  const emailContent = generateEmailContent(emailData);
  
  console.log('📧 Business Invitation Email:', {
    to: business.profile.email,
    subject: `Welcome to Canny Carrot - Set Up Your Business App`,
    link: link,
  });

  // TODO: In production, call your email API:
  // await fetch(`${API_BASE_URL}/api/v1/email/send-business-invitation`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ emailData, emailContent }),
  // });

  return emailData;
};

/**
 * Generate email HTML content
 */
const generateEmailContent = (data: InvitationEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0E7C86; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0E7C86; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Canny Carrot!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.contactName},</p>
          <p>Your business <strong>${data.businessName}</strong> has been set up on Canny Carrot!</p>
          <p>To get started, please install the Canny Carrot Business App and create your account:</p>
          <ol>
            <li>Install the Canny Carrot Business App on your mobile device</li>
            <li>Click the link below to set up your account</li>
            <li>Create your login credentials</li>
            <li>Your business information will be pre-populated automatically</li>
          </ol>
          <div style="text-align: center;">
            <a href="${data.invitationLink}" class="button">Set Up Business App</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #0E7C86;">${data.invitationLink}</p>
          <p><strong>This invitation link expires in 7 days.</strong></p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>Canny Carrot - Rewarding Your Customers</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Verify invitation token from Redis
 */
export const verifyInvitationToken = async (token: string): Promise<InvitationEmailData | null> => {
  try {
    const invitationKey = `business_invitation:${token}`;
    const data = await redis.get(invitationKey);
    
    if (!data) return null;

    const invitation = JSON.parse(data);
    
    // Check if used or expired
    if (invitation.used || new Date(invitation.expiryDate) <= new Date()) {
      return null;
    }
    
    return invitation;
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    return null;
  }
};

/**
 * Mark invitation as used in Redis
 */
export const markInvitationUsed = async (token: string): Promise<void> => {
  try {
    const invitationKey = `business_invitation:${token}`;
    const data = await redis.get(invitationKey);
    
    if (data) {
      const invitation = JSON.parse(data);
      invitation.used = true;
      invitation.usedAt = new Date().toISOString();
      await redis.set(invitationKey, JSON.stringify(invitation));
    }
  } catch (error) {
    console.error('Error marking invitation as used:', error);
    throw error;
  }
};
