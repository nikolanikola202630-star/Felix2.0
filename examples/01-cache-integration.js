// Примеры интеграции кэширования в существующие endpoints

import { cache, cacheKeys } from '../lib/cache.js';
import { db } from '../lib/db.js';

// ============================================
// 1. Кэширование настроек пользователя
// ============================================

// api/settings.js - ДО
export async function getSettingsBefore(userId) {
  const settings = await db.getUserSettings(userId);
  return settings;
}

// api/settings.js - ПОСЛЕ
export async function getSettingsAfter(userId) {
  const settings = await cache.get(
    cacheKeys.userSettings(userId),
    () => db.getUserSettings(userId),
    3600 // 1 час
  );
  return settings;
}

// Обновление с инвалидацией
export async function updateSettingsAfter(userId, newSettings) {
  const updated = await db.updateUserSettings(userId, newSettings);
  await cache.invalidate(cacheKeys.userSettings(userId));
  return updated;
}

// ============================================
// 2. Кэширование курсов
// ============================================

// api/courses.js - ДО
export async function getCoursesBefore() {
  const courses = await db.query('SELECT * FROM courses');
  return courses.rows;
}

// api/courses.js - ПОСЛЕ
export async function getCoursesAfter() {
  const courses = await cache.get(
    cacheKeys.courses(),
    async () => {
      const result = await db.query('SELECT * FROM courses');
      return result.rows;
    },
    86400 // 24 часа
  );
  return courses;
}

// Получение одного курса
export async function getCourseAfter(courseId) {
  const course = await cache.get(
    cacheKeys.course(courseId),
    async () => {
      const result = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
      return result.rows[0];
    },
    86400
  );
  return course;
}

// ============================================
// 3. Кэширование статистики
// ============================================

// api/stats.js - ДО
export async function getStatsBefore(userId, period) {
  const stats = await db.getUserStats(userId, period);
  return stats;
}

// api/stats.js - ПОСЛЕ
export async function getStatsAfter(userId, period) {
  const stats = await cache.get(
    cacheKeys.userStats(userId, period),
    () => db.getUserStats(userId, period),
    300 // 5 минут (статистика меняется часто)
  );
  return stats;
}

// ============================================
// 4. Кэширование с множественными ключами
// ============================================

export async function getMultipleUsers(userIds) {
  // Создать ключи для всех пользователей
  const keys = userIds.map(id => cacheKeys.userSettings(id));
  
  // Попытаться получить из кэша
  const cached = await cache.mget(keys);
  
  // Определить, какие пользователи не в кэше
  const missingIds = userIds.filter((id, i) => cached[i] === null);
  
  // Загрузить недостающих из БД
  const missing = await Promise.all(
    missingIds.map(id => db.getUserSettings(id))
  );
  
  // Закэшировать недостающих
  await Promise.all(
    missingIds.map((id, i) => 
      cache.set(cacheKeys.userSettings(id), missing[i], 3600)
    )
  );
  
  // Объединить результаты
  const result = userIds.map((id, i) => {
    if (cached[i] !== null) return cached[i];
    const missingIndex = missingIds.indexOf(id);
    return missing[missingIndex];
  });
  
  return result;
}

// ============================================
// 5. Инвалидация по паттерну
// ============================================

// Инвалидировать все настройки пользователей
export async function invalidateAllUserSettings() {
  await cache.invalidatePattern('settings:*');
}

// Инвалидировать все курсы
export async function invalidateAllCourses() {
  await cache.invalidatePattern('course:*');
  await cache.invalidate(cacheKeys.courses());
}

// ============================================
// 6. Кэширование с fallback
// ============================================

export async function getDataWithFallback(userId) {
  try {
    // Попытаться получить из кэша
    const cached = await cache.get(
      `data:${userId}`,
      null, // Не передаем fetcher
      3600
    );
    
    if (cached) return cached;
    
    // Если нет в кэше, загрузить из БД
    const data = await db.getData(userId);
    
    // Закэшировать
    await cache.set(`data:${userId}`, data, 3600);
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback - загрузить напрямую из БД
    return await db.getData(userId);
  }
}

// ============================================
// 7. Кэширование с условной инвалидацией
// ============================================

export async function updateUserData(userId, newData) {
  // Обновить в БД
  const updated = await db.updateUserData(userId, newData);
  
  // Инвалидировать связанные кэши
  await Promise.all([
    cache.invalidate(cacheKeys.userSettings(userId)),
    cache.invalidate(cacheKeys.userStats(userId, 'day')),
    cache.invalidate(cacheKeys.userStats(userId, 'week')),
    cache.invalidate(cacheKeys.userStats(userId, 'month'))
  ]);
  
  return updated;
}

// ============================================
// 8. Кэширование с TTL на основе данных
// ============================================

export async function getCourseWithDynamicTTL(courseId) {
  const course = await cache.get(
    cacheKeys.course(courseId),
    async () => {
      const result = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
      return result.rows[0];
    },
    // TTL зависит от популярности курса
    async () => {
      const stats = await db.getCourseStats(courseId);
      // Популярные курсы кэшируются дольше
      return stats.views > 1000 ? 86400 : 3600;
    }
  );
  return course;
}

// ============================================
// 9. Кэширование с предварительной загрузкой
// ============================================

export async function preloadPopularCourses() {
  // Получить топ-10 курсов
  const popular = await db.query(
    'SELECT id FROM courses ORDER BY views DESC LIMIT 10'
  );
  
  // Предварительно загрузить в кэш
  await Promise.all(
    popular.rows.map(async (course) => {
      const data = await db.query('SELECT * FROM courses WHERE id = $1', [course.id]);
      await cache.set(cacheKeys.course(course.id), data.rows[0], 86400);
    })
  );
  
  console.log('Preloaded', popular.rows.length, 'popular courses');
}

// ============================================
// 10. Мониторинг эффективности кэша
// ============================================

let cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0
};

export async function getWithStats(key, fetcher, ttl) {
  try {
    const cached = await cache.get(key, null, ttl);
    
    if (cached !== null) {
      cacheStats.hits++;
      console.log(`Cache HIT: ${key} (hit rate: ${getCacheHitRate()}%)`);
      return cached;
    }
    
    cacheStats.misses++;
    console.log(`Cache MISS: ${key} (hit rate: ${getCacheHitRate()}%)`);
    
    const fresh = await fetcher();
    await cache.set(key, fresh, ttl);
    
    return fresh;
  } catch (error) {
    cacheStats.errors++;
    console.error('Cache error:', error);
    return await fetcher();
  }
}

export function getCacheHitRate() {
  const total = cacheStats.hits + cacheStats.misses;
  if (total === 0) return 0;
  return ((cacheStats.hits / total) * 100).toFixed(2);
}

export function getCacheStats() {
  return {
    ...cacheStats,
    hitRate: getCacheHitRate()
  };
}

export function resetCacheStats() {
  cacheStats = { hits: 0, misses: 0, errors: 0 };
}
