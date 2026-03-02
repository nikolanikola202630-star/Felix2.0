// Felix Bot v9.0 - Test Version with Hardcoded Credentials
// ⚠️ FOR TESTING ONLY! NOT FOR PRODUCTION!

const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/elite.html';
const GROQ_API_KEY = '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';

// Simple in-memory storage for testing
const users = new Map();

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    } else {
      body.reply_markup = {
        inline_keyboard: [[
          { text: '📱 Открыть Felix App', web_app: { url: MINIAPP_URL } }
        ]]
      };
    }

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
    }
    return data;
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
        messages: [
          {
            role: 'system',
            content: 'Ты Felix - умный AI-ассистент. Отвечай кратко, по делу, дружелюбно на русском языке.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return 'Извините, AI временно недоступен. Попробуйте позже.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Извините, не могу ответить.';
  } catch (error) {
    console.error('AI error:', error);
    return 'Ошибка AI. Попробуйте позже.';
  }
}

// Main handler
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      bot: 'Felix v9.0 Test',
      version: '9.0.0',
      mode: 'test',
      timestamp: new Date().toISOString(),
      note: 'Test version with hardcoded credentials',
      users_count: users.size
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Handle callback
    if (callback_query) {
      return res.status(200).json({ ok: true });
    }

    // Handle message
    if (message) {
      const { chat, from, text } = message;
      
      if (!chat || !from) {
        return res.status(200).json({ ok: true });
      }

      const chatId = chat.id;
      const userId = from.id;
      const firstName = from.first_name || 'Пользователь';

      // Store user
      if (!users.has(userId)) {
        users.set(userId, {
          id: userId,
          first_name: firstName,
          message_count: 0,
          ai_requests: 0,
          created_at: new Date()
        });
      }
      
      const user = users.get(userId);
      user.message_count++;

      if (!text) {
        return res.status(200).json({ ok: true });
      }

      // Handle commands
      if (text.startsWith('/')) {
        const parts = text.slice(1).split(' ');
        const cmd = parts[0];
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
          case 'start':
            await send(chatId, `🌟 <b>Felix v9.0 - Test Version</b>

Привет, ${firstName}! 👋

Это тестовая версия бота с базовым функционалом.

🤖 <b>Доступные команды:</b>
/help - Список команд
/profile - Твой профиль
/ask [вопрос] - Задать вопрос AI

Или просто напиши мне что-нибудь, и я отвечу через AI! 🚀`);
            break;

          case 'help':
            await send(chatId, `📖 <b>Команды Felix v9.0 Test</b>

<b>Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль

<b>AI:</b>
/ask [вопрос] - Задать вопрос AI

<b>Или просто пиши мне!</b>
Я отвечу через AI 🎯

<b>Тестовая версия:</b>
• Без базы данных
• In-memory storage
• Базовый функционал`);
            break;

          case 'profile':
            const uptime = Math.floor((new Date() - user.created_at) / 1000 / 60);
            await send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${firstName}
Сообщений: ${user.message_count}
AI запросов: ${user.ai_requests}
В системе: ${uptime} мин

⚠️ Это тестовая версия без БД
Данные сбросятся при рестарте 🧪`);
            break;

          case 'ask':
            if (!arg) {
              await send(chatId, '❓ Используй: /ask [твой вопрос]\n\nНапример:\n/ask что такое AI?');
            } else {
              user.ai_requests++;
              const aiResponse = await getAIResponse(arg);
              await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
            }
            break;

          default:
            await send(chatId, '❓ Неизвестная команда. Используй /help для списка команд.');
        }
      } else {
        // Regular message - AI response
        user.ai_requests++;
        const aiResponse = await getAIResponse(text);
        await send(chatId, `🤖 ${aiResponse}`);
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      ok: false,
      error: 'Internal error',
      message: error.message 
    });
  }
};
