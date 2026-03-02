// Felix Bot v8.6 - Fixed & Optimized
const db = require('../lib/db').db;
const ai = require('../lib/ai').ai;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite-v6.html';

// Lazy load ML modules to improve cold start
let personalization = null;
let selfLearning = null;

function getPersonalization() {
  if (!personalization) {
    personalization = require('../lib/ml/personalization');
  }
  return personalization;
}

function getSelfLearning() {
  if (!selfLearning) {
    selfLearning = require('../lib/automation/self-learning');
  }
  return selfLearning;
}

// Send message with error handling
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text: text.substring(0, 4096), // Telegram limit
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

    if (!res.ok) {
      const error = await res.json();
      console.error('Telegram API error:', error);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Send message error:', error);
    return null;
  }
}

// Main handler
module.exports = async function handler(req, res) {
  // Health check
  if (req.method === 'GET') {
    try {
      const health = {
        status: 'ok',
        bot: 'Felix v8.6 Fixed',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'production'
      };

      // Try to get system health if available
      try {
        const sl = getSelfLearning();
        if (sl && typeof sl.getSystemHealth === 'function') {
          health.system = await sl.getSystemHealth();
        }
      } catch (e) {
        // Ignore if not available
      }

      return res.json(health);
    } catch (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
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
      const { chat: { id: chatId }, from, text } = message;

      // Validate user data
      if (!from || !from.id) {
        return res.json({ ok: true });
      }

      // Create/update user with error handling
      try {
        await db.getOrCreateUser(from);
      } catch (error) {
        console.error('User creation error:', error);
        // Continue anyway
      }

      // Analyze behavior in background (non-blocking)
      if (personalization) {
        getPersonalization().analyzeUserBehavior(from.id).catch(err => {
          console.error('Behavior analysis error:', err);
        });
      }

      if (!text) return res.json({ ok: true });

      // Handle commands
      if (text.startsWith('/')) {
        await handleCommand(chatId, from.id, from.first_name, text);
      } else {
        // Regular message - AI response
        await handleAIMessage(chatId, from.id, text);
      }

      return res.json({ ok: true });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log to database if possible
    try {
      await db.query(`
        INSERT INTO system_logs (level, message, context)
        VALUES ($1, $2, $3)
      `, ['error', error.message, JSON.stringify({ stack: error.stack })]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return res.status(500).json({ error: 'Internal error' });
  }
};

// Handle commands
async function handleCommand(chatId, userId, userName, text) {
  const [cmd, ...args] = text.slice(1).split(' ');
  const arg = args.join(' ');

  const commands = {
    start: () => send(chatId, `
🌟 <b>Felix v8.6 - AI Ассистент</b>

Привет, ${userName}! 👋

Я умный AI-ассистент с персонализацией:

🧠 <b>AI команды</b> - 8 типов запросов
📊 <b>Аналитика</b> - твоя статистика
🎯 <b>Персонализация</b> - адаптируюсь под тебя
📝 <b>Конспекты</b> - из голоса в текст
📚 <b>Академия</b> - обучение и курсы

Просто пиши мне или используй команды! 🚀

Команды: /help
    `.trim()),

    help: () => send(chatId, `
📖 <b>Команды Felix</b>

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

<b>Или просто пиши мне!</b>
    `.trim()),

    profile: async () => {
      try {
        const stats = await db.getUserStats(userId);
        
        let profileText = `
👤 <b>Твой профиль</b>

<b>Статистика:</b>
📊 Сообщений: ${stats.total_messages || 0}
🤖 AI запросов: ${stats.by_command?.organize || 0}
🎤 Голосовых: ${stats.by_type?.voice || 0}
        `.trim();

        // Try to get personalization data
        try {
          const profile = await getPersonalization().analyzeUserBehavior(userId);
          if (profile) {
            profileText += `

<b>Персонализация:</b>
💬 Стиль: ${profile.communicationStyle || 'casual'}
🎓 Уровень: ${profile.skillLevel || 'intermediate'}
📚 Обучение: ${profile.learningStyle || 'mixed'}
            `.trim();
          }
        } catch (e) {
          // Ignore if personalization not available
        }

        await send(chatId, profileText);
      } catch (error) {
        console.error('Profile error:', error);
        await send(chatId, '❌ Ошибка загрузки профиля');
      }
    },

    stats: async () => {
      try {
        const stats = await db.getUserStats(userId);

        await send(chatId, `
📊 <b>Статистика</b>

<b>Твоя активность:</b>
💬 Сообщений: ${stats.total_messages || 0}
🎤 Голосовых: ${stats.by_type?.voice || 0}
📄 Документов: ${stats.by_type?.document || 0}

<b>AI использование:</b>
📝 Резюме: ${stats.by_command?.summary || 0}
🔍 Анализ: ${stats.by_command?.analyze || 0}
✨ Генерация: ${stats.by_command?.generate || 0}
        `.trim());
      } catch (error) {
        console.error('Stats error:', error);
        await send(chatId, '❌ Ошибка загрузки статистики');
      }
    },

    settings: () => send(chatId, `
⚙️ <b>Настройки</b>

Все настройки доступны в Mini App:

🎨 Персонализация
🤖 AI параметры
🌐 Язык интерфейса
🔔 Уведомления

Открой Mini App для настройки! 📱
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
    try {
      await handler();
    } catch (error) {
      console.error(`Command ${cmd} error:`, error);
      await send(chatId, '❌ Ошибка выполнения команды');
    }
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
    // Get base prompt
    const basePrompt = getCommandPrompt(command, text);
    
    // Try to personalize if available
    let finalPrompt = basePrompt;
    try {
      if (personalization) {
        finalPrompt = await getPersonalization().getPersonalizedPrompt(userId, basePrompt);
      }
    } catch (e) {
      // Use base prompt if personalization fails
    }

    // Get AI response
    const response = await ai.getChatResponse(finalPrompt, [], {
      temperature: 0.7,
      max_tokens: 2000
    });

    // Save interaction
    try {
      await db.saveMessage(userId, 'user', text, 'text', { command });
      await db.saveMessage(userId, 'assistant', response.content, 'text', { 
        command,
        tokens: response.tokens,
        latency: response.latency
      });
    } catch (saveError) {
      console.error('Save message error:', saveError);
      // Continue anyway
    }

    await send(chatId, response.content);
  } catch (error) {
    console.error('AI command error:', error);
    await send(chatId, '❌ Ошибка обработки. Попробуй позже.');
  }
}

// Handle regular AI message
async function handleAIMessage(chatId, userId, text) {
  try {
    // Get base prompt
    const basePrompt = `Ответь на сообщение пользователя: ${text}`;
    
    // Try to personalize
    let finalPrompt = basePrompt;
    try {
      if (personalization) {
        finalPrompt = await getPersonalization().getPersonalizedPrompt(userId, basePrompt);
      }
    } catch (e) {
      // Use base prompt
    }

    // Get AI response
    const response = await ai.getChatResponse(finalPrompt, [], {
      temperature: 0.7,
      max_tokens: 1500
    });

    // Save interaction
    try {
      await db.saveMessage(userId, 'user', text);
      await db.saveMessage(userId, 'assistant', response.content, 'text', {
        tokens: response.tokens,
        latency: response.latency
      });
    } catch (saveError) {
      console.error('Save message error:', saveError);
    }

    await send(chatId, response.content);
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
  console.log('Callback:', callback.data);
  // TODO: Implement callback handling
}
