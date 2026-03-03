#!/usr/bin/env node
// Setup Main Bot Webhook
// Use this token temporarily: 8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g

const https = require('https');

const MAIN_BOT_TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

console.log('🔗 Setting up Main Bot webhook...');
console.log('📍 Webhook URL:', WEBHOOK_URL);
console.log('🤖 Bot Token:', MAIN_BOT_TOKEN.substring(0, 20) + '...');

// Set webhook
const setWebhookUrl = `https://api.telegram.org/bot${MAIN_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;

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
        const getInfoUrl = `https://api.telegram.org/bot${MAIN_BOT_TOKEN}/getWebhookInfo`;
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
              
              // Get bot info
              const getBotUrl = `https://api.telegram.org/bot${MAIN_BOT_TOKEN}/getMe`;
              https.get(getBotUrl, (botRes) => {
                let botData = '';
                botRes.on('data', chunk => botData += chunk);
                botRes.on('end', () => {
                  const botInfo = JSON.parse(botData);
                  if (botInfo.ok) {
                    console.log('\n🤖 Bot Info:');
                    console.log('• Username:', '@' + botInfo.result.username);
                    console.log('• Name:', botInfo.result.first_name);
                    console.log('• ID:', botInfo.result.id);
                    
                    console.log('\n✅ Main Bot setup complete!');
                    console.log('\n🧪 Test with: /start in @' + botInfo.result.username);
                    console.log('\n⟁ EGOIST ECOSYSTEM © 2026');
                  }
                });
              });
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
