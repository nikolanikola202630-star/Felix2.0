// Telegram Init Data Validation Middleware
// Проверяет подлинность данных от Telegram Web App

const crypto = require('crypto');

/**
 * Validate Telegram Web App initData
 * @param {string} initData - Raw initData string from Telegram
 * @param {string} botToken - Bot token
 * @returns {Object|null} - Parsed data or null if invalid
 */
function validateInitData(initData, botToken) {
  try {
    if (!initData || !botToken) {
      return null;
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Sort params alphabetically
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      console.error('❌ Invalid initData hash');
      return null;
    }

    // Check auth_date (data should be fresh, max 24 hours)
    const authDate = parseInt(params.get('auth_date'));
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours

    if (now - authDate > maxAge) {
      console.error('❌ initData expired');
      return null;
    }

    // Parse user data
    const userStr = params.get('user');
    if (!userStr) {
      console.error('❌ No user data in initData');
      return null;
    }

    const user = JSON.parse(userStr);

    return {
      user,
      authDate,
      queryId: params.get('query_id'),
      startParam: params.get('start_param'),
      chatType: params.get('chat_type'),
      chatInstance: params.get('chat_instance')
    };

  } catch (error) {
    console.error('❌ Error validating initData:', error);
    return null;
  }
}

/**
 * Express middleware for validating Telegram initData
 */
function telegramAuthMiddleware(req, res, next) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    
    if (!botToken) {
      console.error('❌ BOT_TOKEN not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Get initData from headers or body
    const initData = req.headers['x-telegram-init-data'] || 
                     req.body?.initData || 
                     req.query?.initData;

    if (!initData) {
      // For development/testing, allow requests without initData
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No initData provided (development mode)');
        req.telegramUser = {
          id: parseInt(req.query.userId || req.body?.userId || 0),
          first_name: 'Test User',
          username: 'testuser'
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No Telegram data provided'
      });
    }

    // Validate initData
    const validated = validateInitData(initData, botToken);

    if (!validated) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid Telegram data'
      });
    }

    // Attach user to request
    req.telegramUser = validated.user;
    req.telegramData = validated;

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}

/**
 * Optional auth middleware (doesn't fail if no initData)
 */
function optionalTelegramAuth(req, res, next) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
    const initData = req.headers['x-telegram-init-data'] || 
                     req.body?.initData || 
                     req.query?.initData;

    if (initData && botToken) {
      const validated = validateInitData(initData, botToken);
      if (validated) {
        req.telegramUser = validated.user;
        req.telegramData = validated;
      }
    }

    // Always continue
    next();

  } catch (error) {
    console.error('❌ Optional auth error:', error);
    next();
  }
}

/**
 * Get user ID from request (with fallback)
 */
function getUserId(req) {
  // Try to get from validated Telegram data
  if (req.telegramUser?.id) {
    return req.telegramUser.id;
  }

  // Fallback to query/body params (for backward compatibility)
  const userId = req.query.userId || req.body?.userId;
  
  if (userId) {
    return parseInt(userId);
  }

  return null;
}

module.exports = {
  validateInitData,
  telegramAuthMiddleware,
  optionalTelegramAuth,
  getUserId
};
