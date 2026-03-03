#!/usr/bin/env node

// Deploy Referral Bot Customization System
// EGOIST ECOSYSTEM Edition

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Referral Bot Customization System...\n');

// Check if migration file exists
const migrationPath = path.join(__dirname, '../database/migrations/006-partner-referral-customization-simple.sql');
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found!');
  process.exit(1);
}

console.log('✅ Migration file found');

// Check if API files exist
const apiFiles = [
  'api/partner-referral-settings.js',
  'api/referral-bot-v2.js',
  'api/routes/partner.js'
];

for (const file of apiFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} not found!`);
    process.exit(1);
  }
}

console.log('✅ All API files found');

// Check if UI files exist
const uiFiles = [
  'miniapp/partner-referral-bot.html',
  'miniapp/partner-dashboard.html',
  'miniapp/js/partner-dashboard.js'
];

for (const file of uiFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${file} not found!`);
    process.exit(1);
  }
}

console.log('✅ All UI files found\n');

// Git status
console.log('📊 Git status:');
try {
  execSync('git status --short', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Git status failed');
}

console.log('\n📝 Files to deploy:');
console.log('  - database/migrations/006-partner-referral-customization-simple.sql');
console.log('  - api/partner-referral-settings.js');
console.log('  - api/referral-bot-v2.js');
console.log('  - api/routes/partner.js');
console.log('  - miniapp/partner-referral-bot.html');
console.log('  - miniapp/partner-dashboard.html');
console.log('  - miniapp/js/partner-dashboard.js');

console.log('\n🔄 Adding files to git...');
try {
  execSync('git add database/migrations/006-partner-referral-customization-simple.sql', { stdio: 'inherit' });
  execSync('git add api/partner-referral-settings.js', { stdio: 'inherit' });
  execSync('git add api/referral-bot-v2.js', { stdio: 'inherit' });
  execSync('git add api/routes/partner.js', { stdio: 'inherit' });
  execSync('git add miniapp/partner-referral-bot.html', { stdio: 'inherit' });
  execSync('git add miniapp/partner-dashboard.html', { stdio: 'inherit' });
  execSync('git add miniapp/js/partner-dashboard.js', { stdio: 'inherit' });
  execSync('git add ПРИМЕНИТЬ-МИГРАЦИЮ-СЕЙЧАС.md', { stdio: 'inherit' });
  console.log('✅ Files added');
} catch (error) {
  console.error('❌ Git add failed');
  process.exit(1);
}

console.log('\n💾 Committing...');
try {
  execSync('git commit -m "feat: partner referral bot customization system - fixed migration"', { stdio: 'inherit' });
  console.log('✅ Committed');
} catch (error) {
  console.log('⚠️  Nothing to commit or commit failed');
}

console.log('\n🚀 Pushing to GitHub...');
try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Pushed to GitHub');
} catch (error) {
  console.error('❌ Push failed');
  process.exit(1);
}

console.log('\n✅ Deploy initiated!');
console.log('\n📋 Next steps:');
console.log('1. Wait for Vercel to deploy (1-2 minutes)');
console.log('2. Apply migration in Supabase SQL Editor:');
console.log('   - Open https://supabase.com/dashboard');
console.log('   - Go to SQL Editor');
console.log('   - Copy/paste: database/migrations/006-partner-referral-customization-simple.sql');
console.log('   - Click RUN');
console.log('3. Test API:');
console.log('   curl "https://felix2-0.vercel.app/api/partner-referral-settings?partner_user_id=1907288209"');
console.log('4. Open UI:');
console.log('   https://felix2-0.vercel.app/partner-dashboard.html');
console.log('\n⟁ EGOIST ECOSYSTEM © 2026');
