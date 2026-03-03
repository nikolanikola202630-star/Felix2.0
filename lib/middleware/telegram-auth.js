// CSRF защита для Telegram Mini App через проверку initData
const crypto = require('crypto');

/**
 * Проверяет подпись Telegram WebApp Init Data
 * @param {string} initData - Строка initData от Telegram
 * @param {string} botToken - Токен бота
 * @returns {boolean} - true если подпись валидна
 */
function verifyTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }
    
    urlParams.delete('hash');
    
    // Создать строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создать секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычислить hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram auth verification error:', error);
    return false;
  }
}

/**
 * Извлекает данные пользователя из initData
 * @param {string} initData - Строка initData от Telegram
 * @returns {object|null} - Данные пользователя или null
 */
function extractUserData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }
    
    return JSON.parse(decodeURIComponent(userParam));
  } catch (error) {
    console.error('Extract user data error:', error);
    return null;
  }
}

/**
 * Middleware для проверки Telegram аутентификации
 */
const telegramAuth = (req, res, next) => {
  // Получить initData из заголовка или body
  const initData = req.headers['x-telegram-webapp-init-data'] || req.body?.initData;
  
  if (!initData) {
    return res.status(403).json({
      success: false,
      error: 'Missing Telegram auth data'
    });
  }
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
  }
  
  // Проверить подпись
  if (!verifyTelegramWebAppData(initData, botToken)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid Telegram auth data'
    });
  }
  
  // Извлечь данные пользователя
  const userData = extractUserData(initData);
  
  if (!userData) {
    return res.status(403).json({
      success: false,
      error: 'Cannot extract user data'
    });
  }
  
  // Добавить данные пользователя в request
  req.telegramUser = userData;
  
  next();
};

/**
 * Опциональная аутентификация (не блокирует запрос)
 */
const telegramAuthOptional = (req, res, next) => {
  const initData = req.headers['x-telegram-webapp-init-data'] || req.body?.initData;
  
  if (initData) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (botToken && verifyTelegramWebAppData(initData, botToken)) {
      const userData = extractUserData(initData);
      if (userData) {
        req.telegramUser = userData;
      }
    }
  }
  
  next();
};

module.exports = {
  telegramAuth,
  telegramAuthOptional,
  verifyTelegramWebAppData,
  extractUserData
};
