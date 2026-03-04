#!/usr/bin/env node
// Агрессивная очистка кэша Telegram

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const ADMIN_ID = process.env.ADMIN_ID || '8264612178';

async function fixCache() {
  console.log('\n🧹 Агрессивная очистка кэша Telegram\n');
  
  try {
    // 1. Удалить webhook с очисткой pending updates
    console.log('1️⃣ Удаление webhook и pending updates...');
    const deleteResponse = await fetch(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    const deleteData = await deleteResponse.json();
    console.log(deleteData.ok ? '   ✅ Webhook удален' : '   ⚠️  Ошибка');
    
    // 2. Отправить тестовое сообщение админу
    console.log('\n2️⃣ Отправка тестового сообщения...');
    const testMessage = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: '🔄 Кэш очищен! Попробуйте открыть Mini App снова.',
        reply_markup: {
          inline_keyboard: [[
            { 
              text: '🎓 Открыть EGOIST ACADEMY', 
              web_app: { url: 'https://felix2-0.vercel.app/miniapp/egoist.html' }
            }
          ]]
        }
      })
    });
    
    const testData = await testMessage.json();
    console.log(testData.ok ? '   ✅ Сообщение отправлено' : '   ⚠️  Ошибка отправки');
    
    // 3. Инструкции
    console.log('\n3️⃣ Что делать дальше:\n');
    console.log('📱 В Telegram:');
    console.log('   1. Найдите сообщение от бота');
    console.log('   2. Нажмите "🎓 Открыть EGOIST ACADEMY"');
    console.log('   3. Должен открыться черный фон с заголовком\n');
    
    console.log('⚠️  Если все еще 404:\n');
    console.log('Вариант 1: Telegram Desktop');
    console.log('   - Настройки → Продвинутые → Управление данными');
    console.log('   - Очистить кэш');
    console.log('   - Перезапустить Telegram\n');
    
    console.log('Вариант 2: Telegram Mobile');
    console.log('   - Настройки → Данные и память → Использование памяти');
    console.log('   - Очистить кэш');
    console.log('   - Перезапустить приложение\n');
    
    console.log('Вариант 3: Telegram Web (РЕКОМЕНДУЕТСЯ)');
    console.log('   - Откройте: https://web.telegram.org');
    console.log('   - Найдите бота: @fel12x_bot');
    console.log('   - Отправьте: /start');
    console.log('   - Web версия не кэширует так агрессивно\n');
    
    console.log('Вариант 4: Новый URL (обход кэша)');
    console.log('   - Создать egoist-v2.html');
    console.log('   - Обновить URL в боте');
    console.log('   - Новый URL не будет в кэше\n');
    
    console.log('✅ Готово!\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

fixCache();
