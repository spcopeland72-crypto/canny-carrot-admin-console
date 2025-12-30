/**
 * Redis Client Service - Admin App
 * 
 * Direct Redis connection - Admin console accesses database independently
 * Admin console sits on one side viewing the database in the background
 * Does NOT go through API server - completely separate path
 */

import Redis from 'ioredis';

// Get Redis URL from environment
const getRedisUrl = (): string => {
  const redisUrl = process.env.REDIS_URL || '';
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required for admin console');
  }
  return redisUrl;
};

// Create Redis client with serverless-optimized settings (same as API server)
const isVercel = process.env.VERCEL === '1';
const redisUrl = getRedisUrl();
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
  // Serverless-optimized settings
  connectTimeout: 10000, // 10 seconds
  commandTimeout: 5000, // 5 seconds
  enableReadyCheck: false, // Skip ready check to avoid timeout issues
  enableOfflineQueue: false, // Don't queue commands when offline
  keepAlive: 30000, // 30 seconds keepalive
  // For Vercel: don't auto-reconnect aggressively (serverless functions are ephemeral)
  ...(isVercel ? {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1, // Faster failures on Vercel
  } : {}),
});

// Track connection state
let connectionPromise: Promise<void> | null = null;
let isConnected = false;

// Connection handler - lazy connection for serverless (same as API server)
export const connectRedis = async (): Promise<void> => {
  // If already connected, return immediately
  if (isConnected && redisClient.status === 'ready') {
    return Promise.resolve();
  }
  
  // If already connecting, return existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      connectionPromise = null;
      reject(new Error('Redis connection timeout after 10 seconds'));
    }, 10000);

    const onConnect = () => {
      console.log('[Admin Redis] 📡 Connecting to Redis...');
    };

    const onReady = () => {
      clearTimeout(timeout);
      isConnected = true;
      console.log('[Admin Redis] ✅ Redis connection ready');
      cleanup();
      resolve();
    };

    const onError = (err: Error) => {
      clearTimeout(timeout);
      connectionPromise = null;
      isConnected = false;
      console.error('[Admin Redis] ❌ Redis connection error:', err.message);
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      redisClient.removeListener('connect', onConnect);
      redisClient.removeListener('ready', onReady);
      redisClient.removeListener('error', onError);
    };

    redisClient.once('connect', onConnect);
    redisClient.once('ready', onReady);
    redisClient.once('error', onError);

    // Only connect if not already connecting/connected
    const status = redisClient.status;
    if (status === 'end' || status === 'close' || status === 'wait') {
      redisClient.connect().catch((err) => {
        clearTimeout(timeout);
        connectionPromise = null;
        cleanup();
        reject(err);
      });
    } else if (status === 'ready') {
      clearTimeout(timeout);
      isConnected = true;
      cleanup();
      resolve();
    } else {
      // Already connecting
      console.log('[Admin Redis] ⏳ Redis connection in progress...');
    }
  });

  return connectionPromise;
};

// Ensure connection before operations
const ensureConnected = async (): Promise<void> => {
  try {
    await connectRedis();
  } catch (error: any) {
    console.error('[Admin Redis] Failed to connect to Redis:', error.message);
    throw error;
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  try {
    await ensureConnected();
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
};

/**
 * Direct Redis Operations
 * All operations go directly to Redis database - independent of API server
 */
export const redis = {
  /**
   * Get value by key
   */
  get: async (key: string): Promise<string | null> => {
    try {
      await ensureConnected();
      return await redisClient.get(key);
    } catch (error) {
      console.error(`[Admin Redis] GET failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set key-value pair
   */
  set: async (key: string, value: string, expiry?: number): Promise<boolean> => {
    try {
      await ensureConnected();
      if (expiry) {
        await redisClient.setex(key, expiry, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`[Admin Redis] SET failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Delete key
   */
  del: async (key: string): Promise<boolean> => {
    try {
      await ensureConnected();
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`[Admin Redis] DEL failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all keys matching pattern
   */
  keys: async (pattern: string): Promise<string[]> => {
    try {
      await ensureConnected();
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error(`[Admin Redis] KEYS failed for ${pattern}:`, error);
      return [];
    }
  },

  /**
   * Add member to set
   */
  sadd: async (key: string, ...members: string[]): Promise<number> => {
    try {
      await ensureConnected();
      return await redisClient.sadd(key, ...members);
    } catch (error) {
      console.error(`[Admin Redis] SADD failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get all members of set
   */
  smembers: async (key: string): Promise<string[]> => {
    try {
      await ensureConnected();
      return await redisClient.smembers(key);
    } catch (error) {
      console.error(`[Admin Redis] SMEMBERS failed for ${key}:`, error);
      return [];
    }
  },

  /**
   * Remove member from set
   */
  srem: async (key: string, ...members: string[]): Promise<number> => {
    try {
      await ensureConnected();
      return await redisClient.srem(key, ...members);
    } catch (error) {
      console.error(`[Admin Redis] SREM failed for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      await ensureConnected();
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`[Admin Redis] EXISTS failed for ${key}:`, error);
      return false;
    }
  },

  /**
   * Get multiple keys at once
   */
  mget: async (keys: string[]): Promise<(string | null)[]> => {
    try {
      await ensureConnected();
      if (keys.length === 0) return [];
      return await redisClient.mget(...keys);
    } catch (error) {
      console.error(`[Admin Redis] MGET failed:`, error);
      return keys.map(() => null);
    }
  },

  /**
   * Set multiple key-value pairs at once
   */
  mset: async (keyValues: Record<string, string>): Promise<boolean> => {
    try {
      await ensureConnected();
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
      }
      await redisClient.mset(...args);
      return true;
    } catch (error) {
      console.error(`[Admin Redis] MSET failed:`, error);
      throw error;
    }
  },

  /**
   * Hash operations
   */
  hget: async (key: string, field: string): Promise<string | null> => {
    try {
      await ensureConnected();
      return await redisClient.hget(key, field);
    } catch (error) {
      console.error(`[Admin Redis] HGET failed for ${key}.${field}:`, error);
      return null;
    }
  },

  hset: async (key: string, field: string, value: string): Promise<boolean> => {
    try {
      await ensureConnected();
      await redisClient.hset(key, field, value);
      return true;
    } catch (error) {
      console.error(`[Admin Redis] HSET failed for ${key}.${field}:`, error);
      throw error;
    }
  },

  hgetall: async (key: string): Promise<Record<string, string>> => {
    try {
      await ensureConnected();
      const result = await redisClient.hgetall(key);
      return result || {};
    } catch (error) {
      console.error(`[Admin Redis] HGETALL failed for ${key}:`, error);
      return {};
    }
  },

  hdel: async (key: string, ...fields: string[]): Promise<number> => {
    try {
      await ensureConnected();
      return await redisClient.hdel(key, ...fields);
    } catch (error) {
      console.error(`[Admin Redis] HDEL failed for ${key}:`, error);
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

export default redisClient;
