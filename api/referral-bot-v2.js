// Felix Academy - Referral Bot Handler v2.0
// EGOIST ECOSYSTEM Edition
// With partner customization support
// Synchronized with Main Bot v10.3

const { db } = require('../lib/db');
const crypto = require('crypto');

const TOKEN = process.env.REFERRAL_BOT_TOKEN || '8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MAIN_BOT_URL = 'https://t.me/fel12x_bot';

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    };

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await res.json();
  } catch (error) {
    console.error('Send error:', error);
    throw error;
  }
}

// Get partner settings
async function getPartnerSettings(partnerUserId) {
  try {
    const result = await db.query(
      `SELECT * FROM partner_referral_settings WHERE partner_user_id = $1`,
      [partnerUserId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get partner settings error:', error);
    return null;
  }
}

// Check access conditions
async function checkAccessConditions(partnerUserId, userId, settings) {
  if (!settings || !settings.access_conditions || settings.access_conditions.length === 0) {
    return { granted: true, message: null };
  }

  const conditions = settings.access_conditions;
  const pendingConditions = [];

  for (const condition of conditions) {
    const log = await db.query(
      `SELECT * FROM partner_access_log 
       WHERE partner_user_id = $1 AND referred_user_id = $2 AND condition_type = $3`,
      [partnerUserId, userId, condition.type]
    );

    if (log.rows.length === 0 || log.rows[0].status !== 'completed') {
      pendingConditions.push(condition);
    }
  }

  if (pendingConditions.length > 0) {
    return {
      granted: false,
      pending: pendingConditions,
      message: 'Для доступа к академии выполните условия:'
    };
  }

  return { granted: true, message: null };
}

// Process telegram subscription condition
async function processTelegramSubscription(chatId, userId, partnerUserId, channel) {
  try {
    // Check if user is subscribed
    const checkUrl = `https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${channel}&user_id=${userId}`;
    const response = await fetch(checkUrl);
    const data = await response.json();

    if (data.ok && ['member', 'administrator', 'creator'].includes(data.result.status)) {
      // Mark as completed
      await db.query(
        `INSERT INTO partner_access_log (partner_user_id, referred_user_id, condition_type, status, completed_at)
         VALUES ($1, $2, 'telegram_subscription', 'completed', NOW())
         ON CONFLICT (partner_user_id, referred_user_id, condition_type) 
         DO UPDATE SET status = 'completed', completed_at = NOW()`,
        [partnerUserId, userId]
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Check subscription error:', error);
    return false;
  }
}

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix Academy Referral Bot v2.0',
      features: ['partner_customization', 'access_conditions', 'quiz', 'forms'],
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Handle callback queries
    if (callback_query) {
      return await handleCallback(callback_query, res);
    }

    if (!message) {
      return res.json({ ok: true });
    }

    const { chat, from, text } = message;
    if (!chat || !from || !text) {
      return res.json({ ok: true });
    }

    const chatId = chat.id;
    const userId = from.id;
    const userName = from.first_name || 'Пользователь';

    console.log(`📨 Referral Bot v2: ${userName} (${userId}): ${text}`);

    // Parse referral code from /start command
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1 && parts[1].startsWith('ref_')) {
        const refCode = parts[1].substring(4); // Remove 'ref_' prefix
        const partnerUserId = parseInt(refCode);

        if (!isNaN(partnerUserId)) {
          return await handleReferral(chatId, userId, userName, partnerUserId, from, res);
        }
      }
    }

    // Default response
    await send(chatId, `
👋 Привет, ${userName}!

Это реферальный бот Felix Academy v2.0.

Для доступа к академии используйте реферальную ссылку от партнера.

⟁ EGOIST ECOSYSTEM © 2026
    `.trim());

    return res.json({ ok: true });

  } catch (error) {
    console.error('Referral bot error:', error);
    await db.logError('referral-bot-v2', error.message, { body: req.body });
    return res.status(200).json({ ok: true });
  }
};

// Handle referral
async function handleReferral(chatId, userId, userName, partnerUserId, userInfo, res) {
  try {
    // Get partner settings
    const settings = await getPartnerSettings(partnerUserId);

    // Save or update user
    await db.getOrCreateUser({
      id: userId,
      username: userInfo.username,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      language_code: userInfo.language_code
    });

    // Track referral click
    const ipHash = crypto.createHash('md5').update('unknown').digest('hex');
    const sessionId = `${userId}_${Date.now()}`;

    // Check rate limits
    const recentClicks = await db.countRecentReferralClicks(partnerUserId, ipHash, 60);
    if (recentClicks >= 5) {
      await db.saveReferralClick({
        partnerUserId,
        referralCode: `ref_${partnerUserId}`,
        ipHash,
        sessionId,
        isUnique: false,
        blockedReason: 'rate_limit'
      });

      await send(chatId, '⏱️ Слишком много попыток. Попробуйте позже.');
      return res.json({ ok: true });
    }

    // Save click
    await db.saveReferralClick({
      partnerUserId,
      referralCode: `ref_${partnerUserId}`,
      ipHash,
      sessionId,
      isUnique: true
    });

    // Custom welcome message
    const welcomeMessage = settings?.welcome_message || `Привет, ${userName}! 👋 Добро пожаловать в Felix Academy!`;
    const botName = settings?.bot_name || 'Felix Academy';
    const botEmoji = settings?.bot_avatar_emoji || '🎓';

    // Check access conditions
    const accessCheck = await checkAccessConditions(partnerUserId, userId, settings);

    if (!accessCheck.granted) {
      // Show pending conditions
      let conditionsText = `${botEmoji} <b>${botName}</b>\n\n${welcomeMessage}\n\n`;
      conditionsText += `${accessCheck.message}\n\n`;

      for (const condition of accessCheck.pending) {
        if (condition.type === 'telegram_subscription') {
          conditionsText += `📢 Подпишитесь на канал: ${condition.channel}\n`;
        } else if (condition.type === 'quiz') {
          conditionsText += `❓ Пройдите квиз (минимум ${condition.min_score}%)\n`;
        } else if (condition.type === 'form') {
          conditionsText += `📝 Заполните анкету\n`;
        }
      }

      conditionsText += `\n<i>После выполнения условий вы получите доступ к академии.</i>`;

      // Create keyboard with condition buttons
      const keyboard = {
        inline_keyboard: []
      };

      for (const condition of accessCheck.pending) {
        if (condition.type === 'telegram_subscription') {
          keyboard.inline_keyboard.push([
            { text: `📢 Подписаться на ${condition.channel}`, url: `https://t.me/${condition.channel.replace('@', '')}` }
          ]);
          keyboard.inline_keyboard.push([
            { text: '✅ Я подписался', callback_data: `check_sub_${partnerUserId}` }
          ]);
        } else if (condition.type === 'quiz') {
          keyboard.inline_keyboard.push([
            { text: '❓ Пройти квиз', callback_data: `start_quiz_${partnerUserId}` }
          ]);
        } else if (condition.type === 'form') {
          keyboard.inline_keyboard.push([
            { text: '📝 Заполнить анкету', callback_data: `start_form_${partnerUserId}` }
          ]);
        }
      }

      await send(chatId, conditionsText, keyboard);
      return res.json({ ok: true });
    }

    // Access granted - redirect to main bot
    let successText = `${botEmoji} <b>${botName}</b>\n\n${welcomeMessage}\n\n`;
    successText += `✅ Доступ к академии открыт!\n\n`;
    successText += `Переходите в главного бота для начала обучения:`;

    // Custom buttons
    const keyboard = {
      inline_keyboard: [
        [{ text: '🎓 Открыть Felix Academy', url: MAIN_BOT_URL }]
      ]
    };

    if (settings?.custom_buttons && settings.custom_buttons.length > 0) {
      for (const button of settings.custom_buttons) {
        keyboard.inline_keyboard.push([
          { text: button.text, url: button.url }
        ]);
      }
    }

    await send(chatId, successText, keyboard);

    return res.json({ ok: true });

  } catch (error) {
    console.error('Handle referral error:', error);
    await send(chatId, '❌ Произошла ошибка. Попробуйте позже.');
    return res.json({ ok: true });
  }
}

// Handle callback queries
async function handleCallback(callback_query, res) {
  const { data, from, message } = callback_query;
  const chatId = message.chat.id;
  const userId = from.id;

  try {
    // Check subscription
    if (data.startsWith('check_sub_')) {
      const partnerUserId = parseInt(data.split('_')[2]);
      const settings = await getPartnerSettings(partnerUserId);
      
      if (settings && settings.access_conditions) {
        const subCondition = settings.access_conditions.find(c => c.type === 'telegram_subscription');
        if (subCondition) {
          const isSubscribed = await processTelegramSubscription(chatId, userId, partnerUserId, subCondition.channel);
          
          if (isSubscribed) {
            await send(chatId, '✅ Подписка подтверждена! Проверяем остальные условия...');
            // Re-check all conditions
            const accessCheck = await checkAccessConditions(partnerUserId, userId, settings);
            if (accessCheck.granted) {
              await send(chatId, `✅ Все условия выполнены! Переходите в главного бота:\n${MAIN_BOT_URL}`);
            }
          } else {
            await send(chatId, '❌ Подписка не найдена. Пожалуйста, подпишитесь на канал и попробуйте снова.');
          }
        }
      }
    }

    // Start quiz
    if (data.startsWith('start_quiz_')) {
      const partnerUserId = parseInt(data.split('_')[2]);
      await send(chatId, '❓ Квиз скоро будет доступен! Функция в разработке.');
    }

    // Start form
    if (data.startsWith('start_form_')) {
      const partnerUserId = parseInt(data.split('_')[2]);
      await send(chatId, '📝 Анкета скоро будет доступна! Функция в разработке.');
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Callback handler error:', error);
    return res.json({ ok: true });
  }
}
