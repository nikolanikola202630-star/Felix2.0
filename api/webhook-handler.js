// Felix Academy Bot - Production Webhook Handler
// EGOIST ECOSYSTEM Edition v9.0 FULL

const { db } = require('../lib/db');
const { ai } = require('../lib/ai');

const TOKEN = process.env.BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/app.html';

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard || {
        inline_keyboard: [[
          { text: '🎓 Открыть Академию', web_app: { url: MINIAPP_URL } }
        ]]
      }
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

// AI helper with database integration
async function getAIResponse(prompt, userId) {
  try {
    // Get user history from DB
    const history = await db.getHistory(userId, { limit: 5 });
    const messages = history.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Get AI response
    const response = await ai.getChatResponse(prompt, messages, { userId });
    
    // Save messages to DB
    await db.saveMessage(userId, 'user', prompt, 'text');
    await db.saveMessage(userId, 'assistant', response.content, 'text', {
      tokens: response.tokens,
      latency: response.latency,
      model: response.model
    });

    // Increment AI usage counter
    await db.incrementAIUsage(userId);

    return response.content;
  } catch (error) {
    console.error('AI error:', error);
    return 'Ошибка AI. Попробуй позже.';
  }
}

// Rate limiting with database
async function checkRateLimit(userId) {
  try {
    return await db.checkAILimit(userId);
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
}

// Main webhook handler
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix Academy - EGOIST ECOSYSTEM',
      version: 'v9.0 FULL',
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

    console.log(`📨 ${userName} (${userId}): ${text}`);

    // Save or update user in database
    try {
      await db.getOrCreateUser({
        id: userId,
        username: from.username,
        first_name: from.first_name,
        last_name: from.last_name,
        language_code: from.language_code
      });
    } catch (dbError) {
      console.error('DB user error:', dbError);
    }

    if (text.startsWith('/')) {
      await handleCommand(chatId, userId, userName, text);
    } else {
      // AI ответ на обычное сообщение
      const canUseAI = await checkRateLimit(userId);
      if (!canUseAI) {
        await send(chatId, '⏱️ Лимит AI запросов: 50/день. Попробуй завтра.');
        return res.json({ ok: true });
      }
      
      const aiResponse = await getAIResponse(text, userId);
      await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    await db.logError('webhook', error.message, { body: req.body });
    return res.status(200).json({ ok: true });
  }
};

// Handle commands
async function handleCommand(chatId, userId, userName, text) {
  const [cmd, ...args] = text.slice(1).split(' ');
  const arg = args.join(' ');

  const commands = {
    start: () => send(chatId, `⟁ <b>Felix Academy - EGOIST ECOSYSTEM</b>

Привет, ${userName}! 👋

Я Felix - твой AI-ассистент и консьерж образовательной платформы.

<b>🎓 Что я предлагаю:</b>
• Курсы по трейдингу, IT, психологии
• AI-помощник 24/7 (просто напиши мне)
• Партнерская программа (20% комиссия)
• Аналитика прогресса

<b>⚡ Команды:</b>
/help - Все команды
/ask [вопрос] - Спросить AI
/profile - Твой профиль
/partner_panel - Партнерский кабинет
/admin - Админ-панель

<b>💡 Просто напиши мне любой вопрос - я отвечу!</b>

<i>Создано в ⟁ EGOIST ECOSYSTEM © 2026</i>`),

    help: () => send(chatId, `📖 <b>Команды Felix Academy</b>

<b>🎯 Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль

<b>🤖 AI-Ассистент:</b>
/ask [вопрос] - Спросить AI
Или просто напиши мне - я отвечу!

<b>📚 Обучение:</b>
/community - Сообщество студентов
/settings - Настройки и персонализация

<b>💼 Партнерка:</b>
/partner - Информация
/partner_panel - Кабинет

<b>⚙️ Админ:</b>
/admin - Админ-панель

<i>⟁ EGOIST ECOSYSTEM © 2026</i>`),

    ask: async () => {
      if (!arg) {
        return send(chatId, '❓ Используй: /ask [твой вопрос]\n\nНапример:\n/ask что такое трейдинг?');
      }
      
      const canUseAI = await checkRateLimit(userId);
      if (!canUseAI) {
        return send(chatId, '⏱️ Лимит AI запросов: 50/день. Попробуй завтра.');
      }
      
      const aiResponse = await getAIResponse(arg, userId);
      await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
    },

    profile: async () => {
      try {
        const stats = await db.getUserStats(userId);
        const progress = await db.getUserProgress(userId);
        
        return send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${userName}

📊 <b>Статистика:</b>
• Сообщений: ${stats.messages_count || 0}
• AI запросов: ${stats.ai_requests || 0}
• Курсов завершено: ${progress.completed_courses || 0}
• Активных курсов: ${progress.active_courses || 0}

🔗 <b>Реферальная ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_${userId}</code>

Пригласи друга и получи бонусы! 🎁`);
      } catch (error) {
        console.error('Profile error:', error);
        return send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${userName}

🔗 <b>Реферальная ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_${userId}</code>`);
      }
    },

    partner: () => send(chatId, `💼 <b>Партнерская программа Felix Academy</b>

<b>💰 Условия:</b>
• 20% с каждой покупки
• Минимум для вывода: 1000 ₽
• Пожизненные отчисления

<b>🔗 Твоя ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_partner${userId}</code>

Используй /partner_panel для полного кабинета!`),

    partner_panel: () => {
      const partnerUrl = `${MINIAPP_URL.replace('index.html', 'partner-dashboard.html')}?user_id=${userId}`;
      return send(chatId, `💼 <b>Партнерский кабинет</b>

Открываю твой партнерский кабинет...

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '💼 Открыть Кабинет', web_app: { url: partnerUrl } }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    },

    admin: () => {
      const ADMIN_IDS = [1907288209, 8264612178];
      
      if (!ADMIN_IDS.includes(userId)) {
        return send(chatId, '❌ Нет прав администратора.');
      }

      const adminUrl = `${MINIAPP_URL.replace('index.html', 'admin-panel.html')}?admin_id=${userId}`;
      return send(chatId, `⚙️ <b>Админ-панель</b>

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '⚙️ Админ-Панель', web_app: { url: adminUrl } }
        ], [
          { text: '📚 Управление Курсами', web_app: { url: adminUrl.replace('admin-panel', 'admin-courses') } }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    },

    community: () => {
      const communityUrl = `${MINIAPP_URL.replace('index.html', 'community.html')}?user_id=${userId}`;
      return send(chatId, `👥 <b>Сообщество Felix Academy</b>

Присоединяйся к нашему сообществу:

🎯 <b>Что внутри:</b>
• Обсуждения курсов
• Обмен опытом
• Вопросы и ответы
• Нетворкинг
• Мотивация и поддержка

💬 <b>Активность:</b>
• Форум по темам
• Чат студентов
• Группы по интересам
• События и вебинары

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '👥 Открыть Сообщество', web_app: { url: communityUrl } }
        ], [
          { text: '💬 Telegram Чат', url: 'https://t.me/egoist_ecosystem' }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    },

    settings: () => {
      const settingsUrl = `${MINIAPP_URL.replace('index.html', 'settings.html')}?user_id=${userId}`;
      return send(chatId, `⚙️ <b>Настройки</b>

Персонализируй свой опыт обучения:

🎨 <b>Доступно:</b>
• Тема оформления (светлая/темная)
• Язык интерфейса
• Уведомления
• AI настройки (температура, модель)
• Приватность

📊 <b>Персонализация:</b>
• Рекомендации курсов
• Темп обучения
• Сложность материала
• Напоминания

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '⚙️ Открыть Настройки', web_app: { url: settingsUrl } }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    }
  };

  const handler = commands[cmd];
  if (handler) {
    await handler();
  } else {
    await send(chatId, '❓ Неизвестная команда. Используй /help');
  }
}
