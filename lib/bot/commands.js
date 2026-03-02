// Command handlers for Felix Bot
const keyboards = require('./keyboards');

// Start command
async function handleStart(chatId, userName, sendMessage) {
  const welcomeText = `
🌟 <b>Добро пожаловать в Felix Bot Elite!</b>

Привет, ${userName}! 👋

Я твой персональный AI-ассистент с премиум функционалом:

🤖 <b>8 AI команд</b> - для любых задач
📚 <b>Академия</b> - обучение и курсы
👤 <b>Профиль</b> - твой прогресс
⚙️ <b>Настройки</b> - персонализация

Выбери действие из меню ниже или открой Mini App для полного функционала! 🚀
  `.trim();

  await sendMessage(chatId, welcomeText, keyboards.mainMenu);
}

// Help command
async function handleHelp(chatId, sendMessage) {
  const helpText = `
📖 <b>Справка Felix Bot</b>

<b>Основные команды:</b>
/start - Главное меню
/help - Эта справка
/menu - Открыть меню
/profile - Твой профиль
/settings - Настройки
/stats - Статистика

<b>AI Команды:</b>
/ask - Задать вопрос AI
/summary - Краткое резюме текста
/analyze - Анализ текста
/generate - Генерация контента
/translate - Перевод текста
/improve - Улучшение текста
/brainstorm - Генерация идей
/explain - Объяснение концепций

<b>Академия:</b>
/academy - Открыть академию
/courses - Список курсов

<b>Интерактивное меню:</b>
Используй кнопки ниже для быстрого доступа к функциям!

<b>Mini App:</b>
Открой Mini App для полного функционала с премиум дизайном! 📱
  `.trim();

  await sendMessage(chatId, helpText, keyboards.mainMenu);
}

// Menu command
async function handleMenu(chatId, sendMessage) {
  const menuText = `
🎯 <b>Главное меню Felix Bot</b>

Выбери раздел:

🤖 <b>AI Команды</b> - 8 мощных AI инструментов
📚 <b>Академия</b> - курсы и обучение
👤 <b>Профиль</b> - твой прогресс и статистика
⚙️ <b>Настройки</b> - персонализация бота

Или открой Mini App для полного функционала! 📱
  `.trim();

  await sendMessage(chatId, menuText, keyboards.mainMenu);
}

// Profile command
async function handleProfile(chatId, userId, sendMessage, db) {
  try {
    const user = await db.getUser(userId);
    const stats = await db.getUserStats(userId);
    const settings = await db.getUserSettings(userId);
    
    const profileText = `
👤 <b>Твой профиль</b>

<b>Имя:</b> ${user.first_name || 'Не указано'}
<b>ID:</b> ${userId}
<b>Уровень:</b> ${settings.level || 1} 🏆
<b>Опыт:</b> ${settings.xp || 0} XP

<b>Статистика:</b>
📊 Сообщений: ${stats.messages_count || 0}
🤖 AI запросов: ${stats.ai_requests || 0}
📚 Курсов пройдено: ${stats.courses_completed || 0}
🏆 Достижений: ${stats.achievements_count || 0}

<b>Дата регистрации:</b> ${new Date(user.created_at).toLocaleDateString('ru-RU')}

Открой Mini App для подробной статистики! 📱
    `.trim();

    await sendMessage(chatId, profileText, keyboards.profileMenu);
  } catch (error) {
    console.error('Profile error:', error);
    await sendMessage(chatId, '❌ Ошибка загрузки профиля. Попробуй позже.', keyboards.mainMenu);
  }
}

// Settings command
async function handleSettings(chatId, userId, sendMessage, db) {
  try {
    const settings = await db.getUserSettings(userId);
    
    const settingsText = `
⚙️ <b>Настройки</b>

<b>AI Настройки:</b>
🤖 Модель: ${settings.ai_model || 'llama-3.3-70b-versatile'}
🌡️ Температура: ${settings.ai_temperature || 0.7}

<b>Персонализация:</b>
🌐 Язык: ${settings.language || 'ru'}
🎨 Тема: ${settings.theme || 'auto'}
🔔 Уведомления: ${settings.notifications_enabled ? '✅' : '❌'}

Открой Mini App для детальных настроек! 📱
    `.trim();

    await sendMessage(chatId, settingsText, keyboards.settingsMenu);
  } catch (error) {
    console.error('Settings error:', error);
    await sendMessage(chatId, '❌ Ошибка загрузки настроек. Попробуй позже.', keyboards.mainMenu);
  }
}

// Stats command
async function handleStats(chatId, userId, sendMessage, db) {
  try {
    const stats = await db.getUserStats(userId);
    
    const statsText = `
📊 <b>Твоя статистика</b>

<b>Всего:</b>
📊 Сообщений: ${stats.messages_count || 0}
🤖 AI запросов: ${stats.ai_requests || 0}
📚 Курсов: ${stats.courses_completed || 0}
🏆 Достижений: ${stats.achievements_count || 0}

<b>Прогресс:</b>
⭐ Уровень: ${stats.level || 1}
💎 Опыт: ${stats.xp || 0} XP

Открой Mini App для детальной аналитики! 📱
    `.trim();

    await sendMessage(chatId, statsText, keyboards.mainMenu);
  } catch (error) {
    console.error('Stats error:', error);
    await sendMessage(chatId, '❌ Ошибка загрузки статистики. Попробуй позже.', keyboards.mainMenu);
  }
}

// Academy command
async function handleAcademy(chatId, sendMessage) {
  const academyText = `
📚 <b>Академия Felix</b>

Добро пожаловать в образовательную платформу!

<b>Доступно:</b>
📖 Курсы по различным темам
🎓 Интерактивные уроки
✅ Тесты и задания
🏆 Достижения и награды

<b>Категории:</b>
💻 Программирование
🎨 Дизайн
📊 Маркетинг
🚀 Бизнес
🧠 Личностный рост

Открой Mini App для полного доступа к академии! 📱
  `.trim();

  await sendMessage(chatId, academyText, keyboards.academyMenu);
}

// Courses command
async function handleCourses(chatId, sendMessage, db) {
  try {
    const courses = await db.getCourses({ limit: 5 });
    
    let coursesText = '📚 <b>Популярные курсы</b>\n\n';
    
    if (courses && courses.length > 0) {
      courses.forEach((course, index) => {
        coursesText += `${index + 1}. <b>${course.title}</b>\n`;
        coursesText += `   📊 ${course.lessons_count} уроков | ⏱️ ${course.duration}\n`;
        coursesText += `   ⭐ ${course.rating}/5 (${course.students_count} студентов)\n\n`;
      });
    } else {
      coursesText += 'Курсы скоро появятся!\n\n';
    }
    
    coursesText += 'Открой Mini App для просмотра всех курсов! 📱';
    
    await sendMessage(chatId, coursesText, keyboards.academyMenu);
  } catch (error) {
    console.error('Courses error:', error);
    await sendMessage(chatId, '❌ Ошибка загрузки курсов. Попробуй позже.', keyboards.mainMenu);
  }
}

module.exports = {
  handleStart,
  handleHelp,
  handleMenu,
  handleProfile,
  handleSettings,
  handleStats,
  handleAcademy,
  handleCourses
};
