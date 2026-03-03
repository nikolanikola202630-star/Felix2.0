# Felix Academy - Чеклист Деплоя v10.3

⟁ EGOIST ECOSYSTEM | Дата: 3 марта 2026

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ БЕЗОПАСНОСТИ

### ❌ Найдены хардкоженные токены в коде!

**Файлы с токенами (УДАЛИТЬ ИЛИ ПЕРЕМЕСТИТЬ В .env):**

```
❌ test-bot-now.js                    - Токен основного бота
❌ set-webhook-now.js                 - Токен основного бота
❌ bot-local-polling.js               - Токен + GROQ API ключ
❌ bot-academy-local.js               - Токен + GROQ API ключ
❌ api/webhook-test.js                - Токен + GROQ API ключ
❌ api/webhook-handler.js             - Токен (fallback)
❌ api/referral-bot.js                - Токен реферального бота
❌ api/referral-bot-v2.js             - Токен реферального бота
❌ api/payments/webhook.js            - Токен (fallback)
❌ api/payments/refund.js             - Токен (fallback)
❌ api/payments/create-invoice.js     - Токен (fallback)
❌ miniapp/js/partner-dashboard.js    - Токен в клиентском коде!
❌ scripts/setup-main-bot-webhook.js  - Токен
❌ scripts/setup-referral-bot.js      - Токен
❌ scripts/fix-bot-webhook.js         - Токен
❌ scripts/diagnose-bot.js            - Токен
❌ scripts/setup-webhook-production.js - Токен (fallback)
❌ scripts/sync-bots.js               - Токен (fallback)
```

**Найденные токены:**
- `8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U` - Основной бот
- `8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g` - Реферальный бот
- `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` - Groq API

---

## 📊 Статистика Проекта

**Файлы:**
- API endpoints: 34 файла
- Mini App страницы: 26 HTML файлов
- JavaScript файлы: 136 файлов
- Миграции БД: 7 файлов

**Структура:**
```
felix-academy/
├── api/              (34 endpoints)
├── miniapp/          (26 HTML + JS/CSS)
├── lib/              (Библиотеки)
├── database/         (Схемы и миграции)
├── scripts/          (Утилиты)
└── tests/            (Тесты)
```

---

## ✅ ШАГ 1: БЕЗОПАСНОСТЬ (КРИТИЧНО!)

### 1.1 Удалить хардкоженные токены

**Действия:**


1. **Удалить тестовые файлы с токенами:**
   ```bash
   rm test-bot-now.js
   rm set-webhook-now.js
   ```

2. **Переместить локальные боты в отдельную папку:**
   ```bash
   mkdir local-testing
   mv bot-local-polling.js local-testing/
   mv bot-academy-local.js local-testing/
   ```

3. **Обновить .gitignore:**
   ```
   # Добавить
   local-testing/
   test-*.js
   set-*.js
   ```

4. **Удалить токен из клиентского кода:**
   - Файл: `miniapp/js/partner-dashboard.js`
   - Удалить строку: `BOT_TOKEN: '8623255560:...'`
   - Использовать серверный API вместо прямых вызовов

### 1.2 Обновить fallback токены

**Заменить во всех файлах:**
```javascript
// ❌ ПЛОХО
const TOKEN = process.env.BOT_TOKEN || '8623255560:AAE...';

// ✅ ХОРОШО
const TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  throw new Error('BOT_TOKEN is required');
}
```

**Файлы для обновления:**
- `api/webhook-handler.js`
- `api/payments/webhook.js`
- `api/payments/refund.js`
- `api/payments/create-invoice.js`
- `scripts/setup-webhook-production.js`
- `scripts/sync-bots.js`

### 1.3 Проверить .env файлы

```bash
# Убедиться что .env в .gitignore
cat .gitignore | grep ".env"

# Проверить что .env не в git
git ls-files | grep ".env"
```

---

## ✅ ШАГ 2: БАЗА ДАННЫХ

### 2.1 Проверить подключение к Supabase

```bash
node scripts/check-database.js
```

**Ожидаемый результат:**
```
✅ Database connected
✅ All tables exist
✅ Indexes created
```

### 2.2 Применить миграции

**Порядок миграций:**
```sql
1. database/migrations/001-add-ml-tables-safe.sql
2. database/migrations/002-academy-tables.sql
3. database/migrations/003-partner-courses.sql
4. database/migrations/004-referral-system-v2.sql
5. database/migrations/005-community-system.sql
6. database/migrations/006-partner-referral-customization-simple.sql
7. database/migrations/007-ai-chat-folders.sql
```

**Применить:**
```bash
# В Supabase SQL Editor
# Выполнить каждую миграцию по порядку
```

### 2.3 Проверить таблицы

**Критичные таблицы:**
```sql
-- Проверить существование
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Должны быть:
users
history
user_settings
courses
user_progress
partner_accounts
referral_clicks
user_referrals
partner_referral_settings
```

---

## ✅ ШАГ 3: ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### 3.1 Локальные переменные (.env.local)

```env
# Боты
BOT_TOKEN=your_main_bot_token_here
TELEGRAM_BOT_TOKEN=your_main_bot_token_here
REFERRAL_BOT_TOKEN=your_referral_bot_token_here

# AI
GROQ_API_KEY=your_groq_api_key_here

# База данных
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Админы
ADMIN_IDS=1907288209,8264612178
ADMIN_ID=1907288209

# URLs
MINIAPP_URL=https://felix2-0.vercel.app/miniapp/index.html
WEBHOOK_URL=https://felix2-0.vercel.app

# Окружение
NODE_ENV=production
VERCEL_ENV=production

# Лимиты
AI_DAILY_LIMIT=50
AI_HOURLY_LIMIT=10
MESSAGE_RATE_LIMIT_PER_MINUTE=20
```

### 3.2 Vercel переменные

**Установить через CLI:**
```bash
vercel env add BOT_TOKEN
vercel env add TELEGRAM_BOT_TOKEN
vercel env add REFERRAL_BOT_TOKEN
vercel env add GROQ_API_KEY
vercel env add DATABASE_URL
vercel env add ADMIN_IDS
vercel env add MINIAPP_URL
```

**Или через Dashboard:**
1. Открыть https://vercel.com/dashboard
2. Выбрать проект
3. Settings → Environment Variables
4. Добавить все переменные для Production, Preview, Development

---

## ✅ ШАГ 4: VERCEL КОНФИГУРАЦИЯ

### 4.1 Проверить vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/_router.js",
      "use": "@vercel/node"
    },
    {
      "src": "miniapp/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/_router.js"
    },
    {
      "src": "/miniapp/(.*)",
      "dest": "/miniapp/$1"
    },
    {
      "src": "/",
      "dest": "/miniapp/index.html"
    }
  ]
}
```

### 4.2 Проверить package.json

**Критичные зависимости:**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "groq-sdk": "^0.3.0",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}
```

### 4.3 Проверить Node.js версию

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## ✅ ШАГ 5: ТЕСТИРОВАНИЕ

### 5.1 Локальное тестирование

```bash
# Установить зависимости
npm install

# Запустить тесты
npm test

# Проверить БД
npm run test:supabase

# Запустить локально (с ngrok)
npm run dev
```

### 5.2 Тесты API

```bash
# Health check
curl https://felix2-0.vercel.app/api/webhook

# Database health
curl https://felix2-0.vercel.app/api/health/database

# Courses API
curl https://felix2-0.vercel.app/api/courses
```

### 5.3 Тесты ботов

**Основной бот:**
```bash
# Проверить бота
curl https://api.telegram.org/bot<TOKEN>/getMe

# Проверить webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

**Реферальный бот:**
```bash
# Проверить бота
curl https://api.telegram.org/bot<REF_TOKEN>/getMe

# Проверить webhook
curl https://api.telegram.org/bot<REF_TOKEN>/getWebhookInfo
```

---

## ✅ ШАГ 6: ДЕПЛОЙ

### 6.1 Подготовка

```bash
# Проверить git статус
git status

# Убедиться что .env не в коммите
git ls-files | grep ".env"

# Проверить что токены не в коде
grep -r "8623255560" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "8609120719" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "gsk_" --exclude-dir=node_modules --exclude-dir=.git .
```

### 6.2 Коммит изменений

```bash
# Добавить изменения
git add .

# Коммит
git commit -m "feat: prepare for production deployment v10.3"

# Пуш
git push origin main
```

### 6.3 Деплой на Vercel

**Автоматический:**
```bash
# Vercel автоматически задеплоит при push в main
# Проверить статус: https://vercel.com/dashboard
```

**Ручной:**
```bash
# Деплой
vercel --prod

# Проверить
vercel ls
```

### 6.4 Установка webhook'ов

```bash
# Использовать скрипт синхронизации
node scripts/sync-bots.js

# Или вручную
node scripts/setup-main-bot-webhook.js
node scripts/setup-referral-bot.js
```

---

## ✅ ШАГ 7: ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### 7.1 Проверить API

```bash
# Health check
curl https://felix2-0.vercel.app/api/webhook
# Ожидается: {"status":"ok","bot":"Felix Academy - Main Bot",...}

# Database
curl https://felix2-0.vercel.app/api/health/database
# Ожидается: {"status":"ok","database":"connected",...}

# Referral bot
curl https://felix2-0.vercel.app/api/referral-bot-v2
# Ожидается: {"status":"ok","bot":"Felix Academy Referral Bot v2.0",...}
```

### 7.2 Проверить ботов

**Основной бот:**
1. Открыть https://t.me/fel12x_bot
2. Отправить `/start`
3. Проверить ответ
4. Отправить `/help`
5. Попробовать AI: "Привет!"
6. Открыть Mini App

**Реферальный бот:**
1. Создать реферальную ссылку
2. Перейти по ссылке
3. Проверить трекинг в БД
4. Проверить перенаправление

### 7.3 Проверить Mini App

**Страницы:**
- [ ] https://felix2-0.vercel.app/miniapp/index.html
- [ ] https://felix2-0.vercel.app/miniapp/catalog.html
- [ ] https://felix2-0.vercel.app/miniapp/profile.html
- [ ] https://felix2-0.vercel.app/miniapp/partner-dashboard.html
- [ ] https://felix2-0.vercel.app/miniapp/admin-panel.html

### 7.4 Проверить БД

```sql
-- Проверить пользователей
SELECT COUNT(*) FROM users;

-- Проверить историю
SELECT COUNT(*) FROM history;

-- Проверить реферальные клики
SELECT COUNT(*) FROM referral_clicks;

-- Проверить партнеров
SELECT COUNT(*) FROM partner_accounts WHERE is_active = true;
```

---

## ✅ ШАГ 8: МОНИТОРИНГ

### 8.1 Vercel Dashboard

**Проверить:**
- [ ] Deployment успешен
- [ ] Нет ошибок в логах
- [ ] Analytics работает
- [ ] Environment variables установлены

### 8.2 Supabase Dashboard

**Проверить:**
- [ ] Database активна
- [ ] Connections в норме
- [ ] Нет ошибок в логах
- [ ] Backup настроен

### 8.3 Telegram

**Проверить:**
- [ ] Оба бота онлайн
- [ ] Webhook'и установлены
- [ ] Нет pending updates
- [ ] Боты отвечают

---

## 🚨 КРИТИЧНЫЕ ДЕЙСТВИЯ ПЕРЕД ДЕПЛОЕМ

### Обязательно выполнить:

1. **Удалить все хардкоженные токены**
   ```bash
   # Проверить
   grep -r "8623255560" . --exclude-dir=node_modules
   grep -r "8609120719" . --exclude-dir=node_modules
   grep -r "gsk_" . --exclude-dir=node_modules
   ```

2. **Установить переменные окружения в Vercel**
   ```bash
   vercel env ls
   # Должны быть все переменные из .env.example
   ```

3. **Применить миграции БД**
   ```bash
   # В Supabase SQL Editor
   # Выполнить все 7 миграций
   ```

4. **Проверить .gitignore**
   ```bash
   cat .gitignore | grep -E "\.env|node_modules|\.vercel"
   ```

5. **Установить webhook'и**
   ```bash
   node scripts/sync-bots.js
   ```

---

## 📋 Финальный Чеклист

### Перед деплоем:
- [ ] Удалены все хардкоженные токены
- [ ] .env файлы в .gitignore
- [ ] Переменные окружения в Vercel
- [ ] Миграции БД применены
- [ ] Тесты пройдены
- [ ] vercel.json корректен
- [ ] package.json корректен

### После деплоя:
- [ ] API отвечает
- [ ] База данных подключена
- [ ] Оба бота работают
- [ ] Webhook'и установлены
- [ ] Mini App открывается
- [ ] Реферальная система работает
- [ ] AI отвечает
- [ ] Админ-панель доступна

### Мониторинг:
- [ ] Vercel логи чистые
- [ ] Supabase логи чистые
- [ ] Telegram боты онлайн
- [ ] Нет ошибок в БД
- [ ] Rate limiting работает

---

## 🔧 Troubleshooting

### Проблема: Бот не отвечает
```bash
# 1. Проверить webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# 2. Проверить логи
vercel logs

# 3. Переустановить webhook
node scripts/sync-bots.js
```

### Проблема: БД не подключается
```bash
# 1. Проверить DATABASE_URL
echo $DATABASE_URL

# 2. Проверить подключение
node scripts/check-database.js

# 3. Проверить Supabase Dashboard
```

### Проблема: AI не работает
```bash
# 1. Проверить GROQ_API_KEY
echo $GROQ_API_KEY

# 2. Проверить лимиты
# В Groq Dashboard

# 3. Проверить логи
vercel logs | grep "AI error"
```

---

## 📞 Поддержка

**Документация:**
- `БОТЫ-ПОЛНЫЙ-АНАЛИЗ.md` - Полный анализ ботов
- `БОТЫ-КРАТКАЯ-СВОДКА.md` - Краткая сводка
- `docs/BOTS-SYNC.md` - Синхронизация ботов
- `docs/deployment.md` - Деплой

**Скрипты:**
- `scripts/sync-bots.js` - Синхронизация
- `scripts/check-database.js` - Проверка БД
- `scripts/test-supabase.js` - Тест Supabase

---

⟁ EGOIST ECOSYSTEM © 2026
Версия: 1.0
Статус: ГОТОВ К ДЕПЛОЮ (после исправления безопасности)
