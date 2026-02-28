# Deployment Checklist

## Pre-Deployment

### Аккаунты и сервисы
- [ ] GitHub аккаунт создан
- [ ] Vercel аккаунт создан (https://vercel.com/signup)
- [ ] Supabase PostgreSQL настроен (✅ у вас есть)
- [ ] Redis сервер настроен (Upstash/Redis Cloud)
- [ ] Groq API key получен (https://console.groq.com)
- [ ] Telegram Bot создан (@BotFather)
- [ ] Google Cloud Console проект создан (для OAuth)

### Локальная настройка
- [ ] Node.js 18+ установлен
- [ ] Python 3.11+ установлен
- [ ] Vercel CLI установлен (`npm i -g vercel`)
- [ ] Git репозиторий инициализирован

## Структура проекта

### Файлы конфигурации
- [ ] `vercel.json` в корне проекта
- [ ] `frontend/vercel.json` создан
- [ ] `backend/vercel.json` создан
- [ ] `.github/workflows/deploy.yml` создан
- [ ] `prisma/schema.prisma` создан
- [ ] `backend/requirements.txt` создан
- [ ] `frontend/package.json` создан

### Backend файлы
- [ ] `backend/api/main.py` с Mangum адаптером
- [ ] `backend/api/__init__.py` создан
- [ ] `backend/api/routes/` директория создана
- [ ] `mangum` добавлен в requirements.txt

### Frontend файлы
- [ ] `frontend/src/` директория создана
- [ ] `frontend/public/` директория создана
- [ ] Build скрипты настроены в package.json

## Vercel настройка

### Проект
- [ ] Vercel проект создан (`vercel link`)
- [ ] GitHub репозиторий подключен к Vercel
- [ ] Automatic deployments включены

### Environment Variables (Production)
- [ ] `DATABASE_URL` добавлен
- [ ] `REDIS_URL` добавлен
- [ ] `GROQ_API_KEY` добавлен
- [ ] `TELEGRAM_BOT_TOKEN` добавлен
- [ ] `GOOGLE_CLIENT_ID` добавлен
- [ ] `GOOGLE_CLIENT_SECRET` добавлен
- [ ] `ENCRYPTION_KEY` добавлен (32 байта hex)
- [ ] `STORAGE_URL` добавлен (Supabase Storage)
- [ ] `STORAGE_KEY` добавлен
- [ ] `FRONTEND_URL` добавлен

### Environment Variables (Preview)
- [ ] Все переменные скопированы для preview окружения

### Environment Variables (Development)
- [ ] Все переменные скопированы для development окружения

## GitHub настройка

### Repository Secrets
- [ ] `VERCEL_TOKEN` добавлен
- [ ] `VERCEL_ORG_ID` добавлен
- [ ] `VERCEL_PROJECT_ID` добавлен
- [ ] `DATABASE_URL` добавлен

### GitHub Actions
- [ ] Workflow файл создан (`.github/workflows/deploy.yml`)
- [ ] Workflow тестирован (push в ветку)
- [ ] Actions включены в репозитории

## Database (Prisma + Supabase)

### Prisma настройка
- [ ] `prisma/schema.prisma` создан
- [ ] Модели данных определены (User, UserSettings, etc.)
- [ ] Prisma Client Python установлен
- [ ] `prisma generate` выполнен локально

### Миграции
- [ ] Первая миграция создана (`prisma migrate dev --name init`)
- [ ] Миграция применена на Supabase (`prisma migrate deploy`)
- [ ] Таблицы созданы в Supabase (проверить в Dashboard)

### Supabase настройка
- [ ] Connection string скопирован
- [ ] Connection pooling включен (если нужно)
- [ ] Row Level Security настроен (опционально)

## Redis настройка

### Redis сервер
- [ ] Redis сервер запущен (Upstash/Redis Cloud/Self-hosted)
- [ ] Redis URL получен
- [ ] Подключение протестировано

### Redis Queue
- [ ] RQ установлен в requirements.txt
- [ ] Worker скрипты созданы (workers/tasks.py)

## External Services

### Groq API
- [ ] API key получен
- [ ] Квоты проверены
- [ ] Тестовый запрос выполнен

### Telegram Bot
- [ ] Bot создан через @BotFather
- [ ] Bot token получен
- [ ] Bot username записан
- [ ] Webhook URL настроен (после деплоя)

### Google OAuth
- [ ] Google Cloud Console проект создан
- [ ] OAuth 2.0 credentials созданы
- [ ] Redirect URIs настроены
- [ ] Client ID и Secret получены

## Первый деплой

### Pre-deployment тесты
- [ ] Локальный backend запускается (`vercel dev`)
- [ ] Локальный frontend запускается (`npm run dev`)
- [ ] Prisma Client генерируется без ошибок
- [ ] Все импорты работают

### Deployment
- [ ] Код закоммичен в Git
- [ ] Push в main ветку выполнен
- [ ] GitHub Actions workflow запустился
- [ ] Vercel build успешен
- [ ] Deployment статус "Ready"

### Post-deployment проверки
- [ ] Frontend доступен (https://your-project.vercel.app)
- [ ] Backend API доступен (https://your-project.vercel.app/api)
- [ ] Health endpoint работает (`/api/health`)
- [ ] CORS настроен корректно
- [ ] Database подключение работает

## Мониторинг

### Vercel Dashboard
- [ ] Deployments отображаются
- [ ] Логи доступны
- [ ] Analytics работает
- [ ] Alerts настроены (опционально)

### Логирование
- [ ] Backend логи проверены (`vercel logs`)
- [ ] Ошибки отсутствуют
- [ ] Performance метрики в норме

## Pterodactyl Workers (отдельно)

### Сервер
- [ ] Pterodactyl установлен
- [ ] Python воркеры развернуты
- [ ] Redis подключение настроено
- [ ] Workers запущены

### Мониторинг
- [ ] Workers статус проверен
- [ ] Логи workers доступны
- [ ] Задачи обрабатываются

## Security

### Secrets
- [ ] Все API keys в переменных окружения (не в коде)
- [ ] `.env` файлы в `.gitignore`
- [ ] Encryption key сгенерирован безопасно

### HTTPS
- [ ] Все endpoints используют HTTPS
- [ ] SSL сертификаты валидны (автоматически через Vercel)

### CORS
- [ ] CORS настроен только для вашего домена
- [ ] Wildcard (*) не используется в production

## Documentation

### README
- [ ] README.md обновлен
- [ ] Инструкции по установке добавлены
- [ ] Ссылки на документацию добавлены

### API Documentation
- [ ] OpenAPI/Swagger настроен (опционально)
- [ ] Endpoints документированы

## Final Checks

### Functionality
- [ ] Регистрация пользователя работает
- [ ] Запись аудио работает
- [ ] Обработка конспектов работает (через workers)
- [ ] Диалог работает
- [ ] Экспорт работает (если реализован)

### Performance
- [ ] API response time < 500ms
- [ ] Frontend загружается < 3 сек
- [ ] No memory leaks

### User Experience
- [ ] Mini App открывается в Telegram
- [ ] Навигация работает
- [ ] Ошибки отображаются корректно
- [ ] Loading states работают

## Rollback Plan

### Подготовка
- [ ] Предыдущий деплой сохранен
- [ ] Rollback процедура документирована
- [ ] Команда знает как откатить (`vercel rollback`)

## Post-Launch

### Мониторинг
- [ ] Первые 24 часа мониторинг активен
- [ ] Логи проверяются регулярно
- [ ] Пользовательский feedback собирается

### Optimization
- [ ] Performance bottlenecks идентифицированы
- [ ] Optimization план создан
- [ ] A/B тесты настроены (опционально)

---

## Статус: ⬜ Not Started | 🟡 In Progress | ✅ Completed

**Overall Progress:** ___/100 items completed

**Last Updated:** [DATE]
**Deployed By:** [NAME]
**Deployment URL:** https://your-project.vercel.app
