// AI command handlers for Felix Bot
const keyboards = require('./keyboards');

// AI command descriptions
const AI_COMMANDS = {
  ask: {
    name: '💬 Задать вопрос',
    description: 'Задай любой вопрос - я отвечу на основе AI',
    prompt: 'Ответь на вопрос пользователя подробно и понятно:'
  },
  summary: {
    name: '📝 Резюме',
    description: 'Создам краткое резюме любого текста',
    prompt: 'Создай краткое резюме следующего текста, выдели ключевые моменты:'
  },
  analyze: {
    name: '🔍 Анализ',
    description: 'Проанализирую текст и дам детальную оценку',
    prompt: 'Проанализируй следующий текст, оцени его структуру, стиль и содержание:'
  },
  generate: {
    name: '✨ Генерация',
    description: 'Сгенерирую контент по твоему запросу',
    prompt: 'Сгенерируй качественный контент на основе следующего запроса:'
  },
  translate: {
    name: '🌐 Перевод',
    description: 'Переведу текст на любой язык',
    prompt: 'Переведи следующий текст (определи язык автоматически и переведи на русский, если текст на русском - переведи на английский):'
  },
  improve: {
    name: '✏️ Улучшение',
    description: 'Улучшу твой текст, исправлю ошибки',
    prompt: 'Улучши следующий текст: исправь ошибки, улучши стиль и структуру:'
  },
  brainstorm: {
    name: '💡 Идеи',
    description: 'Сгенерирую креативные идеи по теме',
    prompt: 'Сгенерируй 5-7 креативных идей на следующую тему:'
  },
  explain: {
    name: '📖 Объяснение',
    description: 'Объясню любую концепцию простым языком',
    prompt: 'Объясни следующую концепцию простым и понятным языком, используй примеры:'
  }
};

// Handle AI command
async function handleAICommand(command, chatId, userId, text, sendMessage, ai, db) {
  const commandInfo = AI_COMMANDS[command];
  
  if (!commandInfo) {
    await sendMessage(chatId, '❌ Неизвестная AI команда', keyboards.aiMenu);
    return;
  }

  // Check if user provided text
  if (!text || text.trim() === '') {
    const helpText = `
${commandInfo.name}

<b>Описание:</b> ${commandInfo.description}

<b>Использование:</b>
/${command} [твой текст]

<b>Пример:</b>
/${command} Расскажи про искусственный интеллект

Отправь команду с текстом для обработки! 💬
    `.trim();
    
    await sendMessage(chatId, helpText, keyboards.backButton('menu_ai'));
    return;
  }

  try {
    // Send "typing" action
    await sendMessage(chatId, '⏳ Обрабатываю запрос...', null, true);
    
    // Get user settings
    const settings = await db.getUserSettings(userId);
    
    // Get AI response
    const fullPrompt = `${commandInfo.prompt}\n\n${text}`;
    const response = await ai.getChatResponse(fullPrompt, [], {
      temperature: settings.ai_temperature || 0.7,
      model: settings.ai_model || 'llama-3.3-70b-versatile',
      language: settings.language || 'ru'
    });
    
    // Save to history
    await db.saveMessage(userId, 'user', text, command);
    await db.saveMessage(userId, 'assistant', response, command);
    
    // Update stats
    await db.incrementAIRequests(userId);
    
    // Send response
    const responseText = `${commandInfo.name}\n\n${response}`;
    await sendMessage(chatId, responseText, keyboards.withMiniApp([
      [
        { text: '🔄 Повторить', callback_data: `ai_${command}` },
        { text: '« К AI меню', callback_data: 'menu_ai' }
      ]
    ]));
    
  } catch (error) {
    console.error(`AI ${command} error:`, error);
    
    let errorMessage = '❌ Ошибка обработки запроса.';
    
    if (error.message?.includes('rate limit')) {
      errorMessage = '⏳ Превышен лимит запросов. Попробуй позже.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = '⏱️ Превышено время ожидания. Попробуй еще раз.';
    }
    
    await sendMessage(chatId, errorMessage, keyboards.aiMenu);
  }
}

// Handle AI callback (from button)
async function handleAICallback(command, chatId, messageId, sendMessage, editMessage) {
  const commandInfo = AI_COMMANDS[command];
  
  if (!commandInfo) {
    return;
  }

  const instructionText = `
${commandInfo.name}

<b>Описание:</b> ${commandInfo.description}

<b>Как использовать:</b>
Отправь команду /${command} с твоим текстом

<b>Пример:</b>
/${command} Твой текст здесь

Или используй Mini App для более удобного интерфейса! 📱
  `.trim();

  await editMessage(chatId, messageId, instructionText, keyboards.backButton('menu_ai'));
}

// Show AI menu
async function showAIMenu(chatId, messageId, editMessage) {
  const menuText = `
🤖 <b>AI Команды</b>

Выбери команду для работы с AI:

💬 <b>Задать вопрос</b> - любые вопросы
📝 <b>Резюме</b> - краткое изложение
🔍 <b>Анализ</b> - детальный анализ
✨ <b>Генерация</b> - создание контента
🌐 <b>Перевод</b> - перевод текста
✏️ <b>Улучшение</b> - улучшение текста
💡 <b>Идеи</b> - генерация идей
📖 <b>Объяснение</b> - простые объяснения

<b>Лимиты:</b>
📊 50 запросов в день
⏱️ 10 запросов в час

Открой Mini App для расширенных возможностей! 📱
  `.trim();

  await editMessage(chatId, messageId, menuText, keyboards.aiMenu);
}

module.exports = {
  AI_COMMANDS,
  handleAICommand,
  handleAICallback,
  showAIMenu
};
