// Rate limiting middleware для защиты API
const rateLimit = require('express-rate-limit');

// Общий лимит для API endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // 100 запросов
  message: {
    success: false,
    error: 'Слишком много запросов, попробуйте позже'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Слишком много запросов, попробуйте позже',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Строгий лимит для AI запросов
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 10, // 10 AI запросов в минуту
  message: {
    success: false,
    error: 'Лимит AI запросов превышен. Попробуйте через минуту.'
  },
  keyGenerator: (req) => {
    // Используем user_id из body или IP
    return req.body?.user_id || req.ip;
  }
});

// Лимит для платежных операций
const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 5, // 5 платежей в 5 минут
  message: {
    success: false,
    error: 'Слишком много попыток оплаты. Подождите 5 минут.'
  },
  keyGenerator: (req) => {
    return req.body?.user_id || req.ip;
  }
});

// Лимит для webhook endpoints
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200, // Telegram может отправлять много обновлений
  message: {
    success: false,
    error: 'Webhook rate limit exceeded'
  }
});

module.exports = {
  apiLimiter,
  aiLimiter,
  paymentLimiter,
  webhookLimiter
};
