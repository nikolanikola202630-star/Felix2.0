#!/usr/bin/env node
// Скрипт для настройки переменных окружения в Vercel

require('dotenv').config();
const { execSync } = require('child_process');

console.log('\n🔧 Настройка переменных окружения Vercel\n');

// Переменные, которые нужно добавить
const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_KEY': process.env.SUPABASE_KEY,
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
  'GROQ_API_KEY': process.env.GROQ_API_KEY,
  'ADMIN_ID': process.env.ADMIN_ID,
  'MINIAPP_URL': process.env.MINIAPP_URL,
  'AI_DAILY_LIMIT': process.env.AI_DAILY_LIMIT || '50',
  'AI_HOURLY_LIMIT': process.env.AI_HOURLY_LIMIT || '10',
  'NODE_ENV': 'production'
};

console.log('📋 Проверка локальных переменных:\n');

let allPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: отсутствует`);
    allPresent = false;
  }
}

if (!allPresent) {
  console.log('\n⚠️  Некоторые переменные отсутствуют в .env файле');
  console.log('Проверьте файл .env и добавьте недостающие переменные\n');
  process.exit(1);
}

console.log('\n📤 Добавление переменных в Vercel...\n');

// Функция для добавления переменной
function addVercelEnv(key, value) {
  try {
    console.log(`Добавление ${key}...`);
    
    // Удалить существующую переменную (если есть)
    try {
      execSync(`vercel env rm ${key} production -y`, { stdio: 'pipe' });
    } catch (e) {
      // Игнорировать ошибку, если переменная не существует
    }
    
    // Добавить новую переменную
    const command = `echo "${value}" | vercel env add ${key} production`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ ${key} добавлен\n`);
    return true;
  } catch (error) {
    console.log(`❌ Ошибка при добавлении ${key}: ${error.message}\n`);
    return false;
  }
}

// Добавить все переменные
let successCount = 0;
for (const [key, value] of Object.entries(requiredVars)) {
  if (addVercelEnv(key, value)) {
    successCount++;
  }
}

console.log(`\n📊 Итого: ${successCount}/${Object.keys(requiredVars).length} переменных добавлено\n`);

if (successCount === Object.keys(requiredVars).length) {
  console.log('✅ Все переменные успешно добавлены!');
  console.log('\n🚀 Теперь можно деплоить:');
  console.log('   vercel --prod\n');
} else {
  console.log('⚠️  Некоторые переменные не были добавлены');
  console.log('Проверьте ошибки выше и попробуйте снова\n');
}
