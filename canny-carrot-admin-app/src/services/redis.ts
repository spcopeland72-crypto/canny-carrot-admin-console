/**
 * Redis Client Service - Admin App
 * 
 * Production Redis client using Canny Carrot API as proxy
 * All operations go through the API to Redis database
 */

// Get API base URL (Next.js environment)
const getApiBaseUrl = (): string => {
  // Next.js server-side: use server environment variable
  if (typeof window === 'undefined') {
    const serverUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.cannycarrot.com';
    console.log('[Redis Service] Server-side - Using API URL:', serverUrl);
    return serverUrl;
  }
  
  // Next.js client-side: use public environment variable
  const clientUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.cannycarrot.com';
  console.log('[Redis Service] Client-side - Using API URL:', clientUrl);
  return clientUrl;
};

const API_BASE_URL = getApiBaseUrl();
const REDIS_API_URL = `${API_BASE_URL}/api/v1/redis`;

console.log('[Redis Service] Final API_BASE_URL:', API_BASE_URL);
console.log('[Redis Service] Final REDIS_API_URL:', REDIS_API_URL);

/**
 * Check if API/Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.redis === 'connected';
  } catch {
    return false;
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
};

/**
 * Execute Redis command via HTTP API
 */
const executeCommand = async (
  command: string,
  ...args: any[]
): Promise<any> => {
  if (!isOnline()) {
    throw new Error('Device is offline');
  }

  const commandUrl = `${REDIS_API_URL}/${command}`;
  console.log(`[Redis Service] Executing command: ${command}`, { url: commandUrl, args: args.length > 2 ? args.slice(0, 2) : args });

  try {
    const response = await fetch(commandUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Redis Service] Command ${command} failed:`, { status: response.status, statusText: response.statusText, error: errorText });
      throw new Error(`Redis API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Redis Service] Command ${command} succeeded:`, { hasData: result.data !== undefined, resultType: typeof result.data, resultPreview: Array.isArray(result.data) ? result.data.slice(0, 3) : result.data });
    return result.data !== undefined ? result.data : result;
  } catch (error: any) {
    console.error(`[Redis Service] Redis command ${command} failed:`, { error: error.message, url: commandUrl, stack: error.stack });
    throw error;
  }
};

/**
 * Production Redis Operations
 * All operations commit to Redis database via API
 */
export const redis = {
  /**
   * Get value by key
   */
  get: async (key: string): Promise<string | null> => {
    try {
      return await executeCommand('get', key);
    } catch (error) {
      console.error(`Redis GET failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set key-value pair
   */
  set: async (key: string, value: string, expiry?: number): Promise<boolean> => {
    try {
      if (expiry) {
        await executeCommand('setex', key, expiry, value);
      } else {
        await executeCommand('set', key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Delete key
   */
  del: async (key: string): Promise<boolean> => {
    try {
      await executeCommand('del', key);
      return true;
    } catch (error) {
      console.error(`Redis DEL failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all keys matching pattern
   */
  keys: async (pattern: string): Promise<string[]> => {
    try {
      return await executeCommand('keys', pattern);
    } catch (error) {
      console.error(`Redis KEYS failed for ${pattern}:`, error);
      return [];
    }
  },

  /**
   * Add member to set
   */
  sadd: async (key: string, ...members: string[]): Promise<number> => {
    try {
      return await executeCommand('sadd', key, ...members);
    } catch (error) {
      console.error(`Redis SADD failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all members of set
   */
  smembers: async (key: string): Promise<string[]> => {
    try {
      return await executeCommand('smembers', key);
    } catch (error) {
      console.error(`Redis SMEMBERS failed for ${key}:`, error);
      return [];
    }
  },

  /**
   * Remove member from set
   */
  srem: async (key: string, ...members: string[]): Promise<number> => {
    try {
      return await executeCommand('srem', key, ...members);
    } catch (error) {
      console.error(`Redis SREM failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await executeCommand('exists', key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS failed for ${key}:`, error);
      return false;
    }
  },

  /**
   * Get multiple keys at once
   */
  mget: async (keys: string[]): Promise<(string | null)[]> => {
    try {
      if (keys.length === 0) return [];
      return await executeCommand('mget', ...keys);
    } catch (error) {
      console.error(`Redis MGET failed:`, error);
      return keys.map(() => null);
    }
  },

  /**
   * Set multiple key-value pairs at once
   */
  mset: async (keyValues: Record<string, string>): Promise<boolean> => {
    try {
      const args: any[] = [];
      for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
      }
      await executeCommand('mset', ...args);
      return true;
    } catch (error) {
      console.error(`Redis MSET failed:`, error);
      throw error;
    }
  },

  /**
   * Hash operations
   */
  hget: async (key: string, field: string): Promise<string | null> => {
    try {
      return await executeCommand('hget', key, field);
    } catch (error) {
      console.error(`Redis HGET failed for ${key}.${field}:`, error);
      return null;
    }
  },

  hset: async (key: string, field: string, value: string): Promise<boolean> => {
    try {
      await executeCommand('hset', key, field, value);
      return true;
    } catch (error) {
      console.error(`Redis HSET failed for ${key}.${field}:`, error);
      throw error;
    }
  },

  hgetall: async (key: string): Promise<Record<string, string>> => {
    try {
      const result = await executeCommand('hgetall', key);
      // Convert array [key1, val1, key2, val2] to object
      if (Array.isArray(result)) {
        const obj: Record<string, string> = {};
        for (let i = 0; i < result.length; i += 2) {
          obj[result[i]] = result[i + 1];
        }
        return obj;
      }
      return result || {};
    } catch (error) {
      console.error(`Redis HGETALL failed for ${key}:`, error);
      return {};
    }
  },

  hdel: async (key: string, ...fields: string[]): Promise<number> => {
    try {
      return await executeCommand('hdel', key, ...fields);
    } catch (error) {
      console.error(`Redis HDEL failed for ${key}:`, error);
      throw error;
    }
  },
};

/**
 * Redis key prefixes for admin app
 * Matches the structure used across Canny Carrot system
 */
export const REDIS_KEYS = {
  // Business keys (matching API structure)
  business: (id: string) => `business:${id}`,
  businessList: () => 'businesses:all', // Set of all business IDs
  businessByEmail: (email: string) => `business:email:${email}`, // Index: email -> businessId
  businessRewards: (businessId: string) => `business:${businessId}:rewards`, // Set of reward IDs
  businessCampaigns: (businessId: string) => `business:${businessId}:campaigns`, // Set of campaign IDs
  businessCustomers: (businessId: string) => `business:${businessId}:customers`, // Set of customer IDs
  businessCustomerScans: (businessId: string) => `business:${businessId}:customerScans`, // Hash: customerId -> scan record
  
  // Customer/Member keys (matching API structure)
  customer: (id: string) => `customer:${id}`, // Also may be stored as member:${id} in some contexts
  customerList: () => 'customers:all', // Set of all customer IDs
  customerByEmail: (email: string) => `customer:email:${email}`, // Index: email -> customerId
  customerRewards: (customerId: string) => `customer:${customerId}:rewards`, // Set of reward IDs
  customerCampaigns: (customerId: string) => `customer:${customerId}:campaigns`, // Set of campaign IDs
  
  // Admin-specific keys
  actionLog: () => 'admin:actionLog', // Prefix for action log entries
};

export default redis;

