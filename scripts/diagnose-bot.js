#!/usr/bin/env node

// Bot Diagnostics Script
// Проверяет все системы бота

const https = require('https');

const BOT_TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const API_URL = 'https://felix2-0.vercel.app';

console.log('🔍 Диагностика бота Felix Academy...\n');

// 1. Проверить webhook
async function checkWebhook() {
  console.log('1️⃣ Проверка webhook...');
  
  return new Promise((resolve) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const info = JSON.parse(data);
        
        if (info.ok) {
          const webhook = info.result;
          console.log(`   URL: ${webhook.url || 'НЕ УСТАНОВЛЕН'}`);
          console.log(`   Pending: ${webhook.pending_update_count || 0}`);
          console.log(`   Last Error: ${webhook.last_error_message || 'Нет'}`);
          console.log(`   Last Error Date: ${webhook.last_error_date ? new Date(webhook.last_error_date * 1000).toLocaleString() : 'Нет'}`);
          
          if (!webhook.url) {
            console.log('   ❌ Webhook не установлен!');
            resolve(false);
          } else if (webhook.last_error_message) {
            console.log('   ⚠️  Есть ошибки в webhook!');
            resolve(false);
          } else {
            console.log('   ✅ Webhook работает');
            resolve(true);
          }
        } else {
          console.log('   ❌ Ошибка получения webhook info');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Ошибка: ${err.message}`);
      resolve(false);
    });
  });
}

// 2. Проверить API
async function checkAPI() {
  console.log('\n2️⃣ Проверка API...');
  
  return new Promise((resolve) => {
    https.get(`${API_URL}/api/health/database`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   Status: ${result.status || 'unknown'}`);
          console.log(`   Database: ${result.database || 'unknown'}`);
          
          if (result.status === 'ok') {
            console.log('   ✅ API работает');
            resolve(true);
          } else {
            console.log('   ❌ API не работает');
            resolve(false);
          }
        } catch (err) {
          console.log(`   ❌ Ошибка парсинга: ${err.message}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Ошибка: ${err.message}`);
      resolve(false);
    });
  });
}

// 3. Проверить webhook endpoint
async function checkWebhookEndpoint() {
  console.log('\n3️⃣ Проверка webhook endpoint...');
  
  return new Promise((resolve) => {
    https.get(`${API_URL}/api/webhook`, (res) => {
      console.log(`   Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('   ✅ Webhook endpoint доступен');
        resolve(true);
      } else {
        console.log('   ❌ Webhook endpoint не работает');
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ Ошибка: ${err.message}`);
      resolve(false);
    });
  });
}

// 4. Проверить бота
async function checkBot() {
  console.log('\n4️⃣ Проверка бота...');
  
  return new Promise((resolve) => {
    https.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const info = JSON.parse(data);
        
        if (info.ok) {
          const bot = info.result;
          console.log(`   Username: @${bot.username}`);
          console.log(`   Name: ${bot.first_name}`);
          console.log(`   ID: ${bot.id}`);
          console.log('   ✅ Бот активен');
          resolve(true);
        } else {
          console.log('   ❌ Бот не отвечает');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Ошибка: ${err.message}`);
      resolve(false);
    });
  });
}

// Главная функция
async function main() {
  const results = {
    webhook: await checkWebhook(),
    api: await checkAPI(),
    webhookEndpoint: await checkWebhookEndpoint(),
    bot: await checkBot()
  };

  console.log('\n📊 Результаты диагностики:');
  console.log('─'.repeat(40));
  console.log(`Webhook:          ${results.webhook ? '✅' : '❌'}`);
  console.log(`API:              ${results.api ? '✅' : '❌'}`);
  console.log(`Webhook Endpoint: ${results.webhookEndpoint ? '✅' : '❌'}`);
  console.log(`Bot:              ${results.bot ? '✅' : '❌'}`);
  console.log('─'.repeat(40));

  const allOk = Object.values(results).every(r => r);

  if (allOk) {
    console.log('\n✅ Все системы работают нормально!');
  } else {
    console.log('\n❌ Обнаружены проблемы!');
    console.log('\n🔧 Рекомендации:');
    
    if (!results.webhook) {
      console.log('   1. Переустановить webhook:');
      console.log('      node scripts/setup-webhook-production.js');
    }
    
    if (!results.api) {
      console.log('   2. Проверить логи Vercel');
      console.log('   3. Проверить переменные окружения');
    }
    
    if (!results.webhookEndpoint) {
      console.log('   4. Проверить роутинг в api/_router.js');
    }
    
    if (!results.bot) {
      console.log('   5. Проверить BOT_TOKEN');
    }
  }

  console.log('\n⟁ EGOIST ECOSYSTEM © 2026\n');
}

main().catch(console.error);
