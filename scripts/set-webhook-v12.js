#!/usr/bin/env node
// Скрипт для установки webhook для Felix Academy V12

require('dotenv').config();
const https = require('https');

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL || process.env.MINIAPP_URL?.replace('/miniapp/app.html', '');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Проверка переменных окружения
if (!BOT_TOKEN) {
  log('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения', 'red');
  log('Добавьте в .env.local:', 'yellow');
  log('TELEGRAM_BOT_TOKEN=your_bot_token_here', 'yellow');
  process.exit(1);
}

// Запросить URL если не указан
async function getWebhookUrl() {
  if (VERCEL_URL) {
    return `${VERCEL_URL}/api/webhook`;
  }

  // Интерактивный ввод
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('Введите URL вашего приложения (например, https://your-app.vercel.app): ', (url) => {
      readline.close();
      resolve(`${url}/api/webhook`);
    });
  });
}

// Установить webhook
async function setWebhook(webhookUrl) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query', 'inline_query', 'pre_checkout_query', 'shipping_query'],
      drop_pending_updates: true
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/setWebhook`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Получить информацию о webhook
async function getWebhookInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/getWebhookInfo`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Удалить webhook
async function deleteWebhook() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`,
      method: 'POST'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Главная функция
async function main() {
  log('\n🤖 Felix Academy V12 - Установка Webhook\n', 'cyan');

  try {
    // Получить текущий webhook
    log('📡 Проверка текущего webhook...', 'yellow');
    const currentInfo = await getWebhookInfo();

    if (currentInfo.ok && currentInfo.result.url) {
      log(`\n⚠️  Webhook уже установлен:`, 'yellow');
      log(`   URL: ${currentInfo.result.url}`, 'yellow');
      log(`   Pending updates: ${currentInfo.result.pending_update_count}`, 'yellow');
      
      // Спросить, удалить ли старый webhook
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        readline.question('\nУдалить старый webhook и установить новый? (y/n): ', (ans) => {
          readline.close();
          resolve(ans.toLowerCase());
        });
      });

      if (answer !== 'y' && answer !== 'yes' && answer !== 'д' && answer !== 'да') {
        log('\n❌ Отменено пользователем', 'red');
        process.exit(0);
      }

      // Удалить старый webhook
      log('\n🗑️  Удаление старого webhook...', 'yellow');
      await deleteWebhook();
      log('✅ Старый webhook удалён', 'green');
    }

    // Получить URL для webhook
    const webhookUrl = await getWebhookUrl();
    log(`\n🔗 URL webhook: ${webhookUrl}`, 'cyan');

    // Установить новый webhook
    log('\n⚙️  Установка webhook...', 'yellow');
    const result = await setWebhook(webhookUrl);

    if (result.ok) {
      log('\n✅ Webhook успешно установлен!', 'green');
      log(`   URL: ${webhookUrl}`, 'green');
      log(`   Description: ${result.description || 'Webhook was set'}`, 'green');

      // Проверить установку
      log('\n🔍 Проверка установки...', 'yellow');
      const info = await getWebhookInfo();

      if (info.ok) {
        log('\n📊 Информация о webhook:', 'cyan');
        log(`   URL: ${info.result.url}`, 'cyan');
        log(`   Has custom certificate: ${info.result.has_custom_certificate}`, 'cyan');
        log(`   Pending update count: ${info.result.pending_update_count}`, 'cyan');
        log(`   Max connections: ${info.result.max_connections || 40}`, 'cyan');
        
        if (info.result.last_error_date) {
          log(`   ⚠️  Last error: ${info.result.last_error_message}`, 'yellow');
          log(`   Last error date: ${new Date(info.result.last_error_date * 1000).toLocaleString()}`, 'yellow');
        }
      }

      log('\n🎉 Готово! Бот готов к работе.', 'green');
      log('\nТеперь вы можете:', 'cyan');
      log('1. Открыть бота в Telegram', 'cyan');
      log('2. Отправить команду /start', 'cyan');
      log('3. Нажать "Открыть приложение"', 'cyan');

    } else {
      log('\n❌ Ошибка при установке webhook:', 'red');
      log(`   ${result.description}`, 'red');
      process.exit(1);
    }

  } catch (error) {
    log('\n💥 Критическая ошибка:', 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запуск
main();
