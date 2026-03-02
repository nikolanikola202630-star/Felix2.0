const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const WEBHOOK_URL = 'https://felix2-0.vercel.app/api/webhook';

async function setWebhook() {
  const url = `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Webhook result:', data);
}

setWebhook();
