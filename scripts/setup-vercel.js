#!/usr/bin/env node

/**
 * Скрипт автоматической настройки Vercel
 * Настраивает автоматическое развертывание из GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Настройка автоматического развертывания Vercel\n');

// Проверка наличия Vercel CLI
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI установлен');
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI не установлен');
    console.log('\n📦 Установите Vercel CLI:');
    console.log('   npm install -g vercel');
    console.log('   или');
    console.log('   yarn global add vercel\n');
    return false;
  }
}

// Проверка авторизации в Vercel
function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    console.log('✅ Авторизован в Vercel');
    return true;
  } catch (error) {
    console.log('❌ Не авторизован в Vercel');
    console.log('\n🔐 Авторизуйтесь:');
    console.log('   vercel login\n');
    return false;
  }
}

// Проверка наличия .vercel директории
function checkVercelProject() {
  const vercelDir = path.join(process.cwd(), '.vercel');
  if (fs.existsSync(vercelDir)) {
    console.log('✅ Проект уже связан с Vercel');
    return true;
  }
  console.log('⚠️  Проект не связан с Vercel');
  return false;
}

// Связывание проекта с Vercel
function linkProject() {
  console.log('\n🔗 Связываем проект с Vercel...');
  try {
    execSync('vercel link', { stdio: 'inherit' });
    console.log('✅ Проект связан с Vercel');
    return true;
  } catch (error) {
    console.log('❌ Ошибка при связывании проекта');
    return false;
  }
}

// Настройка Environment Variables
function setupEnvVars() {
  console.log('\n🔧 Настройка Environment Variables...');
  
  const envFile = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envFile)) {
    console.log('⚠️  Файл .env.local не найден');
    console.log('📝 Создайте .env.local с необходимыми переменными');
    return false;
  }

  console.log('✅ Файл .env.local найден');
  console.log('\n📋 Необходимые переменные для Vercel:');
  console.log('   - TELEGRAM_BOT_TOKEN');
  console.log('   - GROQ_API_KEY');
  console.log('   - DATABASE_URL');
  console.log('   - ADMIN_ID');
  console.log('   - MINIAPP_URL');
  console.log('   - SENTRY_DSN (новая)');
  console.log('   - AI_DAILY_LIMIT (новая)');
  console.log('   - AI_HOURLY_LIMIT (новая)');
  console.log('   - KV_URL (новая)');
  console.log('   - KV_REST_API_URL (новая)');
  console.log('   - KV_REST_API_TOKEN (новая)');
  console.log('   - KV_REST_API_READ_ONLY_TOKEN (новая)');
  
  console.log('\n💡 Добавьте переменные через:');
  console.log('   1. Vercel Dashboard → Settings → Environment Variables');
  console.log('   2. Или используйте: vercel env add <NAME>');
  
  return true;
}

// Настройка GitHub Integration
function setupGitHubIntegration() {
  console.log('\n🔗 Настройка GitHub Integration...');
  console.log('\n📋 Шаги:');
  console.log('1. Откройте: https://vercel.com/dashboard');
  console.log('2. Выберите проект Felix2.0');
  console.log('3. Settings → Git');
  console.log('4. Убедитесь, что:');
  console.log('   ✅ Production Branch: main');
  console.log('   ✅ Auto-deploy: Enabled');
  console.log('   ✅ Preview Deployments: Enabled');
  console.log('   ✅ Deployment Protection: Enabled (опционально)');
  
  return true;
}

// Первый деплой
function deployProject() {
  console.log('\n🚀 Выполняем первый деплой...');
  console.log('⚠️  Убедитесь, что все Environment Variables настроены!');
  console.log('\nПродолжить? (y/n): ');
  
  // В реальном использовании здесь будет интерактивный промпт
  console.log('\n💡 Для деплоя выполните:');
  console.log('   vercel --prod');
  
  return true;
}

// Проверка деплоя
function checkDeployment() {
  console.log('\n✅ Проверка деплоя...');
  console.log('\n📋 Чеклист:');
  console.log('   - [ ] Deployment успешен');
  console.log('   - [ ] Логи без ошибок');
  console.log('   - [ ] Environment Variables настроены');
  console.log('   - [ ] Webhook работает');
  console.log('   - [ ] GitHub Actions запустились');
  
  console.log('\n🔍 Проверьте:');
  console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   - GitHub Actions: https://github.com/nikolanikola202630-star/Felix2.0/actions');
  
  return true;
}

// Главная функция
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Felix Bot v7.1 - Vercel Auto-Deploy Setup');
  console.log('═══════════════════════════════════════════════════════\n');

  // Шаг 1: Проверка Vercel CLI
  if (!checkVercelCLI()) {
    process.exit(1);
  }

  // Шаг 2: Проверка авторизации
  if (!checkVercelAuth()) {
    process.exit(1);
  }

  // Шаг 3: Проверка/связывание проекта
  if (!checkVercelProject()) {
    if (!linkProject()) {
      process.exit(1);
    }
  }

  // Шаг 4: Настройка Environment Variables
  setupEnvVars();

  // Шаг 5: Настройка GitHub Integration
  setupGitHubIntegration();

  // Шаг 6: Деплой
  deployProject();

  // Шаг 7: Проверка
  checkDeployment();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Настройка завершена!');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📚 Документация:');
  console.log('   - VERCEL-AUTO-DEPLOY.md - Полная инструкция');
  console.log('   - ГОТОВО-ДЕПЛОЙ.md - Чеклист деплоя');
  console.log('   - CHECKLIST.md - Общий чеклист\n');

  console.log('🎯 Следующие шаги:');
  console.log('   1. Настроить Environment Variables в Vercel Dashboard');
  console.log('   2. Выполнить: vercel --prod');
  console.log('   3. Проверить деплой');
  console.log('   4. Протестировать бота\n');

  console.log('🚀 После настройки каждый push в main будет автоматически деплоиться!\n');
}

// Запуск
main().catch(error => {
  console.error('❌ Ошибка:', error.message);
  process.exit(1);
});
