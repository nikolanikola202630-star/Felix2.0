# 🚀 Vercel Auto-Deploy - Felix Bot v7.1

## 📊 Обзор

Автоматическое развертывание Felix Bot на Vercel с полной интеграцией GitHub, Analytics и мониторинга.

---

## ✅ Что настроено

### 1. Vercel Configuration (vercel.json)
- ✅ Auto-deploy из GitHub
- ✅ Production branch: main
- ✅ Preview deployments для PR
- ✅ Auto-cancellation старых деплоев
- ✅ Оптимизированные функции (1024MB, 10s timeout)

### 2. Vercel Analytics
- ✅ @vercel/analytics установлен
- ✅ Интеграция в Mini App
- ✅ Speed Insights
- ✅ Custom events tracking

### 3. Скрипты автоматизации
- ✅ `setup-vercel.ps1` - PowerShell скрипт
- ✅ `scripts/setup-vercel.js` - Node.js скрипт
- ✅ Автоматическая настройка проекта

---

## 🚀 Быстрый старт

### Способ 1: PowerShell скрипт (Windows)

```powershell
.\setup-vercel.ps1
```

Скрипт автоматически:
1. Проверит Vercel CLI
2. Авторизует в Vercel
3. Свяжет проект
4. Настроит Environment Variables
5. Откроет Dashboard для GitHub Integration
6. Выполнит деплой

**Время:** 5-10 минут

### Способ 2: Node.js скрипт (Cross-platform)

```bash
node scripts/setup-vercel.js
```

### Способ 3: Ручная настройка

См. раздел "Ручная настройка" ниже.

---

## 📦 Предварительные требования

### 1. Vercel CLI

```bash
# Установка
npm install -g vercel

# Проверка
vercel --version
```

### 2. Авторизация

```bash
vercel login
```

### 3. GitHub Repository

- ✅ Код запушен в GitHub
- ✅ Репозиторий: nikolanikola202630-star/Felix2.0
- ✅ Branch: main

---

## 🔧 Ручная настройка

### Шаг 1: Связать проект с Vercel

```bash
vercel link
```

Выберите:
- Scope: Ваш аккаунт/команда
- Link to existing project: Yes (если проект уже создан)
- Project name: Felix2.0

### Шаг 2: Настроить Environment Variables

#### Через Vercel Dashboard

1. Откройте: https://vercel.com/dashboard
2. Выберите проект Felix2.0
3. Settings → Environment Variables
4. Добавьте переменные:

**Существующие:**
```env
TELEGRAM_BOT_TOKEN=your_token
GROQ_API_KEY=your_key
DATABASE_URL=your_db_url
ADMIN_ID=your_admin_id
MINIAPP_URL=your_miniapp_url
```

**Новые в v7.1:**
```env
SENTRY_DSN=your_sentry_dsn
AI_DAILY_LIMIT=50
AI_HOURLY_LIMIT=10
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_api_url
KV_REST_API_TOKEN=your_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_readonly_token
```

#### Через CLI

```bash
# Добавить переменную
vercel env add SENTRY_DSN

# Список переменных
vercel env ls

# Удалить переменную
vercel env rm VARIABLE_NAME
```

### Шаг 3: Настроить GitHub Integration

1. Vercel Dashboard → Settings → Git
2. Убедитесь, что:
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: Enabled
   - ✅ Preview Deployments: Enabled
   - ✅ Deployment Protection: Enabled (опционально)

### Шаг 4: Первый деплой

```bash
# Production деплой
vercel --prod

# Preview деплой
vercel
```

---

## 🔄 Автоматический workflow

### После настройки

1. **Push в main** → Автоматический production deploy
2. **Push в dev** → Автоматический preview deploy
3. **Pull Request** → Автоматический preview deploy
4. **Merge PR** → Автоматический production deploy

### GitHub Actions Integration

После push в GitHub автоматически запускаются:
- ✅ Tests (`.github/workflows/test.yml`)
- ✅ CI/CD (`.github/workflows/ci-cd-full.yml`)
- ✅ Vercel Deploy (автоматически)

---

## 📊 Vercel Analytics

### Что отслеживается

**Автоматически:**
- Page views
- User sessions
- Performance metrics
- Web Vitals (LCP, FID, CLS)

**Custom events:**
- Команды бота
- AI запросы
- Cache hit/miss
- Ошибки
- API вызовы

### Использование в коде

```javascript
import { trackEvent, trackCommand, trackAIRequest } from './lib/analytics.js';

// Отслеживание команды
trackCommand('/start', userId);

// Отслеживание AI запроса
trackAIRequest(userId, tokens, responseTime);

// Кастомное событие
trackEvent('custom_event', {
  userId,
  action: 'something',
});
```

### Dashboard

Просмотр аналитики:
- Vercel Dashboard → Analytics
- Real-time данные
- Исторические данные
- Custom events

---

## 🔍 Мониторинг деплоя

### Vercel Dashboard

1. **Deployments** - История деплоев
2. **Logs** - Логи в реальном времени
3. **Analytics** - Метрики и аналитика
4. **Settings** - Настройки проекта

### CLI

```bash
# Список деплоев
vercel ls

# Логи последнего деплоя
vercel logs

# Логи конкретного деплоя
vercel logs <deployment-url>

# Статус проекта
vercel inspect
```

### GitHub Actions

- GitHub → Actions tab
- Просмотр workflow runs
- Логи каждого job

---

## 🛠️ Troubleshooting

### Проблема: Deployment failed

**Решение:**
1. Проверить логи: `vercel logs`
2. Проверить Environment Variables
3. Проверить GitHub Actions
4. Проверить Sentry для ошибок

### Проблема: Environment Variables не работают

**Решение:**
1. Vercel Dashboard → Settings → Environment Variables
2. Убедиться, что переменные добавлены для Production
3. Redeploy: `vercel --prod --force`

### Проблема: GitHub Integration не работает

**Решение:**
1. Vercel Dashboard → Settings → Git
2. Reconnect GitHub
3. Проверить права доступа к репозиторию

### Проблема: Analytics не показывает данные

**Решение:**
1. Проверить, что @vercel/analytics установлен
2. Проверить интеграцию в коде
3. Подождать 5-10 минут (задержка обработки)
4. Проверить Vercel Dashboard → Analytics

---

## 📈 Оптимизация

### Build Performance

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./"
}
```

### Function Configuration

```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Caching

- Vercel автоматически кэширует статические файлы
- API responses кэшируются через Vercel KV
- CDN кэширование для Mini App

---

## 🔐 Безопасность

### Environment Variables

- ✅ Никогда не коммитить в Git
- ✅ Использовать .env.local локально
- ✅ Настраивать через Vercel Dashboard
- ✅ Разные значения для Production/Preview

### Deployment Protection

1. Vercel Dashboard → Settings → Deployment Protection
2. Включить для Production
3. Настроить правила доступа

### Secrets Management

```bash
# Добавить секрет
vercel env add SECRET_NAME production

# Секреты не видны в логах
# Секреты не доступны в preview deployments (опционально)
```

---

## 📊 Метрики успеха

### Performance

- ✅ Build time <2 минут
- ✅ Deploy time <1 минуты
- ✅ Cold start <500ms
- ✅ Response time <300ms

### Reliability

- ✅ Uptime >99.9%
- ✅ Error rate <1%
- ✅ Successful deploys >95%

### Analytics

- ✅ Page views tracking
- ✅ User sessions tracking
- ✅ Custom events tracking
- ✅ Performance monitoring

---

## 🎯 Чеклист настройки

- [ ] Vercel CLI установлен
- [ ] Авторизован в Vercel
- [ ] Проект связан с Vercel
- [ ] Environment Variables настроены
- [ ] GitHub Integration настроен
- [ ] Первый деплой выполнен
- [ ] Webhook работает
- [ ] Analytics работает
- [ ] Sentry получает события
- [ ] GitHub Actions работают

---

## 📚 Дополнительные ресурсы

### Документация

- [Vercel Docs](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [GitHub Integration](https://vercel.com/docs/git)

### Наша документация

- `ГОТОВО-ДЕПЛОЙ.md` - Общий чеклист деплоя
- `CHECKLIST.md` - Полный чеклист v7.1
- `АВТОНОМНАЯ-СИСТЕМА.md` - Автоматизация
- `РЕЗЮМЕ.md` - Сводка проекта

---

## 🚀 Следующие шаги

### После первого деплоя

1. **Проверить работу**
   - Telegram Bot → /start
   - Mini App открывается
   - AI отвечает

2. **Настроить мониторинг**
   - Sentry Dashboard
   - Vercel Analytics
   - GitHub Actions

3. **Оптимизировать**
   - Проверить Performance
   - Настроить алерты
   - Добавить больше тестов

### Регулярное обслуживание

- Проверять логи ежедневно
- Мониторить метрики
- Обновлять зависимости
- Проверять Security alerts

---

**Версия:** 7.1.0  
**Дата:** 02.03.2026  
**Статус:** ✅ Готово к автоматическому развертыванию

---

# 🎉 Готово!

После настройки каждый push в main будет автоматически деплоиться на Vercel с полным мониторингом и аналитикой!

**Запустите:** `.\setup-vercel.ps1` или `node scripts/setup-vercel.js`
