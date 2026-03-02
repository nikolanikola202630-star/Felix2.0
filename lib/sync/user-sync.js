// User Synchronization System
// Синхронизация данных между ботом и Mini App

class UserSync {
  constructor() {
    this.cache = new Map();
    this.syncInterval = 30000; // 30 seconds
  }

  // Sync user data from bot to Mini App
  async syncUserData(userId) {
    try {
      const userData = {
        userId,
        stats: await this.getUserStats(userId),
        progress: await this.getUserProgress(userId),
        settings: await this.getUserSettings(userId),
        achievements: await this.getUserAchievements(userId),
        lastSync: new Date().toISOString()
      };

      // Cache data
      this.cache.set(userId, userData);

      return userData;
    } catch (error) {
      console.error('Sync error:', error);
      return this.cache.get(userId) || null;
    }
  }

  // Get user stats
  async getUserStats(userId) {
    // In-memory stats (will be replaced with DB)
    return {
      level: 5,
      xp: 2450,
      messages_count: 127,
      ai_requests: 45,
      courses_completed: 3,
      achievements_count: 12,
      streak_days: 7,
      total_time: 145
    };
  }

  // Get user progress
  async getUserProgress(userId) {
    return {
      courses: [
        { id: 1, progress: 65, last_lesson: 15 },
        { id: 2, progress: 30, last_lesson: 5 }
      ],
      topics: [
        { name: 'JavaScript', progress: 85 },
        { name: 'React', progress: 60 },
        { name: 'Node.js', progress: 45 }
      ]
    };
  }

  // Get user settings
  async getUserSettings(userId) {
    return {
      communicationStyle: 'casual',
      language: 'ru',
      theme: 'auto',
      aiModel: 'llama-3.3-70b-versatile',
      aiTemperature: 0.7,
      avatar: '👤',
      notifications: true
    };
  }

  // Get user achievements
  async getUserAchievements(userId) {
    return [
      { id: 1, icon: '🎯', title: 'Первые шаги', description: 'Завершил первый урок', unlocked: true },
      { id: 2, icon: '🔥', title: 'Неделя подряд', description: '7 дней активности', unlocked: true },
      { id: 3, icon: '⭐', title: 'Отличник', description: 'Все тесты на 100%', unlocked: false }
    ];
  }

  // Update user stats (called from bot)
  async updateStats(userId, updates) {
    const cached = this.cache.get(userId);
    if (cached) {
      cached.stats = { ...cached.stats, ...updates };
      cached.lastSync = new Date().toISOString();
      this.cache.set(userId, cached);
    }
    return true;
  }

  // Track user activity
  async trackActivity(userId, activity) {
    const activities = {
      message_sent: { xp: 5 },
      ai_request: { xp: 10 },
      lesson_completed: { xp: 50 },
      course_completed: { xp: 500 },
      achievement_unlocked: { xp: 100 }
    };

    const reward = activities[activity.type] || { xp: 0 };
    
    // Update XP
    await this.updateStats(userId, {
      xp: (await this.getUserStats(userId)).xp + reward.xp
    });

    return reward;
  }

  // Get cached data
  getCached(userId) {
    return this.cache.get(userId);
  }

  // Clear cache
  clearCache(userId) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

module.exports = new UserSync();
