// Vercel KV Cache Module
// Install: npm install @vercel/kv

import { kv } from '@vercel/kv';

export const cache = {
  /**
   * Get value from cache or fetch and cache it
   * @param {string} key - Cache key
   * @param {Function} fetcher - Function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   */
  async get(key, fetcher, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await kv.get(key);
      if (cached !== null) {
        console.log(`Cache HIT: ${key}`);
        return cached;
      }

      // Cache miss - fetch fresh data
      console.log(`Cache MISS: ${key}`);
      const fresh = await fetcher();
      
      // Store in cache
      await kv.set(key, fresh, { ex: ttl });
      
      return fresh;
    } catch (error) {
      console.error('Cache error:', error);
      // Fallback to fetcher on cache error
      return await fetcher();
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 3600) {
    try {
      await kv.set(key, value, { ex: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Invalidate cache key
   * @param {string} key - Cache key to invalidate
   */
  async invalidate(key) {
    try {
      await kv.del(key);
      console.log(`Cache invalidated: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return false;
    }
  },

  /**
   * Invalidate multiple keys by pattern
   * @param {string} pattern - Pattern to match keys (e.g., 'user:*')
   */
  async invalidatePattern(pattern) {
    try {
      const keys = await kv.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => kv.del(key)));
        console.log(`Cache invalidated ${keys.length} keys matching: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
      return false;
    }
  },

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of cache keys
   */
  async mget(keys) {
    try {
      return await kv.mget(...keys);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }
};

// Cache key builders
export const cacheKeys = {
  userSettings: (userId) => `settings:${userId}`,
  userStats: (userId, period) => `stats:${userId}:${period}`,
  courses: () => 'courses:all',
  course: (courseId) => `course:${courseId}`,
  partners: () => 'partners:all',
  partner: (partnerId) => `partner:${partnerId}`,
  leaderboard: (period) => `leaderboard:${period}`
};
