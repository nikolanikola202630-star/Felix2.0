#!/usr/bin/env node
// Создание нового URL для обхода кэша Telegram

const fs = require('fs');

console.log('\n🔄 Создание нового URL для обхода кэша\n');

// 1. Копировать egoist.html в egoist-v2.html
console.log('1️⃣ Создание egoist-v2.html...');
fs.copyFileSync('miniapp/egoist.html', 'miniapp/egoist-v2.html');
console.log('   ✅ Файл создан\n');

// 2. Обновить .env
console.log('2️⃣ Обновление .env...');
const envContent = fs.readFileSync('.env', 'utf8');
const newEnv = envContent.replace(
  /MINIAPP_URL=.+egoist\.html/,
  'MINIAPP_URL=https://felix2-0.vercel.app/miniapp/egoist-v2.html'
);
fs.writeFileSync('.env', newEnv);
console.log('   ✅ .env обновлен\n');

// 3. Обновить bot.js
console.log('3️⃣ Обновление bot.js...');
const botContent = fs.readFileSync('bot.js', 'utf8');
const newBot = botContent.replace(
  /egoist\.html/g,
  'egoist-v2.html'
);
fs.writeFileSync('bot.js', newBot);
console.log('   ✅ bot.js обновлен\n');

// 4. Инструкции
console.log('4️⃣ Следующие шаги:\n');
console.log('   git add .');
console.log('   git commit -m "fix: новый URL egoist-v2.html для обхода кэша"');
console.log('   git push\n');
console.log('   # Перезапустить бота');
console.log('   # Ctrl+C в терминале с ботом');
console.log('   node bot.js\n');

console.log('✅ Новый URL создан: egoist-v2.html\n');
console.log('Этот URL не будет в кэше Telegram!\n');
