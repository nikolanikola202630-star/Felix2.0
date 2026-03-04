#!/usr/bin/env node

/**
 * Felix Academy V12 - Brandbook Integration Script
 * 
 * Этот скрипт автоматически интегрирует брендбук в проект:
 * 1. Создаёт резервные копии старых файлов
 * 2. Заменяет старые файлы новыми с брендбуком
 * 3. Обновляет ссылки в навигации
 * 4. Генерирует отчёт об изменениях
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const config = {
  backupDir: 'miniapp/backup-pre-brandbook',
  filesToReplace: [
    {
      old: 'miniapp/elite.html',
      new: 'miniapp/elite-brandbook.html',
      description: 'Главная страница'
    },
    {
      old: 'miniapp/catalog.html',
      new: 'miniapp/catalog-brandbook.html',
      description: 'Каталог курсов'
    },
    {
      old: 'miniapp/profile.html',
      new: 'miniapp/profile-brandbook.html',
      description: 'Профиль пользователя'
    },
    {
      old: 'miniapp/partner-dashboard.html',
      new: 'miniapp/partner-dashboard-brandbook.html',
      description: 'Партнёрская панель'
    },
    {
      old: 'miniapp/voice-assistant.html',
      new: 'miniapp/voice-assistant-brandbook.html',
      description: 'Голосовой помощник'
    }
  ],
  linksToUpdate: [
    {
      file: 'miniapp/index.html',
      replacements: [
        { from: 'elite.html', to: 'elite-brandbook.html' },
        { from: 'catalog.html', to: 'catalog-brandbook.html' },
        { from: 'profile.html', to: 'profile-brandbook.html' }
      ]
    }
  ]
};

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Логирование
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Создание резервных копий
function createBackups() {
  logStep('1/4', 'Создание резервных копий...');

  // Создать директорию для бэкапов
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    logSuccess(`Создана директория: ${config.backupDir}`);
  }

  // Копировать файлы
  let backedUp = 0;
  config.filesToReplace.forEach(({ old, description }) => {
    if (fs.existsSync(old)) {
      const backupPath = path.join(config.backupDir, path.basename(old));
      fs.copyFileSync(old, backupPath);
      logSuccess(`${description}: ${old} → ${backupPath}`);
      backedUp++;
    } else {
      logWarning(`Файл не найден: ${old}`);
    }
  });

  log(`\nСоздано резервных копий: ${backedUp}/${config.filesToReplace.length}`, 'bright');
}

// Замена файлов
function replaceFiles() {
  logStep('2/4', 'Замена файлов...');

  let replaced = 0;
  config.filesToReplace.forEach(({ old, new: newFile, description }) => {
    if (fs.existsSync(newFile)) {
      // Удалить старый файл
      if (fs.existsSync(old)) {
        fs.unlinkSync(old);
      }

      // Скопировать новый файл на место старого
      fs.copyFileSync(newFile, old);
      logSuccess(`${description}: ${newFile} → ${old}`);
      replaced++;
    } else {
      logWarning(`Новый файл не найден: ${newFile}`);
    }
  });

  log(`\nЗаменено файлов: ${replaced}/${config.filesToReplace.length}`, 'bright');
}

// Обновление ссылок
function updateLinks() {
  logStep('3/4', 'Обновление ссылок...');

  let updated = 0;
  config.linksToUpdate.forEach(({ file, replacements }) => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;

      replacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from, 'g'), to);
          changed = true;
          logSuccess(`${file}: ${from} → ${to}`);
        }
      });

      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        updated++;
      }
    } else {
      logWarning(`Файл не найден: ${file}`);
    }
  });

  log(`\nОбновлено файлов: ${updated}/${config.linksToUpdate.length}`, 'bright');
}

// Генерация отчёта
function generateReport() {
  logStep('4/4', 'Генерация отчёта...');

  const report = {
    timestamp: new Date().toISOString(),
    backupDir: config.backupDir,
    replacedFiles: config.filesToReplace.map(({ old, new: newFile, description }) => ({
      description,
      old,
      new: newFile,
      exists: fs.existsSync(old)
    })),
    updatedLinks: config.linksToUpdate.map(({ file, replacements }) => ({
      file,
      replacements,
      exists: fs.existsSync(file)
    }))
  };

  const reportPath = 'BRANDBOOK-INTEGRATION-REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  logSuccess(`Отчёт сохранён: ${reportPath}`);

  // Вывести краткую статистику
  log('\n' + '='.repeat(60), 'bright');
  log('СТАТИСТИКА ИНТЕГРАЦИИ', 'bright');
  log('='.repeat(60), 'bright');
  log(`Дата: ${new Date().toLocaleString('ru-RU')}`, 'blue');
  log(`Резервные копии: ${config.backupDir}`, 'blue');
  log(`Заменено файлов: ${report.replacedFiles.filter(f => f.exists).length}`, 'green');
  log(`Обновлено ссылок: ${report.updatedLinks.filter(l => l.exists).length}`, 'green');
  log('='.repeat(60), 'bright');
}

// Проверка перед запуском
function preflightCheck() {
  log('\n' + '='.repeat(60), 'bright');
  log('ИНТЕГРАЦИЯ БРЕНДБУКА FELIX ACADEMY V12', 'bright');
  log('='.repeat(60), 'bright');
  log('Old Money. Cold Mind. High Society.', 'yellow');
  log('='.repeat(60) + '\n', 'bright');

  logStep('0/4', 'Проверка готовности...');

  // Проверить наличие новых файлов
  let allFilesExist = true;
  config.filesToReplace.forEach(({ new: newFile, description }) => {
    if (!fs.existsSync(newFile)) {
      logError(`Отсутствует файл: ${newFile} (${description})`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    logError('\nНе все файлы с брендбуком найдены. Интеграция прервана.');
    process.exit(1);
  }

  logSuccess('Все файлы найдены. Готов к интеграции.\n');
}

// Подтверждение
function confirmIntegration() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Продолжить интеграцию? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Главная функция
async function main() {
  try {
    preflightCheck();

    // Запросить подтверждение
    const confirmed = await confirmIntegration();
    if (!confirmed) {
      log('\nИнтеграция отменена пользователем.', 'yellow');
      process.exit(0);
    }

    log('');

    // Выполнить интеграцию
    createBackups();
    replaceFiles();
    updateLinks();
    generateReport();

    // Финальное сообщение
    log('\n' + '='.repeat(60), 'bright');
    log('✅ ИНТЕГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО', 'green');
    log('='.repeat(60), 'bright');
    log('\nСледующие шаги:', 'blue');
    log('1. Проверьте работу сайта в браузере', 'reset');
    log('2. Протестируйте на мобильных устройствах', 'reset');
    log('3. Проверьте все ссылки и навигацию', 'reset');
    log('4. При необходимости восстановите из бэкапа:', 'reset');
    log(`   ${config.backupDir}`, 'yellow');
    log('');

  } catch (error) {
    logError(`\nОшибка при интеграции: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { main };
