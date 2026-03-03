#!/usr/bin/env node
// Скрипт для установки webhook URL в Telegram

require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

async function setWebhook() {
  console.log('\n🔧 Установка Telegram webhook...\n');
  console.log(`Token: ${TOKEN.substring(0, 20)}...`);
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

  try {
    // Установить webhook
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query', 'inline_query']
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook установлен успешно!');
      console.log(`   URL: ${WEBHOOK_URL}`);
    } else {
      console.log('❌ Ошибка установки webhook:');
      console.log(`   ${result.description}`);
    }

    // Получить информацию о webhook
    console.log('\n📊 Информация о webhook:\n');
    
    const infoResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
    const info = await infoResponse.json();
    
    if (info.ok) {
      console.log(`URL: ${info.result.url || 'не установлен'}`);
      console.log(`Pending updates: ${info.result.pending_update_count || 0}`);
      console.log(`Last error: ${info.result.last_error_message || 'нет'}`);
      console.log(`Last error date: ${info.result.last_error_date ? new Date(info.result.last_error_date * 1000).toLocaleString() : 'нет'}`);
    }

    console.log('\n✅ Готово!\n');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

setWebhook();
