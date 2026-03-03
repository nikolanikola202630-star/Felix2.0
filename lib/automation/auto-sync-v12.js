// Felix Academy V12 - Auto Sync System
// Автоматическая синхронизация всех систем

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

class AutoSyncV12 {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    this.syncInterval = 5 * 60 * 1000; // 5 минут
    this.lastSync = {};
  }

  // Запуск автоматической синхронизации
  async start() {
    console.log('🔄 Auto Sync V12 - Starting...');
    
    // Первая синхронизация
    await this.syncAll();
    
    // Периодическая синхронизация
    setInterval(() => this.syncAll(), this.syncInterval);
    
    console.log('✅ Auto Sync V12 - Running');
  }

  // Полная синхронизация
  async syncAll() {
    const startTime = Date.now();
    console.log('🔄 Starting full sync...');

    try {
      await Promise.all([
        this.syncUsers(),
        this.syncCourses(),
        this.syncStats(),
        this.syncCache(),
        this.syncFiles()
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Full sync completed in ${duration}ms`);
      
      await this.logSync('full', true, duration);
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      await this.logSync('full', false, 0, error.message);
    }
  }

  // Синхронизация пользователей
  async syncUsers() {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .gte('updated_at', this.getLastSyncTime('users'));

      if (error) throw error;

      if (users && users.length > 0) {
        console.log(`📊 Synced ${users.length} users`);
        this.lastSync.users = new Date().toISOString();
      }

      return users;
    } catch (error) {
      console.error('❌ User sync failed:', error);
      throw error;
    }
  }

  // Синхронизация курсов
  async syncCourses() {
    try {
      const { data: courses, error } = await this.supabase
        .from('courses')
        .select('*')
        .gte('updated_at', this.getLastSyncTime('courses'));

      if (error) throw error;

      if (courses && courses.length > 0) {
        // Обновление локального кэша
        await this.updateCoursesCache(courses);
        console.log(`📚 Synced ${courses.length} courses`);
        this.lastSync.courses = new Date().toISOString();
      }

      return courses;
    } catch (error) {
      console.error('❌ Courses sync failed:', error);
      throw error;
    }
  }

  // Синхронизация статистики
  async syncStats() {
    try {
      const stats = await this.calculateGlobalStats();
      
      // Сохранение в кэш
      await this.saveStatsCache(stats);
      
      console.log('📈 Stats synced');
      this.lastSync.stats = new Date().toISOString();
      
      return stats;
    } catch (error) {
      console.error('❌ Stats sync failed:', error);
      throw error;
    }
  }

  // Синхронизация кэша
  async syncCache() {
    try {
      // Очистка устаревшего кэша
      const cacheDir = path.join(process.cwd(), '.cache');
      const files = await fs.readdir(cacheDir).catch(() => []);
      
      let cleaned = 0;
      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        const stats = await fs.stat(filePath);
        const age = Date.now() - stats.mtimeMs;
        
        // Удаление файлов старше 1 часа
        if (age > 60 * 60 * 1000) {
          await fs.unlink(filePath);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🗑️ Cleaned ${cleaned} cache files`);
      }
      
      this.lastSync.cache = new Date().toISOString();
    } catch (error) {
      console.error('❌ Cache sync failed:', error);
    }
  }

  // Синхронизация файлов
  async syncFiles() {
    try {
      // Проверка версий файлов
      const versions = await this.checkFileVersions();
      
      if (versions.needsUpdate) {
        console.log('📦 Files need update');
        // Здесь можно добавить логику обновления
      }
      
      this.lastSync.files = new Date().toISOString();
    } catch (error) {
      console.error('❌ Files sync failed:', error);
    }
  }

  // Вспомогательные методы
  getLastSyncTime(type) {
    return this.lastSync[type] || new Date(0).toISOString();
  }

  async updateCoursesCache(courses) {
    const cacheDir = path.join(process.cwd(), '.cache');
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cachePath = path.join(cacheDir, 'courses.json');
    await fs.writeFile(cachePath, JSON.stringify(courses, null, 2));
  }

  async calculateGlobalStats() {
    const [users, courses, purchases, partners] = await Promise.all([
      this.supabase.from('users').select('*', { count: 'exact', head: true }),
      this.supabase.from('courses').select('*', { count: 'exact', head: true }),
      this.supabase.from('purchases').select('*', { count: 'exact', head: true }),
      this.supabase.from('partners').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: users.count || 0,
      totalCourses: courses.count || 0,
      totalPurchases: purchases.count || 0,
      totalPartners: partners.count || 0,
      timestamp: new Date().toISOString()
    };
  }

  async saveStatsCache(stats) {
    const cacheDir = path.join(process.cwd(), '.cache');
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cachePath = path.join(cacheDir, 'stats.json');
    await fs.writeFile(cachePath, JSON.stringify(stats, null, 2));
  }

  async checkFileVersions() {
    // Проверка версий критических файлов
    const files = [
      'miniapp/app-v12.html',
      'miniapp/core/state.js',
      'miniapp/core/router.js',
      'miniapp/core/api.js'
    ];

    const versions = {};
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const hash = this.hashString(content);
        versions[file] = hash;
      } catch (error) {
        versions[file] = null;
      }
    }

    return {
      versions,
      needsUpdate: false // Логика проверки обновлений
    };
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  async logSync(type, success, duration, error = null) {
    try {
      await this.supabase.from('sync_logs').insert({
        type,
        success,
        duration,
        error,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to log sync:', err);
    }
  }
}

// Экспорт
module.exports = AutoSyncV12;

// Автозапуск если запущен напрямую
if (require.main === module) {
  const sync = new AutoSyncV12();
  sync.start().catch(console.error);
}
