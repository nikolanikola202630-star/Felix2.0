// Felix Academy Bot - Production Webhook Handler
// EGOIST ECOSYSTEM Edition v9.0

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const MINIAPP_URL = 'https://felix2-0.vercel.app/miniapp/index.html';

// Send message helper
async function send(chatId, text, keyboard = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard || {
        inline_keyboard: [[
          { text: '🎓 Открыть Академию', web_app: { url: MINIAPP_URL } }
        ]]
      }
    };

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await res.json();
  } catch (error) {
    console.error('Send error:', error);
    throw error;
  }
}

// Main webhook handler
module.exports = async (req, res) => {
  // Health check
  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
      bot: 'Felix Academy - EGOIST ECOSYSTEM',
      version: 'v9.0',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ ok: true });
    }

    const { chat, from, text } = message;
    if (!chat || !from || !text) {
      return res.json({ ok: true });
    }

    const chatId = chat.id;
    const userId = from.id;
    const userName = from.first_name || 'Пользователь';

    console.log(`📨 ${userName} (${userId}): ${text}`);

    // Handle commands
    if (text.startsWith('/')) {
      await handleCommand(chatId, userId, userName, text);
    } else {
      // Regular message
      await send(chatId, `Получил твое сообщение: "${text}"\n\nИспользуй /help для списка команд.`);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true }); // Always 200 for Telegram
  }
};

// Handle commands
async function handleCommand(chatId, userId, userName, text) {
  const [cmd, ...args] = text.slice(1).split(' ');

  const commands = {
    start: () => send(chatId, `⟁ <b>Felix Academy - EGOIST ECOSYSTEM</b>

Привет, ${userName}! 👋

Я Felix - твой персональный ассистент и консьерж образовательной платформы.

<b>🎓 Что я предлагаю:</b>
• Курсы по трейдингу, IT, психологии
• AI-помощник 24/7
• Партнерская программа (20% комиссия)
• Аналитика прогресса
• Сертификаты после обучения

<b>⚡ Быстрый старт:</b>
/help - Все команды
/profile - Твой профиль
/partner_panel - Партнерский кабинет
/admin - Админ-панель (для админов)

<b>📱 Открой Академию через кнопку ниже!</b>

<i>Создано в ⟁ EGOIST ECOSYSTEM © 2026</i>`),

    help: () => send(chatId, `📖 <b>Команды Felix Academy</b>

<b>🎯 Основные:</b>
/start - Главное меню
/help - Эта справка
/profile - Твой профиль

<b>💼 Партнерка:</b>
/partner - Информация о программе
/partner_panel - Открыть партнерский кабинет

<b>⚙️ Админ (только для админов):</b>
/admin - Открыть админ-панель

<i>⟁ EGOIST ECOSYSTEM © 2026</i>`),

    profile: () => send(chatId, `👤 <b>Твой профиль</b>

ID: <code>${userId}</code>
Имя: ${userName}

🔗 <b>Реферальная ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_${userId}</code>

Пригласи друга и получи бонусы! 🎁`),

    partner: () => send(chatId, `💼 <b>Партнерская программа Felix Academy</b>

<b>💰 Условия:</b>
• 20% с каждой покупки по твоей ссылке
• Минимум для вывода: 1000 ₽
• Выплаты на карту или криптовалюту
• Пожизненные отчисления

<b>🎯 Как работает:</b>
1. Получи свою реферальную ссылку
2. Поделись с друзьями
3. Получай 20% с их покупок
4. Выводи деньги когда угодно

<b>🔗 Твоя партнерская ссылка:</b>
<code>https://t.me/fel12x_bot?start=ref_partner${userId}</code>

Используй /partner_panel для открытия полного кабинета! 👇`),

    partner_panel: () => {
      const partnerUrl = `${MINIAPP_URL.replace('index.html', 'partner-dashboard.html')}?user_id=${userId}`;
      return send(chatId, `💼 <b>Партнерский кабинет</b>

Открываю твой партнерский кабинет...

В кабинете ты найдешь:
• 📊 Детальную статистику
• 💰 Историю выплат
• 🔗 Промо-материалы
• 📈 Аналитику переходов

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '💼 Открыть Партнерский Кабинет', web_app: { url: partnerUrl } }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    },

    admin: () => {
      // Замени на свой Telegram ID
      const ADMIN_IDS = [123456789];
      
      if (!ADMIN_IDS.includes(userId)) {
        return send(chatId, '❌ У тебя нет прав администратора.');
      }

      const adminUrl = `${MINIAPP_URL.replace('index.html', 'admin-panel.html')}?admin_id=${userId}`;
      return send(chatId, `⚙️ <b>Админ-панель Felix Academy</b>

Добро пожаловать, администратор!

<b>Доступные функции:</b>
• 👥 Управление пользователями
• 📚 Управление курсами
• 💰 Финансы и выплаты
• 📊 Аналитика платформы
• ⚙️ Настройки системы

<i>⟁ EGOIST ECOSYSTEM</i>`, {
        inline_keyboard: [[
          { text: '⚙️ Открыть Админ-Панель', web_app: { url: adminUrl } }
        ], [
          { text: '📚 Управление Курсами', web_app: { url: adminUrl.replace('admin-panel', 'admin-courses') } }
        ], [
          { text: '🎓 Главная', web_app: { url: MINIAPP_URL } }
        ]]
      });
    }
  };

  // Execute command
  const handler = commands[cmd];
  if (handler) {
    await handler();
  } else {
    await send(chatId, '❓ Неизвестная команда. Используй /help');
  }
}
