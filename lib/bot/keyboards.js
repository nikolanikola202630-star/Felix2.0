// Keyboards and Buttons for Felix Bot
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/elite-v6.html';

// Main menu keyboard
const mainMenu = {
  inline_keyboard: [
    [
      { text: '🤖 AI Команды', callback_data: 'menu_ai' },
      { text: '📚 Академия', callback_data: 'menu_academy' }
    ],
    [
      { text: '👤 Профиль', callback_data: 'menu_profile' },
      { text: '⚙️ Настройки', callback_data: 'menu_settings' }
    ],
    [
      { text: '📱 Открыть Mini App', web_app: { url: MINIAPP_URL } }
    ]
  ]
};

// AI commands menu
const aiMenu = {
  inline_keyboard: [
    [
      { text: '💬 Задать вопрос', callback_data: 'ai_ask' },
      { text: '📝 Резюме', callback_data: 'ai_summary' }
    ],
    [
      { text: '🔍 Анализ', callback_data: 'ai_analyze' },
      { text: '✨ Генерация', callback_data: 'ai_generate' }
    ],
    [
      { text: '🌐 Перевод', callback_data: 'ai_translate' },
      { text: '✏️ Улучшение', callback_data: 'ai_improve' }
    ],
    [
      { text: '💡 Идеи', callback_data: 'ai_brainstorm' },
      { text: '📖 Объяснение', callback_data: 'ai_explain' }
    ],
    [
      { text: '« Назад', callback_data: 'menu_main' }
    ]
  ]
};

// Academy menu
const academyMenu = {
  inline_keyboard: [
    [
      { text: '📚 Все курсы', callback_data: 'academy_courses' },
      { text: '🎓 Мои курсы', callback_data: 'academy_my' }
    ],
    [
      { text: '📊 Прогресс', callback_data: 'academy_progress' },
      { text: '🏆 Достижения', callback_data: 'academy_achievements' }
    ],
    [
      { text: '📱 Открыть в App', web_app: { url: `${MINIAPP_URL}#academy` } }
    ],
    [
      { text: '« Назад', callback_data: 'menu_main' }
    ]
  ]
};

// Profile menu
const profileMenu = {
  inline_keyboard: [
    [
      { text: '📊 Статистика', callback_data: 'profile_stats' },
      { text: '📜 История', callback_data: 'profile_history' }
    ],
    [
      { text: '🏆 Достижения', callback_data: 'profile_achievements' },
      { text: '📈 Аналитика', callback_data: 'profile_analytics' }
    ],
    [
      { text: '📱 Открыть профиль', web_app: { url: `${MINIAPP_URL}#profile` } }
    ],
    [
      { text: '« Назад', callback_data: 'menu_main' }
    ]
  ]
};

// Settings menu
const settingsMenu = {
  inline_keyboard: [
    [
      { text: '🤖 AI Настройки', callback_data: 'settings_ai' },
      { text: '🎨 Персонализация', callback_data: 'settings_personal' }
    ],
    [
      { text: '🔔 Уведомления', callback_data: 'settings_notifications' },
      { text: '🔒 Приватность', callback_data: 'settings_privacy' }
    ],
    [
      { text: '📱 Открыть настройки', web_app: { url: `${MINIAPP_URL}#settings` } }
    ],
    [
      { text: '« Назад', callback_data: 'menu_main' }
    ]
  ]
};

// Back button
const backButton = (callback) => ({
  inline_keyboard: [
    [{ text: '« Назад', callback_data: callback }]
  ]
});

// Mini App button
const miniAppButton = (text = '📱 Открыть Felix App', url = MINIAPP_URL) => ({
  inline_keyboard: [
    [{ text, web_app: { url } }]
  ]
});

// Combined keyboard (buttons + Mini App)
const withMiniApp = (buttons) => ({
  inline_keyboard: [
    ...buttons,
    [{ text: '📱 Открыть Felix App', web_app: { url: MINIAPP_URL } }]
  ]
});

module.exports = {
  mainMenu,
  aiMenu,
  academyMenu,
  profileMenu,
  settingsMenu,
  backButton,
  miniAppButton,
  withMiniApp
};
