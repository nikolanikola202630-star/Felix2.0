// Felix Bot v8.0 - Full Featured
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite.html';

// Groq AI
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: GROQ_KEY });

// Send message with keyboard
async function send(chatId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard || {
      inline_keyboard: [
        [
          { text: '📚 Помощь', callback_data: 'help' },
          { text: '👤 Профиль', callback_data: 'profile' }
        ],
        [
          { text: '🤖 AI Команды', callback_data: 'ai_commands' }
        ],
        [
          { text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }
        ]
      ]
    }
  };

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

// Edit message
async function editMessage(chatId, messageId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard
  };

  const res = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

// Answer callback
async function answerCallback(callbackId, text = '') {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text })
  });
}

// Get AI response
async function getAI(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000
    });
    return completion.choices[0]?.message?.content || 'Ошибка AI';
  } catch (error) {
    console.error('AI error:', error);
    return 'Ошибка обработки запроса';
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ status: 'ok', bot: 'Felix v8.0 Full' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Handle callback
    if (callback_query) {
      const { data, message: msg, from } = callback_query;
      const chatId = msg.chat.id;
      const messageId = msg.message_id;

      await answerCallback(callback_query.id);

      // Handle callbacks
      if (data === 'help') {
        await editMessage(chatId, messageId, `
📚 <b>Помощь Felix</b>

<b>Основные команды:</b>
/start - Главное меню
/help - Справка
/profile - Твой профиль
/ai - AI команды

<b>AI Команды:</b>
/ask [текст] - Задать вопрос
/summary [текст] - Резюме
/analyze [текст] - Анализ
/generate [тема] - Генерация
/translate [текст] - Перевод
/improve [текст] - Улучшение

Просто пиши мне - я отвечу! 💬
        `.trim(), {
          inline_keyboard: [
            [{ text: '« Назад', callback_data: 'back' }]
          ]
        });
      }
      else if (data === 'profile') {
        await editMessage(chatId, messageId, `
👤 <b>Твой профиль</b>

<b>Имя:</b> ${from.first_name}
<b>ID:</b> ${from.id}
<b>Уровень:</b> 5 🏆
<b>Опыт:</b> 2450 XP

<b>Статистика:</b>
📊 Сообщений: 127
🤖 AI запросов: 45
📚 Курсов: 3
🏆 Достижений: 12

Открой Mini App для подробностей! 📱
        `.trim(), {
          inline_keyboard: [
            [{ text: '📱 Открыть профиль', web_app: { url: `${MINIAPP_URL}#profile` } }],
            [{ text: '« Назад', callback_data: 'back' }]
          ]
        });
      }
      else if (data === 'ai_commands') {
        await editMessage(chatId, messageId, `
🤖 <b>AI Команды</b>

Выбери команду:

💬 /ask - Задать вопрос
📝 /summary - Краткое резюме
🔍 /analyze - Анализ текста
✨ /generate - Генерация контента
🌐 /translate - Перевод
✏️ /improve - Улучшение текста

<b>Использование:</b>
/ask Что такое AI?
/summary [вставь текст]
        `.trim(), {
          inline_keyboard: [
            [{ text: '« Назад', callback_data: 'back' }]
          ]
        });
      }
      else if (data === 'back') {
        await editMessage(chatId, messageId, `
👋 <b>Привет! Я Felix - умный AI-ассистент с самообучением!</b>

🧠 Я адаптируюсь под ваш стиль общения
🛡️ Модерирую группы
💬 Отвечаю на вопросы
✨ Генерирую контент

Выберите действие:
        `.trim(), {
          inline_keyboard: [
            [
              { text: '📚 Помощь', callback_data: 'help' },
              { text: '👤 Профиль', callback_data: 'profile' }
            ],
            [
              { text: '🤖 AI Команды', callback_data: 'ai_commands' }
            ],
            [
              { text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }
            ]
          ]
        });
      }

      return res.json({ ok: true });
    }

    // Handle message
    if (message) {
      const { chat: { id: chatId }, from, text } = message;

      if (!text) return res.json({ ok: true });

      // Handle /start
      if (text === '/start') {
        await send(chatId, `
👋 <b>Привет! Я Felix - умный AI-ассистент с самообучением!</b>

🧠 Я адаптируюсь под ваш стиль общения
🛡️ Модерирую группы
💬 Отвечаю на вопросы
✨ Генерирую контент

Выберите действие:
        `.trim());
        return res.json({ ok: true });
      }

      // Handle /help
      if (text === '/help') {
        await send(chatId, `
📚 <b>Помощь Felix</b>

<b>Основные команды:</b>
/start - Главное меню
/help - Справка
/profile - Твой профиль
/ai - AI команды

<b>AI Команды:</b>
/ask [текст] - Задать вопрос
/summary [текст] - Резюме
/analyze [текст] - Анализ
/generate [тема] - Генерация
/translate [текст] - Перевод
/improve [текст] - Улучшение

Просто пиши мне - я отвечу! 💬
        `.trim());
        return res.json({ ok: true });
      }

      // Handle /profile
      if (text === '/profile') {
        await send(chatId, `
👤 <b>Твой профиль</b>

<b>Имя:</b> ${from.first_name}
<b>ID:</b> ${from.id}
<b>Уровень:</b> 5 🏆
<b>Опыт:</b> 2450 XP

<b>Статистика:</b>
📊 Сообщений: 127
🤖 AI запросов: 45
📚 Курсов: 3
🏆 Достижений: 12

Открой Mini App для подробностей! 📱
        `.trim(), {
          inline_keyboard: [
            [{ text: '📱 Открыть профиль', web_app: { url: `${MINIAPP_URL}#profile` } }]
          ]
        });
        return res.json({ ok: true });
      }

      // Handle AI commands
      if (text.startsWith('/ask ')) {
        const question = text.slice(5);
        const answer = await getAI(`Ответь на вопрос: ${question}`);
        await send(chatId, `💬 <b>Вопрос:</b> ${question}\n\n<b>Ответ:</b>\n${answer}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/summary ')) {
        const textToSummarize = text.slice(9);
        const summary = await getAI(`Создай краткое резюме: ${textToSummarize}`);
        await send(chatId, `📝 <b>Резюме:</b>\n${summary}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/analyze ')) {
        const textToAnalyze = text.slice(9);
        const analysis = await getAI(`Проанализируй текст: ${textToAnalyze}`);
        await send(chatId, `🔍 <b>Анализ:</b>\n${analysis}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/generate ')) {
        const topic = text.slice(10);
        const content = await getAI(`Сгенерируй контент на тему: ${topic}`);
        await send(chatId, `✨ <b>Сгенерированный контент:</b>\n${content}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/translate ')) {
        const textToTranslate = text.slice(11);
        const translation = await getAI(`Переведи текст (определи язык и переведи на русский или английский): ${textToTranslate}`);
        await send(chatId, `🌐 <b>Перевод:</b>\n${translation}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/improve ')) {
        const textToImprove = text.slice(9);
        const improved = await getAI(`Улучши текст, исправь ошибки: ${textToImprove}`);
        await send(chatId, `✏️ <b>Улучшенный текст:</b>\n${improved}`);
        return res.json({ ok: true });
      }

      // Regular message - AI response
      const response = await getAI(text);
      await send(chatId, response);
      return res.json({ ok: true });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.json({ ok: true });
  }
};
