#!/usr/bin/env node
// Полный анализ проблемы 404

require('dotenv').config();

const BASE_URL = 'https://felix2-0.vercel.app';
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function fullAnalysis() {
  console.log('\n🔍 ПОЛНЫЙ АНАЛИЗ ПРОБЛЕМЫ 404\n');
  console.log('='.repeat(60) + '\n');
  
  // 1. Проверка файлов на Vercel
  console.log('1️⃣ ПРОВЕРКА ФАЙЛОВ НА VERCEL\n');
  
  const files = [
    '/miniapp/egoist.html',
    '/miniapp/academy.html',
    '/miniapp/index.html',
    '/miniapp/app.html',
  ];
  
  for (const file of files) {
    try {
      const response = await fetch(BASE_URL + file);
      const status = response.status;
      
      if (status === 200) {
        const text = await response.text();
        const hasContent = text.includes('EGOIST') || text.includes('academy');
        console.log(`✅ ${file} - ${status} ${hasContent ? '(содержит контент)' : '(пустой?)'}`);
      } else {
        console.log(`❌ ${file} - ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${file} - ERROR: ${error.message}`);
    }
  }
  
  // 2. Проверка бота
  console.log('\n2️⃣ ПРОВЕРКА БОТА\n');
  
  try {
    const botInfo = await fetch(`${TELEGRAM_API}/getMe`);
    const botData = await botInfo.json();
    
    if (botData.ok) {
      console.log(`✅ Бот активен: @${botData.result.username}`);
    }
    
    const webhookInfo = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const webhookData = await webhookInfo.json();
    
    if (webhookData.ok) {
      const info = webhookData.result;
      console.log(`📡 Webhook: ${info.url || 'НЕ УСТАНОВЛЕН'}`);
      
      if (info.last_error_message) {
        console.log(`⚠️  Последняя ошибка: ${info.last_error_message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Ошибка проверки бота: ${error.message}`);
  }
  
  // 3. Проверка локальных файлов
  console.log('\n3️⃣ ПРОВЕРКА ЛОКАЛЬНЫХ ФАЙЛОВ\n');
  
  const fs = require('fs');
  const localFiles = [
    'miniapp/egoist.html',
    'miniapp/academy.html',
    'bot.js',
    '.env',
  ];
  
  for (const file of localFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
      console.log(`❌ ${file} - НЕ НАЙДЕН`);
    }
  }
  
  // 4. Проверка .env
  console.log('\n4️⃣ ПРОВЕРКА КОНФИГУРАЦИИ\n');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const miniappUrl = envContent.match(/MINIAPP_URL=(.+)/)?.[1]?.trim();
  console.log(`MINIAPP_URL: ${miniappUrl}`);
  
  // 5. Проверка bot.js
  const botContent = fs.readFileSync('bot.js', 'utf8');
  const botUrl = botContent.match(/MINIAPP_URL.*=.*'([^']+)'/)?.[1];
  console.log(`bot.js URL: ${botUrl}`);
  
  // 6. Диагноз
  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 ДИАГНОЗ\n');
  
  // Проверяем что именно не работает
  const academyWorks = await fetch(BASE_URL + '/miniapp/academy.html').then(r => r.status === 200);
  const egoistWorks = await fetch(BASE_URL + '/miniapp/egoist.html').then(r => r.status === 200);
  
  if (academyWorks && egoistWorks) {
    console.log('✅ Файлы доступны на Vercel');
    console.log('⚠️  Проблема: Кэш Telegram');
    console.log('');
    console.log('РЕШЕНИЕ:');
    console.log('1. Используйте Telegram Web: https://web.telegram.org');
    console.log('2. Или очистите кэш приложения');
    console.log('3. Или подождите 24 часа для автоочистки кэша');
  } else if (!academyWorks && !egoistWorks) {
    console.log('❌ Файлы недоступны на Vercel');
    console.log('⚠️  Проблема: Деплой не завершен или ошибка');
    console.log('');
    console.log('РЕШЕНИЕ:');
    console.log('1. Проверьте Vercel Dashboard');
    console.log('2. Сделайте ручной Redeploy');
    console.log('3. Проверьте логи деплоя');
  } else {
    console.log('⚠️  Частичная проблема');
    console.log(`academy.html: ${academyWorks ? '✅' : '❌'}`);
    console.log(`egoist.html: ${egoistWorks ? '✅' : '❌'}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

fullAnalysis().catch(error => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});
