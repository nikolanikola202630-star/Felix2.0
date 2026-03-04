#!/usr/bin/env node
// Детальная диагностика 404

require('dotenv').config();

const BASE_URL = 'https://felix2-0.vercel.app';

async function diagnose() {
  console.log('\n🔍 Детальная диагностика 404\n');
  
  const urls = [
    '/miniapp/egoist.html',
    '/miniapp/index.html',
    '/miniapp/app.html',
    '/miniapp/css/egoist-theme.css',
    '/miniapp/js/egoist-app.js',
    '/data/egoist-courses.json',
    '/api/health/database',
  ];
  
  for (const url of urls) {
    try {
      const fullUrl = BASE_URL + url;
      const response = await fetch(fullUrl);
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200) {
        console.log(`✅ ${url} - ${status} ${statusText}`);
      } else if (status === 404) {
        console.log(`❌ ${url} - ${status} ${statusText}`);
      } else {
        console.log(`⚠️  ${url} - ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - ERROR: ${error.message}`);
    }
  }
  
  console.log('\n📱 Проверка бота...\n');
  
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (TOKEN) {
    const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
    
    try {
      const response = await fetch(`${TELEGRAM_API}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        console.log(`✅ Бот: @${data.result.username}`);
        console.log(`   ID: ${data.result.id}`);
        console.log(`   Имя: ${data.result.first_name}`);
      }
    } catch (error) {
      console.log(`❌ Ошибка проверки бота: ${error.message}`);
    }
    
    try {
      const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
      const data = await response.json();
      
      if (data.ok) {
        const info = data.result;
        console.log(`\n📡 Webhook:`);
        console.log(`   URL: ${info.url || 'не установлен'}`);
        console.log(`   Pending: ${info.pending_update_count || 0}`);
        if (info.last_error_message) {
          console.log(`   ⚠️  Ошибка: ${info.last_error_message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Ошибка проверки webhook: ${error.message}`);
    }
  }
  
  console.log('\n💡 Рекомендации:\n');
  
  console.log('1. Если egoist.html показывает 404:');
  console.log('   - Проверьте Vercel Dashboard');
  console.log('   - Убедитесь, что файл задеплоен');
  console.log('   - Попробуйте ручной редеплой\n');
  
  console.log('2. Если egoist.html показывает 200, но бот открывает 404:');
  console.log('   - Проблема в кэше Telegram');
  console.log('   - Очистите кэш: node scripts/clear-telegram-cache.js');
  console.log('   - Подождите 5-10 минут\n');
  
  console.log('3. Если бот открывает старую версию (app.html):');
  console.log('   - Проверьте переменную MINIAPP_URL в Vercel');
  console.log('   - Должно быть: .../miniapp/egoist.html');
  console.log('   - Сделайте Redeploy после изменения\n');
}

diagnose().catch(error => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});
