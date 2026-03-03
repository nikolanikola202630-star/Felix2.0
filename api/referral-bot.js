// Felix Academy - Referral Bot Handler
// EGOIST ECOSYSTEM Edition
// Обрабатывает реферальные переходы и перенаправляет в основную академию

const { db } = require('../lib/db');
const crypto = require('crypto');

const REF_BOT_TOKEN = '8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g';
const MAIN_BOT_USERNAME = 'fel12x_bot';
const TELEGRAM_API = `https://api.telegram.org/bot${REF_BOT_TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/index.html';

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

// Hash IP for privacy
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// Generate session ID
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix Academy Referral Bot',
      version: 'v1.0',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

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

    console.log(`📨 [REF BOT] ${userName} (${userId}): ${text}`);

    // Parse /start command with referral code
    if (text.startsWith('/start')) {
      const args = text.split(' ');
      const refCode = args[1]; // ref_123456 or ref_partner123456

      if (refCode && refCode.startsWith('ref_')) {
        await handleReferral(chatId, userId, userName, refCode, req);
      } else {
        await handleStart(chatId, userId, userName);
      }
    } else {
      // Redirect to main bot for any other message
      await send(chatId, `💬 Для полного функционала перейди в основного бота:`, {
        inline_keyboard: [[
          { text: '🎓 Открыть Felix Academy', url: `https://t.me/${MAIN_BOT_USERNAME}` }
        ]]
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Referral bot error:', error);
    try {
      await db.logError('referral-bot', error.message, { body: req.body });
    } catch (dbError) {
      console.error('DB log error:', dbError);
    }
    return res.status(200).json({ ok: true });
  }
};

// Handle referral click
async function handleReferral(chatId, userId, userName, refCode, req) {
  try {
    // Extract partner ID from ref code
    const partnerIdMatch = refCode.match(/ref_(?:partner)?(\d+)/);
    if (!partnerIdMatch) {
      await handleStart(chatId, userId, userName);
      return;
    }

    const partnerId = parseInt(partnerIdMatch[1]);
    
    // Get partner account
    const partner = await db.getPartnerAccount(partnerId);
    
    if (!partner || !partner.is_active) {
      console.log(`Partner ${partnerId} not found or inactive`);
      await handleStart(chatId, userId, userName);
      return;
    }

    // Track referral click
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ipHash = hashIP(ip);
    const userAgent = req.headers['user-agent'] || '';
    const sessionId = generateSessionId();

    // Check for spam (max 5 clicks per hour from same IP)
    const recentClicks = await db.countRecentReferralClicks(partnerId, ipHash, 60);
    
    let isUnique = true;
    let blockedReason = null;

    if (recentClicks >= 5) {
      isUnique = false;
      blockedReason = 'Too many clicks from same IP';
    }

    // Save click to database
    await db.saveReferralClick({
      partnerUserId: partnerId,
      referralCode: partner.referral_code,
      ipHash,
      userAgent,
      referer: req.headers.referer || null,
      sessionId,
      isUnique,
      blockedReason
    });

    // Save user to database
    try {
      await db.getOrCreateUser({
        id: userId,
        username: from.username,
        first_name: from.first_name,
        last_name: from.last_name,
        language_code: from.language_code
      });
    } catch (dbError) {
      console.error('User save error:', dbError);
    }

    // Send welcome message with partner info
    const partnerUser = await db.getUser(partnerId);
    const partnerName = partnerUser?.first_name || 'Партнер';

    await send(chatId, `🎉 <b>Добро пожаловать в Felix Academy!</b>

Привет, ${userName}! 👋

Ты перешел по реферальной ссылке от <b>${partnerName}</b>

<b>⟁ Felix Academy - EGOIST ECOSYSTEM</b>

🎓 <b>Что тебя ждет:</b>
• Курсы по трейдингу, IT, психологии
• AI-ассистент 24/7
• Партнерская программа (20% комиссия)
• Аналитика прогресса

💰 <b>Специальное предложение:</b>
При покупке любого курса ты и ${partnerName} получите бонусы!

<b>🚀 Начни обучение прямо сейчас!</b>

<i>Создано в ⟁ EGOIST ECOSYSTEM © 2026</i>`, {
      inline_keyboard: [
        [
          { text: '🎓 Открыть Академию', web_app: { url: MINIAPP_URL } }
        ],
        [
          { text: '💬 Перейти в основного бота', url: `https://t.me/${MAIN_BOT_USERNAME}?start=ref_${partnerId}` }
        ],
        [
          { text: '💼 Стать партнером', callback_data: 'become_partner' }
        ]
      ]
    });

    console.log(`✅ Referral tracked: Partner ${partnerId} → User ${userId} (unique: ${isUnique})`);

  } catch (error) {
    console.error('Handle referral error:', error);
    await handleStart(chatId, userId, userName);
  }
}

// Handle regular start
async function handleStart(chatId, userId, userName) {
  await send(chatId, `⟁ <b>Felix Academy - EGOIST ECOSYSTEM</b>

Привет, ${userName}! 👋

Это реферальный бот Felix Academy.

<b>🎓 Для полного доступа:</b>
Перейди в основного бота и открой академию!

<i>Создано в ⟁ EGOIST ECOSYSTEM © 2026</i>`, {
    inline_keyboard: [
      [
        { text: '🎓 Открыть Академию', web_app: { url: MINIAPP_URL } }
      ],
      [
        { text: '💬 Перейти в основного бота', url: `https://t.me/${MAIN_BOT_USERNAME}` }
      ]
    ]
  });
}
