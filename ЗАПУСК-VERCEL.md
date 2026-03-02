# ⚡ ЗАПУСК VERCEL AUTO-DEPLOY

## 🎯 Быстрый старт (5 минут)

### Шаг 1: Установить Vercel CLI

```powershell
npm install -g vercel
```

### Шаг 2: Запустить автоматическую настройку

```powershell
# Windows PowerShell
.\setup-vercel.ps1

# Или Node.js (cross-platform)
npm run vercel:setup
```

### Шаг 3: Готово! 🎉

После настройки каждый push в GitHub автоматически деплоится на Vercel.

---

## 📋 Что делает скрипт

1. ✅ Проверяет Vercel CLI
2. ✅ Авторизует в Vercel
3. ✅ Связывает проект
4. ✅ Показывает список Environment Variables
5. ✅ Открывает Dashboard для GitHub Integration
6. ✅ Предлагает выполнить первый деплой

---

## 🔧 Ручная настройка (если нужно)

### 1. Авторизация

```powershell
vercel login
```

### 2. Связать проект

```powershell
vercel link
```

Выберите:
- Scope: Ваш аккаунт
- Link to existing project: Yes
- Project name: Felix2.0

### 3. Настроить Environment Variables

#### Через Dashboard (рекомендуется)

1. Откройте: https://vercel.com/dashboard
2. Выберите проект Felix2.0
3. Settings → Environment Variables
4. Добавьте все переменные из `.env.local`

#### Через CLI

```powershell
# Добавить переменную
vercel env add SENTRY_DSN

# Список переменных
vercel env ls
```

### 4. Настроить GitHub Integration

1. Vercel Dashboard → Settings → Git
2. Убедитесь:
   - ✅ Production Branch: main
   - ✅ Auto-deploy: Enabled
   - ✅ Preview Deployments: Enabled

### 5. Первый деплой

```powershell
# Production
vercel --prod

# Или через npm
npm run deploy
```

---

## 📊 Environment Variables

### Обязательные (уже есть)

```env
TELEGRAM_BOT_TOKEN=your_token
GROQ_API_KEY=your_key
DATABASE_URL=your_db_url
ADMIN_ID=your_admin_id
MINIAPP_URL=your_miniapp_url
```

### Новые в v7.1

```env
# Sentry (мониторинг)
SENTRY_DSN=your_sentry_dsn

# AI Rate Limiting
AI_DAILY_LIMIT=50
AI_HOURLY_LIMIT=10

# Vercel KV (Redis)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_api_url
KV_REST_API_TOKEN=your_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_readonly_token
```

### Как получить KV переменные

1. Vercel Dashboard → Storage
2. Create Database → KV (Redis)
3. Скопировать все переменные
4. Добавить в Environment Variables

### Как получить Sentry DSN

1. Создать аккаунт: https://sentry.io
2. Создать проект: Felix Bot
3. Скопировать DSN
4. Добавить в Environment Variables

---

## 🚀 Доступные команды

### Разработка

```powershell
# Локальный dev сервер
npm run dev

# Тесты
npm test

# Тесты с coverage
npm run test:coverage
```

### Деплой

```powershell
# Production деплой
npm run deploy

# Preview деплой
npm run deploy:preview

# Или напрямую
vercel --prod
```

### Vercel управление

```powershell
# Настройка проекта
npm run vercel:setup

# Связать проект
npm run vercel:link

# Список Environment Variables
npm run vercel:env

# Логи
npm run vercel:logs

# Информация о проекте
npm run vercel:inspect
```

### Миграции БД

```powershell
# Создать миграцию
npm run migrate:create add-new-column

# Применить миграции
npm run migrate:up

# Откатить миграцию
npm run migrate:down

# Статус миграций
npm run migrate:status
```

---

## 🔄 Автоматический workflow

### После настройки

```
Push в GitHub (main)
    ↓
GitHub Actions запускаются
    ↓
Тесты проходят
    ↓
Vercel автоматически деплоит
    ↓
Миграции применяются
    ↓
Smoke тесты
    ↓
Уведомление в Telegram
    ↓
✅ Готово!
```

### Время

- Push → Deploy: ~2-3 минуты
- Build time: ~1 минута
- Deploy time: ~30 секунд

---

## 📊 Мониторинг

### Vercel Dashboard

- **Deployments** - История деплоев
- **Analytics** - Метрики и аналитика
- **Logs** - Логи в реальном времени
- **Settings** - Настройки

URL: https://vercel.com/dashboard

### Sentry Dashboard

- **Issues** - Ошибки
- **Performance** - Производительность
- **Releases** - Релизы

URL: https://sentry.io

### GitHub Actions

- **Actions** - Workflow runs
- **Logs** - Логи каждого job

URL: https://github.com/nikolanikola202630-star/Felix2.0/actions

---

## ✅ Проверка после деплоя

### 1. Vercel Dashboard

- [ ] Deployment успешен
- [ ] Логи без ошибок
- [ ] Environment Variables настроены

### 2. Telegram Bot

- [ ] /start работает
- [ ] /ask работает
- [ ] /limits показывает лимиты

### 3. Mini App

- [ ] Открывается
- [ ] Курсы загружаются
- [ ] Партнеры загружаются

### 4. Мониторинг

- [ ] Sentry получает события
- [ ] Vercel Analytics работает
- [ ] GitHub Actions прошли

---

## 🛠️ Troubleshooting

### Ошибка: "Vercel CLI not found"

```powershell
npm install -g vercel
```

### Ошибка: "Not authorized"

```powershell
vercel login
```

### Ошибка: "Project not linked"

```powershell
vercel link
```

### Ошибка: "Environment variables missing"

1. Vercel Dashboard → Settings → Environment Variables
2. Добавить все переменные
3. Redeploy: `vercel --prod --force`

### Ошибка: "Build failed"

1. Проверить логи: `vercel logs`
2. Проверить зависимости: `npm install`
3. Проверить тесты: `npm test`

---

## 📚 Документация

- **VERCEL-AUTO-DEPLOY.md** - Полная документация
- **ГОТОВО-ДЕПЛОЙ.md** - Чеклист деплоя
- **CHECKLIST.md** - Общий чеклист
- **АВТОНОМНАЯ-СИСТЕМА.md** - Автоматизация

---

## 🎯 Следующие шаги

### После первого деплоя

1. **Проверить работу** (5 минут)
   - Telegram Bot
   - Mini App
   - Мониторинг

2. **Настроить алерты** (10 минут)
   - Sentry алерты
   - Vercel алерты
   - GitHub алерты

3. **Оптимизировать** (30 минут)
   - Проверить Performance
   - Добавить больше тестов
   - Настроить кэширование

---

## 💡 Полезные ссылки

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Sentry Dashboard: https://sentry.io
- GitHub Actions: https://github.com/nikolanikola202630-star/Felix2.0/actions

---

**Версия:** 7.1.0  
**Дата:** 02.03.2026  
**Время настройки:** ~5 минут

---

# 🚀 ЗАПУСТИТЬ СЕЙЧАС!

```powershell
.\setup-vercel.ps1
```

Или

```powershell
npm run vercel:setup
```

**После настройки каждый push автоматически деплоится!** 🎉
