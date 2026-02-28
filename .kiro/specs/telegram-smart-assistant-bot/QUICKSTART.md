# Quick Start: Автоматический деплой за 10 минут

## Быстрая настройка автоматического деплоя

### Шаг 1: Установка (2 минуты)

```bash
# Установите Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login
```

### Шаг 2: Подключение проекта (1 минута)

```bash
# В корне вашего проекта
vercel link

# Выберите:
# - Create new project: Yes
# - Project name: telegram-smart-assistant-bot
```

### Шаг 3: Переменные окружения (3 минуты)

```bash
# Добавьте основные переменные
vercel env add DATABASE_URL production
# Вставьте: postgresql://postgres:[YOUR-PASSWORD]@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres

vercel env add GROQ_API_KEY production
# Вставьте ваш Groq API key

vercel env add TELEGRAM_BOT_TOKEN production
# Вставьте ваш Telegram bot token

vercel env add REDIS_URL production
# Вставьте ваш Redis URL

vercel env add ENCRYPTION_KEY production
# Сгенерируйте: python -c "import secrets; print(secrets.token_hex(32))"
```

### Шаг 4: GitHub Secrets (2 минуты)

1. Получите Vercel токены:
```bash
cat .vercel/project.json
```

2. Перейдите в GitHub: Settings → Secrets → Actions
3. Добавьте:
   - `VERCEL_TOKEN` (получите на https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` (из .vercel/project.json)
   - `VERCEL_PROJECT_ID` (из .vercel/project.json)
   - `DATABASE_URL` (ваш Supabase URL)

### Шаг 5: Первый деплой (2 минуты)

```bash
# Создайте коммит
git add .
git commit -m "Setup automatic deployment"

# Push в main ветку
git push origin main
```

**Готово!** GitHub Actions автоматически задеплоит проект на Vercel.

## Проверка

```bash
# Проверьте статус деплоя
vercel ls

# Проверьте логи
vercel logs

# Откройте в браузере
vercel open
```

## Что дальше?

1. ✅ Автоматический деплой настроен
2. ⏭️ Настройте Prisma миграции (см. DEPLOYMENT.md)
3. ⏭️ Настройте Pterodactyl воркеры
4. ⏭️ Интегрируйте Groq API
5. ⏭️ Настройте Telegram Bot

## Полезные команды

```bash
# Локальная разработка
vercel dev

# Production деплой вручную
vercel --prod

# Просмотр логов
vercel logs --follow

# Откат на предыдущую версию
vercel rollback

# Список деплоев
vercel ls

# Удалить деплой
vercel rm [deployment-url]
```

## Troubleshooting

**Проблема:** Деплой не запускается автоматически

**Решение:**
1. Проверьте GitHub Actions: Actions → Deploy to Vercel
2. Проверьте GitHub Secrets
3. Проверьте `.github/workflows/deploy.yml`

**Проблема:** Ошибка "Prisma Client not generated"

**Решение:**
```bash
cd backend
prisma generate
git add .
git commit -m "Add Prisma Client"
git push
```

**Проблема:** CORS ошибки

**Решение:**
Добавьте переменную окружения:
```bash
vercel env add FRONTEND_URL production
# Вставьте: https://your-project.vercel.app
```

## Поддержка

- 📖 Полная документация: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🔧 Примеры конфигураций: [examples/](./examples/)
- ✅ Чеклист деплоя: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
