#!/usr/bin/env node
// Скрипт для очистки кэша Telegram Mini App
// Обновляет webhook и переустанавливает Mini App URL

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/app.html';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://felix2-0.vercel.app/api/webhook';

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function clearCache() {
  console.log('\n🧹 Очистка кэша Telegram Mini App\n');
  console.log('📍 Bot Token:', TOKEN.substring(0, 20) + '...');
  console.log('📍 Mini App URL:', MINIAPP_URL);
  console.log('📍 Webhook URL:', WEBHOOK_URL);
  console.log('');

  try {
    // 1. Получить информацию о боте
    console.log('1️⃣ Получение информации о боте...');
    const botInfo = await fetch(`${TELEGRAM_API}/getMe`);
    const botData = await botInfo.json();
    
    if (botData.ok) {
      console.log(`✅ Бот: @${botData.result.username} (${botData.result.first_name})`);
      console.log(`   ID: ${botData.result.id}`);
    } else {
      console.error('❌ Ошибка получения информации о боте:', botData);
      process.exit(1);
    }

    // 2. Удалить старый webhook
    console.log('\n2️⃣ Удаление старого webhook...');
    const deleteWebhook = await fetch(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    const deleteData = await deleteWebhook.json();
    
    if (deleteData.ok) {
      console.log('✅ Webhook удален');
    } else {
      console.log('⚠️  Webhook не был установлен или уже удален');
    }

    // Пауза 2 секунды
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Установить новый webhook
    console.log('\n3️⃣ Установка нового webhook...');
    const setWebhook = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
        drop_pending_updates: true
      })
    });
    const setData = await setWebhook.json();
    
    if (setData.ok) {
      console.log('✅ Webhook установлен:', WEBHOOK_URL);
    } else {
      console.error('❌ Ошибка установки webhook:', setData);
      process.exit(1);
    }

    // 4. Проверить webhook
    console.log('\n4️⃣ Проверка webhook...');
    const checkWebhook = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const checkData = await checkWebhook.json();
    
    if (checkData.ok) {
      const info = checkData.result;
      console.log('✅ Webhook информация:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Pending updates: ${info.pending_update_count}`);
      console.log(`   Last error: ${info.last_error_message || 'нет'}`);
      console.log(`   Max connections: ${info.max_connections || 40}`);
      
      if (info.url !== WEBHOOK_URL) {
        console.log('\n⚠️  ВНИМАНИЕ: URL webhook не совпадает!');
        console.log(`   Ожидается: ${WEBHOOK_URL}`);
        console.log(`   Установлен: ${info.url}`);
      }
    }

    // 5. Отправить тестовое сообщение (опционально)
    console.log('\n5️⃣ Готово! Теперь выполните следующие шаги:\n');
    console.log('📱 В Telegram:');
    console.log('   1. Откройте бота @' + botData.result.username);
    console.log('   2. Отправьте команду /start');
    console.log('   3. Нажмите "Открыть приложение"');
    console.log('   4. Если открылась старая версия:');
    console.log('      - Закройте приложение');
    console.log('      - Закройте чат с ботом полностью');
    console.log('      - Откройте снова и попробуйте еще раз');
    console.log('');
    console.log('🔄 Если проблема сохраняется:');
    console.log('   1. Переустановите Telegram');
    console.log('   2. Или очистите кэш приложения в настройках');
    console.log('   3. Или используйте Telegram Web: https://web.telegram.org');
    console.log('');
    console.log('⚙️  Также обновите переменную окружения в Vercel:');
    console.log('   MINIAPP_URL=' + MINIAPP_URL);
    console.log('   Затем выполните: vercel --prod');
    console.log('');
    console.log('✅ Кэш очищен успешно!\n');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск
clearCache();
