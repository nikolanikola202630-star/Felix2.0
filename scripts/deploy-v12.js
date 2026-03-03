#!/usr/bin/env node
// Felix Academy V12 - Deployment Script
// Автоматический деплой всего проекта

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Felix Academy V12 - Deployment');
console.log('='.repeat(50));

const steps = [
  {
    name: 'Проверка изменений',
    command: 'git status --short',
    check: true
  },
  {
    name: 'Оптимизация проекта',
    command: 'node scripts/optimize-project-v12.js'
  },
  {
    name: 'Синхронизация компонентов',
    command: 'node scripts/sync-all-v12.js'
  },
  {
    name: 'Добавление файлов',
    command: 'git add .'
  },
  {
    name: 'Коммит изменений',
    command: 'git commit -m "feat: Felix Academy V12 - полная модернизация, оптимизация, новые боты"'
  },
  {
    name: 'Push в GitHub',
    command: 'git push origin main'
  }
];

async function deploy() {
  for (const step of steps) {
    console.log(`\n📦 ${step.name}...`);
    
    try {
      const output = execSync(step.command, { encoding: 'utf8' });
      
      if (step.check && output.trim()) {
        console.log(output);
      }
      
      console.log(`  ✓ ${step.name} завершен`);
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        console.log('  ℹ️  Нет изменений для коммита');
        continue;
      }
      
      console.error(`  ❌ Ошибка: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ Деплой завершен!');
  console.log('='.repeat(50));
  console.log('\n📝 Следующие шаги:');
  console.log('1. Проверь статус деплоя на Vercel');
  console.log('2. Протестируй приложение');
  console.log('3. Проверь работу ботов');
  console.log('\n🔗 Ссылки:');
  console.log('• Приложение: https://felix2-0.vercel.app/miniapp/app-v12.html');
  console.log('• Vercel Dashboard: https://vercel.com/dashboard');
}

deploy().catch(console.error);
