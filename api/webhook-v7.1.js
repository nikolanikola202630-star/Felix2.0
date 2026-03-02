// Felix Bot v7.1 - Webhook with all improvements
// Integrates: Monitoring, Caching, AI Rate Limiting, Database

import { db } from '../lib/db.js';
import { ai } from '../lib/ai.js';
import { cache, cacheKeys } from '../lib/cache.js';
import { initMonitoring, captureError, logger } from '../lib/monitoring.js';
import { checkAILimit, incrementAIUsage, getAIUsageStats } from '../lib/ai-rate-limit.js';

// Initialize monitoring
initMonitoring();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID || '0');
const MINIAPP_URL = process.env.MINIAPP_URL || '';

// Rate limiting for webhook (20 req/min per user)
const rateLimiter = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId) || { count: 0, resetAt: now + 60000 };
  
  if (now > userLimit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (userLimit.count >= 20) {
    return false;
  }
  
  userLimit.count++;
  rateLimiter.set(userId, userLimit);
  return true;
}

// Telegram API helpers
function addMiniAppButton(buttons = []) {
  return {
    inline_keyboard: [
      [{ text: '🚀 Открыть Mini App', web_app: { url: MINIAPP_URL } }],
      ...buttons
    ]
  };
}

async function send(chatId, text, buttons = []) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : addMiniAppButton()
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      throw new Error(`Telegram API error: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    captureError(error, { chatId, text: text.substring(0, 100) });
    throw error;
  }
}

// AI response with context and rate limiting
async function getAIResponse(userId, userMessage) {
  const startTime = Date.now();
  
  try {
    // Check AI rate limit
    const limit = await checkAILimit(userId);
    if (!limit.allowed) {
      const resetTime = new Date(limit.resetAt).toLocaleTimeString('ru-RU');
      return {
        content: `⚠️ Лимит AI запросов исчерпан (${limit.limit}/${limit.reason === 'daily_limit' ? 'день' : 'час'}).\n\nПопробуйте после ${resetTime}`,
        limited: true
      };
    }
    
    // Get user settings with caching
    const settings = await cache.get(
      cacheKeys.userSettings(userId),
      () => db.getUserSettings(userId),
      3600 // 1 hour
    );
    
    // Get conversation history
    const historyData = await db.getHistory(userId, { limit: 10 });
    const history = historyData.messages || [];
    
    // Get AI response
    const response = await ai.getChatResponse(userMessage, history, settings);
    
    // Save messages to database
    await db.saveMessage(userId, 'user', userMessage, 'text', {
      timestamp: Date.now()
    });
    
    await db.saveMessage(userId, 'assistant', response.content, 'text', {
      tokens: response.tokens,
      latency: response.latency,
      model: response.model
    });
    
    // Increment AI usage
    await incrementAIUsage(userId, response.tokens);
    
    // Log metrics
    logger.info('AI response generated', {
      userId,
      tokens: response.tokens,
      latency: response.latency,
      totalTime: Date.now() - startTime
    });
    
    return {
      content: response.content,
      limited: false,
      stats: {
        tokens: response.tokens,
        latency: response.latency,
        remaining: limit.dailyLimit - limit.dailyUsed - 1
      }
    };
  } catch (error) {
    captureError(error, { userId, userMessage: userMessage.substring(0, 100) });
    return {
      content: '❌ Произошла ошибка при обработке запроса. Попробуйте позже.',
      error: true
    };
  }
}

// Moderation
function moderateMessage(text) {
  // Check for spam (repeated characters)
  if (/(.)\1{10,}/.test(text)) {
    return { spam: true, reason: 'Повторяющиеся символы' };
  }
  
  // Check for CAPS abuse
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    return { spam: true, reason: 'Злоупотребление CAPS' };
  }
  
  return { spam: false };
}

// Main webhook handler
export default async function handler(req, res) {
  // Health check
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      version: '7.1.0',
      bot: 'Felix Bot',
      features: ['monitoring', 'caching', 'rate-limiting', 'database']
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const startTime = Date.now();
  
  try {
    const update = req.body;
    
    // Handle callback queries
    if (update.callback_query) {
      const { id, data, from, message } = update.callback_query;
      
      logger.info('Callback query received', { userId: from.id, data });
      
      await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id, text: 'Обработано' })
      });
      
      return res.json({ ok: true });
    }
    
    // Handle messages
    if (!update.message) {
      return res.json({ ok: true });
    }
    
    const { message_id, from, chat, text, voice } = update.message;
    const userId = from.id;
    const chatId = chat.id;
    const isGroup = chat.type === 'group' || chat.type === 'supergroup';
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      logger.warn('Rate limit exceeded', { userId });
      await send(chatId, '⚠️ Слишком много запросов. Подождите минуту.');
      return res.json({ ok: true });
    }
    
    // Create or update user
    await db.getOrCreateUser(from);
    
    // Handle voice messages
    if (voice) {
      logger.info('Voice message received', { userId, duration: voice.duration });
      await send(chatId, '🎤 Голосовые сообщения пока не поддерживаются. Используйте текст.');
      return res.json({ ok: true });
    }
    
    // Handle text messages
    if (!text) {
      return res.json({ ok: true });
    }
    
    // Group moderation
    if (isGroup) {
      const moderation = moderateMessage(text);
      if (moderation.spam) {
        logger.warn('Spam detected', { userId, chatId, reason: moderation.reason });
        
        try {
          await fetch(`https://api.telegram.org/bot${TOKEN}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id })
          });
          
          await send(chatId, `⚠️ Сообщение удалено: ${moderation.reason}`);
        } catch (error) {
          logger.error('Failed to delete message', { error: error.message });
        }
        
        return res.json({ ok: true });
      }
    }
    
    // Commands
    if (text.startsWith('/')) {
      const [command, ...args] = text.split(' ');
      const argument = args.join(' ');
      
      logger.info('Command received', { userId, command });
      
      switch (command) {
        case '/start':
          await send(chatId, 
            `👋 Привет, ${from.first_name}!\n\n` +
            `Я Felix Bot v7.1 - умный AI-ассистент с улучшениями:\n\n` +
            `✅ Мониторинг и логирование\n` +
            `✅ Кэширование для скорости\n` +
            `✅ Лимиты AI запросов\n` +
            `✅ Полная интеграция с БД\n\n` +
            `Используй /help для списка команд`
          );
          break;
        
        case '/help':
          await send(chatId,
            `📚 Доступные команды:\n\n` +
            `🤖 AI Команды:\n` +
            `/ask [вопрос] - Задать вопрос AI\n` +
            `/summary [текст] - Краткое содержание\n` +
            `/analyze [текст] - Анализ текста\n` +
            `/generate [тема] - Генерация контента\n\n` +
            `📊 Информация:\n` +
            `/profile - Ваш профиль\n` +
            `/stats - Статистика\n` +
            `/history - История сообщений\n` +
            `/limits - Лимиты AI\n\n` +
            `⚙️ Настройки:\n` +
            `/settings - Настройки бота`
          );
          break;
        
        case '/ask':
          if (!argument) {
            await send(chatId, '❓ Использование: /ask [ваш вопрос]');
            break;
          }
          
          const aiResponse = await getAIResponse(userId, argument);
          
          let responseText = aiResponse.content;
          if (aiResponse.stats && !aiResponse.limited) {
            responseText += `\n\n📊 Токенов: ${aiResponse.stats.tokens} | Осталось: ${aiResponse.stats.remaining}`;
          }
          
          await send(chatId, responseText);
          break;
        
        case '/profile':
          const stats = await db.getUserStats(userId, 'all');
          const user = await db.getOrCreateUser(from);
          
          await send(chatId,
            `👤 Профиль ${from.first_name}\n\n` +
            `🆔 ID: ${userId}\n` +
            `📝 Сообщений: ${stats.total_messages || 0}\n` +
            `🤖 AI запросов: ${stats.total_messages ? Math.floor(stats.total_messages / 2) : 0}\n` +
            `⚡ Токенов использовано: ${stats.total_tokens || 0}\n` +
            `📅 Зарегистрирован: ${new Date(user.created_at).toLocaleDateString('ru-RU')}`
          );
          break;
        
        case '/stats':
          const period = argument || 'week';
          const periodStats = await db.getUserStats(userId, period);
          
          await send(chatId,
            `📊 Статистика (${period === 'day' ? 'день' : period === 'week' ? 'неделя' : 'месяц'}):\n\n` +
            `📝 Сообщений: ${periodStats.total_messages || 0}\n` +
            `⚡ Токенов: ${periodStats.total_tokens || 0}\n` +
            `⏱️ Среднее время ответа: ${periodStats.avg_response_time || 0}ms`
          );
          break;
        
        case '/limits':
          const aiStats = await getAIUsageStats(userId);
          
          if (aiStats) {
            await send(chatId,
              `🚦 Лимиты AI запросов:\n\n` +
              `📅 Сегодня: ${aiStats.daily.used}/${aiStats.daily.limit}\n` +
              `⏰ Этот час: ${aiStats.hourly.used}/${aiStats.hourly.limit}\n` +
              `⚡ Токенов использовано: ${aiStats.tokens.used}\n\n` +
              `Сброс дневного лимита: ${new Date(aiStats.daily.resetAt).toLocaleTimeString('ru-RU')}`
            );
          } else {
            await send(chatId, '❌ Не удалось получить информацию о лимитах');
          }
          break;
        
        case '/history':
          const history = await db.getHistory(userId, { limit: 5 });
          
          if (history.messages.length === 0) {
            await send(chatId, '📭 История пуста');
          } else {
            let historyText = '📜 Последние сообщения:\n\n';
            history.messages.forEach((msg, i) => {
              const role = msg.role === 'user' ? '👤' : '🤖';
              const content = msg.content.substring(0, 50);
              historyText += `${role} ${content}${msg.content.length > 50 ? '...' : ''}\n`;
            });
            historyText += `\n📊 Всего: ${history.total} сообщений`;
            
            await send(chatId, historyText);
          }
          break;
        
        case '/admin':
          if (userId !== ADMIN_ID) {
            await send(chatId, '🔒 Доступ запрещен');
            break;
          }
          
          await send(chatId, '🛡️ Админ-панель доступна в Mini App');
          break;
        
        default:
          await send(chatId, '❓ Неизвестная команда. Используйте /help');
      }
      
      logger.info('Command processed', {
        userId,
        command,
        processingTime: Date.now() - startTime
      });
      
      return res.json({ ok: true });
    }
    
    // Regular message - AI response
    const aiResponse = await getAIResponse(userId, text);
    await send(chatId, aiResponse.content);
    
    logger.info('Message processed', {
      userId,
      messageLength: text.length,
      processingTime: Date.now() - startTime
    });
    
    return res.json({ ok: true });
    
  } catch (error) {
    captureError(error, {
      method: req.method,
      body: JSON.stringify(req.body).substring(0, 200)
    });
    
    logger.error('Webhook error', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
