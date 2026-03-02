const Groq = require('groq-sdk');

let client;
const userRequestWindows = new Map();

function getClient() {
  if (client) return client;

  client = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  return client;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((msg) => msg && typeof msg.content === 'string' && typeof msg.role === 'string')
    .slice(-10)
    .map((msg) => ({ role: msg.role, content: msg.content }));
}

function checkRateLimit(userId) {
  if (!userId) return { allowed: true, remaining: null };

  const key = String(userId);
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 20);
  const entries = (userRequestWindows.get(key) || []).filter((ts) => now - ts < windowMs);

  if (entries.length >= limit) {
    userRequestWindows.set(key, entries);
    return { allowed: false, remaining: 0 };
  }

  entries.push(now);
  userRequestWindows.set(key, entries);
  return { allowed: true, remaining: Math.max(0, limit - entries.length) };
}

module.exports.ai = {
  __setClient(mockClient) {
    client = mockClient;
  },

  __resetClient() {
    client = undefined;
    userRequestWindows.clear();
  },

  async getChatResponse(userMessage, history = [], settings = {}) {
    const { temperature = 0.7, model = 'llama-3.3-70b-versatile', language = 'ru', userId = null } = settings;
    const startTime = Date.now();
    const rate = checkRateLimit(userId);

    if (!rate.allowed) {
      return {
        content: 'Слишком много AI-запросов за минуту. Попробуйте через 30-60 секунд.',
        tokens: 0,
        model,
        latency: Date.now() - startTime,
        error: true,
        rateLimited: true
      };
    }

    const systemPrompt =
      language === 'en'
        ? 'You are Felix, a smart Telegram assistant. Answer concisely and helpfully.'
        : 'Ты Felix, умный ассистент для Telegram. Отвечай кратко, по делу и дружелюбно.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...normalizeHistory(history),
      { role: 'user', content: String(userMessage || '') }
    ];

    try {
      const completion = await getClient().chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: 2048,
        top_p: 1
      });

      return {
        content: completion.choices?.[0]?.message?.content || 'Не могу ответить',
        tokens: completion.usage?.total_tokens || 0,
        model,
        latency: Date.now() - startTime,
        rateRemaining: rate.remaining
      };
    } catch (error) {
      console.error('Groq API error:', error);
      return {
        content: 'Ошибка при обработке запроса. Попробуйте позже.',
        tokens: 0,
        model,
        latency: Date.now() - startTime,
        error: true
      };
    }
  },

  async createSummary(messagesOrText, detailLevel = 'medium') {
    const sourceMessages =
      typeof messagesOrText === 'string'
        ? [{ role: 'user', content: messagesOrText }]
        : Array.isArray(messagesOrText)
          ? messagesOrText
          : [];

    if (sourceMessages.length === 0) {
      throw new Error('Недостаточно данных для создания саммари');
    }

    const text = sourceMessages
      .map((m) => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`)
      .join('\n\n');

    const detailPrompts = {
      brief: 'Создай очень краткое саммари (2-3 предложения) ключевых моментов диалога.',
      medium: 'Создай саммари диалога с основными темами, решениями и важными моментами.',
      detailed:
        'Создай подробное саммари диалога с ключевыми темами, решениями, action items и важными деталями.'
    };

    const completion = await getClient().chat.completions.create({
      messages: [
        {
          role: 'system',
          content: detailPrompts[detailLevel] || detailPrompts.medium
        },
        {
          role: 'user',
          content: text.substring(0, 8000)
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024
    });

    const summary = completion.choices?.[0]?.message?.content || '';
    return {
      content: summary,
      summary,
      tokens: completion.usage?.total_tokens || 0
    };
  },

  async analyzeText(text, analysisType = 'all') {
    if (String(text).split(/\s+/).length < 10) {
      throw new Error('Недостаточно текста для анализа (минимум 10 слов)');
    }

    const prompts = {
      sentiment: 'Определи тональность текста (positive/neutral/negative) с confidence score.',
      keywords: 'Извлеки 5-10 ключевых слов и фраз из текста.',
      topics: 'Определи основные темы и категории текста.',
      readability: 'Оцени читаемость текста по шкале от 1 до 10.',
      all: 'Проанализируй текст: определи тональность, ключевые слова, темы, читаемость и язык.'
    };

    const completion = await getClient().chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `${prompts[analysisType] || prompts.all}\nВерни результат в структурированном формате.`
        },
        {
          role: 'user',
          content: String(text).substring(0, 2000)
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 512
    });

    return {
      analysis: completion.choices?.[0]?.message?.content || '',
      tokens: completion.usage?.total_tokens || 0
    };
  },

  async generateContent(prompt, contentType = 'article', options = {}) {
    const { length = 'medium', tone = 'professional' } = options;

    const templates = {
      article: `Напиши статью на тему: "${prompt}". Длина: ${length}. Тон: ${tone}.`,
      email: `Напиши email на тему: "${prompt}". Тон: ${tone}.`,
      social: `Напиши пост для соцсетей на тему: "${prompt}". Тон: ${tone}.`,
      code: `Напиши код для: "${prompt}". Добавь комментарии.`,
      ideas: `Сгенерируй список идей на тему: "${prompt}".`
    };

    const lengthLimits = {
      short: 512,
      medium: 1024,
      long: 2048
    };

    const completion = await getClient().chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный копирайтер и генератор контента.'
        },
        {
          role: 'user',
          content: templates[contentType] || templates.article
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: lengthLimits[length] || lengthLimits.medium
    });

    return {
      content: completion.choices?.[0]?.message?.content || '',
      tokens: completion.usage?.total_tokens || 0
    };
  },

  async organizeText(text) {
    const completion = await getClient().chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Ты эксперт по организации текста. Структурируй текст: добавь заголовки, списки и выдели ключевые моменты.'
        },
        {
          role: 'user',
          content: String(text || '')
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048
    });

    return completion.choices?.[0]?.message?.content || text;
  }
};
