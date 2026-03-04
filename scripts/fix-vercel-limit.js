#!/usr/bin/env node
// Исправление лимита Vercel Hobby (12 функций)
// Объединяем все API в один файл

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Исправление лимита Vercel Hobby\n');
console.log('Проблема: Vercel Hobby позволяет максимум 12 serverless функций');
console.log('Решение: Объединить все API endpoints в один файл\n');

// Подсчет текущих функций
const apiDir = './api';
let functionCount = 0;

function countFunctions(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      countFunctions(fullPath);
    } else if (file.endsWith('.js')) {
      functionCount++;
    }
  });
}

countFunctions(apiDir);

console.log(`📊 Текущее количество функций: ${functionCount}`);
console.log(`⚠️  Лимит Vercel Hobby: 12`);
console.log(`❌ Превышение: ${functionCount - 12}\n`);

console.log('🎯 План действий:\n');
console.log('1. Создать единый API endpoint: api/index.js');
console.log('2. Переместить всю логику в lib/');
console.log('3. Использовать роутинг внутри одной функции');
console.log('4. Удалить лишние API файлы\n');

console.log('✅ Для EGOIST ACADEMY нужны только:');
console.log('   - api/index.js (главный роутер)');
console.log('   - api/webhook.js (Telegram webhook)');
console.log('   - Все остальное - статические файлы\n');

console.log('📝 Выполните:');
console.log('   node scripts/optimize-api-for-hobby.js\n');
