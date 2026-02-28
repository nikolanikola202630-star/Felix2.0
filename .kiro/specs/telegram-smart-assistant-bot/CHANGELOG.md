# Changelog: Telegram Smart Assistant Bot

## Обновление от 2024 - Полная автономность обновлений

### Новая функциональность: Autonomous Updates

**Что добавлено:**
- ✅ Автоматический деплой через GitHub Actions при пуше в main
- ✅ Динамическая конфигурация через БД (изменение поведения без перезапуска)
- ✅ Feature Flags с A/B тестированием
- ✅ Автоматические миграции БД с бэкапами
- ✅ Healthcheck и самовосстановление воркеров
- ✅ Dependabot для автообновления зависимостей
- ✅ Secrets Manager с автоматической ротацией ключей
- ✅ WebSocket для live UI updates без перезагрузки

**Документация:**
- Создан [AUTONOMOUS-UPDATES.md](./AUTONOMOUS-UPDATES.md) с полной архитектурой

## Обновление от 2024 - Технологический стек и функциональность экспорта

### Основные изменения

#### 1. Замена технологического стека

**AI Services (OpenAI → Groq):**
- ❌ OpenAI Whisper API → ✅ Groq Whisper-large-v3 (STT)
- ❌ OpenAI GPT-4 → ✅ Groq llama-3.3-70b-versatile (LLM)
- ❌ OpenAI TTS / Silero → ✅ Groq TTS
- **Преимущество**: Очень низкая задержка, официальный Python SDK

**ORM (SQLAlchemy → Prisma):**
- ❌ SQLAlchemy → ✅ Prisma Client Python
- **Преимущества**: Типобезопасные запросы, автогенерация клиента, встроенные миграции
- **Требование**: Node.js для генерации клиента (в CI/CD)

**Хостинг (Traditional → Serverless):**
- ❌ Traditional server deployment → ✅ Vercel (serverless functions + static hosting)
- **Ограничения**: 60 сек timeout, 250 MB размер пакета
- **Решение**: Делегирование тяжелых задач воркерам

**Воркеры (Celery → Redis Queue + Pterodactyl):**
- ❌ Celery → ✅ Redis Queue (RQ)
- ❌ Self-managed workers → ✅ Pterodactyl (панель управления)
- **Преимущества**: Обработка длинных аудио без ограничений, мониторинг через панель

**Storage:**
- ❌ Local filesystem → ✅ S3-compatible storage / Supabase Storage
- **Причина**: Serverless архитектура требует внешнего хранилища

#### 2. Новая функциональность - Экспорт конспектов

**Базовые форматы:**
- ✅ Plain text (.txt)
- ✅ Markdown (.md)
- ✅ PDF с форматированием (fpdf2)
- ✅ DOCX (python-docx)

**Google Workspace интеграция:**
- ✅ Google Docs (с форматированием)
- ✅ Google Sheets (для структурированных данных: action items, глоссарий)
- ✅ OAuth 2.0 авторизация (один раз на пользователя)
- ✅ Безопасное хранение refresh tokens (шифрование AES-256)
- ✅ Автоматическое обновление access tokens

#### 3. Архитектурные изменения

**Асинхронная обработка длинных аудио:**

Проблема: Vercel Functions имеют лимит 60 секунд, лекции на час могут не уложиться.

Решение:
1. Mini App → FastAPI на Vercel → сохранение в S3/Supabase Storage
2. Создание задачи в Redis Queue (RQ)
3. Немедленный возврат task_id пользователю
4. Воркер на Pterodactyl забирает задачу:
   - Скачивает аудио из хранилища
   - STT через Groq Whisper
   - LLM через Groq Chat
   - Генерация PDF/экспорт
   - Отправка через Telegram Bot API
5. Пользователь получает уведомление в чат

**Итоговая архитектура:**
- Mini App (frontend): React/Vue → Vercel (static)
- API (легкие запросы): FastAPI → Vercel (serverless)
- База данных: PostgreSQL (отдельный сервер / Managed)
- ORM: Prisma Client Python
- Очередь задач: Redis + RQ (отдельный сервер)
- Тяжелые воркеры: Python → Pterodactyl
- Нейросеть: Groq API (Whisper + Llama)
- Файловое хранилище: S3 / Supabase Storage

#### 4. Обновления моделей данных

**User модель:**
- ✅ `google_refresh_token: str` - зашифрованный refresh token
- ✅ `google_token_expires_at: datetime` - срок действия токена

**NotesHistory модель:**
- ✅ `google_doc_id: str` - ID документа в Google Docs
- ✅ `google_sheet_id: str` - ID таблицы в Google Sheets

#### 5. Новые компоненты

**Export Service:**
- Генерация PDF с форматированием (fpdf2)
- OAuth 2.0 авторизация для Google Docs/Sheets
- Безопасное хранение и обновление refresh tokens
- Создание документов в Google Docs с форматированием
- Экспорт структурированных данных в Google Sheets
- Генерация Markdown, DOCX, plain text
- Автоматическое обновление access tokens

**GroqService:**
- Интеграция с Groq API через официальный Python SDK
- Поддержка синхронных и асинхронных вызовов
- Whisper-large-v3 для STT (низкая задержка)
- llama-3.3-70b-versatile для LLM
- Chat completions для диалогов

**GoogleAPIService:**
- Интеграция с Google Docs API
- Интеграция с Google Sheets API
- Управление OAuth токенами

#### 6. Новые требования

**Функциональные:**
- FR-16: Экспорт конспектов в различные форматы
- FR-17: Экспорт в Google Docs
- FR-18: Экспорт в Google Sheets

**Нефункциональные:**
- NFR-10: Безопасность OAuth и шифрование

#### 7. Новые задачи разработки

**Инфраструктура:**
- Настройка Vercel для деплоя
- Настройка Pterodactyl для воркеров
- Настройка Prisma и миграций
- Настройка S3/Supabase Storage

**Backend:**
- Export Service (20 подзадач)
- Интеграция с Groq API
- Интеграция с Google APIs
- OAuth 2.0 flow
- Шифрование/расшифровка токенов

**Frontend:**
- Кнопки экспорта в различные форматы
- OAuth flow для Google (открытие окна авторизации)
- Отображение ссылок на экспортированные документы

**Тестирование:**
- Unit тесты для Export Service
- Unit тесты для OAuth 2.0 flow
- Unit тесты для шифрования токенов
- Integration тесты для Google APIs

**Документация:**
- Инструкция по настройке Google OAuth 2.0
- Инструкция по настройке Prisma
- Руководство по развертыванию на Vercel и Pterodactyl

### Зависимости

**Новые Python пакеты:**
- `groq >= 0.4.0` - официальный Groq SDK
- `prisma >= 0.11.0` - Prisma Client Python
- `rq >= 1.15.0` - Redis Queue
- `fpdf2 >= 2.7.0` - генерация PDF
- `python-docx >= 1.0.0` - генерация DOCX
- `google-api-python-client >= 2.100.0` - Google APIs
- `google-auth >= 2.23.0` - OAuth 2.0
- `google-auth-oauthlib >= 1.1.0`
- `google-auth-httplib2 >= 0.1.1`
- `cryptography >= 41.0.0` - шифрование секретов
- `websockets >= 12.0` - WebSocket для live updates

**Удаленные зависимости:**
- ❌ `celery` - заменен на RQ
- ❌ `sqlalchemy` - заменен на Prisma
- ❌ `openai` - заменен на Groq SDK

**Новые внешние сервисы:**
- Groq API (требуется API key)
- Google Cloud Console (требуется OAuth 2.0 приложение)
- Vercel (требуется аккаунт)
- Pterodactyl (требуется сервер)

### Безопасность

**Новые меры безопасности:**
- Шифрование Google OAuth refresh tokens (AES-256)
- Автоматическое обновление access tokens
- Отзыв токенов при удалении пользователя
- PKCE для OAuth flow
- Валидация redirect_uri
- Безопасное хранение encryption keys

### Roadmap

**MVP (4-6 недель):**
- Базовый функционал конспектирования и диалога
- Экспорт в TXT/Markdown
- Groq API интеграция
- Vercel + Pterodactyl деплой
- Базовая автономность (CI/CD)

**v1.0 (+6-8 недель):**
- Экспорт в PDF/DOCX
- Экспорт в Google Docs/Sheets
- OAuth 2.0 интеграция
- Полные настройки и подписки
- Динамическая конфигурация
- Feature Flags

**v2.0 (+8-12 недель):**
- Диаризация спикеров
- Расширенная интеграция с Google Workspace (Calendar, Drive)
- Интеграция с Notion
- Collaborative features
- Полная автономность (Secrets Manager, WebSocket updates)
- Админ-панель для управления конфигурацией

### Миграция с предыдущей версии

Если вы уже начали разработку по старой спецификации:

1. **База данных**: Создайте миграцию для добавления полей `google_refresh_token`, `google_token_expires_at` в User, `google_doc_id`, `google_sheet_id` в NotesHistory
2. **ORM**: Замените SQLAlchemy на Prisma (требуется переписать запросы)
3. **AI API**: Замените OpenAI SDK на Groq SDK (API совместимы, но требуется обновление кода)
4. **Воркеры**: Замените Celery на Redis Queue (требуется переписать задачи)
5. **Хостинг**: Подготовьте деплой на Vercel (serverless) и Pterodactyl (воркеры)
6. **Storage**: Настройте S3/Supabase Storage вместо локального хранилища

### Контакты и поддержка

Для вопросов по обновленной спецификации обращайтесь к документам:
- [design.md](./design.md) - техническое проектирование
- [requirements.md](./requirements.md) - требования
- [tasks.md](./tasks.md) - план разработки
