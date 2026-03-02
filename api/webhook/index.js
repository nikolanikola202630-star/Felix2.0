const { db } = require('../../lib/db');
const { ai } = require('../../lib/ai');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/';

async function telegram(method, body) {
  if (!TOKEN) return { ok: false };
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

async function sendMessage(chatId, text, keyboard = null) {
  return telegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup:
      keyboard ||
      {
        inline_keyboard: [[{ text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }]]
      }
  });
}

function buildHelp() {
  return (
    '📚 <b>Felix Bot</b>\n\n' +
    '/start - запуск\n' +
    '/help - помощь\n' +
    '/stats - статистика\n' +
    '/ask [вопрос] - вопрос AI\n\n' +
    'Также можно писать обычным сообщением.'
  );
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix webhook',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const message = req.body?.message;
    if (!message || !message.text) return res.json({ ok: true });

    const chatId = message.chat.id;
    const user = message.from || {};
    const text = String(message.text || '').trim();
    const userId = user.id;

    await db.getOrCreateUser(user).catch(() => null);
    await db.saveMessage(userId, 'user', text, 'text').catch(() => null);

    if (text === '/start') {
      await sendMessage(
        chatId,
        `👋 Привет, ${user.first_name || 'друг'}!\n\nЯ Felix: AI-ассистент, аналитика, обучение и mini app.`,
        {
          inline_keyboard: [
            [{ text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }],
            [{ text: '📚 Помощь', callback_data: 'help' }]
          ]
        }
      );
      return res.json({ ok: true });
    }

    if (text === '/help') {
      await sendMessage(chatId, buildHelp());
      return res.json({ ok: true });
    }

    if (text === '/stats') {
      const stats = await db.getUserStats(userId).catch(() => null);
      const total = stats?.messages_count || stats?.total_messages || 0;
      const aiRequests = stats?.ai_requests || 0;
      const courses = stats?.courses_completed || 0;
      await sendMessage(
        chatId,
        `📊 <b>Твоя статистика</b>\n\nСообщений: ${total}\nAI-запросов: ${aiRequests}\nКурсов завершено: ${courses}`
      );
      return res.json({ ok: true });
    }

    const prompt = text.startsWith('/ask ') ? text.slice(5).trim() : text;
    const history = await db.getHistory(userId, { limit: 10 }).catch(() => ({ messages: [] }));
    const aiResponse = await ai.getChatResponse(
      prompt,
      (history?.messages || [])
        .reverse()
        .map((m) => ({ role: m.role, content: m.content })),
      { language: 'ru', userId }
    );

    await sendMessage(chatId, aiResponse.content || 'Не удалось сформировать ответ');
    await db
      .saveMessage(userId, 'assistant', aiResponse.content || '', 'text', {
        tokens: aiResponse.tokens || 0,
        latency: aiResponse.latency || 0
      })
      .catch(() => null);

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.json({ ok: true });
  }
};
