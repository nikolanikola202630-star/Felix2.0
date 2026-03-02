// Callback query handlers for Felix Bot
const keyboards = require('./keyboards');
const aiHandlers = require('./ai-handlers');

// Handle callback query
async function handleCallback(callbackQuery, sendMessage, editMessage, db, ai) {
  const { data, message, from } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  const userId = from.id;

  try {
    // Main menu callbacks
    if (data === 'menu_main') {
      await showMainMenu(chatId, messageId, editMessage);
    }
    else if (data === 'menu_ai') {
      await aiHandlers.showAIMenu(chatId, messageId, editMessage);
    }
    else if (data === 'menu_academy') {
      await showAcademyMenu(chatId, messageId, editMessage);
    }
    else if (data === 'menu_profile') {
      await showProfileMenu(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'menu_settings') {
      await showSettingsMenu(chatId, messageId, userId, editMessage, db);
    }
    
    // AI callbacks
    else if (data.startsWith('ai_')) {
      const command = data.replace('ai_', '');
      await aiHandlers.handleAICallback(command, chatId, messageId, sendMessage, editMessage);
    }
    
    // Academy callbacks
    else if (data === 'academy_courses') {
      await showCourses(chatId, messageId, editMessage, db);
    }
    else if (data === 'academy_my') {
      await showMyCourses(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'academy_progress') {
      await showProgress(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'academy_achievements') {
      await showAchievements(chatId, messageId, userId, editMessage, db);
    }
    
    // Profile callbacks
    else if (data === 'profile_stats') {
      await showStats(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'profile_history') {
      await showHistory(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'profile_achievements') {
      await showAchievements(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'profile_analytics') {
      await showAnalytics(chatId, messageId, userId, editMessage, db);
    }
    
    // Settings callbacks
    else if (data === 'settings_ai') {
      await showAISettings(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'settings_personal') {
      await showPersonalSettings(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'settings_notifications') {
      await showNotificationSettings(chatId, messageId, userId, editMessage, db);
    }
    else if (data === 'settings_privacy') {
      await showPrivacySettings(chatId, messageId, userId, editMessage, db);
    }
    
  } catch (error) {
    console.error('Callback error:', error);
    await sendMessage(chatId, '❌ Произошла ошибка. Попробуй еще раз.', keyboards.mainMenu);
  }
}

// Show main menu
async function showMainMenu(chatId, messageId, editMessage) {
  const text = `
🎯 <b>Главное меню Felix Bot</b>

Выбери раздел:

🤖 <b>AI Команды</b> - 8 мощных AI инструментов
📚 <b>Академия</b> - курсы и обучение
👤 <b>Профиль</b> - твой прогресс и статистика
⚙️ <b>Настройки</b> - персонализация бота

Или открой Mini App для полного функционала! 📱
  `.trim();

  await editMessage(chatId, messageId, text, keyboards.mainMenu);
}

// Show academy menu
async function showAcademyMenu(chatId, messageId, editMessage) {
  const text = `
📚 <b>Академия Felix</b>

Добро пожаловать в образовательную платформу!

<b>Доступно:</b>
📖 Курсы по различным темам
🎓 Интерактивные уроки
✅ Тесты и задания
🏆 Достижения и награды

Открой Mini App для полного доступа! 📱
  `.trim();

  await editMessage(chatId, messageId, text, keyboards.academyMenu);
}

// Show profile menu
async function showProfileMenu(chatId, messageId, userId, editMessage, db) {
  try {
    const user = await db.getUser(userId);
    const stats = await db.getUserStats(userId);
    
    const text = `
👤 <b>Твой профиль</b>

<b>Имя:</b> ${user.first_name || 'Не указано'}
<b>Уровень:</b> ${stats.level || 1} 🏆
<b>Опыт:</b> ${stats.xp || 0} XP

<b>Статистика:</b>
📊 Сообщений: ${stats.messages_count || 0}
🤖 AI запросов: ${stats.ai_requests || 0}
📚 Курсов: ${stats.courses_completed || 0}
🏆 Достижений: ${stats.achievements_count || 0}

Открой Mini App для подробностей! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.profileMenu);
  } catch (error) {
    console.error('Profile menu error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки профиля', keyboards.mainMenu);
  }
}

// Show settings menu
async function showSettingsMenu(chatId, messageId, userId, editMessage, db) {
  try {
    const settings = await db.getUserSettings(userId);
    
    const text = `
⚙️ <b>Настройки</b>

<b>AI:</b> ${settings.ai_model || 'llama-3.3-70b-versatile'}
<b>Стиль:</b> ${settings.communication_style || 'casual'}
<b>Язык:</b> ${settings.language || 'ru'}

Открой Mini App для детальных настроек! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.settingsMenu);
  } catch (error) {
    console.error('Settings menu error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки настроек', keyboards.mainMenu);
  }
}

// Show courses
async function showCourses(chatId, messageId, editMessage, db) {
  try {
    const courses = await db.getCourses({ limit: 3 });
    
    let text = '📚 <b>Популярные курсы</b>\n\n';
    
    courses.forEach((course, index) => {
      text += `${index + 1}. <b>${course.title}</b>\n`;
      text += `   📊 ${course.lessons_count} уроков\n`;
      text += `   ⭐ ${course.rating}/5\n\n`;
    });
    
    text += 'Открой Mini App для всех курсов! 📱';
    
    await editMessage(chatId, messageId, text, keyboards.academyMenu);
  } catch (error) {
    console.error('Courses error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки курсов', keyboards.academyMenu);
  }
}

// Show my courses
async function showMyCourses(chatId, messageId, userId, editMessage, db) {
  try {
    const courses = await db.getUserCourses(userId);
    
    let text = '🎓 <b>Мои курсы</b>\n\n';
    
    if (courses.length === 0) {
      text += 'У тебя пока нет активных курсов.\n\n';
      text += 'Открой Mini App чтобы начать обучение! 📱';
    } else {
      courses.forEach((course, index) => {
        text += `${index + 1}. <b>${course.title}</b>\n`;
        text += `   📊 Прогресс: ${course.progress}%\n\n`;
      });
      text += 'Открой Mini App для продолжения! 📱';
    }
    
    await editMessage(chatId, messageId, text, keyboards.academyMenu);
  } catch (error) {
    console.error('My courses error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки курсов', keyboards.academyMenu);
  }
}

// Show progress
async function showProgress(chatId, messageId, userId, editMessage, db) {
  try {
    const progress = await db.getUserProgress(userId);
    
    const text = `
📊 <b>Твой прогресс</b>

<b>Обучение:</b>
📚 Курсов в процессе: ${progress.active_courses || 0}
✅ Курсов завершено: ${progress.completed_courses || 0}
📖 Уроков пройдено: ${progress.lessons_completed || 0}

<b>Активность:</b>
🔥 Серия дней: ${progress.streak || 0}
⏱️ Время обучения: ${progress.total_time || 0} мин

Открой Mini App для детальной статистики! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.academyMenu);
  } catch (error) {
    console.error('Progress error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки прогресса', keyboards.academyMenu);
  }
}

// Show achievements
async function showAchievements(chatId, messageId, userId, editMessage, db) {
  try {
    const achievements = await db.getUserAchievements(userId);
    
    let text = '🏆 <b>Твои достижения</b>\n\n';
    
    if (achievements.length === 0) {
      text += 'У тебя пока нет достижений.\n\n';
      text += 'Начни обучение чтобы получить первое! 🎯';
    } else {
      achievements.slice(0, 5).forEach(achievement => {
        text += `${achievement.icon} <b>${achievement.title}</b>\n`;
        text += `   ${achievement.description}\n\n`;
      });
      
      if (achievements.length > 5) {
        text += `И еще ${achievements.length - 5} достижений!\n\n`;
      }
    }
    
    text += 'Открой Mini App для всех достижений! 📱';
    
    await editMessage(chatId, messageId, text, keyboards.backButton('menu_academy'));
  } catch (error) {
    console.error('Achievements error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки достижений', keyboards.mainMenu);
  }
}

// Show stats
async function showStats(chatId, messageId, userId, editMessage, db) {
  try {
    const stats = await db.getUserStats(userId);
    
    const text = `
📊 <b>Статистика</b>

<b>Всего:</b>
💬 Сообщений: ${stats.messages_count || 0}
🤖 AI запросов: ${stats.ai_requests || 0}
📚 Курсов: ${stats.courses_completed || 0}
🏆 Достижений: ${stats.achievements_count || 0}

<b>Уровень:</b>
⭐ ${stats.level || 1}
💎 ${stats.xp || 0} XP

Открой Mini App для графиков! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.profileMenu);
  } catch (error) {
    console.error('Stats error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки статистики', keyboards.profileMenu);
  }
}

// Show history
async function showHistory(chatId, messageId, userId, editMessage, db) {
  try {
    const history = await db.getHistory(userId, { limit: 5 });
    
    let text = '📜 <b>История</b>\n\n';
    
    if (history.messages.length === 0) {
      text += 'История пуста.\n\n';
    } else {
      history.messages.forEach((msg, index) => {
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');
        text += `${index + 1}. ${msg.role === 'user' ? '👤' : '🤖'} ${date}\n`;
        text += `   ${msg.content.substring(0, 50)}...\n\n`;
      });
    }
    
    text += 'Открой Mini App для полной истории! 📱';
    
    await editMessage(chatId, messageId, text, keyboards.profileMenu);
  } catch (error) {
    console.error('History error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки истории', keyboards.profileMenu);
  }
}

// Show analytics
async function showAnalytics(chatId, messageId, userId, editMessage, db) {
  const text = `
📈 <b>Аналитика</b>

Детальная аналитика доступна в Mini App:

📊 Графики прогресса
⏱️ Время активности
🎯 Достижение целей
📈 Динамика обучения

Открой Mini App для просмотра! 📱
  `.trim();

  await editMessage(chatId, messageId, text, keyboards.profileMenu);
}

// Show AI settings
async function showAISettings(chatId, messageId, userId, editMessage, db) {
  try {
    const settings = await db.getUserSettings(userId);
    
    const text = `
🤖 <b>AI Настройки</b>

<b>Модель:</b> ${settings.ai_model || 'llama-3.3-70b-versatile'}
<b>Температура:</b> ${settings.ai_temperature || 0.7}
<b>Стиль:</b> ${settings.communication_style || 'casual'}

Открой Mini App для изменения настроек! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.settingsMenu);
  } catch (error) {
    console.error('AI settings error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки настроек', keyboards.settingsMenu);
  }
}

// Show personal settings
async function showPersonalSettings(chatId, messageId, userId, editMessage, db) {
  try {
    const settings = await db.getUserSettings(userId);
    
    const text = `
🎨 <b>Персонализация</b>

<b>Язык:</b> ${settings.language || 'ru'}
<b>Тема:</b> ${settings.theme || 'auto'}
<b>Уведомления:</b> ${settings.notifications ? '✅' : '❌'}

Открой Mini App для изменения! 📱
    `.trim();

    await editMessage(chatId, messageId, text, keyboards.settingsMenu);
  } catch (error) {
    console.error('Personal settings error:', error);
    await editMessage(chatId, messageId, '❌ Ошибка загрузки настроек', keyboards.settingsMenu);
  }
}

// Show notification settings
async function showNotificationSettings(chatId, messageId, userId, editMessage, db) {
  const text = `
🔔 <b>Уведомления</b>

Настройки уведомлений доступны в Mini App:

✅ Новые уроки
✅ Достижения
✅ Напоминания
✅ Новости

Открой Mini App для настройки! 📱
  `.trim();

  await editMessage(chatId, messageId, text, keyboards.settingsMenu);
}

// Show privacy settings
async function showPrivacySettings(chatId, messageId, userId, editMessage, db) {
  const text = `
🔒 <b>Приватность</b>

Настройки приватности доступны в Mini App:

🔐 Видимость профиля
📊 Сбор аналитики
💾 Хранение данных
📤 Экспорт данных

Открой Mini App для настройки! 📱
  `.trim();

  await editMessage(chatId, messageId, text, keyboards.settingsMenu);
}

module.exports = {
  handleCallback
};
