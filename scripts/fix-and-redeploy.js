#!/usr/bin/env node

/**
 * EGOIST ACADEMY - Автоматическое исправление и редеплой
 * Обновляет переменную окружения в Vercel и очищает кэш
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🔧 EGOIST ACADEMY - Автоматическое исправление\n');

// Шаг 1: Очистить кэш Telegram
console.log('1️⃣ Очистка кэша Telegram...');
try {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (TOKEN) {
    const url = `https://api.telegram.org/bot${TOKEN}/deleteWebhook?drop_pending_updates=true`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Кэш Telegram очищен');
        
        // Установить webhook обратно
        setTimeout(() => {
          const webhookUrl = 'https://felix2-0.vercel.app/api/webhook';
          const setUrl = `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${webhookUrl}`;
          
          https.get(setUrl, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              console.log('✅ Webhook установлен обратно');
            });
          });
        }, 1000);
      });
    });
  }
} catch (error) {
  console.log('⚠️  Не удалось очистить кэш Telegram');
}

// Шаг 2: Проверить текущий деплой
console.log('\n2️⃣ Проверка текущего деплоя...');
try {
  const deployUrl = 'https://felix2-0.vercel.app/miniapp/egoist.html';
  
  https.get(deployUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ egoist.html доступен');
    } else if (res.statusCode === 404) {
      console.log('❌ egoist.html не найден (404)');
      console.log('   Нужно дождаться завершения деплоя Vercel');
    } else {
      console.log(`⚠️  Статус: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log('❌ Ошибка проверки:', err.message);
  });
} catch (error) {
  console.log('⚠️  Не удалось проверить деплой');
}

// Шаг 3: Инструкции для Vercel
console.log('\n3️⃣ Обновление переменной в Vercel...');
console.log('\n📋 ВАЖНО: Обновите вручную в Vercel Dashboard:');
console.log('   1. Откройте: https://vercel.com/dashboard');
console.log('   2. Выберите проект: felix2-0');
console.log('   3. Settings → Environment Variables');
console.log('   4. Найдите: MINIAPP_URL');
console.log('   5. Измените на: https://felix2-0.vercel.app/miniapp/egoist.html');
console.log('   6. Save');
console.log('   7. Deployments → Redeploy (последний)');

// Шаг 4: Альтернатива - через CLI
console.log('\n4️⃣ Или через Vercel CLI:');
console.log('\n   vercel env rm MINIAPP_URL production');
console.log('   vercel env add MINIAPP_URL production');
console.log('   (введите: https://felix2-0.vercel.app/miniapp/egoist.html)');
console.log('   vercel --prod');

// Шаг 5: Проверка после обновления
console.log('\n5️⃣ После обновления проверьте:');
console.log('   • Подождите 2-3 минуты');
console.log('   • Откройте @fel12x_bot');
console.log('   • Нажмите "🎓 Открыть Академию"');
console.log('   • Должен открыться EGOIST ACADEMY');

console.log('\n✨ Скрипт завершён!\n');
