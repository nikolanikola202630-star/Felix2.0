// Felix Academy - Единый бот со всем функционалом
// Объединяет Felix Bot v9.0 + Академия + Партнерка

const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/index.html'; // Production URL (Telegram требует HTTPS)
const GROQ_API_KEY = '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';

// In-memory хранилище (для локального тестирования)
const users = new Map();
const courses = [
  {
    id: 1,
    title: 'Основы трейдинга',
    price: 2990,
    rating: 4.8,
    category: 'trading',
    lessons: [
      { id: 1, title: 'Введение в трейдинг', duration: 15, is_free: true },
      { id: 2, title: 'Технический анализ', duration: 25, is_free: false },
      { id: 3, title: 'Управление рисками', duration: 20, is_free: false }
    ]
  },
  {
    id: 2,
    title: 'Python для начинающих',
    price: 0,
    rating: 4.9,
    category: 'it',
    lessons: [
      { id: 4, title: 'Основы Python', duration: 20, is_free: true },
      { id: 5, title: 'Переменные и типы данных', duration: 30, is_free: true }
    ]
  },
  {
    id: 3,
    title: 'Психология успеха',
    price: 1990,
    rating: 4.7,
    category: 'psychology',
    lessons: [
      { id: 6, title: 'Мышление победителя', duration: 25, is_free: true },
      { id: 7, title: 'Управление эмоциями', duration: 30, is_free: false }
    ]
  }
];

let offset = 0;

// Helper: отправка сообщения
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
    }
    return data;
  } catch (error) {
    console.error('❌ Send error:', error);
    throw error;
  }
}

// AI ответ через Groq
async function getAIResponse(prompt, context = []) {
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
          {
            role: 'system',
            content: 'Ты AI-ассистент образовательной платформы Felix Academy. Помогаешь с выбором курсов, отвечаешь на вопросы по трейдингу, IT, психологии. Отвечай кратко, дружелюбно на русском.'
          },
          ...context,
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      return 'Извините, AI временно недоступен.';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Извините, не могу ответить.';
  } catch (error) {
    console.error('❌ AI error:', error);
    return 'Ошибка AI. Попробуйте позже.';
  }
}

// Обработка сообщений
async function handleMessage(message) {
  const { chat, from, text } = message;
  
  if (!chat || !from || !text) return;

  const chatId = chat.id;
  const userId = from.id;
  const firstName = from.first_name || 'Пользователь';

  console.log(`📨 ${firstName} (${userId}): ${text}`);

  // Создать/обновить пользователя
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      first_name: firstName,
      message_count: 0,
      ai_requests: 0,
      courses_purchased: [],
      bonus_balance: 0,
      referrer: null,
      created_at: new Date()
    });
    console.log(`👤 Новый пользователь: ${firstName}`);
  }
  
  const user = users.get(userId);
  user.message_count++;

  // Команды
  if (text.startsWith('/')) {
    const parts = text.slice(1).split(' ');
    const cmd = parts[0];
    const arg = parts.slice(1).join(' ');

    console.log(`⚡ Команда: /${cmd}`);

    switch (cmd) {
      case 'start':
        // Реферальный код
        if (arg && arg.startsWith('ref_')) {
          user.referrer = arg;
          console.log(`🔗 Реферал: ${arg}`);
        }

        await send(chatId, `🎓 <b>Добро пожаловать в Felix Academy!</b>

Привет, ${firstName}! 👋

<b>Что я умею:</b>
🎓 Академия - курсы по трейдингу, IT, психологии
🤖 AI-Ассистент - помощь 24/7
💼 Партнерка - зарабатывай 20%
📊 Аналитика - отслеживай прогресс

<b>Команды:</b>
/help - Все команды
/profile - Твой профиль
/partner - Партнерская программа
/ask [вопрос] - Спросить AI

Открой Академию через кнопку ниже! 👇`);
        break;

      case 'help':
        await send(chatId, `📖 <b>Команды Felix Academy</b>

<b>Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль
/partner - Партнерский кабинет

<b>AI:</b>
/ask [вопрос] - Спросить AI
Или просто напиши мне что-нибудь!

<b>Курсы:</b>
Открой Академию через кнопку ниже 👇

<b>Статус:</b> 🏠 Локальный тест
<b>Пользователей:</b> ${users.size}
<b>Курсов:</b> ${courses.length}`);
        break;

      case 'profile':
        const uptime = Math.floor((new Date() - user.created_at) / 1000 / 60);
        await send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${firstName}
Курсов: ${user.courses_purchased.length}
Бонусов: ${user.bonus_balance} ₽
Сообщений: ${user.message_count}
AI запросов: ${user.ai_requests}
В системе: ${uptime} мин

🔗 <b>Реферальная ссылка:</b>
<code>t.me/YourBot?start=ref_user${userId}</code>

Пригласи друга и получи 10% бонусов! 🎁`);
        break;

      case 'partner':
        await send(chatId, `💼 <b>Партнерский кабинет</b>

Баланс: 0 ₽
Переходов: 0
Регистраций: 0
Покупок: 0
Заработано: 0 ₽

🔗 <b>Партнерская ссылка:</b>
<code>t.me/YourBot?start=ref_partner${userId}</code>

<b>Условия:</b>
• 20% с каждой покупки
• Минимум для вывода: 1000 ₽
• Выплаты на карту или крипту

Открой партнерский кабинет в Академии! 👇`);
        break;

      case 'ask':
        if (!arg) {
          await send(chatId, '❓ Используй: /ask [твой вопрос]\n\nНапример:\n/ask что такое трейдинг?');
        } else {
          user.ai_requests++;
          const aiResponse = await getAIResponse(arg);
          await send(chatId, `🤖 <b>Felix AI:</b>\n\n${aiResponse}`);
        }
        break;

      case 'courses':
        let coursesList = '<b>📚 Доступные курсы:</b>\n\n';
        courses.forEach(course => {
          const price = course.price > 0 ? `${course.price} ₽` : 'Бесплатно';
          coursesList += `${course.id}. ${course.title}\n`;
          coursesList += `   ⭐ ${course.rating} | ${price}\n`;
          coursesList += `   📖 ${course.lessons.length} уроков\n\n`;
        });
        coursesList += 'Открой Академию для подробностей! 👇';
        await send(chatId, coursesList);
        break;

      default:
        await send(chatId, '❓ Неизвестная команда. Используй /help');
    }
  } else {
    // Обычное сообщение - AI ответ
    user.ai_requests++;
    const aiResponse = await getAIResponse(text);
    await send(chatId, `🤖 ${aiResponse}`);
  }
}

// Polling
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

// Запуск
async function start() {
  console.log('\n🚀 Felix Academy - Единый бот запущен!\n');
  console.log('📍 Mode: Long Polling');
  console.log('📍 Token: ' + TOKEN.substring(0, 20) + '...');
  console.log('📍 Mini App: ' + MINIAPP_URL);
  console.log('📍 Курсов: ' + courses.length);
  console.log('\n🤖 Бот работает и ждет сообщений...');
  console.log('⏹️  Ctrl+C для остановки\n');

  // Удалить webhook
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook`);
    console.log('✅ Webhook удален\n');
  } catch (e) {
    console.log('⚠️  Не удалось удалить webhook\n');
  }

  // Polling loop
  while (true) {
    await getUpdates();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка бота...');
  console.log(`📊 Статистика: ${users.size} пользователей, ${Array.from(users.values()).reduce((sum, u) => sum + u.message_count, 0)} сообщений`);
  process.exit(0);
});

// Старт
start().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
