#!/usr/bin/env node

// Deploy Community & Settings Features
// EGOIST ECOSYSTEM Edition

const { execSync } = require('child_process');

console.log('🚀 Deploying Community & Settings Features...\n');

const steps = [
  {
    name: 'Git Add',
    command: 'git add .'
  },
  {
    name: 'Git Commit',
    command: 'git commit -m "feat: полная персонализация и обсуждения по курсам\n\n- Добавлена система обсуждений по курсам\n- Полная персонализация всего мини-аппа\n- API для сохранения настроек\n- Глобальная система персонализации\n- Обсуждения, комментарии, лайки\n- Настройки темы, AI, уведомлений\n- Синхронизация с сервером\n\n⟁ EGOIST ECOSYSTEM"'
  },
  {
    name: 'Git Push',
    command: 'git push origin main'
  }
];

for (const step of steps) {
  try {
    console.log(`📦 ${step.name}...`);
    execSync(step.command, { stdio: 'inherit' });
    console.log(`✅ ${step.name} completed\n`);
  } catch (error) {
    console.error(`❌ ${step.name} failed:`, error.message);
    if (step.name !== 'Git Commit') {
      process.exit(1);
    }
  }
}

console.log('\n✅ Deployment completed!');
console.log('\n📋 What was deployed:');
console.log('  • Community discussions by course topics');
console.log('  • Full personalization system');
console.log('  • Settings API with server sync');
console.log('  • Global personalization across all pages');
console.log('  • Discussion comments and likes');
console.log('  • Theme, AI, notifications settings');
console.log('\n🔗 Check: https://felix2-0.vercel.app/miniapp/community.html');
console.log('🔗 Settings: https://felix2-0.vercel.app/miniapp/settings.html');
console.log('\n⟁ EGOIST ECOSYSTEM © 2026');
