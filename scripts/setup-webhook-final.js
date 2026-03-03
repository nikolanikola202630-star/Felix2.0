#!/usr/bin/env node
// Setup Telegram Webhook - Final Version
// EGOIST ECOSYSTEM Edition

const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment');
  console.log('\n📝 Set it in Vercel:');
  console.log('vercel env add TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

console.log('🔗 Setting up Telegram webhook...');
console.log('📍 Webhook URL:', WEBHOOK_URL);

const setWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;

https.get(setWebhookUrl, (res) => {
  let data = '';
  
  res.on('data', chunk => data += chunk);
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.ok) {
        console.log('✅ Webhook set successfully!');
        console.log('📊 Result:', result.description);
        
        // Get webhook info
        const getInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
        https.get(getInfoUrl, (infoRes) => {
          let infoData = '';
          infoRes.on('data', chunk => infoData += chunk);
          infoRes.on('end', () => {
            const info = JSON.parse(infoData);
            if (info.ok) {
              console.log('\n📋 Webhook Info:');
              console.log('• URL:', info.result.url);
              console.log('• Pending updates:', info.result.pending_update_count);
              console.log('• Last error:', info.result.last_error_message || 'None');
              console.log('\n✅ Setup complete! Bot is ready.');
              console.log('\n🧪 Test with: /start in @fel12x_bot');
              console.log('⟁ EGOIST ECOSYSTEM © 2026');
            }
          });
        });
      } else {
        console.error('❌ Webhook setup failed:', result.description);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Parse error:', error.message);
      console.error('Response:', data);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});
