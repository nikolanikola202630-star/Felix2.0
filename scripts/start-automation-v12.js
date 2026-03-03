#!/usr/bin/env node

// Felix Academy V12 - Start Automation
// Запуск всех систем автоматизации

const MasterAutomationV12 = require('../lib/automation/master-automation-v12');
const path = require('path');
const fs = require('fs');

// Проверка переменных окружения
function checkEnv() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ Environment variables OK');
}

// Создание необходимых директорий
async function setupDirectories() {
  const dirs = [
    '.cache',
    'logs',
    'logs/automation'
  ];

  for (const dir of dirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  console.log('✅ Directories OK');
}

// Настройка логирования
function setupLogging() {
  const logFile = path.join(process.cwd(), 'logs', 'automation', `${new Date().toISOString().split('T')[0]}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Перехват console.log
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    const message = args.join(' ');
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${message}\n`);
    originalLog.apply(console, args);
  };

  console.error = (...args) => {
    const message = args.join(' ');
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ERROR: ${message}\n`);
    originalError.apply(console, args);
  };

  console.log('✅ Logging configured');
  console.log(`📝 Log file: ${logFile}`);
}

// Главная функция
async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Felix Academy V12 - Master Automation       ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Проверки
    console.log('🔍 Running pre-flight checks...');
    checkEnv();
    await setupDirectories();
    setupLogging();

    console.log('');
    console.log('━'.repeat(50));
    console.log('');

    // Создание и запуск мастер-автоматизации
    const master = new MasterAutomationV12();
    await master.start();

    // Обработка сигналов завершения
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      await master.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('');
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      await master.stop();
      process.exit(0);
    });

    // Обработка необработанных ошибок
    process.on('uncaughtException', async (error) => {
      console.error('');
      console.error('💥 Uncaught Exception:', error);
      await master.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('');
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      await master.stop();
      process.exit(1);
    });

    // Периодический вывод статуса
    setInterval(() => {
      const status = master.getStatus();
      console.log('');
      console.log('━'.repeat(50));
      console.log('📊 Status Update');
      console.log(`   Status: ${status.status}`);
      console.log(`   Uptime: ${Math.floor(status.uptime / 1000 / 60)} minutes`);
      console.log(`   Auto Sync: ${Object.keys(status.autoSync.lastSync).length} syncs`);
      console.log(`   Health Alerts: ${status.healthMonitor.alerts}`);
      console.log(`   Deploy Queue: ${status.autoDeploy.queueLength}`);
      console.log('━'.repeat(50));
      console.log('');
    }, 15 * 60 * 1000); // Каждые 15 минут

  } catch (error) {
    console.error('');
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Запуск
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
