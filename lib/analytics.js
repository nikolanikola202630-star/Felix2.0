/**
 * Vercel Analytics Integration
 * Отслеживание событий и метрик для Felix Bot
 */

import { track } from '@vercel/analytics';

/**
 * Типы событий для аналитики
 */
export const AnalyticsEvents = {
  // Команды бота
  COMMAND_START: 'command_start',
  COMMAND_HELP: 'command_help',
  COMMAND_ASK: 'command_ask',
  COMMAND_PROFILE: 'command_profile',
  COMMAND_STATS: 'command_stats',
  COMMAND_LIMITS: 'command_limits',
  COMMAND_HISTORY: 'command_history',
  
  // AI взаимодействия
  AI_REQUEST: 'ai_request',
  AI_RESPONSE: 'ai_response',
  AI_ERROR: 'ai_error',
  AI_LIMIT_REACHED: 'ai_limit_reached',
  
  // Кэш
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  CACHE_SET: 'cache_set',
  CACHE_INVALIDATE: 'cache_invalidate',
  
  // База данных
  DB_QUERY: 'db_query',
  DB_ERROR: 'db_error',
  USER_CREATED: 'user_created',
  MESSAGE_SAVED: 'message_saved',
  
  // Mini App
  MINIAPP_OPEN: 'miniapp_open',
  MINIAPP_COURSE_VIEW: 'miniapp_course_view',
  MINIAPP_PARTNER_VIEW: 'miniapp_partner_view',
  MINIAPP_COMMUNITY_VIEW: 'miniapp_community_view',
  
  // Ошибки
  ERROR_OCCURRED: 'error_occurred',
  ERROR_HANDLED: 'error_handled',
  
  // Производительность
  RESPONSE_TIME: 'response_time',
  API_CALL: 'api_call',
};

/**
 * Отслеживание события
 * @param {string} event - Название события
 * @param {Object} properties - Свойства события
 */
export function trackEvent(event, properties = {}) {
  try {
    // Добавляем timestamp
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
    
    // Отправляем в Vercel Analytics
    track(event, eventData);
    
    // Логируем в консоль (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, eventData);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Отслеживание команды бота
 * @param {string} command - Команда
 * @param {number} userId - ID пользователя
 */
export function trackCommand(command, userId) {
  const eventName = `command_${command.replace('/', '')}`;
  trackEvent(eventName, {
    command,
    userId,
    type: 'command',
  });
}

/**
 * Отслеживание AI запроса
 * @param {number} userId - ID пользователя
 * @param {number} tokens - Количество токенов
 * @param {number} responseTime - Время ответа (мс)
 */
export function trackAIRequest(userId, tokens, responseTime) {
  trackEvent(AnalyticsEvents.AI_REQUEST, {
    userId,
    tokens,
    responseTime,
    type: 'ai',
  });
}

/**
 * Отслеживание AI ответа
 * @param {number} userId - ID пользователя
 * @param {boolean} success - Успешность
 * @param {number} responseTime - Время ответа (мс)
 */
export function trackAIResponse(userId, success, responseTime) {
  trackEvent(AnalyticsEvents.AI_RESPONSE, {
    userId,
    success,
    responseTime,
    type: 'ai',
  });
}

/**
 * Отслеживание превышения AI лимита
 * @param {number} userId - ID пользователя
 * @param {string} limitType - Тип лимита (daily/hourly)
 */
export function trackAILimitReached(userId, limitType) {
  trackEvent(AnalyticsEvents.AI_LIMIT_REACHED, {
    userId,
    limitType,
    type: 'limit',
  });
}

/**
 * Отслеживание кэша
 * @param {string} key - Ключ кэша
 * @param {boolean} hit - Cache hit/miss
 */
export function trackCache(key, hit) {
  const event = hit ? AnalyticsEvents.CACHE_HIT : AnalyticsEvents.CACHE_MISS;
  trackEvent(event, {
    key,
    hit,
    type: 'cache',
  });
}

/**
 * Отслеживание ошибки
 * @param {Error} error - Ошибка
 * @param {Object} context - Контекст ошибки
 */
export function trackError(error, context = {}) {
  trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
    error: error.message,
    stack: error.stack,
    ...context,
    type: 'error',
  });
}

/**
 * Отслеживание времени ответа
 * @param {string} endpoint - Endpoint
 * @param {number} duration - Длительность (мс)
 */
export function trackResponseTime(endpoint, duration) {
  trackEvent(AnalyticsEvents.RESPONSE_TIME, {
    endpoint,
    duration,
    type: 'performance',
  });
}

/**
 * Отслеживание открытия Mini App
 * @param {number} userId - ID пользователя
 */
export function trackMiniAppOpen(userId) {
  trackEvent(AnalyticsEvents.MINIAPP_OPEN, {
    userId,
    type: 'miniapp',
  });
}

/**
 * Отслеживание просмотра курса
 * @param {number} userId - ID пользователя
 * @param {number} courseId - ID курса
 */
export function trackCourseView(userId, courseId) {
  trackEvent(AnalyticsEvents.MINIAPP_COURSE_VIEW, {
    userId,
    courseId,
    type: 'miniapp',
  });
}

/**
 * Отслеживание просмотра партнера
 * @param {number} userId - ID пользователя
 * @param {number} partnerId - ID партнера
 */
export function trackPartnerView(userId, partnerId) {
  trackEvent(AnalyticsEvents.MINIAPP_PARTNER_VIEW, {
    userId,
    partnerId,
    type: 'miniapp',
  });
}

/**
 * Middleware для отслеживания API вызовов
 * @param {Function} handler - API handler
 * @returns {Function} Wrapped handler
 */
export function withAnalytics(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    const endpoint = req.url;
    
    try {
      // Выполняем handler
      const result = await handler(req, res);
      
      // Отслеживаем время ответа
      const duration = Date.now() - startTime;
      trackResponseTime(endpoint, duration);
      
      // Отслеживаем API вызов
      trackEvent(AnalyticsEvents.API_CALL, {
        endpoint,
        method: req.method,
        duration,
        success: true,
        type: 'api',
      });
      
      return result;
    } catch (error) {
      // Отслеживаем ошибку
      const duration = Date.now() - startTime;
      trackError(error, {
        endpoint,
        method: req.method,
        duration,
      });
      
      trackEvent(AnalyticsEvents.API_CALL, {
        endpoint,
        method: req.method,
        duration,
        success: false,
        error: error.message,
        type: 'api',
      });
      
      throw error;
    }
  };
}

/**
 * Получение статистики (для дашборда)
 * @returns {Object} Статистика
 */
export function getAnalyticsStats() {
  return {
    events: Object.keys(AnalyticsEvents).length,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };
}

export default {
  track: trackEvent,
  trackCommand,
  trackAIRequest,
  trackAIResponse,
  trackAILimitReached,
  trackCache,
  trackError,
  trackResponseTime,
  trackMiniAppOpen,
  trackCourseView,
  trackPartnerView,
  withAnalytics,
  getAnalyticsStats,
  AnalyticsEvents,
};
