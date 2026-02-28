import { db } from '../lib/db.js';
import { ai } from '../lib/ai.js';
import { telegram } from '../lib/telegram.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Felix Bot is running! 🤖');
  }

  if (req.method === 'POST') {
    try {
      const update = req.body;
      const message = update.message || update.callback_query?.message;
      const callbackQuery = update.callback_query;
      const chatId = message?.chat?.id;
      const userId = message?.from?.id || callbackQuery?.from?.id;
      const text = message?.text || '';
      const voice = message?.voice;

      if (!chatId || !userId) {
        return res.status(200).json({ ok: true });
      }

      // Get or create user
      await db.getOrCreateUser(message.from || callbackQuery.from);

      // Handle callback queries (button clicks)
      if (callbackQuery) {
        const data = callbackQuery.data;

        if (data === 'clear_history') {
          await db.clearHistory(userId);
          await telegram.sendMessage(chatId, '✅ История диалога очищена!');
        } else if (data === 'get_summary') {
          const history = await db.getHistory(userId, 50);
          if (history.length === 0) {
            await telegram.sendMessage(chatId, 'История пуста. Напиши мне что-нибудь!');
          } else {
            await telegram.sendTyping(chatId);
            const summary = await ai.createSummary(history);
            await telegram.sendMessage(chatId, `📝 <b>Саммари диалога:</b>\n\n${summary}`);
          }
        } else if (data === 'get_stats') {
          const stats = await db.getUserStats(userId);
          const statsText = `📊 <b>Твоя статистика:</b>

💬 Всего сообщений: ${stats.total_messages}
👤 Твоих: ${stats.user_messages}
🤖 Моих: ${stats.bot_messages}
📅 Первое сообщение: ${new Date(stats.first_message).toLocaleDateString('ru')}
🕐 Последнее: ${new Date(stats.last_message).toLocaleDateString('ru')}`;
          
          await telegram.sendMessage(chatId, statsText);
        }

        return res.status(200).json({ ok: true });
      }

      // Handle voice messages
      if (voice) {
        await telegram.sendTyping(chatId);
        await telegram.sendMessage(chatId, '🎤 Транскрибирую голосовое сообщение...');
        
        try {
          const audioBuffer = await telegram.getFile(voice.file_id);
          const transcription = await ai.transcribeVoice(audioBuffer);
          
          await db.saveVoiceMessage(userId, voice.file_id, transcription, voice.duration);
          await db.saveMessage(userId, 'user', transcription);
          
          await telegram.sendMessage(chatId, `📝 <b>Транскрипция:</b>\n\n${transcription}`);
          
          // Get AI response to transcription
          const history = await db.getHistory(userId, 10);
          await telegram.sendTyping(chatId);
          const aiResponse = await ai.getChatResponse(transcription, history);
          
          await db.saveMessage(userId, 'assistant', aiResponse);
          await telegram.sendMessage(chatId, aiResponse);
        } catch (error) {
          console.error('Voice processing error:', error);
          await telegram.sendMessage(chatId, '❌ Ошибка при обработке голосового сообщения');
        }
        
        return res.status(200).json({ ok: true });
      }

      // Handle commands
      if (text.startsWith('/')) {
        if (text === '/start') {
          const keyboard = telegram.createKeyboard([
            [
              { text: '📊 Статистика', callback_data: 'get_stats' },
              { text: '📝 Саммари', callback_data: 'get_summary' }
            ],
            [
              { text: '🗑 Очистить историю', callback_data: 'clear_history' }
            ]
          ]);

          const welcomeText = `Привет! Я Felix - твой умный ассистент 🤖

<b>Что я умею:</b>
• 💬 Отвечаю на вопросы с помощью AI
• 🧠 Помню контекст диалога
• 🎤 Транскрибирую голосовые сообщения
• 📝 Создаю саммари диалогов

<b>Команды:</b>
/start - это сообщение
/clear - очистить историю
/stats - статистика
/summary - саммари диалога
/help - справка

Просто напиши мне что-нибудь или отправь голосовое!`;
          
          await telegram.sendMessage(chatId, welcomeText, { replyMarkup: keyboard });
        } else if (text === '/clear') {
          await db.clearHistory(userId);
          await telegram.sendMessage(chatId, '✅ История диалога очищена!');
        } else if (text === '/stats') {
          const stats = await db.getUserStats(userId);
          const statsText = `📊 <b>Твоя статистика:</b>

💬 Всего сообщений: ${stats.total_messages}
👤 Твоих: ${stats.user_messages}
🤖 Моих: ${stats.bot_messages}
📅 Первое сообщение: ${new Date(stats.first_message).toLocaleDateString('ru')}
🕐 Последнее: ${new Date(stats.last_message).toLocaleDateString('ru')}`;
          
          await telegram.sendMessage(chatId, statsText);
        } else if (text === '/summary') {
          const history = await db.getHistory(userId, 50);
          if (history.length === 0) {
            await telegram.sendMessage(chatId, 'История пуста. Напиши мне что-нибудь!');
          } else {
            await telegram.sendTyping(chatId);
            const summary = await ai.createSummary(history);
            await telegram.sendMessage(chatId, `📝 <b>Саммари диалога:</b>\n\n${summary}`);
          }
        } else if (text === '/help') {
          const helpText = `ℹ️ <b>Справка по Felix Bot</b>

<b>Команды:</b>
/start - главное меню
/clear - очистить историю диалога
/stats - показать статистику
/summary - создать саммари диалога
/help - эта справка

<b>Возможности:</b>
• Отправь текстовое сообщение - получишь AI-ответ с учетом контекста
• Отправь голосовое - получишь транскрипцию и ответ
• Используй кнопки для быстрого доступа к функциям

<b>Технологии:</b>
• AI: Groq LLaMA 3.3 70B
• Транскрибация: Groq Whisper Large v3
• База данных: PostgreSQL`;
          
          await telegram.sendMessage(chatId, helpText);
        }
        
        return res.status(200).json({ ok: true });
      }

      // Handle regular messages
      if (text) {
        // Save user message
        await db.saveMessage(userId, 'user', text);
        
        // Get conversation history
        const history = await db.getHistory(userId, 10);
        
        // Show typing indicator
        await telegram.sendTyping(chatId);
        
        // Get AI response with context
        const aiResponse = await ai.getChatResponse(text, history);
        
        // Save assistant response
        await db.saveMessage(userId, 'assistant', aiResponse);
        
        // Send response
        await telegram.sendMessage(chatId, aiResponse);
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error:', error);
      
      // Try to notify user about error
      try {
        const chatId = req.body?.message?.chat?.id;
        if (chatId) {
          await telegram.sendMessage(chatId, '❌ Произошла ошибка. Попробуй еще раз.');
        }
      } catch (e) {
        console.error('Failed to send error message:', e);
      }
      
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
