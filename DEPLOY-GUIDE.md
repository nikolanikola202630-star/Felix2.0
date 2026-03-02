# 🚀 Felix Bot v7.0 - Полное руководство по деплою

## ✅ Что готово

- ✅ Webhook с полной интеграцией БД
- ✅ Rate limiting (20 запросов/минуту)
- ✅ Обработка ошибок
- ✅ Полная схема PostgreSQL
- ✅ 13 API endpoints
- ✅ Mini App с админ-панелью
- ✅ Очищенная структура проекта

---

## 📋 Шаг 1: Настройка базы данных (Supabase)

### 1.1 Создать проект
1. Перейти на https://supabase.com
2. Нажать "New Project"
3. Заполнить:
   - Name: `felix-bot`
   - Database Password: (сохранить!)
   - Region: выбрать ближайший

### 1.2 Применить схему
1. Открыть SQL Editor в Supabase
2. Скопировать содержимое `database/complete-schema.sql`
3. Вставить и нажать "Run"
4. Дождаться выполнения (~10 секунд)

### 1.3 Получить DATABASE_URL
1. Settings → Database
2. Скопировать "Connection string" (URI)
3. Заменить `[YOUR-PASSWORD]` на ваш пароль
4. Сохранить для следующего шага

**Пример:**
```
postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## 📋 Шаг 2: Настройка Vercel

### 2.1 Подключить GitHub
1. Открыть https://vercel.com
2. New Project → Import Git Repository
3. Выбрать репозиторий `Felix-`
4. Нажать "Import"

### 2.2 Добавить Environment Variables
В настройках проекта добавить:

```env
TELEGRAM_BOT_TOKEN=8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
GROQ_API_KEY=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
DATABASE_URL=postgresql://postgres.xxx:password@...
ADMIN_ID=8264612178
MINIAPP_URL=https://felix-black.vercel.app/miniapp/
```

### 2.3 Deploy
1. Нажать "Deploy"
2. Дождаться завершения (~2 минуты)
3. Скопировать URL проекта

---

## 📋 Шаг 3: Настройка Telegram Webhook

### 3.1 Установить webhook
Выполнить команду (заменить `<YOUR_VERCEL_URL>`):

```bash
curl -X POST "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook" \
  -d "url=https://felix-black.vercel.app/api/webhook"
```

### 3.2 Проверить webhook
```bash
curl "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/getWebhookInfo"
```

Должно вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://felix-black.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 📋 Шаг 4: Проверка работы

### 4.1 Проверить health check
```bash
curl https://felix-black.vercel.app/api/webhook
```

Должно вернуть:
```json
{
  "status": "ok",
  "bot": "Felix v7.0",
  "database": "connected",
  "timestamp": "2026-03-02T..."
}
```

### 4.2 Проверить бота в Telegram
1. Открыть @fel12x_bot
2. Отправить `/start`
3. Должен ответить с кнопкой Mini App

### 4.3 Проверить базу данных
1. Отправить несколько сообщений боту
2. Открыть Supabase → Table Editor → messages
3. Должны появиться записи

### 4.4 Проверить Mini App
1. Нажать кнопку "Открыть Felix App"
2. Должен открыться Mini App
3. Проверить вкладки: Профиль, Команды, Обучение

---

## 📋 Шаг 5: Push через GitHub Desktop

### 5.1 Открыть GitHub Desktop
1. Запустить GitHub Desktop
2. Выбрать репозиторий Felix-

### 5.2 Проверить изменения
Должны быть изменены:
- `api/webhook.js` (полная переработка)
- `.env.example` (обновлен)
- `DEPLOY-GUIDE.md` (новый)
- `FULL-AUDIT.md` (новый)

### 5.3 Commit
```
feat: Full database integration - Felix Bot v7.0 production ready

- Integrated PostgreSQL in webhook.js
- Added rate limiting (20 req/min)
- Improved error handling
- Updated environment variables
- Added deployment guide
```

### 5.4 Push
1. Нажать "Push origin"
2. Дождаться завершения
3. Vercel автоматически задеплоит

---

## 🎯 Что изменилось

### До (v6.0)
- ❌ In-memory хранилище (Map)
- ❌ Нет персистентности
- ❌ Нет истории диалогов
- ❌ Нет rate limiting

### После (v7.0)
- ✅ PostgreSQL база данных
- ✅ Полная история сообщений
- ✅ Контекст в AI ответах
- ✅ Rate limiting
- ✅ Статистика и аналитика
- ✅ Поиск по сообщениям

---

## 🔧 Troubleshooting

### Проблема: Webhook не работает
**Решение:**
1. Проверить environment variables в Vercel
2. Проверить логи: Vercel → Deployments → Logs
3. Проверить webhook: `getWebhookInfo`

### Проблема: База данных не подключается
**Решение:**
1. Проверить DATABASE_URL
2. Проверить пароль в connection string
3. Проверить, что схема применена

### Проблема: AI не отвечает
**Решение:**
1. Проверить GROQ_API_KEY
2. Проверить квоту Groq API
3. Проверить логи Vercel

### Проблема: Rate limit срабатывает слишком часто
**Решение:**
Изменить лимит в `api/webhook.js`:
```javascript
if (userLimit.count >= 20) { // Увеличить до 50
```

---

## 📊 Мониторинг

### Vercel Dashboard
- Deployments: История деплоев
- Analytics: Трафик и производительность
- Logs: Логи ошибок

### Supabase Dashboard
- Table Editor: Просмотр данных
- SQL Editor: Запросы
- Database: Метрики производительности

### Telegram
- @BotFather: Статистика бота
- Webhook Info: Статус webhook

---

## 🎉 Готово!

Бот полностью готов к работе с:
- ✅ Полной интеграцией БД
- ✅ AI с контекстом
- ✅ Rate limiting
- ✅ Mini App
- ✅ Админ-панелью
- ✅ Статистикой

**Следующие шаги:**
1. Протестировать все команды
2. Добавить курсы через админ-панель
3. Пригласить пользователей
4. Мониторить метрики

**Поддержка:**
- GitHub Issues
- Telegram: @fel12x_bot
- Документация: README.md
