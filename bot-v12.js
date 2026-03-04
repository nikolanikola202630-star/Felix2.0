// Felix Academy V12 - Main Bot
// Оптимизированный главный бот с улучшенной логикой

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Конфигурация
const config = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  webAppUrl: process.env.WEB_APP_URL || 'https://felix2-0.vercel.app/miniapp/app.html',
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id)).filter(Boolean)
};

// Инициализация
const bot = new TelegramBot(config.token, { polling: true });
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

console.log('🤖 Felix Academy V12 Bot - Starting...');

// Middleware для логирования
bot.on('message', async (msg) => {
  console.log(`📨 Message from ${msg.from.username || msg.from.first_name}: ${msg.text}`);
  
  // Сохранение пользователя
  await saveUser(msg.from);
  
  // Сохранение истории
  await saveHistory(msg.from.id, 'message', msg.text);
});

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  const welcomeText = `
👋 Привет, ${user.first_name}!

Добро пожаловать в Felix Academy V12 - твою персональную академию обучения!

🎓 Что я умею:
• Доступ к курсам и урокам
• AI-ассистент для обучения
• Сообщество и обсуждения
• Персональная статистика
• Достижения и награды

Выбери действие ниже или открой приложение! 👇
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Открыть приложение', web_app: { url: config.webAppUrl } }
      ],
      [
        { text: '📚 Мои курсы', callback_data: 'my_courses' },
        { text: '🎓 Каталог', callback_data: 'catalog' }
      ],
      [
        { text: '👥 Сообщество', callback_data: 'community' },
        { text: '⚙️ Настройки', callback_data: 'settings' }
      ],
      [
        { text: '📊 Статистика', callback_data: 'stats' },
        { text: '❓ Помощь', callback_data: 'help' }
      ]
    ]
  };

  await bot.sendMessage(chatId, welcomeText, { reply_markup: keyboard });
});

// Команда /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpText = `
📖 Справка Felix Academy V12

🎯 Основные команды:
/start - Главное меню
/help - Эта справка
/stats - Твоя статистика
/courses - Мои курсы
/catalog - Каталог курсов
/community - Сообщество
/settings - Настройки

🤖 AI-Ассистент:
Просто напиши мне вопрос, и я помогу!

💡 Совет:
Используй кнопку "Открыть приложение" для полного функционала!
  `;

  await bot.sendMessage(chatId, helpText);
});

// Команда /stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stats) {
      const statsText = `
📊 Твоя статистика

🎓 Курсов куплено: ${stats.courses_purchased || 0}
⏱️ Времени обучения: ${stats.hours_learned || 0} часов
✅ Уроков завершено: ${stats.lessons_completed || 0}
🎯 Достижений: ${stats.achievements_count || 0}
💰 Бонусов: ${stats.bonus_balance || 0} ₽

Продолжай в том же духе! 🚀
      `;

      await bot.sendMessage(chatId, statsText);
    } else {
      await bot.sendMessage(chatId, '📊 Статистика пока пуста. Начни обучение!');
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    await bot.sendMessage(chatId, '❌ Ошибка загрузки статистики');
  }
});

// Обработка callback запросов
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userId = query.from.id;

  await bot.answerCallbackQuery(query.id);

  switch (data) {
    case 'my_courses':
      await handleMyCourses(chatId, userId);
      break;
    
    case 'catalog':
      await handleCatalog(chatId);
      break;
    
    case 'community':
      await handleCommunity(chatId);
      break;
    
    case 'settings':
      await handleSettings(chatId, userId);
      break;
    
    case 'stats':
      await bot.sendMessage(chatId, '/stats');
      break;
    
    case 'help':
      await bot.sendMessage(chatId, '/help');
      break;
    
    default:
      await bot.sendMessage(chatId, '❓ Неизвестная команда');
  }
});

// Обработчики
async function handleMyCourses(chatId, userId) {
  try {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('*, courses(*)')
      .eq('user_id', userId);

    if (purchases && purchases.length > 0) {
      let text = '📚 Твои курсы:\n\n';
      
      purchases.forEach((purchase, index) => {
        text += `${index + 1}. ${purchase.courses.title}\n`;
        text += `   Прогресс: ${purchase.progress || 0}%\n\n`;
      });

      const keyboard = {
        inline_keyboard: [
          [{ text: '🚀 Открыть в приложении', web_app: { url: config.webAppUrl } }]
        ]
      };

      await bot.sendMessage(chatId, text, { reply_markup: keyboard });
    } else {
      await bot.sendMessage(chatId, '📚 У тебя пока нет курсов. Загляни в каталог!');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    await bot.sendMessage(chatId, '❌ Ошибка загрузки курсов');
  }
}

async function handleCatalog(chatId) {
  const text = `
📚 Каталог курсов

Доступны курсы по:
• 📈 Трейдингу
• ₿ Криптовалютам
• 🧠 Психологии
• 💼 Инвестициям
• 🚀 Саморазвитию

Открой приложение для просмотра всех курсов!
  `;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 Открыть каталог', web_app: { url: config.webAppUrl + '?page=catalog' } }]
    ]
  };

  await bot.sendMessage(chatId, text, { reply_markup: keyboard });
}

async function handleCommunity(chatId) {
  const text = `
👥 Сообщество Felix Academy

Присоединяйся к обсуждениям:
• 📈 Трейдинг
• ₿ Криптовалюты
• 🧠 Психология
• 💼 Инвестиции

Делись опытом и учись у других!
  `;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 Открыть сообщество', web_app: { url: config.webAppUrl + '?page=community' } }]
    ]
  };

  await bot.sendMessage(chatId, text, { reply_markup: keyboard });
}

async function handleSettings(chatId, userId) {
  const text = `
⚙️ Настройки

Доступные настройки:
• 🎨 Тема оформления
• 🔔 Уведомления
• 🤖 AI-ассистент
• 📚 Обучение

Открой приложение для настройки!
  `;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 Открыть настройки', web_app: { url: config.webAppUrl + '?page=settings' } }]
    ]
  };

  await bot.sendMessage(chatId, text, { reply_markup: keyboard });
}

// Вспомогательные функции
async function saveUser(user) {
  try {
    await supabase
      .from('users')
      .upsert({
        user_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        language_code: user.language_code,
        last_active: new Date().toISOString()
      }, { onConflict: 'user_id' });
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

async function saveHistory(userId, actionType, message) {
  try {
    await supabase
      .from('user_history')
      .insert({
        user_id: userId,
        action_type: actionType,
        message: message,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Felix Academy V12 Bot - Ready!');
