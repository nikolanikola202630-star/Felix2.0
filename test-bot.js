// Скрипт для тестирования бота

const TELEGRAM_BOT_TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';

async function testBot() {
  console.log('🧪 Тестирование Telegram бота...\n');
  
  // 1. Проверка getMe
  console.log('1️⃣ Проверка getMe...');
  try {
    const meUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();
    
    if (meData.ok) {
      console.log('✅ Бот активен:');
      console.log(`   Username: @${meData.result.username}`);
      console.log(`   Name: ${meData.result.first_name}`);
      console.log(`   ID: ${meData.result.id}`);
    } else {
      console.log('❌ Ошибка getMe:', meData);
    }
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  }
  
  console.log('\n2️⃣ Проверка webhook...');
  try {
    const webhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const webhookResponse = await fetch(webhookUrl);
    const webhookData = await webhookResponse.json();
    
    if (webhookData.ok) {
      console.log('✅ Webhook информация:');
      console.log(`   URL: ${webhookData.result.url}`);
      console.log(`   Pending: ${webhookData.result.pending_update_count}`);
      console.log(`   Max connections: ${webhookData.result.max_connections || 40}`);
      
      if (webhookData.result.last_error_message) {
        console.log(`   ⚠️  Last error: ${webhookData.result.last_error_message}`);
        console.log(`   ⚠️  Last error date: ${new Date(webhookData.result.last_error_date * 1000).toLocaleString()}`);
      } else {
        console.log('   ✅ Нет ошибок');
      }
    }
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  }
  
  console.log('\n3️⃣ Проверка Vercel endpoint...');
  try {
    const vercelUrl = 'https://felix2-0.vercel.app/api/webhook';
    const vercelResponse = await fetch(vercelUrl, {
      method: 'GET',
    });
    
    console.log(`   Status: ${vercelResponse.status}`);
    console.log(`   Status Text: ${vercelResponse.statusText}`);
    
    if (vercelResponse.ok) {
      const text = await vercelResponse.text();
      console.log(`   Response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  }
  
  console.log('\n4️⃣ Проверка Mini App...');
  try {
    const miniappUrl = 'https://felix2-0.vercel.app/miniapp/index.html';
    const miniappResponse = await fetch(miniappUrl);
    
    console.log(`   Status: ${miniappResponse.status}`);
    console.log(`   Status Text: ${miniappResponse.statusText}`);
    
    if (miniappResponse.ok) {
      console.log('   ✅ Mini App доступен');
    } else {
      console.log('   ❌ Mini App недоступен');
    }
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  }
  
  console.log('\n📋 Итоги:');
  console.log('   - Бот должен отвечать на /start');
  console.log('   - Mini App должен открываться');
  console.log('   - Если не работает, проверьте логи в Vercel Dashboard');
  console.log('\n🔗 Vercel Dashboard: https://vercel.com/nikolanikola202630-stars-projects/felix2-0');
}

testBot();
