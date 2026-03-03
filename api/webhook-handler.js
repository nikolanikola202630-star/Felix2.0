// Felix Academy Bot - Production Webhook Handler
// EGOIST ECOSYSTEM Edition v9.0 FULL

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/index.html';

// In-memory rate limiting
const userRequests = new Map();

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

// AI helper
async function getAIResponse(prompt, userId) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Ты AI-ассистент Felix Academy. Помогаешь с обучением, отвечаешь кратко и по делу на русском.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!res.ok) return 'AI временно недоступен';
    
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Не могу ответить';
  } catch (error) {
    console.error('AI error:', error);
    return 'Ошибка AI';
  }
}

// Rate limiting
function checkRateLimit(userId) {
  const now = Date.now();
  const userReqs = userRequests.get(userId) || [];
  const recentReqs = userReqs.filter(t => now - t < 3600000); // 1 hour
  
  if (recentReqs.length >= 10) {
    return false;
  }
  
  recentReqs.push(now);
  userRequests.set(userId, recentReqs);
  return true;
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

    if (text.startsWith('/')) {
      await handleCommand(chatId, userId, userName, text);
    } else {
      // AI ответ на обычное сообщение
      if (!checkRateLimit(userId)) {
        await send(chatId, '⏱️ Лимит AI запросов: 10/час. Попробуй позже.');
        return res.json({ ok: true });
      }
      
      const aiResponse = await getAIResponse(text, userId);
      await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
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
      
      if (!checkRateLimit(userId)) {
        return send(chatId, '⏱️ Лимит AI запросов: 10/час. Попробуй позже.');
      }
      
      const aiResponse = await getAIResponse(arg, userId);
      await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
    },

    profile: () => send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${userName}

🔗 <b>Реферальная ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_${userId}</code>

Пригласи друга и получи бонусы! 🎁`),

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
      const ADMIN_IDS = [123456789];
      
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
    }
  };

  const handler = commands[cmd];
  if (handler) {
    await handler();
  } else {
    await send(chatId, '❓ Неизвестная команда. Используй /help');
  }
}
