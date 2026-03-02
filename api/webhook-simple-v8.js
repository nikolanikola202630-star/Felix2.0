// Felix Bot v8.3 - Full Featured with All Commands
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite-v2.html';

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

// Get AI response with user context
async function getAI(prompt, userId = null) {
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
/settings - Настройки
/stats - Статистика

<b>AI Команды:</b>
/ask [текст] - Задать вопрос
/summary [текст] - Резюме
/analyze [текст] - Анализ
/generate [тема] - Генерация
/translate [текст] - Перевод
/improve [текст] - Улучшение
/brainstorm [тема] - Идеи
/explain [тема] - Объяснение

<b>Обучение:</b>
/courses - Список курсов
/progress - Мой прогресс
/achievements - Достижения

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

      // Handle /settings
      if (text === '/settings') {
        await send(chatId, `
⚙️ <b>Настройки</b>

<b>Текущие настройки:</b>
💬 Формат: Неформальный
🌐 Язык: Русский
🎨 Тема: Авто
🤖 Модель: Llama 3.3 70B

Открой Mini App для изменения настроек
        `.trim(), {
          inline_keyboard: [
            [{ text: '⚙️ Открыть настройки', web_app: { url: `${MINIAPP_URL}#settings` } }]
          ]
        });
        return res.json({ ok: true });
      }

      // Handle /stats
      if (text === '/stats') {
        await send(chatId, `
📊 <b>Твоя статистика</b>

<b>Активность:</b>
📨 Сообщений: 127
🤖 AI запросов: 45
⏱️ Время обучения: 145 мин
🔥 Дней подряд: 7

<b>Обучение:</b>
📚 Курсов пройдено: 3
📝 Уроков завершено: 42
🎯 Средний балл: 87%

<b>Достижения:</b>
🏆 Получено: 12/50
⭐ Редких: 3
💎 Легендарных: 1
        `.trim());
        return res.json({ ok: true });
      }

      // Handle /courses
      if (text === '/courses') {
        await send(chatId, `
📚 <b>Доступные курсы</b>

<b>Мои курсы:</b>
💻 JavaScript Основы - 65%
⚛️ React для начинающих - 30%

<b>Рекомендуемые:</b>
🟢 Node.js Backend
🎨 CSS & Design
🔐 Безопасность

Открой Mini App для просмотра всех курсов
        `.trim(), {
          inline_keyboard: [
            [{ text: '📚 Открыть курсы', web_app: { url: `${MINIAPP_URL}#academy` } }]
          ]
        });
        return res.json({ ok: true });
      }

      // Handle /progress
      if (text === '/progress') {
        await send(chatId, `
📈 <b>Мой прогресс</b>

<b>JavaScript Основы</b>
▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 65%
Урок 15/24 • Осталось 3 часа

<b>React для начинающих</b>
▓▓▓▓▓▓░░░░░░░░░░░░░░ 30%
Урок 5/18 • Осталось 4 часа

<b>Следующий урок:</b>
🎯 Функции высшего порядка
⏱️ 15 минут

Продолжить обучение в Mini App
        `.trim(), {
          inline_keyboard: [
            [{ text: '▶️ Продолжить', web_app: { url: `${MINIAPP_URL}#academy` } }]
          ]
        });
        return res.json({ ok: true });
      }

      // Handle /achievements
      if (text === '/achievements') {
        await send(chatId, `
🏆 <b>Достижения</b>

<b>Получено: 12/50</b>

✅ 🎯 Первые шаги
✅ 🔥 Неделя подряд
✅ ⭐ Отличник
✅ 💬 Болтун (100 сообщений)
✅ 🤖 AI Мастер (50 запросов)
✅ 📚 Книжный червь
✅ 🎓 Выпускник
✅ 💎 Легенда (редкое)
✅ 🌟 Звезда
✅ 🚀 Ракета
✅ 🎨 Творец
✅ 🧠 Гений

🔒 38 достижений ещё не получено

Открой Mini App для просмотра всех
        `.trim(), {
          inline_keyboard: [
            [{ text: '🏆 Все достижения', web_app: { url: `${MINIAPP_URL}#profile` } }]
          ]
        });
        return res.json({ ok: true });
      }

      // Handle /brainstorm
      if (text.startsWith('/brainstorm ')) {
        const topic = text.slice(12);
        const ideas = await getAI(`Сгенерируй 5 креативных идей на тему: ${topic}. Каждую идею с новой строки с номером.`, chatId);
        await send(chatId, `💡 <b>Идеи на тему "${topic}":</b>\n\n${ideas}`);
        return res.json({ ok: true });
      }

      // Handle /explain
      if (text.startsWith('/explain ')) {
        const topic = text.slice(9);
        const explanation = await getAI(`Объясни простыми словами: ${topic}. Используй примеры и аналогии.`, chatId);
        await send(chatId, `📖 <b>Объяснение "${topic}":</b>\n\n${explanation}`);
        return res.json({ ok: true });
      }
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
        const answer = await getAI(`Ответь на вопрос: ${question}`, chatId);
        await send(chatId, `💬 <b>Вопрос:</b> ${question}\n\n<b>Ответ:</b>\n${answer}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/summary ')) {
        const textToSummarize = text.slice(9);
        const summary = await getAI(`Создай краткое резюме: ${textToSummarize}`, chatId);
        await send(chatId, `📝 <b>Резюме:</b>\n${summary}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/analyze ')) {
        const textToAnalyze = text.slice(9);
        const analysis = await getAI(`Проанализируй текст: ${textToAnalyze}`, chatId);
        await send(chatId, `🔍 <b>Анализ:</b>\n${analysis}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/generate ')) {
        const topic = text.slice(10);
        const content = await getAI(`Сгенерируй контент на тему: ${topic}`, chatId);
        await send(chatId, `✨ <b>Сгенерированный контент:</b>\n${content}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/translate ')) {
        const textToTranslate = text.slice(11);
        const translation = await getAI(`Переведи текст (определи язык и переведи на русский или английский): ${textToTranslate}`, chatId);
        await send(chatId, `🌐 <b>Перевод:</b>\n${translation}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/improve ')) {
        const textToImprove = text.slice(9);
        const improved = await getAI(`Улучши текст, исправь ошибки: ${textToImprove}`, chatId);
        await send(chatId, `✏️ <b>Улучшенный текст:</b>\n${improved}`);
        return res.json({ ok: true });
      }

      // Regular message - AI response
      const response = await getAI(text, chatId);
      await send(chatId, response);
      return res.json({ ok: true });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.json({ ok: true });
  }
};
