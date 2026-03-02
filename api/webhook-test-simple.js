// Simple test webhook
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(chatId, text) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    return await res.json();
  } catch (error) {
    console.error('Send error:', error);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ status: 'ok', test: 'simple' });
  }

  try {
    const { message } = req.body;
    
    if (message && message.text) {
      const { chat: { id: chatId }, text } = message;
      
      if (text === '/start') {
        await sendMessage(chatId, '✅ Бот работает! Это тестовая версия.');
      } else {
        await sendMessage(chatId, `Получено: ${text}`);
      }
    }
    
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
