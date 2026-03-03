#!/usr/bin/env node

// Быстрое исправление webhook бота
// Удаляет старый webhook и устанавливает новый

const https = require('https');

const BOT_TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

console.log('🔧 Исправление webhook бота Felix Academy...\n');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function fixWebhook() {
  try {
    // 1. Удалить старый webhook
    console.log('1️⃣ Удаление старого webhook...');
    const deleteResult = await makeRequest(
      'POST',
      `/bot${BOT_TOKEN}/deleteWebhook`
    );

    if (deleteResult.ok) {
      console.log('   ✅ Старый webhook удален');
    } else {
      console.log('   ⚠️  Ошибка при удалении:', deleteResult.description);
    }

    // 2. Установить новый webhook
    console.log('\n2️⃣ Установка нового webhook...');
    const setResult = await makeRequest(
      'POST',
      `/bot${BOT_TOKEN}/setWebhook`,
      { url: WEBHOOK_URL }
    );

    if (setResult.ok) {
      console.log('   ✅ Новый webhook установлен');
      console.log(`   URL: ${WEBHOOK_URL}`);
    } else {
      console.log('   ❌ Ошибка при установке:', setResult.description);
      return false;
    }

    // 3. Проверить webhook info
    console.log('\n3️⃣ Проверка webhook...');
    const infoResult = await makeRequest(
      'GET',
      `/bot${BOT_TOKEN}/getWebhookInfo`
    );

    if (infoResult.ok) {
      const webhook = infoResult.result;
      console.log('   ✅ Webhook информация:');
      console.log(`      URL: ${webhook.url}`);
      console.log(`      Pending updates: ${webhook.pending_update_count}`);
      console.log(`      Last error: ${webhook.last_error_message || 'Нет'}`);
    } else {
      console.log('   ❌ Ошибка получения информации');
      return false;
    }

    // 4. Проверить бота
    console.log('\n4️⃣ Проверка бота...');
    const botResult = await makeRequest(
      'GET',
      `/bot${BOT_TOKEN}/getMe`
    );

    if (botResult.ok) {
      const bot = botResult.result;
      console.log('   ✅ Бот активен:');
      console.log(`      @${bot.username}`);
      console.log(`      ${bot.first_name}`);
    } else {
      console.log('   ❌ Бот не отвечает');
      return false;
    }

    console.log('\n✅ Webhook успешно исправлен!\n');
    console.log('⟁ EGOIST ECOSYSTEM © 2026\n');
    return true;

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    return false;
  }
}

fixWebhook().then(success => {
  process.exit(success ? 0 : 1);
});
