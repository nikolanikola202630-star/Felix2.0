// Simple working webhook
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function send(chatId, text) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    })
  });
  return await res.json();
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ status: 'ok', bot: 'Felix v8.0 Simple' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message?.text) {
      return res.json({ ok: true });
    }

    const { chat: { id: chatId }, text } = message;

    // Handle /start
    if (text === '/start') {
      await send(chatId, `
🌟 <b>Felix v8.0 - AI Assistant</b>

Привет! Я работаю! 🚀

Команды:
/start - Начало
/help - Справка

Просто пиши мне - я отвечу!
      `.trim());
      return res.json({ ok: true });
    }

    // Handle /help
    if (text === '/help') {
      await send(chatId, `
📖 <b>Справка</b>

Доступные команды:
/start - Начало работы
/help - Эта справка

Просто пиши мне любые сообщения!
      `.trim());
      return res.json({ ok: true });
    }

    // Echo any other message
    await send(chatId, `Ты написал: ${text}\n\nЯ работаю! ✅`);
    return res.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.json({ ok: true }); // Always return ok to Telegram
  }
};
