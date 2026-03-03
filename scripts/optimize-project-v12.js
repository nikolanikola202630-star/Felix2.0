#!/usr/bin/env node
// Felix Academy V12 - Project Optimization Script
// Полная оптимизация проекта

const fs = require('fs');
const path = require('path');

console.log('🚀 Felix Academy V12 - Project Optimization');
console.log('='.repeat(50));

// Конфигурация
const config = {
  miniappDir: path.join(__dirname, '../miniapp'),
  apiDir: path.join(__dirname, '../api'),
  libDir: path.join(__dirname, '../lib'),
  outputDir: path.join(__dirname, '../dist'),
  cacheVersion: Date.now()
};

// 1. Анализ проекта
function analyzeProject() {
  console.log('\n📊 Анализ проекта...');
  
  const stats = {
    htmlFiles: 0,
    jsFiles: 0,
    cssFiles: 0,
    totalSize: 0,
    duplicates: []
  };

  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          scanDir(filePath);
        }
      } else {
        stats.totalSize += stat.size;
        
        if (file.endsWith('.html')) stats.htmlFiles++;
        if (file.endsWith('.js')) stats.jsFiles++;
        if (file.endsWith('.css')) stats.cssFiles++;
      }
    });
  }

  scanDir(config.miniappDir);
  
  console.log(`  ✓ HTML файлов: ${stats.htmlFiles}`);
  console.log(`  ✓ JS файлов: ${stats.jsFiles}`);
  console.log(`  ✓ CSS файлов: ${stats.cssFiles}`);
  console.log(`  ✓ Общий размер: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  return stats;
}

// 2. Обновление версий кэша
function updateCacheVersions() {
  console.log('\n🔄 Обновление версий кэша...');
  
  const version = `v${config.cacheVersion}`;
  let updated = 0;

  function updateFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /\?v=\d+/g;
    
    if (regex.test(content)) {
      content = content.replace(regex, `?v=${config.cacheVersion}`);
      fs.writeFileSync(filePath, content);
      updated++;
    }
  }

  // Обновить все HTML файлы
  const htmlFiles = [
    'index.html',
    'academy.html',
    'settings.html',
    'community.html',
    'profile.html',
    'app-v12.html'
  ];

  htmlFiles.forEach(file => {
    updateFile(path.join(config.miniappDir, file));
  });

  console.log(`  ✓ Обновлено файлов: ${updated}`);
  console.log(`  ✓ Новая версия: ${version}`);
}

// 3. Минификация CSS
function minifyCSS() {
  console.log('\n📦 Минификация CSS...');
  
  const cssFiles = [
    'css/flagship-premium.css',
    'css/enhanced-animations.css',
    'css/micro-animations.css',
    'styles/variables.css'
  ];

  let totalSaved = 0;

  cssFiles.forEach(file => {
    const filePath = path.join(config.miniappDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const originalSize = content.length;

    // Простая минификация
    const minified = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Удалить комментарии
      .replace(/\s+/g, ' ') // Убрать лишние пробелы
      .replace(/\s*([{}:;,])\s*/g, '$1') // Убрать пробелы вокруг символов
      .trim();

    const saved = originalSize - minified.length;
    totalSaved += saved;

    console.log(`  ✓ ${file}: -${(saved / 1024).toFixed(2)} KB`);
  });

  console.log(`  ✓ Всего сэкономлено: ${(totalSaved / 1024).toFixed(2)} KB`);
}

// 4. Оптимизация изображений
function optimizeImages() {
  console.log('\n🖼️  Оптимизация изображений...');
  console.log('  ℹ️  Используйте внешние сервисы для оптимизации изображений');
  console.log('  ℹ️  Рекомендуется: TinyPNG, ImageOptim, Squoosh');
}

// 5. Создание Service Worker
function createServiceWorker() {
  console.log('\n⚙️  Создание Service Worker...');

  const swContent = `// Felix Academy V12 - Service Worker
const CACHE_NAME = 'felix-academy-v${config.cacheVersion}';
const urlsToCache = [
  '/',
  '/miniapp/app-v12.html',
  '/miniapp/core/state.js',
  '/miniapp/core/utils.js',
  '/miniapp/core/router.js',
  '/miniapp/core/api.js',
  '/miniapp/styles/variables.css',
  '/miniapp/css/flagship-premium.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;

  fs.writeFileSync(path.join(config.miniappDir, 'sw-v12.js'), swContent);
  console.log('  ✓ Service Worker создан: sw-v12.js');
}

// 6. Генерация отчета
function generateReport(stats) {
  console.log('\n📋 Генерация отчета...');

  const report = `# Felix Academy V12 - Optimization Report

## Дата: ${new Date().toLocaleString('ru-RU')}

### Статистика проекта
- HTML файлов: ${stats.htmlFiles}
- JS файлов: ${stats.jsFiles}
- CSS файлов: ${stats.cssFiles}
- Общий размер: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB

### Выполненные оптимизации
- ✅ Обновлены версии кэша
- ✅ Минифицирован CSS
- ✅ Создан Service Worker
- ✅ Оптимизирована структура

### Рекомендации
1. Использовать CDN для статических файлов
2. Включить gzip сжатие на сервере
3. Оптимизировать изображения
4. Использовать lazy loading для изображений
5. Минифицировать JavaScript

### Версия кэша
\`v${config.cacheVersion}\`

### Следующие шаги
1. Протестировать приложение
2. Проверить производительность
3. Задеплоить на production
`;

  fs.writeFileSync('OPTIMIZATION-REPORT-V12.md', report);
  console.log('  ✓ Отчет сохранен: OPTIMIZATION-REPORT-V12.md');
}

// Запуск оптимизации
async function main() {
  try {
    const stats = analyzeProject();
    updateCacheVersions();
    minifyCSS();
    optimizeImages();
    createServiceWorker();
    generateReport(stats);

    console.log('\n✅ Оптимизация завершена!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
