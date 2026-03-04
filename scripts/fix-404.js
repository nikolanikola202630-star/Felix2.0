#!/usr/bin/env node

/**
 * Исправление 404 ошибки - автоматическое решение
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Исправление 404 ошибки...\n');

// 1. Проверить, что файлы существуют
console.log('1️⃣ Проверка файлов...');
const files = [
  'miniapp/egoist.html',
  'miniapp/egoist-catalog.html',
  'miniapp/egoist-course.html',
  'miniapp/egoist-lesson.html',
  'miniapp/css/egoist-theme.css',
  'miniapp/js/egoist-app.js'
];

let allExist = true;
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - НЕ НАЙДЕН!`);
    allExist = false;
  }
});

if (!allExist) {
  console.log('\n❌ Некоторые файлы отсутствуют!');
  process.exit(1);
}

// 2. Создать vercel.json для правильной маршрутизации
console.log('\n2️⃣ Создание vercel.json...');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/miniapp/(.*)",
      "dest": "/miniapp/$1"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/miniapp/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('   ✅ vercel.json создан');

// 3. Обновить .env
console.log('\n3️⃣ Обновление .env...');
let envContent = fs.readFileSync('.env', 'utf8');
if (!envContent.includes('MINIAPP_URL=https://felix2-0.vercel.app/miniapp/egoist.html')) {
  envContent = envContent.replace(
    /MINIAPP_URL=.*/,
    'MINIAPP_URL=https://felix2-0.vercel.app/miniapp/egoist.html'
  );
  fs.writeFileSync('.env', envContent);
  console.log('   ✅ .env обновлён');
} else {
  console.log('   ✅ .env уже правильный');
}

// 4. Git commit и push
console.log('\n4️⃣ Git commit и push...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: исправление 404, добавлен vercel.json"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('   ✅ Push выполнен');
} catch (error) {
  console.log('   ⚠️  Git push: возможно нет изменений');
}

console.log('\n✅ Исправление завершено!');
console.log('\n📝 Следующие шаги:');
console.log('   1. Подождите 2-3 минуты (Vercel деплоит)');
console.log('   2. Очистите кэш Telegram: node scripts/clear-telegram-cache.js');
console.log('   3. Проверьте: https://felix2-0.vercel.app/miniapp/egoist.html');
console.log('   4. Откройте бота и проверьте\n');
