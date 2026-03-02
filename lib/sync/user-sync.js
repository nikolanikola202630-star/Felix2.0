// User synchronization between bot and mini app (DB-first)
const { db } = require('../db');

class UserSync {
  constructor() {
    this.cache = new Map();
    this.cacheTtlMs = 60 * 1000;
  }

  buildCacheKey(userId) {
    return String(userId);
  }

  getCached(userId) {
    const item = this.cache.get(this.buildCacheKey(userId));
    if (!item) return null;
    if (Date.now() - item.createdAt > this.cacheTtlMs) {
      this.cache.delete(this.buildCacheKey(userId));
      return null;
    }
    return item.payload;
  }

  setCached(userId, payload) {
    this.cache.set(this.buildCacheKey(userId), { payload, createdAt: Date.now() });
  }

  async syncUserData(userId) {
    const cached = this.getCached(userId);
    if (cached) return cached;

    try {
      const [stats, progress, settings, achievements, courses] = await Promise.all([
        db.getUserStats(userId).catch(() => null),
        db.getUserProgress(userId).catch(() => null),
        db.getUserSettings(userId).catch(() => null),
        db.getUserAchievements(userId).catch(() => []),
        db.getUserCourses(userId).catch(() => [])
      ]);

      const payload = {
        userId,
        stats: stats || this.getDefaultStats(),
        progress: progress || this.getDefaultProgress(),
        settings: settings || this.getDefaultSettings(),
        achievements: achievements || [],
        courses: courses || [],
        lastSync: new Date().toISOString()
      };

      this.setCached(userId, payload);
      return payload;
    } catch (error) {
      console.error('Sync error:', error);
      return cached || {
        userId,
        stats: this.getDefaultStats(),
        progress: this.getDefaultProgress(),
        settings: this.getDefaultSettings(),
        achievements: [],
        courses: [],
        lastSync: new Date().toISOString()
      };
    }
  }

  getDefaultStats() {
    return {
      level: 1,
      xp: 0,
      messages_count: 0,
      ai_requests: 0,
      courses_completed: 0,
      achievements_count: 0,
      streak_days: 0,
      total_time: 0
    };
  }

  getDefaultProgress() {
    return {
      active_courses: 0,
      completed_courses: 0,
      lessons_completed: 0,
      streak: 0,
      total_time: 0
    };
  }

  getDefaultSettings() {
    return {
      communication_style: 'casual',
      language: 'ru',
      theme: 'auto',
      ai_model: 'llama-3.3-70b-versatile',
      ai_temperature: 0.7,
      avatar: '👤',
      notifications_enabled: true
    };
  }

  async updateStats(userId, updates) {
    try {
      const patch = {};
      if (updates.theme !== undefined) patch.theme = updates.theme;
      if (updates.ai_model !== undefined) patch.ai_model = updates.ai_model;
      if (updates.ai_temperature !== undefined) patch.ai_temperature = updates.ai_temperature;
      if (updates.notifications_enabled !== undefined) patch.notifications_enabled = updates.notifications_enabled;

      if (Object.keys(patch).length > 0) {
        await db.updateUserSettings(userId, patch);
      }

      const cached = this.getCached(userId);
      if (cached) {
        cached.stats = { ...cached.stats, ...updates };
        cached.lastSync = new Date().toISOString();
        this.setCached(userId, cached);
      }

      return true;
    } catch (error) {
      console.error('Update stats error:', error);
      return false;
    }
  }

  async trackActivity(userId, activity) {
    const activities = {
      message_sent: { xp: 5 },
      ai_request: { xp: 10 },
      lesson_completed: { xp: 50 },
      course_completed: { xp: 500 },
      achievement_unlocked: { xp: 100 }
    };

    const reward = activities[activity?.type] || { xp: 0 };
    await this.syncUserData(userId);
    return reward;
  }

  clearCache(userId) {
    if (userId) {
      this.cache.delete(this.buildCacheKey(userId));
      return;
    }
    this.cache.clear();
  }

  getCacheStats() {
    return {
      items: this.cache.size,
      ttlMs: this.cacheTtlMs
    };
  }
}

module.exports = new UserSync();
