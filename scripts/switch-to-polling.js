#!/usr/bin/env node
// Переключение бота на polling режим

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function switchToPolling() {
  console.log('\n🔄 Переключение на polling режим\n');
  
  try {
    // 1. Удалить webhook
    console.log('1️⃣ Удаление webhook...');
    const deleteResponse = await fetch(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    const deleteData = await deleteResponse.json();
    
    if (deleteData.ok) {
      console.log('   ✅ Webhook удален\n');
    } else {
      console.log('   ⚠️  Ошибка удаления webhook\n');
    }
    
    // 2. Проверка
    console.log('2️⃣ Проверка статуса...');
    const checkResponse = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const checkData = await checkResponse.json();
    
    if (checkData.ok && !checkData.result.url) {
      console.log('   ✅ Webhook отключен\n');
    } else {
      console.log('   ⚠️  Webhook все еще активен\n');
    }
    
    // 3. Инструкции
    console.log('3️⃣ Запуск бота:\n');
    console.log('   node bot.js\n');
    console.log('Бот будет работать в режиме long polling.');
    console.log('Для остановки нажмите Ctrl+C\n');
    
    console.log('✅ Готово!\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

switchToPolling();
