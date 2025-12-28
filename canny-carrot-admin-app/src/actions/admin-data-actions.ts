/**
 * Admin Data Actions - Replaces email-actions.ts from Auroxeon
 * Uses Redis instead of Prisma/Postgres
 * Returns businesses/customers instead of emails
 */

import { businessData, customerData } from '../services/dataAccess';
import { redis, REDIS_KEYS } from '../services/redis';
import type { BusinessRecord, CustomerRecord } from '../types';

// For Members view (businesses)
export async function getInboxItems(view: 'Members' | 'Customers', page = 1, limit = 50) {
  try {
    if (view === 'Members') {
      const businesses = await businessData.getAll();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = businesses.slice(startIndex, endIndex);
      
      return { 
        success: true, 
        items: paginated,
        total: businesses.length 
      };
    } else {
      const customers = await customerData.getAll();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = customers.slice(startIndex, endIndex);
      
      return { 
        success: true, 
        items: paginated,
        total: customers.length 
      };
    }
  } catch (error) {
    console.error(`Get ${view} items error:`, error);
    return { success: false, message: `Failed to fetch ${view}`, items: [], total: 0 };
  }
}

// Get single business/customer by ID
export async function getItemById(view: 'Members' | 'Customers', itemId: string) {
  try {
    if (view === 'Members') {
      const business = await businessData.getById(itemId);
      return business ? { success: true, item: business } : { success: false, message: 'Business not found', item: null };
    } else {
      const customer = await customerData.getById(itemId);
      return customer ? { success: true, item: customer } : { success: false, message: 'Customer not found', item: null };
    }
  } catch (error) {
    console.error(`Get ${view} item by ID error:`, error);
    return { success: false, message: 'Failed to fetch item', item: null };
  }
}

// Delete item
export async function deleteItem(view: 'Members' | 'Customers', itemId: string) {
  try {
    if (view === 'Members') {
      await businessData.delete(itemId);
    } else {
      await customerData.delete(itemId);
    }
    return { success: true };
  } catch (error) {
    console.error(`Delete ${view} item error:`, error);
    return { success: false, message: 'Failed to delete item' };
  }
}




