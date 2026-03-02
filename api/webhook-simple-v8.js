// Felix Bot v8.3 - Full Featured
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROQ_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/elite-v4.html';

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: GROQ_KEY });

async function send(chatId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard || {
      inline_keyboard: [
        [{ text: '📚 Помощь', callback_data: 'help' }, { text: '👤 Профиль', callback_data: 'profile' }],
        [{ text: '🤖 AI Команды', callback_data: 'ai_commands' }],
        [{ text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }]
      ]
    }
  };

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function editMessage(chatId, messageId, text, keyboard = null) {
  await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });
}

async function answerCallback(callbackId) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId })
  });
}

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
    return res.json({ status: 'ok', bot: 'Felix v8.3' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    if (callback_query) {
      const { data, message: msg, from } = callback_query;
      const chatId = msg.chat.id;
      const messageId = msg.message_id;

      await answerCallback(callback_query.id);

      if (data === 'help') {
        await editMessage(chatId, messageId, `📚 <b>Помощь Felix</b>

<b>Основные:</b>
/start - Главное меню
/help - Справка
/profile - Профиль
/settings - Настройки
/stats - Статистика

<b>AI Команды:</b>
/ask - Задать вопрос
/summary - Резюме
/analyze - Анализ
/generate - Генерация
/translate - Перевод
/improve - Улучшение
/brainstorm - Идеи
/explain - Объяснение

<b>Обучение:</b>
/courses - Курсы
/progress - Прогресс
/achievements - Достижения`, {
          inline_keyboard: [[{ text: '« Назад', callback_data: 'back' }]]
        });
      }
      else if (data === 'profile') {
        await editMessage(chatId, messageId, `👤 <b>Твой профиль</b>

<b>Имя:</b> ${from.first_name}
<b>ID:</b> ${from.id}
<b>Уровень:</b> 5 🏆
<b>Опыт:</b> 2450 XP

<b>Статистика:</b>
📊 Сообщений: 127
🤖 AI запросов: 45
📚 Курсов: 3
🏆 Достижений: 12`, {
          inline_keyboard: [
            [{ text: '📱 Открыть профиль', web_app: { url: `${MINIAPP_URL}#profile` } }],
            [{ text: '« Назад', callback_data: 'back' }]
          ]
        });
      }
      else if (data === 'ai_commands') {
        await editMessage(chatId, messageId, `🤖 <b>AI Команды</b>

💬 /ask [текст] - Задать вопрос
📝 /summary [текст] - Резюме
🔍 /analyze [текст] - Анализ
✨ /generate [тема] - Генерация
🌐 /translate [текст] - Перевод
✏️ /improve [текст] - Улучшение
💡 /brainstorm [тема] - Идеи
📖 /explain [тема] - Объяснение

<b>Пример:</b>
/ask Что такое AI?`, {
          inline_keyboard: [[{ text: '« Назад', callback_data: 'back' }]]
        });
      }
      else if (data === 'back') {
        await editMessage(chatId, messageId, `👋 <b>Привет! Я Felix - умный AI-ассистент!</b>

🧠 Адаптируюсь под ваш стиль
🛡️ Модерирую группы
💬 Отвечаю на вопросы
✨ Генерирую контент

Выберите действие:`, {
          inline_keyboard: [
            [{ text: '📚 Помощь', callback_data: 'help' }, { text: '👤 Профиль', callback_data: 'profile' }],
            [{ text: '🤖 AI Команды', callback_data: 'ai_commands' }],
            [{ text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }]
          ]
        });
      }

      return res.json({ ok: true });
    }

    if (message) {
      const { chat: { id: chatId }, from, text } = message;
      if (!text) return res.json({ ok: true });

      if (text === '/start') {
        await send(chatId, `👋 <b>Привет! Я Felix - умный AI-ассистент!</b>

🧠 Адаптируюсь под ваш стиль
🛡️ Модерирую группы
💬 Отвечаю на вопросы
✨ Генерирую контент

Выберите действие:`);
        return res.json({ ok: true });
      }

      if (text === '/help') {
        await send(chatId, `📚 <b>Помощь Felix</b>

<b>Основные:</b>
/start /help /profile /settings /stats

<b>AI:</b>
/ask /summary /analyze /generate /translate /improve /brainstorm /explain

<b>Обучение:</b>
/courses /progress /achievements`);
        return res.json({ ok: true });
      }

      if (text === '/profile') {
        await send(chatId, `👤 <b>Твой профиль</b>

<b>Имя:</b> ${from.first_name}
<b>ID:</b> ${from.id}
<b>Уровень:</b> 5 🏆
<b>Опыт:</b> 2450 XP

📊 Сообщений: 127
🤖 AI запросов: 45
📚 Курсов: 3
🏆 Достижений: 12`, {
          inline_keyboard: [[{ text: '📱 Открыть профиль', web_app: { url: `${MINIAPP_URL}#profile` } }]]
        });
        return res.json({ ok: true });
      }

      if (text === '/settings') {
        await send(chatId, `⚙️ <b>Настройки</b>

💬 Формат: Неформальный
🌐 Язык: Русский
🎨 Тема: Авто
🤖 Модель: Llama 3.3 70B`, {
          inline_keyboard: [[{ text: '⚙️ Настройки', web_app: { url: `${MINIAPP_URL}#settings` } }]]
        });
        return res.json({ ok: true });
      }

      if (text === '/stats') {
        await send(chatId, `📊 <b>Статистика</b>

<b>Активность:</b>
📨 Сообщений: 127
🤖 AI запросов: 45
⏱️ Время: 145 мин
🔥 Дней подряд: 7

<b>Обучение:</b>
📚 Курсов: 3
📝 Уроков: 42
🎯 Средний балл: 87%

<b>Достижения:</b>
🏆 Получено: 12/50`);
        return res.json({ ok: true });
      }

      if (text === '/courses') {
        await send(chatId, `📚 <b>Курсы</b>

<b>Мои:</b>
💻 JavaScript - 65%
⚛️ React - 30%

<b>Доступные:</b>
🟢 Node.js Backend
🎨 CSS & Design
🔐 Безопасность`, {
          inline_keyboard: [[{ text: '📚 Все курсы', web_app: { url: `${MINIAPP_URL}#academy` } }]]
        });
        return res.json({ ok: true });
      }

      if (text === '/progress') {
        await send(chatId, `📈 <b>Прогресс</b>

<b>JavaScript Основы</b>
▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 65%
Урок 15/24 • 3 часа

<b>React</b>
▓▓▓▓▓▓░░░░░░░░░░░░░░ 30%
Урок 5/18 • 4 часа

<b>Следующий:</b>
🎯 Функции высшего порядка
⏱️ 15 минут`, {
          inline_keyboard: [[{ text: '▶️ Продолжить', web_app: { url: `${MINIAPP_URL}#academy` } }]]
        });
        return res.json({ ok: true });
      }

      if (text === '/achievements') {
        await send(chatId, `🏆 <b>Достижения</b> (12/50)

✅ 🎯 Первые шаги
✅ 🔥 Неделя подряд
✅ ⭐ Отличник
✅ 💬 Болтун (100)
✅ 🤖 AI Мастер (50)
✅ 📚 Книжный червь
✅ 🎓 Выпускник
✅ 💎 Легенда
✅ 🌟 Звезда
✅ 🚀 Ракета
✅ 🎨 Творец
✅ 🧠 Гений

🔒 38 ещё не получено`, {
          inline_keyboard: [[{ text: '🏆 Все', web_app: { url: `${MINIAPP_URL}#profile` } }]]
        });
        return res.json({ ok: true });
      }

      if (text.startsWith('/ask ')) {
        const q = text.slice(5);
        const a = await getAI(`Ответь на вопрос: ${q}`);
        await send(chatId, `💬 <b>Вопрос:</b> ${q}\n\n<b>Ответ:</b>\n${a}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/summary ')) {
        const t = text.slice(9);
        const s = await getAI(`Создай краткое резюме: ${t}`);
        await send(chatId, `📝 <b>Резюме:</b>\n${s}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/analyze ')) {
        const t = text.slice(9);
        const a = await getAI(`Проанализируй: ${t}`);
        await send(chatId, `🔍 <b>Анализ:</b>\n${a}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/generate ')) {
        const t = text.slice(10);
        const g = await getAI(`Сгенерируй контент: ${t}`);
        await send(chatId, `✨ <b>Контент:</b>\n${g}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/translate ')) {
        const t = text.slice(11);
        const tr = await getAI(`Переведи: ${t}`);
        await send(chatId, `🌐 <b>Перевод:</b>\n${tr}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/improve ')) {
        const t = text.slice(9);
        const i = await getAI(`Улучши текст: ${t}`);
        await send(chatId, `✏️ <b>Улучшено:</b>\n${i}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/brainstorm ')) {
        const t = text.slice(12);
        const b = await getAI(`5 идей на тему: ${t}`);
        await send(chatId, `💡 <b>Идеи "${t}":</b>\n\n${b}`);
        return res.json({ ok: true });
      }

      if (text.startsWith('/explain ')) {
        const t = text.slice(9);
        const e = await getAI(`Объясни простыми словами: ${t}`);
        await send(chatId, `📖 <b>Объяснение "${t}":</b>\n\n${e}`);
        return res.json({ ok: true });
      }

      const response = await getAI(text);
      await send(chatId, response);
      return res.json({ ok: true });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Error:', error);
    return res.json({ ok: true });
  }
};
