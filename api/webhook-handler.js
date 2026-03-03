// Webhook handler - обертка для старого webhook.js
// Экспортирует функцию для роутера

module.exports = async (req, res) => {
  // Простой webhook для тестирования
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Felix Bot Webhook is running',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const update = req.body;
      
      // Базовая обработка
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        console.log(`Message from ${chatId}: ${text}`);
        
        // Отправить ответ
        const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `Получил ваше сообщение: ${text}\n\nБот работает! 🎉`,
            reply_markup: {
              inline_keyboard: [[
                { 
                  text: '📱 Открыть Felix Academy', 
                  web_app: { url: 'https://felix2-0.vercel.app/miniapp/index.html' }
                }
              ]]
            }
          })
        });
        
        const result = await response.json();
        console.log('Sent response:', result);
      }
      
      return res.status(200).json({ ok: true });
      
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(200).json({ ok: true }); // Всегда возвращаем 200 для Telegram
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
