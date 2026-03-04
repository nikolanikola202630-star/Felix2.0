#!/usr/bin/env node

/**
 * EGOIST ACADEMY - Финальная очистка
 * Удаляет ВСЕ файлы не относящиеся к EGOIST ACADEMY
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 EGOIST ACADEMY - Финальная очистка проекта\n');

// Файлы для удаления (все старые версии Felix, дубликаты, неиспользуемые)
const filesToDelete = [
  // Старые HTML страницы (не EGOIST)
  'miniapp/app.html',
  'miniapp/catalog.html',
  'miniapp/course.html',
  'miniapp/lesson.html',
  'miniapp/my-courses.html',
  'miniapp/profile.html',
  'miniapp/community.html',
  'miniapp/settings.html',
  'miniapp/voice.html',
  'miniapp/ai-chat.html',
  'miniapp/search.html',
  'miniapp/achievements.html',
  'miniapp/analytics.html',
  'miniapp/admin-courses.html',
  
  // Старые JS (не EGOIST)
  'miniapp/js/app.js',
  'miniapp/js/catalog.js',
  'miniapp/js/community.js',
  'miniapp/js/settings.js',
  'miniapp/js/search.js',
  'miniapp/js/academy.js',
  'miniapp/js/voice.js',
  'miniapp/js/admin.js',
  'miniapp/js/admin-courses.js',
  'miniapp/js/partner-dashboard.js',
  'miniapp/js/course-editor.js',
  'miniapp/js/personalization.js',
  'miniapp/js/performance.js',
  'miniapp/js/lazy-load.js',
  
  // Старые CSS (не EGOIST)
  'miniapp/css/animations.css',
  'miniapp/css/micro-animations.css',
  'miniapp/css/enhanced-animations.css',
  'miniapp/css/admin.css',
  
  // Старые API (дубликаты)
  'api/courses.js',
  'api/miniapp.js',
  'api/learning.js',
  'api/voice.js',
  'api/community.js',
  'api/admin.js',
  'api/history.js',
  'api/export.js',
  'api/sync.js',
  
  // Старая документация (не EGOIST)
  'ПОЛНЫЙ-АНАЛИЗ-ПРОЕКТА-2026.md',
  'ГЛОБАЛЬНОЕ-ОБНОВЛЕНИЕ-V12.md',
  'ФИНАЛЬНОЕ-ОБНОВЛЕНИЕ-V12.md',
  'ГОТОВО-V12.md',
  'РУЧНОЙ-ДЕПЛОЙ.md',
  'БЫСТРОЕ-ОБНОВЛЕНИЕ-URL.md',
  'ФИНАЛЬНАЯ-ПРОВЕРКА-ДЕПЛОЙ.md',
  'EGOIST-ECOSYSTEM-БРЕНДИНГ.md',
  'ОПТИМИЗАЦИЯ-ЗАВЕРШЕНА.md',
  
  // Старые либы (неиспользуемые)
  'lib/learning/adaptive-learning.js',
  'lib/ml/personalization.js',
  
  // Старые скрипты
  'scripts/optimize-egoist-project.js',
  'scripts/auto-deploy.js',
  'scripts/auto-commit.js',
  'scripts/deploy-hooks.js',
  
  // Пустые папки
  'lib/automation/',
  'lib/sync/',
  'lib/learning/',
  'lib/ml/'
];

console.log('📝 Файлов для удаления:', filesToDelete.length);
console.log('\nУдаление...\n');

let deletedCount = 0;

filesToDelete.forEach(file => {
  try {
    const fullPath = path.join(process.cwd(), file);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Удалена папка: ${file}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Удалён: ${file}`);
      }
      deletedCount++;
    }
  } catch (error) {
    console.log(`⚠️  Ошибка: ${file}`);
  }
});

console.log(`\n✅ Удалено: ${deletedCount} файлов\n`);

// Создать список оставшихся файлов
console.log('📊 Создание списка оставшихся файлов...\n');

const remainingFiles = {
  frontend: [],
  backend: [],
  database: [],
  docs: [],
  scripts: [],
  lib: [],
  tests: []
};

function scanDir(dir, category) {
  try {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory() && !file.startsWith('.')) {
        scanDir(fullPath, category);
      } else if (stats.isFile()) {
        remainingFiles[category].push(fullPath.replace(process.cwd() + path.sep, ''));
      }
    });
  } catch (error) {
    // Игнорируем ошибки
  }
}

scanDir('miniapp', 'frontend');
scanDir('api', 'backend');
scanDir('database', 'database');
scanDir('lib', 'lib');
scanDir('scripts', 'scripts');
scanDir('tests', 'tests');

// Документы в корне
const rootDocs = fs.readdirSync('.').filter(f => 
  f.endsWith('.md') && !f.startsWith('.')
);
remainingFiles.docs = rootDocs;

// Сохранить отчёт
const report = `# 📊 EGOIST ACADEMY - Оставшиеся файлы

**Дата:** ${new Date().toLocaleDateString('ru-RU')}

## Статистика

- Frontend: ${remainingFiles.frontend.length} файлов
- Backend: ${remainingFiles.backend.length} файлов
- Database: ${remainingFiles.database.length} файлов
- Libraries: ${remainingFiles.lib.length} файлов
- Scripts: ${remainingFiles.scripts.length} файлов
- Tests: ${remainingFiles.tests.length} файлов
- Docs: ${remainingFiles.docs.length} файлов

**Всего:** ${Object.values(remainingFiles).flat().length} файлов

## Frontend (miniapp/)

${remainingFiles.frontend.map(f => `- ${f}`).join('\n')}

## Backend (api/)

${remainingFiles.backend.map(f => `- ${f}`).join('\n')}

## Database

${remainingFiles.database.map(f => `- ${f}`).join('\n')}

## Libraries (lib/)

${remainingFiles.lib.map(f => `- ${f}`).join('\n')}

## Scripts

${remainingFiles.scripts.map(f => `- ${f}`).join('\n')}

## Tests

${remainingFiles.tests.map(f => `- ${f}`).join('\n')}

## Documentation

${remainingFiles.docs.map(f => `- ${f}`).join('\n')}
`;

fs.writeFileSync('EGOIST-FILES-REPORT.md', report);

console.log('✅ Отчёт сохранён: EGOIST-FILES-REPORT.md\n');
console.log('🎉 Очистка завершена!\n');
console.log('📊 Осталось файлов:', Object.values(remainingFiles).flat().length);
console.log('\n✨ Проект готов для EGOIST ACADEMY!\n');
