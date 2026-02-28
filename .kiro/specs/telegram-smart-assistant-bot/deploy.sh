#!/bin/bash

# Автоматический деплой Telegram Smart Assistant Bot
# Этот скрипт выполняет все необходимые команды для деплоя

echo "🚀 Начинаем автоматический деплой..."
echo ""

# Шаг 1: Создание .env.local
echo "📝 Шаг 1/4: Создание .env.local..."
if [ ! -f .env.local ]; then
    cp .kiro/specs/telegram-smart-assistant-bot/.env.example .env.local
    echo "✅ .env.local создан"
else
    echo "ℹ️  .env.local уже существует, пропускаем"
fi
echo ""

# Шаг 2: Git add
echo "📦 Шаг 2/4: Добавление файлов в Git..."
git add .
echo "✅ Файлы добавлены"
echo ""

# Шаг 3: Git commit
echo "💾 Шаг 3/4: Создание коммита..."
git commit -m "Setup complete: all credentials configured and ready for deployment"
if [ $? -eq 0 ]; then
    echo "✅ Коммит создан"
else
    echo "ℹ️  Нет изменений для коммита или коммит уже существует"
fi
echo ""

# Шаг 4: Git push
echo "🚀 Шаг 4/4: Отправка на GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Код отправлен на GitHub"
    echo ""
    echo "🎉 Деплой запущен!"
    echo ""
    echo "📊 Проверьте статус деплоя:"
    echo "   - GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
    echo "   - Vercel Dashboard: https://vercel.com/egoistsuport-coders-projects/felix"
    echo ""
    echo "⏳ Деплой займет ~2-3 минуты"
    echo ""
    echo "📝 После деплоя не забудьте:"
    echo "   1. Настроить Telegram Webhook (см. webhook.sh)"
    echo "   2. Протестировать бота @fel12x_bot"
else
    echo "❌ Ошибка при отправке на GitHub"
    echo "   Проверьте подключение к интернету и права доступа к репозиторию"
    exit 1
fi
