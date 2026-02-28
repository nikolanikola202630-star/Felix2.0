# Спецификация: Telegram Smart Assistant Bot

## 🆕 Что нового?

**Версия 2.0** - Добавлена полная автономность обновлений!

👉 [Читать WHATS-NEW.md](./WHATS-NEW.md) - Все изменения и новые возможности

## 🚀 Готово к деплою!

**90% завершено!** Все основные credentials настроены.

👉 [Читать READY-TO-DEPLOY.md](./READY-TO-DEPLOY.md) - Финальные шаги и первый деплой

## Обзор проекта

Telegram-бот "Умный ассистент" с Mini App интерфейсом, предоставляющий два основных режима работы:

1. **Конспектирование** - запись голоса с последующей расшифровкой (STT через Groq Whisper-large-v3), обработкой через LLM (Groq llama-3.3-70b-versatile) и озвучкой результата (TTS). Поддержка экспорта в различные форматы (PDF, Google Docs, Google Sheets, Markdown, DOCX).
2. **Диалоговый помощник** - интерактивное общение с AI через текст или голос

**Архитектурные особенности:**
- Асинхронная обработка длинных аудио через Redis Queue + Pterodactyl воркеры
- Serverless API на Vercel (60 сек timeout)
- Prisma Client Python для типобезопасной работы с PostgreSQL
- OAuth 2.0 для интеграции с Google Workspace

## Быстрый старт

🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Настройка автоматического деплоя за 10 минут

## Структура спецификации

### 📐 [design.md](./design.md)
Техническое проектирование системы:
- Архитектура и компоненты
- Sequence диаграммы основных процессов
- Интерфейсы компонентов
- Модели данных
- Correctness properties
- Обработка ошибок
- Стратегия тестирования
- Производительность и безопасность
- Зависимости и технологический стек

### 📋 [requirements.md](./requirements.md)
Функциональные и нефункциональные требования:
- 20 функциональных требований (FR-1 до FR-20)
  - Включая экспорт в PDF, Google Docs, Google Sheets
  - OAuth 2.0 авторизация для Google интеграций
- 11 нефункциональных требований (NFR-1 до NFR-11)
  - Включая безопасность OAuth и шифрование токенов
- Технические ограничения (Vercel, Groq API, Google APIs)
- Предположения и зависимости
- Метрики успеха
- Out of scope для MVP

### ✅ [tasks.md](./tasks.md)
Детальный план разработки:
- 27 основных секций задач
- От инфраструктуры до развертывания
- Backend (Python FastAPI)
- Frontend (React Mini App)
- Тестирование и документация
- Мониторинг и безопасность

### 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md)
Руководство по автоматическому деплою:
- Настройка Vercel для Frontend и Backend
- GitHub Actions CI/CD pipeline
- Автоматическая генерация Prisma Client
- Preview деплои для Pull Requests
- Production деплой при merge в main
- Мониторинг, логи и rollback
- Troubleshooting и best practices

### ⚡ [QUICKSTART.md](./QUICKSTART.md)
Быстрый старт за 10 минут:
- Установка Vercel CLI
- Связывание проекта с Vercel
- Настройка GitHub Secrets
- Первый автоматический деплой
- Проверка работоспособности

### ✅ [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
Чеклист перед деплоем:
- Pre-deployment проверки
- Конфигурация и зависимости
- Переменные окружения
- Безопасность и мониторинг
- Rollback процедура
- Post-deployment мониторинг

### 📁 [examples/](./examples/)
Готовые конфигурационные файлы:
- GitHub Actions workflows (deploy.yml, preview.yml)
- Vercel конфигурации (frontend, backend)
- Пример FastAPI с Mangum адаптером
- .env.example с переменными окружения
- admin-panel-config.json - примеры конфигураций для админ-панели

### 🔄 [AUTONOMOUS-UPDATES.md](./AUTONOMOUS-UPDATES.md)
Архитектура автономных обновлений:
- CI/CD для автоматического деплоя
- Динамическая конфигурация через БД
- Feature Flags с A/B тестированием
- Автоматические миграции с бэкапами
- Healthcheck и самовосстановление
- Dependabot для автообновления зависимостей
- Secrets Manager с ротацией ключей
- WebSocket для live UI updates

### 📊 [AUTONOMOUS-ARCHITECTURE.md](./AUTONOMOUS-ARCHITECTURE.md)
Визуальные схемы автономности:
- Mermaid диаграммы всех уровней
- Sequence диаграммы процессов
- Flow диаграммы деплоя
- Схемы мониторинга и алертов

## Ключевые технологии

**Backend:**
- Python FastAPI на Vercel (serverless functions)
- PostgreSQL с Prisma Client Python (ORM)
- Redis Queue (RQ) для асинхронной обработки
- Pterodactyl для Python воркеров (тяжелые задачи)
- python-telegram-bot

**Frontend:**
- React / Vue / Svelte на Vercel (static hosting)
- TypeScript
- Telegram Mini Apps SDK

**AI Services:**
- Groq API (официальный Python SDK)
  - Whisper-large-v3 (STT) - очень низкая задержка
  - llama-3.3-70b-versatile (LLM)
  - TTS

**Export & Integrations:**
- fpdf2 (генерация PDF)
- python-docx (генерация DOCX)
- Google Docs API (экспорт конспектов)
- Google Sheets API (экспорт структурированных данных)
- Google OAuth 2.0 (авторизация)

**Storage:**
- S3-compatible storage или Supabase Storage (аудиофайлы)

## Этапы разработки

- **MVP**: 4-6 недель - базовый функционал конспектирования и диалога, экспорт в TXT/Markdown
- **v1.0**: +6-8 недель - полные настройки, история, подписки, экспорт в PDF/DOCX/Google Docs/Sheets
- **v2.0**: +8-12 недель - диаризация, расширенные интеграции с Google Workspace, Notion, расширенные функции

## Workflow

Спецификация создана по методологии **Design-First**:
1. ✅ Техническое проектирование (design.md)
2. ✅ Извлечение требований (requirements.md)
3. ✅ Создание задач (tasks.md)
4. ✅ Руководство по деплою (DEPLOYMENT.md)

## 🚀 Deployment & DevOps

### 📚 Документация по деплою

- **[QUICKSTART.md](./QUICKSTART.md)** - Быстрый старт: автоматический деплой за 10 минут
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Полное руководство по настройке автоматического деплоя на Vercel
- **[DEPLOYMENT-FLOW.md](./DEPLOYMENT-FLOW.md)** - Визуальные схемы и flow диаграммы деплоя
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Чеклист для проверки готовности к деплою

### 📁 Примеры конфигураций

- **[examples/](./examples/)** - Готовые конфигурационные файлы:
  - `vercel.json` - конфигурация Vercel
  - `github-workflow.yml` - GitHub Actions для CI/CD
  - `backend-main.py` - пример FastAPI с Mangum адаптером
  - `.env.example` - шаблон переменных окружения

### 🎯 Быстрый старт деплоя

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Логин и подключение проекта
vercel login
vercel link

# 3. Настройте переменные окружения
vercel env add DATABASE_URL production
vercel env add GROQ_API_KEY production
vercel env add TELEGRAM_BOT_TOKEN production

# 4. Первый деплой
git push origin main  # Автоматический деплой через GitHub Actions
```

Подробнее: [QUICKSTART.md](./QUICKSTART.md)

## Метаданные

- **Spec ID**: 07af11e9-e552-4a3c-a80e-99274875c9e1
- **Workflow Type**: design-first
- **Spec Type**: feature
- **Feature Name**: telegram-smart-assistant-bot
- **Дата создания**: 2024
- **Deployment**: Vercel (Serverless + Static) + Pterodactyl (Workers)
