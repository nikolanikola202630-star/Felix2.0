// AI Rate Limiting Module
// Install: npm install @vercel/kv

import { kv } from '@vercel/kv';

const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '50');
const HOURLY_LIMIT = parseInt(process.env.AI_HOURLY_LIMIT || '10');

/**
 * Check if user can make AI request
 * @param {number} userId - Telegram user ID
 * @returns {Object} { allowed, used, limit, resetAt }
 */
export async function checkAILimit(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    
    const dailyKey = `ai:daily:${userId}:${today}`;
    const hourlyKey = `ai:hourly:${userId}:${today}:${hour}`;
    
    // Get current usage
    const [dailyUsage, hourlyUsage] = await Promise.all([
      kv.get(dailyKey),
      kv.get(hourlyKey)
    ]);
    
    const dailyCount = dailyUsage || 0;
    const hourlyCount = hourlyUsage || 0;
    
    // Check limits
    if (dailyCount >= DAILY_LIMIT) {
      return {
        allowed: false,
        reason: 'daily_limit',
        used: dailyCount,
        limit: DAILY_LIMIT,
        resetAt: getEndOfDay()
      };
    }
    
    if (hourlyCount >= HOURLY_LIMIT) {
      return {
        allowed: false,
        reason: 'hourly_limit',
        used: hourlyCount,
        limit: HOURLY_LIMIT,
        resetAt: getEndOfHour()
      };
    }
    
    return {
      allowed: true,
      dailyUsed: dailyCount,
      dailyLimit: DAILY_LIMIT,
      hourlyUsed: hourlyCount,
      hourlyLimit: HOURLY_LIMIT
    };
  } catch (error) {
    console.error('AI rate limit check error:', error);
    // On error, allow request (fail open)
    return { allowed: true };
  }
}

/**
 * Increment AI usage counter
 * @param {number} userId - Telegram user ID
 * @param {number} tokens - Number of tokens used
 */
export async function incrementAIUsage(userId, tokens = 0) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    
    const dailyKey = `ai:daily:${userId}:${today}`;
    const hourlyKey = `ai:hourly:${userId}:${today}:${hour}`;
    const tokensKey = `ai:tokens:${userId}:${today}`;
    
    // Increment counters
    await Promise.all([
      kv.incr(dailyKey),
      kv.incr(hourlyKey),
      kv.incrby(tokensKey, tokens)
    ]);
    
    // Set TTL
    const dailyTTL = Math.floor((getEndOfDay() - Date.now()) / 1000);
    const hourlyTTL = Math.floor((getEndOfHour() - Date.now()) / 1000);
    
    await Promise.all([
      kv.expire(dailyKey, dailyTTL),
      kv.expire(hourlyKey, hourlyTTL),
      kv.expire(tokensKey, dailyTTL)
    ]);
    
    return true;
  } catch (error) {
    console.error('AI usage increment error:', error);
    return false;
  }
}

/**
 * Get AI usage stats for user
 * @param {number} userId - Telegram user ID
 */
export async function getAIUsageStats(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    
    const dailyKey = `ai:daily:${userId}:${today}`;
    const hourlyKey = `ai:hourly:${userId}:${today}:${hour}`;
    const tokensKey = `ai:tokens:${userId}:${today}`;
    
    const [dailyUsage, hourlyUsage, tokensUsed] = await Promise.all([
      kv.get(dailyKey),
      kv.get(hourlyKey),
      kv.get(tokensKey)
    ]);
    
    return {
      daily: {
        used: dailyUsage || 0,
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - (dailyUsage || 0),
        resetAt: getEndOfDay()
      },
      hourly: {
        used: hourlyUsage || 0,
        limit: HOURLY_LIMIT,
        remaining: HOURLY_LIMIT - (hourlyUsage || 0),
        resetAt: getEndOfHour()
      },
      tokens: {
        used: tokensUsed || 0
      }
    };
  } catch (error) {
    console.error('AI usage stats error:', error);
    return null;
  }
}

/**
 * Reset AI limits for user (admin function)
 * @param {number} userId - Telegram user ID
 */
export async function resetAILimits(userId) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    
    const keys = [
      `ai:daily:${userId}:${today}`,
      `ai:hourly:${userId}:${today}:${hour}`,
      `ai:tokens:${userId}:${today}`
    ];
    
    await Promise.all(keys.map(key => kv.del(key)));
    
    return true;
  } catch (error) {
    console.error('AI limits reset error:', error);
    return false;
  }
}

// Helper functions
function getEndOfDay() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return endOfDay.getTime();
}

function getEndOfHour() {
  const now = new Date();
  const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);
  return endOfHour.getTime();
}
