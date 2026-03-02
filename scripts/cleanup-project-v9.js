#!/usr/bin/env node

// Felix Bot v9.0 - Project Cleanup Script
// Removes outdated files and keeps only production-ready code

const fs = require('fs');
const path = require('path');

console.log('🧹 Felix Bot v9.0 - Project Cleanup\n');

// Files to delete
const filesToDelete = [
  // Old webhook versions
  'api/webhook-v7.1.js',
  'api/webhook-v7-full.js',
  'api/webhook-v8.js',
  'api/webhook-v8-fixed.js',
  'api/webhook-simple.js',
  'api/webhook-simple-v8.js',
  'api/webhook-simple-test.js',
  'api/webhook-supabase.js',
  'api/webhook-test-simple.js',
  'api/index-backup.js',
  'api/index-minimal.js',
  
  // Old Mini App versions
  'miniapp/elite-v2.html',
  'miniapp/elite-v3.html',
  'miniapp/elite-v4.html',
  'miniapp/elite-v5.html',
  'miniapp/elite-v6.html',
  'miniapp/egoist.html',
  'miniapp/admin.html',
  
  // Test scripts
  'test-bot.js',
  'send-test-message.js',
  'set-webhook.js',
  
  // Old PowerShell scripts
  'cleanup.ps1',
  'fix-git-user.ps1',
  'push-with-token.ps1',
  'setup-vercel.ps1',
  'vercel-quick-setup.ps1',
  'add-env-vercel.ps1',
  
  // Old database files
  'database/v4-schema.sql',
  'database/add-message-type-column.sql',
  'database/verify-schema.sql',
  
  // Old library versions
  'lib/automation/self-learning.js', // Keep only self-learning-safe.js
];

// Documentation files to delete (keep only essential)
const docsToDelete = [
  'PUSH-*.md',
  'VERCEL-*.md',
  'ГОТОВО-*.md',
  'ИТОГИ-*.md',
  'СТАТУС-*.md',
  'ФИНАЛ*.md',
  'УСПЕХ.md',
  'РЕЗЮМЕ.md',
  'ПРОБЛЕМА-*.md',
  'ЧТО-ДЕЛАТЬ-*.md',
  'СЕЙЧАС-ДЕЛАТЬ.md',
  'НАЧАТЬ-ЗДЕСЬ.md',
  'БОТ-РАБОТАЕТ.md',
  'ИНТЕГРАЦИЯ-*.md',
  'ПРОЕКТ-ГОТОВ.md',
  'ВОССТАНОВЛЕНИЕ-*.md',
  'MINI-APP-FIX.md',
  'ПРОГРЕСС-*.md',
  'БЫСТРОЕ-*.md',
  'ПОЛНЫЙ-АНАЛИЗ-И-ИСПРАВЛЕНИЯ.md',
  'ИТОГИ-АНАЛИЗА-V8.6.md',
  'ЧЕКЛИСТ-ИСПРАВЛЕНИЙ.md',
  'FELIX-V8-STATUS.md',
  'FELIX-V8.6-FINAL.md',
  'FELIX-V8.1-*.md',
  'FELIX-V8.2-*.md',
  'FELIX-V8.3-*.md',
  'FELIX-V7-*.md',
  'FELIX-V5-SPEC.md',
  'FELIX-COMPLETE-AUDIT.md',
  'FULL-AUDIT.md',
  'FINAL-STATUS-V6.md',
  'PROJECT-STATUS-FINAL.md',
  'SPEC-V4.md',
  'TEST-V7.md',
  'COMMIT-V7-FINAL.txt',
  'GITHUB-ACTIONS-РАБОТАЮТ.md',
  'АВТОНОМНАЯ-СИСТЕМА.md',
  'АВТОМАТИЗАЦИЯ-И-CI-CD.md',
  'СВОДКА-УЛУЧШЕНИЙ.md',
  'ВНЕДРЕНИЕ-УЛУЧШЕНИЙ.md',
  'ЧЕКЛИСТ-V7.1.md',
  'ИТОГИ-ПРОРАБОТКИ.md',
  'ИТОГИ-ПРОРАБОТКИ-V8.1.md',
  'ВИЗУАЛ-АНАЛИЗ.md',
  'ГЛУБОКИЙ-ТЕХНИЧЕСКИЙ-АНАЛИЗ.md',
  'ПОЛНЫЙ-АНАЛИЗ-ПРОЕКТА.md',
  'SETUP-SUPABASE-COMPLETE.md',
];

let deletedCount = 0;
let errorCount = 0;

// Delete specific files
console.log('📁 Deleting specific files...\n');
filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${file}:`, error.message);
    errorCount++;
  }
});

// Delete documentation files by pattern
console.log('\n📄 Deleting outdated documentation...\n');
docsToDelete.forEach(pattern => {
  const files = fs.readdirSync(process.cwd());
  const regex = new RegExp(pattern.replace('*', '.*'));
  
  files.forEach(file => {
    if (regex.test(file) && file.endsWith('.md')) {
      const filePath = path.join(process.cwd(), file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted: ${file}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error deleting ${file}:`, error.message);
        errorCount++;
      }
    }
  });
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n✨ Cleanup completed!`);
console.log(`✅ Deleted: ${deletedCount} files`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount}`);
}

console.log('\n📦 Keeping essential files:');
console.log('  - api/webhook.js (v9.0 production)');
console.log('  - miniapp/elite.html (production UI)');
console.log('  - miniapp/admin-panel.html (admin UI)');
console.log('  - lib/automation/self-learning-safe.js');
console.log('  - database/migrations/001-add-ml-tables-safe.sql');
console.log('  - README.md, CHANGELOG.md, DEPLOY-GUIDE.md');
console.log('  - АНАЛИЗ-ПРОЕКТА-FELIX-BOT.md');

console.log('\n🎯 Next steps:');
console.log('  1. Review changes: git status');
console.log('  2. Commit: git add -A && git commit -m "chore: cleanup v9.0"');
console.log('  3. Deploy: git push');

console.log('\n✅ Project is now clean and production-ready!\n');
