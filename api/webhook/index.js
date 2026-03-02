// Felix Bot - Minimal Working Version
module.exports = async (req, res) => {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      bot: 'Felix v7.0 WORKING',
      timestamp: new Date().toISOString(),
      env: {
        hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasGroq: !!process.env.GROQ_API_KEY
      }
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/';

  try {
    const { message } = req.body;

    if (!message?.text) {
      return res.status(200).json({ ok: true });
    }

    const { chat: { id: chatId }, from, text } = message;

    // Send response using Telegram API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Получено: ${text}\n\nБот работает! ✅`,
        parse_mode: 'HTML'
      })
    });

    const result = await telegramResponse.json();
    
    return res.status(200).json({ ok: true, result });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message,
      stack: error.stack
    });
  }
};
