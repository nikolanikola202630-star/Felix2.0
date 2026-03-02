// Felix Bot v9.0 - Test Version with Hardcoded Credentials
// ⚠️ FOR TESTING ONLY! NOT FOR PRODUCTION!

const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/elite.html';
const GROQ_API_KEY = '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';

// Simple in-memory storage for testing
const users = new Map();
const messages = new Map();

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard || {
        inline_keyboard: [[
          { text: '📱 Открыть Felix App', web_app: { url: MINIAPP_URL } }
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
    console.error('Send message error:', error);
    throw error;
  }
}

// Simple AI response using Groq
async function getAIResponse(prompt) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Извините, не могу ответить.';
  } catch (error) {
    console.error('AI error:', error);
    return 'Ошибка AI. Попробуйте позже.';
  }
}

// Main handler
module.exports = async function handler(req, res) {
  // Health check
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix v9.0 Test (Hardcoded)',
      timestamp: new Date().toISOString(),
      note: 'Test version with hardcoded credentials'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Handle callback
    if (callback_query) {
      return res.json({ ok: true });
    }

    // Handle message
    if (message) {
      const { chat: { id: chatId }, from: { id: userId, first_name }, text } = message;

      // Store user
      if (!users.has(userId)) {
        users.set(userId, {
          id: userId,
          first_name,
          message_count: 0
        });
      }
      
      const user = users.get(userId);
      user.message_count++;

      if (!text) return res.json({ ok: true });

      // Handle commands
      if (text.startsWith('/')) {
        const [cmd, ...args] = text.slice(1).split(' ');
        const arg = args.join(' ');

        switch (cmd) {
          case 'start':
            await send(chatId, `
🌟 <b>Felix v9.0 - Test Version</b>

Привет, ${first_name}! 👋

Это тестовая версия бота с hardcoded credentials.

🤖 <b>Доступные команды:</b>
/help - Список команд
/profile - Твой профиль
/ask [вопрос] - Задать вопрос AI

Или просто напиши мне что-нибудь! 🚀
            `.trim());
            break;

          case 'help':
            await send(chatId, `
📖 <b>Команды Felix v9.0 Test</b>

<b>Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль

<b>AI:</b>
/ask [вопрос] - Задать вопрос AI

<b>Или просто пиши мне!</b>
Я отвечу через AI 🎯
            `.trim());
            break;

          case 'profile':
            await send(chatId, `
👤 <b>Твой профиль</b>

ID: ${userId}
Имя: ${first_name}
Сообщений: ${user.message_count}

Это тестовая версия без БД 🧪
            `.trim());
            break;

          case 'ask':
            if (!arg) {
              await send(chatId, 'Используй: /ask [твой вопрос]');
            } else {
              const aiResponse = await getAIResponse(arg);
              await send(chatId, aiResponse);
            }
            break;

          default:
            await send(chatId, '❓ Неизвестная команда. Используй /help');
        }
      } else {
        // Regular message - AI response
        const aiResponse = await getAIResponse(text);
        await send(chatId, aiResponse);
      }

      return res.json({ ok: true });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
};
