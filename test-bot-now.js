const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const CHAT_ID = '8264612178';

async function sendTest() {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: 'Тест Felix v8.0 - бот работает! 🚀'
    })
  });
  
  const data = await response.json();
  console.log('Result:', data);
}

sendTest();
