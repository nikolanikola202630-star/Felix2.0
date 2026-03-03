// Утилиты для защиты от XSS и санитизации данных

/**
 * Экранирует HTML специальные символы
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
function escapeHTML(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, m => map[m]);
}

/**
 * Удаляет HTML теги из текста
 * @param {string} text - Текст с HTML
 * @returns {string} - Текст без HTML
 */
function stripHTML(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Санитизирует текст для безопасного отображения
 * @param {string} text - Исходный текст
 * @param {object} options - Опции санитизации
 * @returns {string} - Безопасный текст
 */
function sanitizeText(text, options = {}) {
  if (typeof text !== 'string') {
    return text;
  }
  
  const {
    maxLength = 10000,
    allowNewlines = true,
    trim = true
  } = options;
  
  let result = text;
  
  // Удалить HTML теги
  result = stripHTML(result);
  
  // Экранировать специальные символы
  result = escapeHTML(result);
  
  // Удалить переносы строк если не разрешены
  if (!allowNewlines) {
    result = result.replace(/[\r\n]+/g, ' ');
  }
  
  // Обрезать пробелы
  if (trim) {
    result = result.trim();
  }
  
  // Ограничить длину
  if (result.length > maxLength) {
    result = result.substring(0, maxLength) + '...';
  }
  
  return result;
}

/**
 * Санитизирует объект рекурсивно
 * @param {object} obj - Объект для санитизации
 * @param {object} options - Опции санитизации
 * @returns {object} - Санитизированный объект
 */
function sanitizeObject(obj, options = {}) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value, options);
    } else if (typeof value === 'object') {
      result[key] = sanitizeObject(value, options);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Валидирует URL
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если URL валиден
 */
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Санитизирует URL (удаляет опасные протоколы)
 * @param {string} url - URL для санитизации
 * @returns {string|null} - Безопасный URL или null
 */
function sanitizeURL(url) {
  if (!isValidURL(url)) {
    return null;
  }
  
  try {
    const parsed = new URL(url);
    
    // Разрешены только http и https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Валидирует Telegram user_id
 * @param {number} userId - ID пользователя
 * @returns {boolean} - true если валиден
 */
function isValidTelegramUserId(userId) {
  return Number.isInteger(userId) && userId > 0 && userId < 10000000000;
}

/**
 * Санитизирует имя пользователя
 * @param {string} name - Имя пользователя
 * @returns {string} - Безопасное имя
 */
function sanitizeUsername(name) {
  if (typeof name !== 'string') {
    return 'User';
  }
  
  // Удалить HTML и экранировать
  let result = stripHTML(name);
  result = escapeHTML(result);
  
  // Ограничить длину
  if (result.length > 100) {
    result = result.substring(0, 100);
  }
  
  // Если пустое - вернуть дефолт
  if (!result.trim()) {
    return 'User';
  }
  
  return result.trim();
}

module.exports = {
  escapeHTML,
  stripHTML,
  sanitizeText,
  sanitizeObject,
  isValidURL,
  sanitizeURL,
  isValidTelegramUserId,
  sanitizeUsername
};
