/**
 * Redis Client Service - Admin App
 * 
 * Direct Redis connection - Admin console accesses database independently
 * Admin console sits on one side viewing the database in the background
 * Does NOT go through API server - completely separate path
 */

import Redis from 'ioredis';

// Get Redis URL from environment (only when needed, not at module load)
const getRedisUrl = (): string => {
  // During build, Next.js might call this - return empty string to avoid errors
  // Only check and throw at actual runtime when a request is made
  if (typeof process === 'undefined' || !process.env) {
    return '';
  }
  
  const redisUrl = process.env.REDIS_URL || '';
  if (!redisUrl) {
    // Only throw if we're actually in a runtime environment (not build)
    // Check if we're in a serverless function context (Vercel sets these)
    const isRuntime = process.env.VERCEL || process.env.NEXT_RUNTIME || (typeof window === 'undefined' && process.env.NODE_ENV === 'production');
    if (isRuntime) {
      throw new Error('REDIS_URL environment variable is required for admin console');
    }
    // Return empty string during build to avoid connection attempt
    return '';
  }
  return redisUrl;
};

// Lazy initialization - only create client when needed (not during build)
let redisClientInstance: Redis | null = null;

const createRedisClient = (): Redis => {
  if (redisClientInstance) {
    return redisClientInstance;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required for admin console');
  }

  // Create Redis client with serverless-optimized settings (same as API server)
  const isVercel = process.env.VERCEL === '1';
  redisClientInstance = new Redis(redisUrl, {
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

  return redisClientInstance;
};

// Export client getter function - client is created lazily only when needed
export const getRedisClient = (): Redis => {
  return createRedisClient();
};

// For backward compatibility if needed elsewhere
export { createRedisClient as redisClient };

// Track connection state
let connectionPromise: Promise<void> | null = null;
let isConnected = false;

// Connection handler - lazy connection for serverless (same as API server)
export const connectRedis = async (): Promise<void> => {
  const client = createRedisClient();
  
  // If already connected, return immediately
  if (isConnected && client.status === 'ready') {
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
      client.removeListener('connect', onConnect);
      client.removeListener('ready', onReady);
      client.removeListener('error', onError);
    };

    client.once('connect', onConnect);
    client.once('ready', onReady);
    client.once('error', onError);

    // Only connect if not already connecting/connected
    const status = client.status;
    if (status === 'end' || status === 'close' || status === 'wait') {
      client.connect().catch((err) => {
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
  // Create client first (lazy initialization)
  createRedisClient();
  
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
    const client = createRedisClient();
    await ensureConnected();
    const result = await client.ping();
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.get(key);
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
      const client = createRedisClient();
      await ensureConnected();
      if (expiry) {
        await client.setex(key, expiry, value);
      } else {
        await client.set(key, value);
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
      const client = createRedisClient();
      await ensureConnected();
      await client.del(key);
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.keys(pattern);
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.sadd(key, ...members);
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.smembers(key);
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.srem(key, ...members);
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
      const client = createRedisClient();
      await ensureConnected();
      const result = await client.exists(key);
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
      const client = createRedisClient();
      await ensureConnected();
      if (keys.length === 0) return [];
      return await client.mget(...keys);
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
      const client = createRedisClient();
      await ensureConnected();
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
      }
      await client.mset(...args);
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
      const client = createRedisClient();
      await ensureConnected();
      return await client.hget(key, field);
    } catch (error) {
      console.error(`[Admin Redis] HGET failed for ${key}.${field}:`, error);
      return null;
    }
  },

  hset: async (key: string, field: string, value: string): Promise<boolean> => {
    try {
      const client = createRedisClient();
      await ensureConnected();
      await client.hset(key, field, value);
      return true;
    } catch (error) {
      console.error(`[Admin Redis] HSET failed for ${key}.${field}:`, error);
      throw error;
    }
  },

  hgetall: async (key: string): Promise<Record<string, string>> => {
    try {
      const client = createRedisClient();
      await ensureConnected();
      const result = await client.hgetall(key);
      return result || {};
    } catch (error) {
      console.error(`[Admin Redis] HGETALL failed for ${key}:`, error);
      return {};
    }
  },

  hdel: async (key: string, ...fields: string[]): Promise<number> => {
    try {
      const client = createRedisClient();
      await ensureConnected();
      return await client.hdel(key, ...fields);
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

export default getRedisClient;
