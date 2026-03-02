# 🚀 Felix Bot v9.0 - Deployment Guide

**Версия:** 9.0 Production Ready  
**Дата:** 2 марта 2026  
**Статус:** ✅ Готов к деплою

---

## 📋 Предварительные требования

### 1. Аккаунты
- [x] GitHub аккаунт
- [x] Vercel аккаунт (подключен к GitHub)
- [x] Supabase аккаунт
- [x] Groq API ключ
- [x] Telegram Bot Token

### 2. Локальное окружение
- Node.js 18+
- Git
- Текстовый редактор

---

## 🗄️ Шаг 1: Настройка базы данных (10 мин)

### 1.1 Создать проект Supabase

1. Открыть https://supabase.com
2. Создать новый проект
3. Выбрать регион (ближайший к пользователям)
4. Дождаться создания (~2 мин)

### 1.2 Применить миграцию

1. Открыть SQL Editor в Supabase
2. Скопировать содержимое `database/migrations/001-add-ml-tables-safe.sql`
3. Вставить и выполнить (Run)
4. Проверить результат - должно быть создано 22 таблицы

### 1.3 Получить DATABASE_URL

1. Settings → Database
2. Скопировать Connection String (URI)
3. Формат: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

---

## 🔑 Шаг 2: Получение API ключей (5 мин)

### 2.1 Telegram Bot Token

1. Открыть @BotFather в Telegram
2. Отправить `/newbot`
3. Следовать инструкциям
4. Скопировать токен (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2.2 Groq API Key

1. Открыть https://console.groq.com
2. Зарегистрироваться/войти
3. API Keys → Create API Key
4. Скопировать ключ (формат: `gsk_...`)

### 2.3 Admin ID

1. Открыть @userinfobot в Telegram
2. Отправить любое сообщение
3. Скопировать свой ID (число)

---

## 📦 Шаг 3: Подготовка проекта (5 мин)

### 3.1 Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/felix-bot.git
cd felix-bot
```

### 3.2 Установить зависимости

```bash
npm install
```

### 3.3 Создать .env.local

```bash
cp .env.example .env.local
```

Заполнить переменные:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_ID=your_telegram_id

# AI
GROQ_API_KEY=your_groq_key_here

# Database
DATABASE_URL=your_supabase_connection_string

# App
MINIAPP_URL=https://your-project.vercel.app/miniapp/elite.html
NODE_ENV=production
```

---

## 🚀 Шаг 4: Деплой на Vercel (10 мин)

### 4.1 Подключить к Vercel

1. Открыть https://vercel.com
2. New Project
3. Import Git Repository
4. Выбрать репозиторий felix-bot
5. Configure Project:
   - Framework Preset: Other
   - Build Command: (оставить пустым)
   - Output Directory: (оставить пустым)

### 4.2 Добавить переменные окружения

В Vercel Dashboard → Settings → Environment Variables добавить:

```
TELEGRAM_BOT_TOKEN = your_bot_token
GROQ_API_KEY = your_groq_key
DATABASE_URL = your_database_url
ADMIN_ID = your_telegram_id
MINIAPP_URL = https://your-project.vercel.app/miniapp/elite.html
NODE_ENV = production
```

**Важно:** Для MINIAPP_URL использовать реальный URL проекта после деплоя

### 4.3 Задеплоить

1. Нажать Deploy
2. Дождаться завершения (~2 мин)
3. Скопировать URL проекта (например: `https://felix-bot-abc123.vercel.app`)

### 4.4 Обновить MINIAPP_URL

1. Settings → Environment Variables
2. Найти MINIAPP_URL
3. Обновить на реальный URL: `https://your-project.vercel.app/miniapp/elite.html`
4. Redeploy (Deployments → ... → Redeploy)

---

## 🔗 Шаг 5: Настройка Webhook (5 мин)

### 5.1 Установить webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/webhook"}'
```

Замените:
- `<YOUR_BOT_TOKEN>` на ваш токен
- `your-project.vercel.app` на ваш URL

### 5.2 Проверить webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Должно вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-project.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## ✅ Шаг 6: Тестирование (5 мин)

### 6.1 Health Check

```bash
curl https://your-project.vercel.app/api/webhook
```

Должно вернуть:
```json
{
  "status": "ok",
  "bot": "Felix v9.0 Production",
  "health": {...},
  "timestamp": "2026-03-02T..."
}
```

### 6.2 Тест бота

1. Открыть бота в Telegram
2. Отправить `/start` - должно прийти приветствие
3. Отправить `/help` - должен показать команды
4. Отправить `/profile` - должен показать профиль
5. Отправить обычное сообщение - должен ответить через AI
6. Отправить `/ask что такое AI?` - должен ответить

### 6.3 Тест Mini App

1. Нажать кнопку "📱 Открыть Felix App"
2. Должен открыться Mini App
3. Проверить все вкладки:
   - Профиль ✅
   - Обучение ✅
   - Аналитика ✅
   - Рейтинг ✅
   - Академия ✅
   - Настройки ✅

---

## 🎯 Шаг 7: Мониторинг (опционально)

### 7.1 Vercel Analytics

1. Vercel Dashboard → Analytics
2. Включить Analytics
3. Мониторить запросы и производительность

### 7.2 Supabase Logs

1. Supabase Dashboard → Logs
2. Мониторить запросы к БД
3. Проверять ошибки

### 7.3 Telegram Bot Logs

1. Vercel Dashboard → Deployments → Latest → Logs
2. Мониторить логи в реальном времени
3. Проверять ошибки

---

## 🔧 Troubleshooting

### Проблема: Бот не отвечает

**Решение:**
1. Проверить webhook: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Проверить логи Vercel
3. Проверить переменные окружения
4. Переустановить webhook

### Проблема: Ошибки БД

**Решение:**
1. Проверить DATABASE_URL
2. Проверить, что миграция применена
3. Проверить логи Supabase
4. Проверить connection pooling

### Проблема: AI не работает

**Решение:**
1. Проверить GROQ_API_KEY
2. Проверить квоту Groq
3. Проверить логи
4. Проверить rate limiting

### Проблема: Mini App не открывается

**Решение:**
1. Проверить MINIAPP_URL
2. Проверить, что файл elite.html существует
3. Проверить CORS настройки
4. Проверить в браузере: https://your-project.vercel.app/miniapp/elite.html

---

## 📊 Метрики успеха

После деплоя проверить:

- [x] Health check возвращает OK
- [x] Бот отвечает на команды
- [x] AI работает
- [x] Mini App открывается
- [x] БД сохраняет данные
- [x] Нет ошибок в логах

---

## 🎉 Готово!

Ваш Felix Bot v9.0 успешно задеплоен и работает!

### Следующие шаги:

1. **Поделиться ботом:** Отправить ссылку друзьям
2. **Мониторинг:** Следить за метриками
3. **Обновления:** Пушить изменения в GitHub - Vercel автоматически задеплоит
4. **Масштабирование:** При росте пользователей - увеличить лимиты

### Полезные ссылки:

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Groq Console: https://console.groq.com
- Telegram Bot API: https://core.telegram.org/bots/api

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверить логи Vercel
2. Проверить логи Supabase
3. Проверить документацию
4. Открыть issue на GitHub

---

**Версия:** 9.0  
**Дата:** 2 марта 2026  
**Статус:** ✅ Production Ready

**Удачи! 🚀**
