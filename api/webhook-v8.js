// Felix Bot v8.0 - Autonomous AI with ML & Self-Learning
const db = require('../lib/db').db;
const ai = require('../lib/ai').ai;
const personalization = require('../lib/ml/personalization');
const selfLearning = require('../lib/automation/self-learning');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite.html';

// Start autonomous systems
selfLearning.start().catch(console.error);

// Send message
async function send(chatId, text, keyboard = null) {
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
}

// Main handler
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const health = await selfLearning.getSystemHealth();
    return res.json({
      status: 'ok',
      bot: 'Felix v8.0 Autonomous',
      health,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Handle callback
    if (callback_query) {
      await handleCallback(callback_query);
      return res.json({ ok: true });
    }

    // Handle message
    if (message) {
      const { chat: { id: chatId }, from: { id: userId, first_name }, text } = message;

      // Create/update user
      await db.getOrCreateUser(message.from);

      // Analyze behavior in background
      personalization.analyzeUserBehavior(userId).catch(console.error);

      if (!text) return res.json({ ok: true });

      // Handle commands
      if (text.startsWith('/')) {
        await handleCommand(chatId, userId, first_name, text);
      } else {
        // Regular message - personalized AI response
        await handleAIMessage(chatId, userId, text);
      }

      return res.json({ ok: true });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
};

// Handle commands
async function handleCommand(chatId, userId, userName, text) {
  const [cmd, ...args] = text.slice(1).split(' ');
  const arg = args.join(' ');

  const commands = {
    start: () => send(chatId, `
🌟 <b>Felix v8.0 - Autonomous AI</b>

Привет, ${userName}! 👋

Я автономный AI-ассистент с машинным обучением:

🧠 <b>Самообучение</b> - адаптируюсь под тебя
📊 <b>Аналитика</b> - анализирую поведение
🎯 <b>Персонализация</b> - подстраиваюсь под стиль
🤖 <b>8 AI команд</b> - для любых задач
📝 <b>Конспекты</b> - из голоса в текст
📚 <b>Академия</b> - обучение и курсы

Просто пиши мне - я пойму и адаптируюсь! 🚀
    `.trim()),

    help: () => send(chatId, `
📖 <b>Команды Felix v8.0</b>

<b>AI Команды:</b>
/ask - Задать вопрос
/summary - Резюме текста
/analyze - Анализ
/generate - Генерация
/translate - Перевод
/improve - Улучшение
/brainstorm - Идеи
/explain - Объяснение

<b>Функции:</b>
/profile - Твой профиль
/stats - Статистика
/settings - Настройки
/notes - Конспекты
/academy - Академия

<b>Или просто пиши мне!</b>
Я пойму и адаптируюсь под твой стиль 🎯
    `.trim()),

    profile: async () => {
      const profile = await personalization.analyzeUserBehavior(userId);
      const stats = await db.getUserStats(userId);

      send(chatId, `
👤 <b>Твой профиль</b>

<b>Персонализация:</b>
💬 Стиль: ${profile?.communicationStyle || 'casual'}
🎓 Уровень: ${profile?.skillLevel || 'intermediate'}
📚 Обучение: ${profile?.learningStyle || 'mixed'}
⚡ Активность: ${profile?.activityPattern || 'mixed'}

<b>Статистика:</b>
📊 Сообщений: ${stats.total_messages || 0}
🤖 AI запросов: ${stats.by_command?.organize || 0}
🎯 Вовлеченность: ${profile?.engagementLevel || 'medium'}

<b>Интересы:</b>
${profile?.preferredTopics?.join(', ') || 'Определяются...'}

Я постоянно учусь и адаптируюсь! 🧠
      `.trim());
    },

    stats: async () => {
      const stats = await db.getUserStats(userId);
      const health = await selfLearning.getSystemHealth();

      send(chatId, `
📊 <b>Статистика</b>

<b>Твоя активность:</b>
💬 Сообщений: ${stats.total_messages || 0}
🎤 Голосовых: ${stats.by_type?.voice || 0}
📄 Документов: ${stats.by_type?.document || 0}

<b>Система:</b>
👥 Активных: ${health.metrics?.activeUsers || 0}
🤖 Статус: ${health.status}
⚡ Ошибок/час: ${health.metrics?.errorRate || 0}

<b>AI использование:</b>
📝 Резюме: ${stats.by_command?.summary || 0}
🔍 Анализ: ${stats.by_command?.analyze || 0}
✨ Генерация: ${stats.by_command?.generate || 0}
      `.trim());
    },

    settings: () => send(chatId, `
⚙️ <b>Настройки</b>

Все настройки доступны в Mini App:

🎨 Персонализация
🤖 AI параметры
🌐 Язык интерфейса
🎭 Аватар
🔔 Уведомления

Открой Mini App для настройки! 📱
    `.trim()),

    notes: () => send(chatId, `
📝 <b>Конспекты лекций</b>

<b>Возможности:</b>
🎤 Запись голоса
📤 Загрузка аудио
🤖 AI создание конспектов
💾 Сохранение
✨ Улучшение

Открой Mini App → Конспекты! 📱
    `.trim()),

    academy: () => send(chatId, `
📚 <b>Академия Felix</b>

<b>Доступно:</b>
📖 Курсы по темам
🎓 Интерактивные уроки
✅ Тесты и задания
🏆 Достижения
📊 Прогресс

Открой Mini App → Академия! 📱
    `.trim()),

    // AI commands
    ask: () => handleAICommand('ask', userId, arg, chatId),
    summary: () => handleAICommand('summary', userId, arg, chatId),
    analyze: () => handleAICommand('analyze', userId, arg, chatId),
    generate: () => handleAICommand('generate', userId, arg, chatId),
    translate: () => handleAICommand('translate', userId, arg, chatId),
    improve: () => handleAICommand('improve', userId, arg, chatId),
    brainstorm: () => handleAICommand('brainstorm', userId, arg, chatId),
    explain: () => handleAICommand('explain', userId, arg, chatId)
  };

  const handler = commands[cmd];
  if (handler) {
    await handler();
  } else {
    await send(chatId, '❓ Неизвестная команда. Используй /help');
  }
}

// Handle AI command
async function handleAICommand(command, userId, text, chatId) {
  if (!text) {
    await send(chatId, `Используй: /${command} [твой текст]`);
    return;
  }

  try {
    // Get personalized prompt
    const basePrompt = getCommandPrompt(command, text);
    const personalizedPrompt = await personalization.getPersonalizedPrompt(userId, basePrompt);

    // Get AI response
    const response = await ai.getChatResponse(personalizedPrompt, [], {
      temperature: 0.7,
      max_tokens: 2000
    });

    // Save interaction
    await db.saveMessage(userId, 'user', text, command);
    await db.saveMessage(userId, 'assistant', response, command);

    await send(chatId, response);
  } catch (error) {
    console.error('AI command error:', error);
    await send(chatId, '❌ Ошибка обработки. Попробуй позже.');
  }
}

// Handle regular AI message
async function handleAIMessage(chatId, userId, text) {
  try {
    // Get personalized prompt
    const basePrompt = `Ответь на сообщение пользователя: ${text}`;
    const personalizedPrompt = await personalization.getPersonalizedPrompt(userId, basePrompt);

    // Get AI response
    const response = await ai.getChatResponse(personalizedPrompt, [], {
      temperature: 0.7,
      max_tokens: 1500
    });

    // Save interaction
    await db.saveMessage(userId, 'user', text);
    await db.saveMessage(userId, 'assistant', response);

    await send(chatId, response);
  } catch (error) {
    console.error('AI message error:', error);
    await send(chatId, '❌ Ошибка. Попробуй еще раз.');
  }
}

// Get command prompt
function getCommandPrompt(command, text) {
  const prompts = {
    ask: `Ответь на вопрос: ${text}`,
    summary: `Создай краткое резюме: ${text}`,
    analyze: `Проанализируй текст: ${text}`,
    generate: `Сгенерируй контент: ${text}`,
    translate: `Переведи текст: ${text}`,
    improve: `Улучши текст: ${text}`,
    brainstorm: `Сгенерируй идеи: ${text}`,
    explain: `Объясни концепцию: ${text}`
  };

  return prompts[command] || text;
}

// Handle callback
async function handleCallback(callback) {
  // Implement callback handling
  console.log('Callback:', callback.data);
}
