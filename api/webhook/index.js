// Felix Bot - Vercel Serverless Function
module.exports = async (req, res) => {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/';

  async function sendMessage(chatId, text) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{
              text: '📱 Открыть Felix App',
              web_app: { url: MINIAPP_URL }
            }]]
          }
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Send error:', error);
    }
  }

  async function getAIResponse(prompt) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Ты Felix - умный ассистент. Отвечай кратко на русском.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Не могу ответить';
    } catch (error) {
      console.error('AI error:', error);
      return 'Ошибка AI';
    }
  }

  // Health check
  if (req.method === 'GET') {
    return res.json({ 
      status: 'ok', 
      bot: 'Felix v7.0 WORKING',
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, callback_query } = req.body;

    // Callback Query
    if (callback_query) {
      const chatId = callback_query.message.chat.id;
      const data = callback_query.data;

      if (data === 'help') {
        await sendMessage(chatId, '📚 <b>Felix Bot v7.0</b>\n\nДоступные команды:\n/start - Начать\n/help - Помощь\n/ask [текст] - Задать вопрос AI');
      }
      
      return res.json({ ok: true });
    }

    if (!message?.text) {
      return res.json({ ok: true });
    }

    const { chat: { id: chatId }, from, text } = message;

    // Commands
    if (text.startsWith('/')) {
      const [cmd, ...args] = text.split(' ');
      const arg = args.join(' ');

      if (cmd === '/start') {
        await sendMessage(chatId, `👋 Привет, ${from.first_name}!\n\n🤖 Я Felix - AI-ассистент.\n\n📱 Откройте Mini App для полного функционала!`);
        return res.json({ ok: true });
      }

      if (cmd === '/help') {
        await sendMessage(chatId, '📚 <b>Felix Bot v7.0</b>\n\nДоступные команды:\n/start - Начать\n/help - Помощь\n/ask [текст] - Задать вопрос AI');
        return res.json({ ok: true });
      }

      if (cmd === '/ask' && arg) {
        const aiResponse = await getAIResponse(arg);
        await sendMessage(chatId, `💬 <b>Ответ:</b>\n\n${aiResponse}`);
        return res.json({ ok: true });
      }

      await sendMessage(chatId, '❓ Неизвестная команда. Используйте /help');
      return res.json({ ok: true });
    }

    // Regular message - AI response
    const aiResponse = await getAIResponse(text);
    await sendMessage(chatId, aiResponse);
    
    return res.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal error',
      message: error.message 
    });
  }
};
