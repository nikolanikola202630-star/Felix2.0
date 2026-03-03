# 🚀 Руководство по деплою Felix Academy

## Быстрый старт

### 1. Подготовка

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/felix-academy.git
cd felix-academy

# Установить зависимости
npm install
```

### 2. Настройка переменных окружения

Создайте `.env` файл:

```env
# Telegram Bot
BOT_TOKEN=your_bot_token_here
WEBHOOK_URL=https://your-domain.vercel.app/api/webhook

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# AI (Groq)
GROQ_API_KEY=your_groq_api_key

# Optional
SENTRY_DSN=your_sentry_dsn
```

### 3. Деплой на Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

Или через GitHub:
1. Push в main ветку
2. Vercel автоматически задеплоит

### 4. Настройка базы данных

```bash
# Применить миграции
npm run db:migrate

# Или вручную в Supabase SQL Editor
# Выполнить файлы из database/migrations/
```

### 5. Установка webhook

```bash
node scripts/set-webhook.js
```

## Проверка

1. Откройте бота в Telegram
2. Отправьте `/start`
3. Откройте Mini App

## Troubleshooting

### Бот не отвечает
- Проверьте BOT_TOKEN
- Проверьте webhook: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

### База данных не работает
- Проверьте SUPABASE_URL и SUPABASE_KEY
- Проверьте применены ли миграции

### Mini App не загружается
- Проверьте CORS настройки
- Проверьте логи в Vercel

## Дополнительно

- [Настройка переменных окружения](environment.md)
- [Настройка базы данных](database.md)
- [FAQ](../FAQ.md)
