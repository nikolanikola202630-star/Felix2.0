// Скрипт для установки Telegram webhook

const TELEGRAM_BOT_TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

async function setWebhook() {
  console.log('🔧 Установка Telegram webhook...\n');
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
        drop_pending_updates: true,
      }),
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook установлен успешно!');
      console.log(`📡 URL: ${WEBHOOK_URL}`);
      console.log(`📋 Описание: ${data.description || 'Webhook is set'}`);
    } else {
      console.log('❌ Ошибка установки webhook:');
      console.log(data);
    }
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  }
  
  console.log('\n🔍 Проверка webhook...\n');
  
  // Проверка webhook
  try {
    const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const infoResponse = await fetch(infoUrl);
    const infoData = await infoResponse.json();
    
    if (infoData.ok) {
      console.log('📊 Информация о webhook:');
      console.log(`   URL: ${infoData.result.url}`);
      console.log(`   Pending updates: ${infoData.result.pending_update_count}`);
      console.log(`   Last error: ${infoData.result.last_error_message || 'Нет ошибок'}`);
      console.log(`   Last error date: ${infoData.result.last_error_date ? new Date(infoData.result.last_error_date * 1000).toLocaleString() : 'N/A'}`);
    }
  } catch (error) {
    console.log('❌ Ошибка проверки:', error.message);
  }
  
  console.log('\n✅ Готово! Теперь бот должен работать.');
  console.log('📱 Попробуйте отправить /start в Telegram');
}

setWebhook();
