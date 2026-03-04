#!/usr/bin/env node
// Принудительный редеплой с обновлением всех настроек

require('dotenv').config();
const fs = require('fs');

async function forceRedeploy() {
  console.log('\n🚀 Принудительный редеплой EGOIST ACADEMY\n');
  
  // 1. Проверка локальных файлов
  console.log('1️⃣ Проверка локальных файлов...');
  const files = [
    'miniapp/egoist.html',
    'miniapp/css/egoist-theme.css',
    'miniapp/js/egoist-app.js',
    'bot.js',
    '.env',
    'vercel.json'
  ];
  
  let allFilesExist = true;
  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - НЕ НАЙДЕН!`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    console.log('\n❌ Не все файлы найдены! Остановка.\n');
    process.exit(1);
  }
  
  // 2. Проверка .env
  console.log('\n2️⃣ Проверка .env...');
  const envContent = fs.readFileSync('.env', 'utf8');
  const miniappUrlMatch = envContent.match(/MINIAPP_URL=(.+)/);
  
  if (miniappUrlMatch) {
    const url = miniappUrlMatch[1].trim();
    console.log(`   Текущий URL: ${url}`);
    
    if (url.includes('egoist.html')) {
      console.log('   ✅ URL правильный');
    } else {
      console.log('   ⚠️  URL не содержит egoist.html');
      console.log('   Обновляю...');
      
      const newEnv = envContent.replace(
        /MINIAPP_URL=.+/,
        'MINIAPP_URL=https://felix2-0.vercel.app/miniapp/egoist.html'
      );
      fs.writeFileSync('.env', newEnv);
      console.log('   ✅ .env обновлен');
    }
  } else {
    console.log('   ❌ MINIAPP_URL не найден в .env');
  }
  
  // 3. Проверка bot.js
  console.log('\n3️⃣ Проверка bot.js...');
  const botContent = fs.readFileSync('bot.js', 'utf8');
  
  if (botContent.includes('egoist.html')) {
    console.log('   ✅ bot.js содержит egoist.html');
  } else {
    console.log('   ⚠️  bot.js не содержит egoist.html');
  }
  
  // 4. Создать файл-триггер для редеплоя
  console.log('\n4️⃣ Создание триггера редеплоя...');
  const timestamp = new Date().toISOString();
  const triggerContent = `# Redeploy Trigger
Дата: ${timestamp}
Версия: EGOIST ACADEMY
URL: https://felix2-0.vercel.app/miniapp/egoist.html

Этот файл создан для принудительного редеплоя.
`;
  
  fs.writeFileSync('.vercel-redeploy', triggerContent);
  console.log('   ✅ Триггер создан');
  
  // 5. Инструкции
  console.log('\n5️⃣ Следующие шаги:\n');
  console.log('📋 АВТОМАТИЧЕСКИ (рекомендуется):');
  console.log('   git add .');
  console.log('   git commit -m "fix: принудительный редеплой EGOIST ACADEMY"');
  console.log('   git push');
  console.log('');
  console.log('⏱️  Подождите 2-3 минуты для деплоя\n');
  
  console.log('📋 ВРУЧНУЮ (если автоматически не работает):');
  console.log('   1. Откройте: https://vercel.com/dashboard');
  console.log('   2. Выберите проект: felix2-0');
  console.log('   3. Settings → Environment Variables');
  console.log('   4. Найдите: MINIAPP_URL');
  console.log('   5. Измените на: https://felix2-0.vercel.app/miniapp/egoist.html');
  console.log('   6. Save');
  console.log('   7. Deployments → Latest → ... → Redeploy');
  console.log('');
  
  console.log('📱 После деплоя:');
  console.log('   1. Подождите 5 минут');
  console.log('   2. Откройте бота: @fel12x_bot');
  console.log('   3. Отправьте: /start');
  console.log('   4. Если все еще 404 - очистите кэш Telegram\n');
  
  console.log('✅ Готово!\n');
}

forceRedeploy().catch(error => {
  console.error('\n❌ Ошибка:', error);
  process.exit(1);
});
