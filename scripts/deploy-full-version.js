#!/usr/bin/env node
// Felix Academy - Full Version Deploy Script
// EGOIST ECOSYSTEM Edition v9.0

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Felix Academy - Full Version Deploy');
console.log('⟁ EGOIST ECOSYSTEM Edition v9.0\n');

// Check environment
console.log('📋 Checking environment...');
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'GROQ_API_KEY',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn('⚠️  Missing env vars (will use Vercel secrets):', missingVars.join(', '));
}

// Check critical files
console.log('\n📁 Checking critical files...');
const criticalFiles = [
  'api/webhook-handler.js',
  'api/_router.js',
  'lib/db.js',
  'lib/ai.js',
  'vercel.json',
  'package.json'
];

const missingFiles = criticalFiles.filter(f => !fs.existsSync(f));
if (missingFiles.length > 0) {
  console.error('❌ Missing critical files:', missingFiles.join(', '));
  process.exit(1);
}
console.log('✅ All critical files present');

// Git status
console.log('\n📊 Git status...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('📝 Changes detected:\n' + status);
    
    // Add all changes
    console.log('\n➕ Adding changes...');
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit
    const commitMsg = `🚀 Deploy Full Version v9.0 - EGOIST ECOSYSTEM

✨ Features:
- Full AI integration with Groq
- Database integration with PostgreSQL
- Rate limiting (50 requests/day)
- User stats and progress tracking
- Message history
- Error logging

⟁ EGOIST ECOSYSTEM © 2026`;
    
    console.log('\n💾 Committing...');
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    
    // Push
    console.log('\n⬆️  Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub');
  } else {
    console.log('✅ No changes to commit');
  }
} catch (error) {
  console.error('❌ Git error:', error.message);
  process.exit(1);
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod --yes', { stdio: 'inherit' });
  console.log('\n✅ Deployed to Vercel!');
} catch (error) {
  console.error('❌ Vercel deploy error:', error.message);
  process.exit(1);
}

// Set webhook
console.log('\n🔗 Setting webhook...');
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (botToken) {
  try {
    const webhookUrl = 'https://felix2-0.vercel.app/api/webhook';
    const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;
    
    const https = require('https');
    https.get(setWebhookUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.ok) {
          console.log('✅ Webhook set successfully');
        } else {
          console.error('❌ Webhook error:', result.description);
        }
      });
    });
  } catch (error) {
    console.error('❌ Webhook setup error:', error.message);
  }
} else {
  console.log('⚠️  No TELEGRAM_BOT_TOKEN, skipping webhook setup');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ DEPLOYMENT COMPLETE!');
console.log('='.repeat(60));
console.log('\n📊 Deployment Summary:');
console.log('• Version: v9.0 FULL');
console.log('• Bot: Felix Academy - EGOIST ECOSYSTEM');
console.log('• URL: https://felix2-0.vercel.app');
console.log('• Webhook: https://felix2-0.vercel.app/api/webhook');
console.log('\n🎯 Features Deployed:');
console.log('✓ AI Integration (Groq)');
console.log('✓ Database Integration (PostgreSQL)');
console.log('✓ Rate Limiting (50/day)');
console.log('✓ User Stats & Progress');
console.log('✓ Message History');
console.log('✓ Error Logging');
console.log('✓ EGOIST ECOSYSTEM Branding');
console.log('\n🧪 Test Commands:');
console.log('• /start - Main menu');
console.log('• /help - Help');
console.log('• /ask [question] - AI query');
console.log('• /profile - User profile with stats');
console.log('• Just send any message - AI will respond');
console.log('\n⟁ EGOIST ECOSYSTEM © 2026');
console.log('='.repeat(60) + '\n');
