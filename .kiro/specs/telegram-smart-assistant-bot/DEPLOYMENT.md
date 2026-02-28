# Deployment Guide: Автоматический деплой на Vercel

## Обзор

Этот проект использует автоматический деплой на Vercel для:
- **Frontend (Mini App)**: React/Vue/Svelte → Vercel Static Hosting
- **Backend (API)**: FastAPI → Vercel Serverless Functions
- **Database**: Supabase PostgreSQL (уже настроен)
- **Workers**: Python воркеры на Pterodactyl (отдельно)

## Архитектура деплоя

```
GitHub Repository
    ↓ (push/PR)
GitHub Actions
    ↓ (build)
Vercel
    ├── Frontend (Static CDN)
    └── Backend (Serverless Functions)
```

## Предварительные требования

1. **GitHub аккаунт** с репозиторием проекта
2. **Vercel аккаунт** (бесплатный tier подходит для старта)
3. **Supabase PostgreSQL** (у вас уже есть)
4. **Groq API Key** (для AI сервисов)
5. **Telegram Bot Token** (от @BotFather)

## Шаг 1: Структура проекта

Создайте следующую структуру:

```
telegram-smart-assistant-bot/
├── frontend/                 # Mini App
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts       # или webpack.config.js
│   └── vercel.json
├── backend/                  # FastAPI API
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── routes/
│   ├── requirements.txt
│   └── vercel.json
├── workers/                  # Pterodactyl воркеры (не на Vercel)
│   ├── tasks.py
│   └── requirements.txt
├── prisma/
│   └── schema.prisma
├── .github/
│   └── workflows/
│       └── deploy.yml
├── vercel.json              # Root конфигурация
└── README.md
```

## Шаг 2: Настройка Vercel проекта

### 2.1 Установка Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Логин в Vercel

```bash
vercel login
```

### 2.3 Связывание проекта

```bash
# В корне проекта
vercel link
```

Выберите:
- Scope: ваш аккаунт
- Link to existing project: No (создать новый)
- Project name: telegram-smart-assistant-bot
- Directory: ./

## Шаг 3: Конфигурация переменных окружения

### 3.1 Через Vercel Dashboard

1. Перейдите на https://vercel.com/dashboard
2. Выберите проект `telegram-smart-assistant-bot`
3. Settings → Environment Variables
4. Добавьте следующие переменные:

**Production Environment:**

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres

# Redis (для очередей)
REDIS_URL=redis://your-redis-host:6379

# Groq API
GROQ_API_KEY=gsk_your_groq_api_key_here

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Google OAuth (для экспорта)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Encryption (для OAuth токенов)
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Storage (Supabase Storage или S3)
STORAGE_URL=https://kzjkkwfrqymtrgjarsag.supabase.co/storage/v1
STORAGE_KEY=your-supabase-anon-key

# CORS (URL вашего Mini App)
FRONTEND_URL=https://telegram-smart-assistant-bot.vercel.app
```

### 3.2 Через Vercel CLI

```bash
# Production
vercel env add DATABASE_URL production
# Вставьте: postgresql://postgres:[YOUR-PASSWORD]@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres

vercel env add GROQ_API_KEY production
# Вставьте ваш Groq API key

vercel env add TELEGRAM_BOT_TOKEN production
# Вставьте ваш Telegram bot token

# Повторите для всех переменных
```

### 3.3 Preview и Development окружения

Для preview деплоев (PR) и локальной разработки:

```bash
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

## Шаг 4: Конфигурационные файлы

### 4.1 Root vercel.json

Создайте в корне проекта:

```json
{
  "version": 2,
  "name": "telegram-smart-assistant-bot",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/api/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### 4.2 Frontend vercel.json

Создайте `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "react",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "https://telegram-smart-assistant-bot.vercel.app/api",
    "VITE_TELEGRAM_BOT_USERNAME": "@your_bot_username"
  }
}
```

### 4.3 Backend vercel.json

Создайте `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/main.py"
    }
  ]
}
```

## Шаг 5: GitHub Actions для автоматического деплоя

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Prisma CLI
        run: npm install -g prisma
      
      - name: Install Python dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Generate Prisma Client
        run: |
          cd backend
          prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
      
      - name: Notify on success
        if: success()
        run: echo "Deployment successful!"
      
      - name: Notify on failure
        if: failure()
        run: echo "Deployment failed!"
```

## Шаг 6: Настройка GitHub Secrets

1. Перейдите в ваш GitHub репозиторий
2. Settings → Secrets and variables → Actions
3. Добавьте следующие secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
```

### Как получить Vercel токены:

```bash
# Получить Vercel token
vercel login
# Перейдите на https://vercel.com/account/tokens
# Создайте новый token

# Получить org ID и project ID
vercel link
# Они будут в .vercel/project.json
cat .vercel/project.json
```

## Шаг 7: Prisma настройка

### 7.1 Создайте prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-py"
  interface = "asyncio"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  user_id               Int       @id
  telegram_username     String?
  first_name            String?
  last_name             String?
  language_code         String?
  subscription_status   String    @default("free")
  subscription_end      DateTime?
  tariff                String?
  google_refresh_token  String?
  google_token_expires_at DateTime?
  created_at            DateTime  @default(now())
  last_active           DateTime  @default(now())
  
  settings              UserSettings?
  notes                 NotesHistory[]
  conversations         ConversationHistory[]
}

model UserSettings {
  user_id                 Int      @id
  conspect_style          String   @default("detailed")
  conspect_structure      String   @default("chronological")
  include_terms           Boolean  @default(true)
  include_dates           Boolean  @default(true)
  include_formulas        Boolean  @default(true)
  max_conspect_length     Int      @default(5000)
  default_language        String   @default("ru")
  dialog_response_length  String   @default("medium")
  dialog_style            String   @default("casual")
  voice_responses_enabled Boolean  @default(false)
  context_messages_count  Int      @default(10)
  tts_voice               String   @default("default")
  tts_speed               Float    @default(1.0)
  updated_at              DateTime @default(now())
  
  user                    User     @relation(fields: [user_id], references: [user_id])
}

model ConversationHistory {
  id          String   @id @default(uuid())
  user_id     Int
  role        String
  message     String
  timestamp   DateTime @default(now())
  tokens_used Int      @default(0)
  
  user        User     @relation(fields: [user_id], references: [user_id])
}

model NotesHistory {
  id                      String   @id @default(uuid())
  user_id                 Int
  title                   String
  original_transcript     String
  text_conspect           String
  audio_file_id           String
  voice_conspect_file_id  String?
  settings_snapshot       Json
  duration_seconds        Int
  created_at              DateTime @default(now())
  tokens_used             Int      @default(0)
  google_doc_id           String?
  google_sheet_id         String?
  
  user                    User     @relation(fields: [user_id], references: [user_id])
}

model TaskStatus {
  task_id       String   @id @default(uuid())
  user_id       Int
  task_type     String
  status        String   @default("queued")
  progress      Int      @default(0)
  result_id     String?
  error_message String?
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())
}
```

### 7.2 Создайте миграцию

```bash
cd backend
prisma migrate dev --name init
```

### 7.3 Примените миграцию на Supabase

```bash
prisma migrate deploy
```

## Шаг 8: Backend адаптация для Vercel

### 8.1 backend/requirements.txt

```txt
fastapi>=0.104.0
mangum>=0.17.0
prisma>=0.11.0
groq>=0.4.0
rq>=1.15.0
redis>=5.0.0
python-telegram-bot>=20.6
fpdf2>=2.7.0
python-docx>=1.0.0
google-api-python-client>=2.100.0
google-auth>=2.23.0
google-auth-oauthlib>=1.1.0
cryptography>=41.0.0
pydantic>=2.4.0
httpx>=0.25.0
python-jose>=3.3.0
```

### 8.2 backend/api/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

app = FastAPI(title="Telegram Smart Assistant API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "API is running"}

@app.get("/api/")
async def root():
    return {"message": "Telegram Smart Assistant API"}

# Импортируйте ваши routes здесь
# from .routes import user, conspect, dialog, export, payment

# Адаптер для Vercel Serverless
handler = Mangum(app)
```

## Шаг 9: Первый деплой

### 9.1 Локальное тестирование

```bash
# Тестирование backend локально
cd backend
vercel dev

# Тестирование frontend локально
cd frontend
npm run dev
```

### 9.2 Деплой на Vercel

```bash
# Production деплой
vercel --prod

# Или просто push в main ветку
git add .
git commit -m "Initial deployment setup"
git push origin main
```

GitHub Actions автоматически запустит деплой!

## Шаг 10: Проверка деплоя

### 10.1 Проверьте статус

1. Перейдите на https://vercel.com/dashboard
2. Выберите проект
3. Проверьте статус деплоя (Building → Ready)

### 10.2 Проверьте endpoints

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Root endpoint
curl https://your-project.vercel.app/api/
```

### 10.3 Проверьте логи

```bash
vercel logs
```

## Шаг 11: Настройка домена (опционально)

### 11.1 Добавление кастомного домена

1. Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен
3. Настройте DNS записи

### 11.2 Автоматический HTTPS

Vercel автоматически выдает SSL сертификат для всех доменов.

## Troubleshooting

### Проблема: Prisma Client не генерируется

**Решение:**
```bash
# Добавьте в package.json (backend)
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Проблема: Timeout 60 секунд

**Решение:** Все длительные задачи должны быть асинхронными через Redis Queue.

```python
# Вместо прямого вызова
result = process_audio(file)  # ❌ Может превысить 60 сек

# Используйте очередь
task_id = queue.enqueue(process_audio, file)  # ✅ Возвращает немедленно
return {"task_id": task_id, "status": "queued"}
```

### Проблема: Большой размер пакета

**Решение:** Оптимизируйте зависимости

```txt
# Используйте только необходимые пакеты
# Тяжелые библиотеки (numpy, pandas) только на воркерах
```

### Проблема: CORS ошибки

**Решение:** Проверьте FRONTEND_URL в переменных окружения

```python
allow_origins=[os.getenv("FRONTEND_URL", "*")]
```

## Мониторинг

### Vercel Analytics

Автоматически доступны:
- Request count
- Response time
- Error rate
- Bandwidth usage

### Логирование

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Processing request")
```

Логи доступны через:
```bash
vercel logs --follow
```

## Rollback

### Откат на предыдущую версию

1. Vercel Dashboard → Deployments
2. Выберите предыдущий деплой
3. Нажмите "Promote to Production"

Или через CLI:
```bash
vercel rollback
```

## Следующие шаги

1. ✅ Настроить автоматический деплой
2. ✅ Настроить переменные окружения
3. ✅ Создать Prisma схему и миграции
4. ⏭️ Настроить Pterodactyl для воркеров
5. ⏭️ Настроить Redis для очередей
6. ⏭️ Интегрировать Groq API
7. ⏭️ Настроить Telegram Bot

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Prisma Documentation](https://www.prisma.io/docs)
- [FastAPI on Vercel](https://vercel.com/guides/using-fastapi-with-vercel)
- [Supabase Documentation](https://supabase.com/docs)

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `vercel logs`
2. Проверьте переменные окружения
3. Проверьте GitHub Actions статус
4. Обратитесь к документации Vercel
