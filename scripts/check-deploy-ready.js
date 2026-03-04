#!/usr/bin/env node
// Скрипт для проверки готовности к деплою Felix Academy V12

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Проверки
const checks = {
  env: {
    name: 'Переменные окружения',
    required: [
      'TELEGRAM_BOT_TOKEN',
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'GROQ_API_KEY'
    ],
    optional: [
      'ADMIN_ID',
      'MINIAPP_URL',
      'NODE_ENV'
    ]
  },
  files: {
    name: 'Критические файлы',
    required: [
      'package.json',
      'vercel.json',
      'miniapp/app.html',
      'miniapp/core/router.js',
      'miniapp/core/api.js',
      'miniapp/core/state.js',
      'api/app-v12.js',
      'api/_router.js',
      'lib/middleware/telegram-init-data.js',
      'lib/middleware/error-handler.js',
      'database/FULL-SCHEMA-COMBINED.sql'
    ]
  },
  brandbook: {
    name: 'Брендбук',
    required: [
      'miniapp/styles/brandbook-variables.css',
      'miniapp/css/brandbook-components.css',
      'BRANDBOOK-V12.md'
    ]
  },
  docs: {
    name: 'Документация',
    required: [
      'README.md',
      'API-ENDPOINTS.md',
      'ИНСТРУКЦИЯ-ЗАГРУЗКА-КОНТЕНТА.md',
      'БЫСТРЫЙ-СТАРТ-V12.md',
      'ДЕПЛОЙ-V12-ФИНАЛ.md'
    ]
  }
};

// Результаты
let totalChecks = 0;
let passedChecks = 0;
let warnings = 0;

// Проверить переменные окружения
function checkEnv() {
  log('\n📋 Проверка переменных окружения...', 'cyan');
  
  let passed = 0;
  let failed = 0;

  // Обязательные
  checks.env.required.forEach(key => {
    totalChecks++;
    const value = process.env[key] || process.env[key.replace('TELEGRAM_', '')];
    
    if (value) {
      log(`  ✅ ${key}`, 'green');
      passed++;
      passedChecks++;
    } else {
      log(`  ❌ ${key} - НЕ НАЙДЕНА`, 'red');
      failed++;
    }
  });

  // Опциональные
  checks.env.optional.forEach(key => {
    const value = process.env[key];
    
    if (value) {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ⚠️  ${key} - не установлена (опционально)`, 'yellow');
      warnings++;
    }
  });

  return { passed, failed };
}

// Проверить файлы
function checkFiles() {
  log('\n📁 Проверка критических файлов...', 'cyan');
  
  let passed = 0;
  let failed = 0;

  checks.files.required.forEach(file => {
    totalChecks++;
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
      passedChecks++;
    } else {
      log(`  ❌ ${file} - НЕ НАЙДЕН`, 'red');
      failed++;
    }
  });

  return { passed, failed };
}

// Проверить брендбук
function checkBrandbook() {
  log('\n🎨 Проверка брендбука...', 'cyan');
  
  let passed = 0;
  let failed = 0;

  checks.brandbook.required.forEach(file => {
    totalChecks++;
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
      passedChecks++;
    } else {
      log(`  ❌ ${file} - НЕ НАЙДЕН`, 'red');
      failed++;
    }
  });

  return { passed, failed };
}

// Проверить документацию
function checkDocs() {
  log('\n📚 Проверка документации...', 'cyan');
  
  let passed = 0;
  let failed = 0;

  checks.docs.required.forEach(file => {
    totalChecks++;
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      log(`  ✅ ${file}`, 'green');
      passed++;
      passedChecks++;
    } else {
      log(`  ❌ ${file} - НЕ НАЙДЕН`, 'red');
      failed++;
    }
  });

  return { passed, failed };
}

// Проверить package.json
function checkPackageJson() {
  log('\n📦 Проверка package.json...', 'cyan');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Проверить зависимости
    const requiredDeps = [
      '@supabase/supabase-js',
      'dotenv',
      'groq-sdk'
    ];

    let allFound = true;
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`  ✅ ${dep}`, 'green');
      } else {
        log(`  ❌ ${dep} - не найдена`, 'red');
        allFound = false;
      }
    });

    // Проверить скрипты
    const requiredScripts = [
      'test:miniapp',
      'upload:courses'
    ];

    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`  ✅ npm run ${script}`, 'green');
      } else {
        log(`  ⚠️  npm run ${script} - не найден`, 'yellow');
        warnings++;
      }
    });

    return allFound;

  } catch (error) {
    log(`  ❌ Ошибка чтения package.json: ${error.message}`, 'red');
    return false;
  }
}

// Проверить vercel.json
function checkVercelJson() {
  log('\n⚡ Проверка vercel.json...', 'cyan');
  
  try {
    const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelJson.routes) {
      log(`  ✅ routes настроены`, 'green');
    } else {
      log(`  ❌ routes не найдены`, 'red');
      return false;
    }

    if (vercelJson.builds) {
      log(`  ✅ builds настроены`, 'green');
    } else {
      log(`  ⚠️  builds не найдены`, 'yellow');
      warnings++;
    }

    return true;

  } catch (error) {
    log(`  ❌ Ошибка чтения vercel.json: ${error.message}`, 'red');
    return false;
  }
}

// Главная функция
async function main() {
  log('\n🚀 Felix Academy V12 - Проверка готовности к деплою\n', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

  // Запустить все проверки
  const envResult = checkEnv();
  const filesResult = checkFiles();
  const brandResult = checkBrandbook();
  const docsResult = checkDocs();
  const packageOk = checkPackageJson();
  const vercelOk = checkVercelJson();

  // Итоги
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('\n📊 Результаты проверки:\n', 'cyan');

  const failedChecks = totalChecks - passedChecks;
  const percentage = Math.round((passedChecks / totalChecks) * 100);

  log(`✅ Пройдено: ${passedChecks}/${totalChecks} (${percentage}%)`, 'green');
  
  if (failedChecks > 0) {
    log(`❌ Провалено: ${failedChecks}`, 'red');
  }
  
  if (warnings > 0) {
    log(`⚠️  Предупреждений: ${warnings}`, 'yellow');
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

  // Рекомендации
  if (failedChecks === 0 && warnings === 0) {
    log('\n🎉 Отлично! Проект полностью готов к деплою!', 'green');
    log('\nСледующие шаги:', 'cyan');
    log('1. vercel --prod', 'cyan');
    log('2. node scripts/set-webhook-v12.js', 'cyan');
    log('3. npm run upload:courses', 'cyan');
  } else if (failedChecks === 0) {
    log('\n✅ Проект готов к деплою с предупреждениями', 'yellow');
    log('\nРекомендуется исправить предупреждения перед деплоем', 'yellow');
  } else {
    log('\n❌ Проект НЕ готов к деплою', 'red');
    log('\nИсправьте ошибки перед деплоем:', 'red');
    
    if (envResult.failed > 0) {
      log('\n1. Добавьте недостающие переменные окружения в .env.local', 'yellow');
    }
    
    if (filesResult.failed > 0) {
      log('2. Убедитесь, что все критические файлы на месте', 'yellow');
    }
    
    if (brandResult.failed > 0) {
      log('3. Проверьте файлы брендбука', 'yellow');
    }
    
    if (docsResult.failed > 0) {
      log('4. Создайте недостающую документацию', 'yellow');
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // Выход с кодом ошибки если есть проваленные проверки
  process.exit(failedChecks > 0 ? 1 : 0);
}

// Запуск
main();
