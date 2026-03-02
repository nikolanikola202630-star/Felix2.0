// Академия Bot - Local Polling Mode (без ngrok)
// Запуск: node bot-academy-local.js

const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/flagship.html'; // Флагманская версия
const GROQ_API_KEY = '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';

// Simple in-memory storage
const users = new Map();
let offset = 0;

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    } else {
      body.reply_markup = {
        inline_keyboard: [[
          { text: '🎓 Открыть Академию', web_app: { url: MINIAPP_URL } }
        ]]
      };
    }

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('❌ Telegram API error:', data);
    } else {
      console.log('✅ Message sent to', chatId);
    }
    return data;
  } catch (error) {
    console.error('❌ Send message error:', error);
    throw error;
  }
}

// AI response using Groq
async function getAIResponse(prompt) {
  try {
    console.log('🤖 Calling Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Ты преподаватель Академии - образовательной платформы. Отвечай кратко, по делу, дружелюбно на русском языке. Помогай с вопросами по трейдингу, IT, психологии и саморазвитию.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Groq API error:', error);
      return 'Извините, AI временно недоступен. Попробуйте позже.';
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Извините, не могу ответить.';
    console.log('✅ AI response received');
    return answer;
  } catch (error) {
    console.error('❌ AI error:', error);
    return 'Ошибка AI. Попробуйте позже.';
  }
}

// Handle message
async function handleMessage(message) {
  const { chat, from, text } = message;
  
  if (!chat || !from || !text) return;

  const chatId = chat.id;
  const userId = from.id;
  const firstName = from.first_name || 'Пользователь';

  console.log(`\n📨 Message from ${firstName} (${userId}): ${text}`);

  // Store user
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      first_name: firstName,
      message_count: 0,
      ai_requests: 0,
      courses_purchased: 0,
      bonus_balance: 0,
      created_at: new Date()
    });
    console.log(`👤 New user: ${firstName}`);
  }
  
  const user = users.get(userId);
  user.message_count++;

  // Handle commands
  if (text.startsWith('/')) {
    const parts = text.slice(1).split(' ');
    const cmd = parts[0];
    const arg = parts.slice(1).join(' ');

    console.log(`⚡ Command: /${cmd}`);

    switch (cmd) {
      case 'start':
        // Проверить реферальный код
        if (arg && arg.startsWith('ref_')) {
          const refCode = arg.replace('ref_', '');
          console.log(`🔗 Referral code: ${refCode}`);
          user.referrer = refCode;
        }

        // Объединенное сообщение
        await send(chatId, `🎓 <b>Добро пожаловать в Академию!</b>

Привет, ${firstName}! 👋

Здесь ты найдешь курсы по:
📈 Трейдингу
💻 IT-разработке
🧠 Психологии
🚀 Саморазвитию

<b>Что я умею:</b>
• Помогу выбрать курс
• Отвечу на вопросы по обучению
• Покажу твой прогресс

<b>Команды:</b>
/help - Все команды
/profile - Твой профиль
/partner - Партнерская программа

Начни обучение прямо сейчас! 🎯`);
        break;

      case 'help':
        await send(chatId, `📖 <b>Команды Академии</b>

<b>Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль
/partner - Партнерский кабинет

<b>Обучение:</b>
Открой Академию через кнопку ниже 👇

<b>Поддержка:</b>
Напиши нам в любое время!

<b>Режим:</b> 🏠 Local Test
<b>Пользователей:</b> ${users.size}`);
        break;

      case 'profile':
        const uptime = Math.floor((new Date() - user.created_at) / 1000 / 60);
        await send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${firstName}
Курсов куплено: ${user.courses_purchased}
Бонусов: ${user.bonus_balance} ₽
В системе: ${uptime} мин

🔗 <b>Реферальная ссылка:</b>
<code>t.me/AcademyBot?start=ref_user${userId}</code>

Пригласи друга и получи бонусы! 🎁

⚠️ Локальная версия без БД`);
        break;

      case 'partner':
        await send(chatId, `💼 <b>Партнерский кабинет</b>

Переходов: 0
Регистраций: 0
Покупок: 0
Заработано: 0 ₽

Доступно для вывода: 0 ₽

🔗 <b>Ваша партнерская ссылка:</b>
<code>t.me/AcademyBot?start=ref_partner${userId}</code>

Минимальная сумма вывода: 1000 ₽

⚠️ Локальная версия без БД`);
        break;

      case 'ask':
        if (!arg) {
          await send(chatId, '❓ Используй: /ask [твой вопрос]\n\nНапример:\n/ask что такое трейдинг?');
        } else {
          user.ai_requests++;
          const aiResponse = await getAIResponse(arg);
          await send(chatId, `🤖 <b>Академия AI:</b>\n\n${aiResponse}`);
        }
        break;

      default:
        await send(chatId, '❓ Неизвестная команда. Используй /help для списка команд.');
    }
  } else {
    // Regular message - AI response
    console.log('🤖 Processing AI request...');
    user.ai_requests++;
    const aiResponse = await getAIResponse(text);
    await send(chatId, `🤖 ${aiResponse}`);
  }
}

// Get updates (polling)
async function getUpdates() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`);
    const data = await response.json();

    if (!data.ok) {
      console.error('❌ getUpdates error:', data);
      return;
    }

    const updates = data.result;
    
    if (updates.length > 0) {
      console.log(`\n📬 Received ${updates.length} update(s)`);
      
      for (const update of updates) {
        offset = update.update_id + 1;
        
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Polling error:', error);
  }
}

// Start polling
async function startPolling() {
  console.log('\n🎓 Академия Bot - Local Polling Mode Started!\n');
  console.log('📍 Mode: Long Polling (no webhook needed)');
  console.log('📍 Token: ' + TOKEN.substring(0, 20) + '...');
  console.log('📍 Mini App: ' + MINIAPP_URL);
  console.log('📍 Users in memory: 0');
  console.log('\n🤖 Bot is running and waiting for messages...');
  console.log('⏹️  Press Ctrl+C to stop\n');

  // Delete webhook if exists
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook`);
    console.log('✅ Webhook deleted (if existed)\n');
  } catch (e) {
    console.log('⚠️  Could not delete webhook:', e.message);
  }

  // Start polling loop
  while (true) {
    await getUpdates();
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down bot...');
  console.log(`📊 Stats: ${users.size} users, ${Array.from(users.values()).reduce((sum, u) => sum + u.message_count, 0)} messages`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down bot...');
  process.exit(0);
});

// Start
startPolling().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
