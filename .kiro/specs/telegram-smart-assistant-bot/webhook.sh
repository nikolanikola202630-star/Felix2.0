#!/bin/bash

# Настройка Telegram Webhook
# Запустите этот скрипт после успешного деплоя

echo "🔗 Настройка Telegram Webhook..."
echo ""

# Получите URL вашего приложения из Vercel
echo "📝 Введите URL вашего приложения на Vercel:"
echo "   (например: https://felix.vercel.app)"
read -p "URL: " APP_URL

# Удаляем trailing slash если есть
APP_URL=${APP_URL%/}

echo ""
echo "🚀 Настраиваем webhook..."

# Настройка webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook" \
  -d "url=${APP_URL}/api/telegram/webhook")

echo ""
echo "📊 Ответ от Telegram:"
echo "$RESPONSE"
echo ""

# Проверка успешности
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook успешно настроен!"
    echo ""
    echo "🎉 Бот готов к работе!"
    echo ""
    echo "📝 Протестируйте бота:"
    echo "   1. Откройте Telegram"
    echo "   2. Найдите @fel12x_bot"
    echo "   3. Отправьте /start"
    echo "   4. Попробуйте отправить голосовое сообщение"
else
    echo "❌ Ошибка при настройке webhook"
    echo "   Проверьте URL и попробуйте снова"
fi
