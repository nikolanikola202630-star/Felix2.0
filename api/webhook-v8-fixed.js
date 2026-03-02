// Felix Bot v8.6 - Fixed & Optimized
const db = require('../lib/db').db;
const ai = require('../lib/ai').ai;
const commands = require('../lib/bot/commands');
const aiHandlers = require('../lib/bot/ai-handlers');
const keyboards = require('../lib/bot/keyboards');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite-v6.html';

// Lazy load ML modules to improve cold start
let personalization = null;
let selfLearning = null;

function getPersonalization() {
  if (!personalization) {
    try {
      personalization = require('../lib/ml/personalization');
    } catch (e) {
      console.log('Personalization not available');
    }
  }
  return personalization;
}

function getSelfLearning() {
  if (!selfLearning) {
    try {
      selfLearning = require('../lib/automation/self-learning-safe');
    } catch (e) {
      console.log('Self-learning not available');
    }
  }
  return selfLearning;
}

// Send message with error handling
async function sendMessage(chatId, text, keyboard = null, isTyping = false) {
  try {
    // Send typing action if requested
    if (isTyping) {
      await fetch(`${TELEGRAM_API}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' })
      });
    }

    const body = {
      chat_id: chatId,
      text: text.substring(0, 4096), // Telegram limit
      parse_mode: 'HTML',
      reply_markup: keyboard || keyboards.mainMenu
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

// Edit message
async function editMessage(chatId, messageId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      message_id: messageId,
      text: text.substring(0, 4096),
      parse_mode: 'HTML',
      reply_markup: keyboard || keyboards.mainMenu
    };

    const res = await fetch(`${TELEGRAM_API}/editMessageText`, {
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
    console.error('Edit message error:', error);
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
      const { data, message, from } = callback_query;
      await handleCallback(data, message.chat.id, message.message_id, from.id);
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

  try {
    // Basic commands
    if (cmd === 'start') {
      await commands.handleStart(chatId, userName, sendMessage);
      return;
    }
    
    if (cmd === 'help') {
      await commands.handleHelp(chatId, sendMessage);
      return;
    }
    
    if (cmd === 'menu') {
      await commands.handleMenu(chatId, sendMessage);
      return;
    }
    
    if (cmd === 'profile') {
      await commands.handleProfile(chatId, userId, sendMessage, db);
      return;
    }
    
    if (cmd === 'settings') {
      await commands.handleSettings(chatId, userId, sendMessage, db);
      return;
    }
    
    if (cmd === 'stats') {
      await commands.handleStats(chatId, userId, sendMessage, db);
      return;
    }
    
    if (cmd === 'academy') {
      await commands.handleAcademy(chatId, sendMessage);
      return;
    }
    
    if (cmd === 'courses') {
      await commands.handleCourses(chatId, sendMessage, db);
      return;
    }

    // AI commands
    const aiCommands = ['ask', 'summary', 'analyze', 'generate', 'translate', 'improve', 'brainstorm', 'explain'];
    if (aiCommands.includes(cmd)) {
      await aiHandlers.handleAICommand(cmd, chatId, userId, arg, sendMessage, ai, db);
      return;
    }

    // Unknown command
    await sendMessage(chatId, '❓ Неизвестная команда. Используй /help', keyboards.mainMenu);
    
  } catch (error) {
    console.error(`Command ${cmd} error:`, error);
    await sendMessage(chatId, '❌ Ошибка выполнения команды', keyboards.mainMenu);
  }
}

// This function is now handled by aiHandlers module

// Handle regular AI message
async function handleAIMessage(chatId, userId, text) {
  try {
    await sendMessage(chatId, '⏳ Обрабатываю...', null, true);
    
    // Get base prompt
    const basePrompt = `Ответь на сообщение пользователя дружелюбно и полезно: ${text}`;
    
    // Try to personalize
    let finalPrompt = basePrompt;
    try {
      const p = getPersonalization();
      if (p && p.getPersonalizedPrompt) {
        finalPrompt = await p.getPersonalizedPrompt(userId, basePrompt);
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

    await sendMessage(chatId, response.content, keyboards.mainMenu);
  } catch (error) {
    console.error('AI message error:', error);
    await sendMessage(chatId, '❌ Ошибка. Попробуй еще раз.', keyboards.mainMenu);
  }
}

// Handle callback
async function handleCallback(data, chatId, messageId, userId) {
  try {
    const [action, param] = data.split('_');

    // Menu navigation
    if (action === 'menu') {
      if (param === 'main') {
        await editMessage(chatId, messageId, '🎯 Главное меню', keyboards.mainMenu);
      } else if (param === 'ai') {
        await aiHandlers.showAIMenu(chatId, messageId, editMessage);
      } else if (param === 'academy') {
        await editMessage(chatId, messageId, '📚 Академия Felix', keyboards.academyMenu);
      } else if (param === 'profile') {
        await editMessage(chatId, messageId, '👤 Профиль', keyboards.profileMenu);
      } else if (param === 'settings') {
        await editMessage(chatId, messageId, '⚙️ Настройки', keyboards.settingsMenu);
      }
      return;
    }

    // AI command callbacks
    if (action === 'ai') {
      await aiHandlers.handleAICallback(param, chatId, messageId, sendMessage, editMessage);
      return;
    }

    // Other callbacks
    console.log('Unhandled callback:', data);
    
  } catch (error) {
    console.error('Callback error:', error);
  }
}
