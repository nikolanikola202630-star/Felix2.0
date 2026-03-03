#!/usr/bin/env node

/**
 * Установка Webhook для Production
 * Felix Academy Bot - EGOIST ECOSYSTEM Edition
 */

const https = require('https');

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://felix2-0.vercel.app/api/webhook';

console.log('🚀 Felix Academy - Установка Webhook\n');
console.log('📍 Webhook URL:', WEBHOOK_URL);
console.log('🤖 Bot Token:', BOT_TOKEN.substring(0, 20) + '...\n');

// Функция для HTTP запроса
function makeRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + (data ? '?' + new URLSearchParams(data).toString() : ''),
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Основная функция
async function setupWebhook() {
  try {
    // 1. Удаляем старый webhook
    console.log('🗑️  Удаление старого webhook...');
    const deleteResult = await makeRequest('deleteWebhook');
    
    if (deleteResult.ok) {
      console.log('✅ Старый webhook удален\n');
    } else {
      console.log('⚠️  Ошибка удаления:', deleteResult.description, '\n');
    }

    // 2. Устанавливаем новый webhook
    console.log('📡 Установка нового webhook...');
    const setResult = await makeRequest('setWebhook', {
      url: WEBHOOK_URL,
      drop_pending_updates: 'true'
    });

    if (setResult.ok) {
      console.log('✅ Webhook установлен успешно!\n');
    } else {
      console.log('❌ Ошибка установки:', setResult.description, '\n');
      process.exit(1);
    }

    // 3. Проверяем webhook
    console.log('🔍 Проверка webhook...');
    const infoResult = await makeRequest('getWebhookInfo');

    if (infoResult.ok) {
      const info = infoResult.result;
      console.log('\n📊 Информация о webhook:');
      console.log('   URL:', info.url);
      console.log('   Pending updates:', info.pending_update_count);
      console.log('   Max connections:', info.max_connections || 40);
      
      if (info.last_error_date) {
        console.log('   ⚠️  Последняя ошибка:', new Date(info.last_error_date * 1000).toLocaleString());
        console.log('   Сообщение:', info.last_error_message);
      } else {
        console.log('   ✅ Ошибок нет');
      }

      if (info.url === WEBHOOK_URL) {
        console.log('\n🎉 Webhook настроен правильно!');
        console.log('🤖 Бот готов к работе!\n');
      } else {
        console.log('\n⚠️  URL не совпадает!');
        console.log('   Ожидается:', WEBHOOK_URL);
        console.log('   Установлен:', info.url, '\n');
      }
    }

    // 4. Получаем информацию о боте
    console.log('🤖 Информация о боте:');
    const meResult = await makeRequest('getMe');
    
    if (meResult.ok) {
      const bot = meResult.result;
      console.log('   Username: @' + bot.username);
      console.log('   Name:', bot.first_name);
      console.log('   ID:', bot.id);
      console.log('   Can join groups:', bot.can_join_groups);
      console.log('   Can read messages:', bot.can_read_all_group_messages);
      console.log('   Supports inline:', bot.supports_inline_queries);
    }

    console.log('\n✅ Настройка завершена!');
    console.log('📱 Протестируй бота: https://t.me/' + (meResult.result?.username || 'your_bot'));
    console.log('🌐 MiniApp: ' + WEBHOOK_URL.replace('/api/webhook', '/miniapp/'));
    console.log('\n⟁ EGOIST ECOSYSTEM © 2026\n');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error('\n💡 Проверь:');
    console.error('   1. TELEGRAM_BOT_TOKEN правильный');
    console.error('   2. WEBHOOK_URL доступен (HTTPS)');
    console.error('   3. Интернет соединение работает\n');
    process.exit(1);
  }
}

// Запуск
setupWebhook();
