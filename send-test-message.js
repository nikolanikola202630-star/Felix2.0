// Отправка тестового сообщения боту
const TOKEN = '8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U';
const ADMIN_ID = 8264612178;

async function sendTestMessage() {
    console.log('📤 Отправка тестового сообщения...\n');
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: '🧪 Тест бота Felix v7.1\n\nЕсли вы видите это сообщение, значит бот работает!\n\n✅ Webhook активен\n✅ Переменные окружения загружены\n✅ Vercel деплой успешен\n\nПопробуйте команды:\n/start - Начать\n/help - Помощь\n/profile - Профиль',
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Сообщение отправлено успешно!');
            console.log(`📨 Message ID: ${data.result.message_id}`);
        } else {
            console.log('❌ Ошибка отправки:', data.description);
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

sendTestMessage();
