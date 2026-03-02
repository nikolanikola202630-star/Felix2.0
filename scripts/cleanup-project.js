#!/usr/bin/env node

/**
 * Project Cleanup Script
 * Removes outdated and duplicate files
 * Run: node scripts/cleanup-project.js
 */

const fs = require('fs');
const path = require('path');

// Files to delete
const filesToDelete = [
  // Outdated webhooks
  'api/webhook.js',
  'api/webhook-v7.1.js',
  'api/webhook-v7-full.js',
  'api/webhook-v8.js',
  'api/webhook-simple.js',
  'api/webhook-supabase.js',
  
  // Outdated Mini App versions
  'miniapp/elite.html',
  'miniapp/elite-v2.html',
  'miniapp/elite-v3.html',
  'miniapp/elite-v4.html',
  'miniapp/elite-v5.html',
  'miniapp/egoist.html',
  
  // Test scripts
  'test-bot.js',
  'send-test-message.js',
  'set-webhook.js',
  'fix-git-user.ps1',
  
  // Outdated docs (keep only latest)
  'PUSH-СЕЙЧАС.md',
  'PUSH-NOW.md',
  'PUSH-В-GITHUB.md',
  'VERCEL-НЕТ-РЕЗУЛЬТАТОВ.md',
  'VERCEL-READY.md',
  'VERCEL-AUTO-DEPLOY.md',
  'ГОТОВО-ДЕПЛОЙ.md',
  'ГОТОВО-К-ЗАПУСКУ.md',
  'ЗАПУСК-VERCEL.md',
  'ПРОБЛЕМА-ДЕПЛОЯ.md',
  'ФИНАЛ.md',
  'УСПЕХ.md',
  'РЕЗЮМЕ.md',
  'СЕЙЧАС-ДЕЛАТЬ.md',
  'ЧТО-ДЕЛАТЬ-ДАЛЬШЕ.md',
  'GITHUB-ACTIONS-РАБОТАЮТ.md',
  'БОТ-РАБОТАЕТ.md',
  'COMMIT-V7-FINAL.txt',
  'ФИНАЛЬНАЯ-ИНСТРУКЦИЯ.md',
  'SETUP-SUPABASE-COMPLETE.md',
  'PROJECT-STATUS-FINAL.md',
  'FINAL-STATUS-V6.md',
  'FULL-AUDIT.md',
  'TEST-V7.md',
  'SPEC-V4.md',
  'ИНТЕГРАЦИЯ-v4.1.md',
  
  // Duplicate improvement docs
  'improvements/04-miniapp-optimization.md',
  'improvements/05-real-time.md',
  
  // Old scripts
  'vercel-quick-setup.ps1',
  'setup-vercel.ps1',
  'push-with-token.ps1',
  'add-env-vercel.ps1'
];

// Directories to clean
const directoriesToClean = [
  'improvements',
  '.kiro/specs/felix-bot-v4-full-features',
  '.kiro/specs/felix-bot-v4.3-documents',
  '.kiro/specs/telegram-smart-assistant-bot'
];

console.log('🧹 Starting project cleanup...\n');

let deletedCount = 0;
let skippedCount = 0;
let errors = [];

// Delete files
filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`⏭️  Skipped (not found): ${file}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${file}:`, error.message);
    errors.push({ file, error: error.message });
  }
});

// Clean directories (remove if empty)
directoriesToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`✅ Removed empty directory: ${dir}`);
        deletedCount++;
      } else {
        console.log(`⏭️  Skipped (not empty): ${dir} (${files.length} files)`);
        skippedCount++;
      }
    } else {
      console.log(`⏭️  Skipped (not found): ${dir}`);
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${dir}:`, error.message);
    errors.push({ file: dir, error: error.message });
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Cleanup Summary:');
console.log('='.repeat(50));
console.log(`✅ Deleted: ${deletedCount} files/directories`);
console.log(`⏭️  Skipped: ${skippedCount} files/directories`);
console.log(`❌ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n⚠️  Errors encountered:');
  errors.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}

console.log('\n✨ Cleanup completed!');
console.log('\n💡 Next steps:');
console.log('  1. Review changes: git status');
console.log('  2. Commit: git add -A && git commit -m "chore: cleanup outdated files"');
console.log('  3. Push: git push');
