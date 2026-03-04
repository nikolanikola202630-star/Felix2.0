#!/usr/bin/env node
// Быстрая диагностика бота Felix Academy V12

require('dotenv').config();
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  log('❌ TELEGRAM_BOT_TOKEN не найден!', 'red');
  log('Добавьте в .env.local:', 'yellow');
  log('TELEGRAM_BOT_TOKEN=your_token_here', 'yellow');
  process.exit(1);
}

// Проверка бота
async function checkBot() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Проверка webhook
async function checkWebhook() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Удалить webhook
async function deleteWebhook() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Получить обновления
async function getUpdates() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=5`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  log('\n🔍 Диагностика бота Felix Academy V12\n', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    // 1. Проверка токена
    log('\n1️⃣ Проверка токена бота...', 'yellow');
    const botInfo = await checkBot();
    
    if (botInfo.ok) {
      log(`✅ Бот найден: @${botInfo.result.username}`, 'green');
      log(`   ID: ${botInfo.result.id}`, 'green');
      log(`   Имя: ${botInfo.result.first_name}`, 'green');
    } else {
      log('❌ Неверный токен бота!', 'red');
      process.exit(1);
    }

    // 2. Проверка webhook
    log('\n2️⃣ Проверка webhook...', 'yellow');
    const webhookInfo = await checkWebhook();
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      
      if (info.url) {
        log(`✅ Webhook установлен: ${info.url}`, 'green');
        log(`   Pending updates: ${info.pending_update_count}`, info.pending_update_count > 0 ? 'yellow' : 'green');
        
        if (info.last_error_date) {
          log(`   ⚠️ Последняя ошибка:`, 'red');
          log(`      ${info.last_error_message}`, 'red');
          log(`      ${new Date(info.last_error_date * 1000).toLocaleString()}`, 'red');
        }
        
        if (info.last_synchronization_error_date) {
          log(`   ⚠️ Ошибка синхронизации:`, 'red');
          log(`      ${new Date(info.last_synchronization_error_date * 1000).toLocaleString()}`, 'red');
        }
      } else {
        log('⚠️ Webhook НЕ установлен!', 'yellow');
        log('   Бот работает в режиме polling (для локальной разработки)', 'yellow');
      }
    }

    // 3. Проверка обновлений
    log('\n3️⃣ Проверка последних сообщений...', 'yellow');
    const updates = await getUpdates();
    
    if (updates.ok && updates.result.length > 0) {
      log(`✅ Найдено ${updates.result.length} сообщений:`, 'green');
      updates.result.slice(0, 3).forEach((update, i) => {
        const msg = update.message || update.callback_query?.message;
        if (msg) {
          log(`   ${i + 1}. От: ${msg.from?.first_name || 'Unknown'}`, 'cyan');
          log(`      Текст: ${msg.text || update.callback_query?.data || 'N/A'}`, 'cyan');
        }
      });
    } else {
      log('⚠️ Нет новых сообщений', 'yellow');
    }

    // 4. Диагноз
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('\n📋 ДИАГНОЗ:\n', 'cyan');

    if (!webhookInfo.result.url) {
      log('❌ ПРОБЛЕМА: Webhook не установлен!', 'red');
      log('\n🔧 РЕШЕНИЕ:', 'yellow');
      log('1. Задеплойте приложение на Vercel:', 'yellow');
      log('   vercel --prod', 'yellow');
      log('\n2. Установите webhook:', 'yellow');
      log('   npm run webhook:set', 'yellow');
      log('   или', 'yellow');
      log('   node scripts/set-webhook-v12.js', 'yellow');
      
    } else if (webhookInfo.result.last_error_message) {
      log('❌ ПРОБЛЕМА: Ошибки при доставке сообщений!', 'red');
      log(`   ${webhookInfo.result.last_error_message}`, 'red');
      log('\n🔧 РЕШЕНИЕ:', 'yellow');
      log('1. Проверьте логи Vercel:', 'yellow');
      log('   vercel logs', 'yellow');
      log('\n2. Проверьте, что endpoint работает:', 'yellow');
      log(`   curl ${webhookInfo.result.url}`, 'yellow');
      log('\n3. Переустановите webhook:', 'yellow');
      log('   npm run webhook:set', 'yellow');
      
    } else if (webhookInfo.result.pending_update_count > 10) {
      log('⚠️ ПРОБЛЕМА: Много необработанных сообщений!', 'yellow');
      log('\n🔧 РЕШЕНИЕ:', 'yellow');
      log('1. Удалите старые сообщения и переустановите webhook:', 'yellow');
      log('   npm run webhook:set', 'yellow');
      
    } else {
      log('✅ Всё в порядке! Бот должен работать.', 'green');
      log('\n📝 Если бот всё равно не отвечает:', 'yellow');
      log('1. Отправьте /start боту в Telegram', 'yellow');
      log('2. Проверьте логи: vercel logs', 'yellow');
      log('3. Проверьте переменные окружения в Vercel', 'yellow');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    // Предложить действия
    if (!webhookInfo.result.url || webhookInfo.result.last_error_message) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        readline.question('Хотите переключиться на polling для локального тестирования? (y/n): ', (ans) => {
          readline.close();
          resolve(ans.toLowerCase());
        });
      });

      if (answer === 'y' || answer === 'yes' || answer === 'д' || answer === 'да') {
        log('\n🔄 Удаление webhook и переключение на polling...', 'yellow');
        await deleteWebhook();
        log('✅ Webhook удалён!', 'green');
        log('\nТеперь запустите бота локально:', 'cyan');
        log('node bot-local-polling.js', 'cyan');
      }
    }

  } catch (error) {
    log(`\n💥 Ошибка: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
