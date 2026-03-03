#!/usr/bin/env node

// Deploy Referral Bot Customization System
// EGOIST ECOSYSTEM Edition

const { execSync } = require('child_process');

console.log('🚀 Deploying Referral Bot Customization System...\n');

const steps = [
  {
    name: 'Git Status',
    command: 'git status --short'
  },
  {
    name: 'Add Files',
    command: 'git add .'
  },
  {
    name: 'Commit',
    command: 'git commit -m "feat: Partner referral bot customization system v2.0 - EGOIST ECOSYSTEM"'
  },
  {
    name: 'Push to GitHub',
    command: 'git push origin main'
  }
];

for (const step of steps) {
  try {
    console.log(`\n📦 ${step.name}...`);
    const output = execSync(step.command, { encoding: 'utf-8' });
    console.log(output);
  } catch (error) {
    if (step.name === 'Commit' && error.message.includes('nothing to commit')) {
      console.log('✅ No changes to commit');
      continue;
    }
    console.error(`❌ Error in ${step.name}:`, error.message);
    if (step.name !== 'Git Status') {
      process.exit(1);
    }
  }
}

console.log('\n✅ Deployment complete!');
console.log('\n📋 Next steps:');
console.log('1. Apply migration in Supabase: database/migrations/006-partner-referral-customization-simple.sql');
console.log('2. Wait for Vercel auto-deploy (2-3 minutes)');
console.log('3. Test API: https://felix2-0.vercel.app/api/partner-referral-settings?partner_user_id=1907288209');
console.log('4. Test UI: https://felix2-0.vercel.app/partner-referral-bot.html');
console.log('5. Setup referral bot webhook if needed');
console.log('\n⟁ EGOIST ECOSYSTEM © 2026\n');
