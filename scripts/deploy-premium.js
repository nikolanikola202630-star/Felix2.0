#!/usr/bin/env node

/**
 * Felix Academy - Premium Deploy Script
 * Автоматический деплой премиум версии на Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Felix Academy - Premium Deploy');
console.log('================================\n');

// Проверка файлов
const requiredFiles = [
  'miniapp/index.html',
  'miniapp/catalog.html',
  'miniapp/css/flagship-premium.css',
  'miniapp/js/app.js',
  'api/_router.js',
  'vercel.json',
  'package.json'
];

console.log('📋 Проверка файлов...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.error('\n❌ Не все файлы найдены!');
  process.exit(1);
}

console.log('\n✅ Все файлы на месте\n');

// Git commit
console.log('📦 Создание коммита...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🎨 Premium UI Update - Flagship Design System"', { stdio: 'inherit' });
  console.log('✅ Коммит создан\n');
} catch (error) {
  console.log('ℹ️  Нет изменений для коммита\n');
}

// Git push
console.log('🔄 Отправка на GitHub...');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Отправлено на GitHub\n');
} catch (error) {
  console.error('❌ Ошибка при push:', error.message);
  process.exit(1);
}

// Vercel deploy
console.log('🚀 Деплой на Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('\n✅ Деплой завершен!\n');
} catch (error) {
  console.error('❌ Ошибка при деплое:', error.message);
  process.exit(1);
}

console.log('================================');
console.log('✨ Premium версия развернута!');
console.log('🌐 URL: https://felix2-0.vercel.app');
console.log('================================\n');
