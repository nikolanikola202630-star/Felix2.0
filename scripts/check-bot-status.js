#!/usr/bin/env node
// Проверка статуса бота

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function checkStatus() {
  console.log('\n🔍 Проверка статуса бота\n');
  
  try {
    // 1. Проверка бота
    const botInfo = await fetch(`${TELEGRAM_API}/getMe`);
    const botData = await botInfo.json();
    
    if (botData.ok) {
      console.log('✅ Бот активен:');
      console.log(`   @${botData.result.username}`);
      console.log(`   ID: ${botData.result.id}`);
      console.log(`   Имя: ${botData.result.first_name}\n`);
    } else {
      console.log('❌ Бот недоступен\n');
      return;
    }
    
    // 2. Проверка webhook
    const webhookInfo = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const webhookData = await webhookInfo.json();
    
    if (webhookData.ok) {
      const info = webhookData.result;
      console.log('📡 Webhook:');
      console.log(`   URL: ${info.url || 'НЕ УСТАНОВЛЕН'}`);
      console.log(`   Pending: ${info.pending_update_count || 0}`);
      
      if (info.last_error_message) {
        console.log(`   ❌ Ошибка: ${info.last_error_message}`);
        console.log(`   Время: ${new Date(info.last_error_date * 1000).toLocaleString()}`);
      } else {
        console.log(`   ✅ Ошибок нет`);
      }
      console.log('');
    }
    
    // 3. Рекомендации
    console.log('💡 Рекомендации:\n');
    
    if (webhookData.result.url) {
      console.log('⚠️  Webhook установлен, но API endpoints удалены!');
      console.log('');
      console.log('Вариант 1: Запустить бота локально (РЕКОМЕНДУЕТСЯ):');
      console.log('   node bot.js');
      console.log('');
      console.log('Вариант 2: Удалить webhook и использовать polling:');
      console.log('   node scripts/switch-to-polling.js');
      console.log('');
    } else {
      console.log('✅ Webhook не установлен');
      console.log('');
      console.log('Запустите бота локально:');
      console.log('   node bot.js');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkStatus();
