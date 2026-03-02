const Groq = require ('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

module.exports.ai = {
  // Get AI response with conversation history and settings
  async getChatResponse(userMessage, history = [], settings = {}) {
    const {
      temperature = 0.7,
      model = 'llama-3.3-70b-versatile',
      language = 'ru'
    } = settings;

    const systemPrompt = language === 'en' 
      ? 'You are Felix - a smart Telegram assistant. Answer concisely and helpfully.'
      : 'Ты Felix - умный ассистент для Telegram. Отвечай кратко, по делу, на русском языке. Будь дружелюбным и полезным.';

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history (last 10 messages)
    history.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: 2048,
        top_p: 1
      });

      const latency = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || 'Не могу ответить';
      const tokens = completion.usage?.total_tokens || 0;

      return {
        content,
        tokens,
        model,
        latency
      };
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Ошибка при обработке запроса');
    }
  },

  // Create summary of messages
  async createSummary(messages, detailLevel = 'medium') {
    if (messages.length < 5) {
      throw new Error('Недостаточно сообщений для создания саммари (минимум 5)');
    }

    const text = messages
      .map(m => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`)
      .join('\n\n');

    const detailPrompts = {
      brief: 'Создай очень краткое саммари (2-3 предложения) ключевых моментов диалога.',
      medium: 'Создай саммари диалога с основными темами, решениями и важными моментами.',
      detailed: 'Создай подробное саммари диалога с ключевыми темами, решениями, action items и важными деталями.'
    };

    try {
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: detailPrompts[detailLevel] || detailPrompts.medium
          },
          {
            role: 'user',
            content: text.substring(0, 8000) // Limit input
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1024
      });

      const latency = Date.now() - startTime;

      if (latency > 30000) {
        throw new Error('Timeout: генерация саммари заняла слишком много времени');
      }

      return {
        summary: completion.choices[0]?.message?.content,
        tokens: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('Error creating summary:', error);
      throw error;
    }
  },

  // Analyze text
  async analyzeText(text, analysisType = 'all') {
    if (text.split(/\s+/).length < 10) {
      throw new Error('Недостаточно текста для анализа (минимум 10 слов)');
    }

    const prompts = {
      sentiment: 'Определи тональность текста (positive/neutral/negative) с confidence score.',
      keywords: 'Извлеки 5-10 ключевых слов и фраз из текста.',
      topics: 'Определи основные темы и категории текста.',
      readability: 'Оцени читаемость текста по шкале от 1 до 10.',
      all: 'Проанализируй текст: определи тональность, ключевые слова, темы, читаемость и язык.'
    };

    try {
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: prompts[analysisType] || prompts.all + '\nВерни результат в структурированном формате.'
          },
          {
            role: 'user',
            content: text.substring(0, 2000)
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 512
      });

      const latency = Date.now() - startTime;

      if (latency > 15000) {
        throw new Error('Timeout: анализ текста занял слишком много времени');
      }

      return {
        analysis: completion.choices[0]?.message?.content,
        tokens: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  },

  // Generate content
  async generateContent(prompt, contentType = 'article', options = {}) {
    const {
      length = 'medium',
      tone = 'professional'
    } = options;

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

    try {
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
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

      const latency = Date.now() - startTime;

      if (latency > 45000) {
        throw new Error('Timeout: генерация контента заняла слишком много времени');
      }

      return {
        content: completion.choices[0]?.message?.content,
        tokens: completion.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  },

  // Organize text (existing function)
  async organizeText(text) {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Ты эксперт по организации текста. Структурируй текст: добавь заголовки, списки, выдели ключевые моменты.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content || text;
  }
};



