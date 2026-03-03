#!/usr/bin/env node
// Simple Webhook Setup Script
// Run after deployment with: node scripts/setup-webhooks-simple.js YOUR_VERCEL_URL

require('dotenv').config({ path: '.env.local' });

const MAIN_BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const REF_BOT_TOKEN = process.env.REFERRAL_BOT_TOKEN;
const WEBHOOK_URL = process.argv[2] || process.env.WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.log('❌ Please provide Vercel URL:');
  console.log('   node scripts/setup-webhooks-simple.js https://your-project.vercel.app');
  process.exit(1);
}

async function setWebhook(token, name, path) {
  const url = `${WEBHOOK_URL}${path}`;
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, allowed_updates: ['message', 'callback_query'] })
  });
  
  const data = await response.json();
  
  if (data.ok) {
    console.log(`✅ ${name}: ${url}`);
  } else {
    console.log(`❌ ${name}: ${data.description}`);
  }
}

async function main() {
  console.log('\n🔗 Setting up webhooks...\n');
  
  if (MAIN_BOT_TOKEN) {
    await setWebhook(MAIN_BOT_TOKEN, 'Main Bot', '/api/webhook');
  }
  
  if (REF_BOT_TOKEN) {
    await setWebhook(REF_BOT_TOKEN, 'Referral Bot', '/api/referral-bot-v2');
  }
  
  console.log('\n✅ Done!\n');
}

main();
