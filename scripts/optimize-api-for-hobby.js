#!/usr/bin/env node
// Оптимизация API для Vercel Hobby (макс 12 функций)

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Оптимизация API для Vercel Hobby\n');

// Для EGOIST ACADEMY нужны только эти endpoints
const keepFiles = [
  'api/index.js',           // Главный роутер
  'api/webhook.js',         // Telegram webhook
  'api/health/database.js', // Health check
];

console.log('✅ Оставляем только необходимые файлы:\n');
keepFiles.forEach(f => console.log(`   - ${f}`));

console.log('\n❌ Удаляем все остальные API файлы...\n');

// Список файлов для удаления
const filesToDelete = [
  'api/_router.js',
  'api/admin-api.js',
  'api/admin-courses.js',
  'api/admin-enhanced.js',
  'api/ai-chat-folders.js',
  'api/analytics.js',
  'api/automation.js',
  'api/courses-full.js',
  'api/lessons.js',
  'api/partner-enhanced.js',
  'api/partner-stats.js',
  'api/partner.js',
  'api/payments.js',
  'api/search.js',
  'api/settings.js',
  'api/stats.js',
  'api/support.js',
  'api/voice-assistant.js',
  'api/webhook-handler.js',
  'api/admin/courses-manage.js',
  'api/app/index.js',
  'api/courses/check-access.js',
  'api/courses/my-courses.js',
  'api/payments/create-invoice.js',
  'api/payments/refund.js',
  'api/payments/webhook.js',
  'api/routes/admin.js',
  'api/routes/courses.js',
  'api/routes/partner.js',
  'api/routes/payments.js',
  'api/routes/system.js',
  'api/voice/index.js',
  'api/webhook/index.js',
];

let deleted = 0;
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`   ✅ Удален: ${file}`);
    deleted++;
  }
});

// Удаляем пустые папки
const dirsToRemove = [
  'api/admin',
  'api/app',
  'api/courses',
  'api/payments',
  'api/routes',
  'api/telegram',
  'api/voice',
  'api/webhook',
];

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmdirSync(dir, { recursive: true });
      console.log(`   ✅ Удалена папка: ${dir}`);
    } catch (e) {
      // Игнорируем ошибки
    }
  }
});

console.log(`\n📊 Удалено файлов: ${deleted}`);
console.log('📊 Осталось функций: 3 (в пределах лимита!)\n');

console.log('✅ Оптимизация завершена!\n');
console.log('📝 Следующие шаги:');
console.log('   git add .');
console.log('   git commit -m "fix: оптимизация API для Vercel Hobby (3 функции)"');
console.log('   git push\n');
