# Examples: Конфигурационные файлы

Эта директория содержит примеры конфигурационных файлов для автоматического деплоя на Vercel.

## Файлы

### 1. vercel.json
Основная конфигурация Vercel для монорепозитория.

**Использование:**
```bash
cp examples/vercel.json ./vercel.json
# Отредактируйте под ваш проект
```

### 2. github-workflow.yml
GitHub Actions workflow для автоматического деплоя.

**Использование:**
```bash
mkdir -p .github/workflows
cp examples/github-workflow.yml .github/workflows/deploy.yml
```

### 3. backend-main.py
Пример FastAPI приложения с Mangum адаптером для Vercel.

**Использование:**
```bash
mkdir -p backend/api
cp examples/backend-main.py backend/api/main.py
# Добавьте ваши routes
```

### 4. prisma-schema.prisma
Пример Prisma схемы для PostgreSQL.

**Использование:**
```bash
mkdir -p prisma
cp examples/prisma-schema.prisma prisma/schema.prisma
# Отредактируйте модели под ваши нужды
```

### 5. requirements.txt
Пример зависимостей Python для backend.

**Использование:**
```bash
cp examples/requirements.txt backend/requirements.txt
```

### 6. frontend-package.json
Пример package.json для React/Vue/Svelte frontend.

**Использование:**
```bash
cp examples/frontend-package.json frontend/package.json
# Установите зависимости: npm install
```

### 7. .env.example
Пример файла с переменными окружения.

**Использование:**
```bash
cp examples/.env.example .env.local
# Заполните реальными значениями
```

### 8. admin-panel-config.json
Примеры конфигураций для динамической настройки бота и Feature Flags.

**Использование:**
```bash
# Используйте как шаблон для начальных конфигураций
# Загрузите в БД через админ-панель или скрипт
python scripts/load_initial_config.py examples/admin-panel-config.json
```

## Быстрый старт

```bash
# 1. Скопируйте все примеры
./examples/copy-all.sh

# 2. Отредактируйте конфигурации
# - vercel.json: укажите ваши пути
# - .env.local: заполните секреты
# - prisma/schema.prisma: настройте модели

# 3. Установите зависимости
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# 4. Сгенерируйте Prisma Client
cd backend && prisma generate

# 5. Деплой
vercel --prod
```

## Структура после копирования

```
telegram-smart-assistant-bot/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ← из github-workflow.yml
├── frontend/
│   ├── package.json            # ← из frontend-package.json
│   └── vercel.json
├── backend/
│   ├── api/
│   │   └── main.py             # ← из backend-main.py
│   ├── requirements.txt        # ← из requirements.txt
│   └── vercel.json
├── prisma/
│   └── schema.prisma           # ← из prisma-schema.prisma
├── vercel.json                 # ← из vercel.json
└── .env.local                  # ← из .env.example
```

## Дополнительные примеры

### Пример Dockerfile для воркеров

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY workers/requirements.txt .
RUN pip install -r requirements.txt

COPY workers/ .

CMD ["python", "worker.py"]
```

### Пример docker-compose.yml для локальной разработки

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  worker:
    build: ./workers
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=${DATABASE_URL}
      - GROQ_API_KEY=${GROQ_API_KEY}
```

## Troubleshooting

### Проблема: Файлы не копируются

**Решение:**
```bash
# Убедитесь, что вы в корне проекта
pwd

# Скопируйте вручную
cp examples/vercel.json ./
```

### Проблема: Prisma не генерируется

**Решение:**
```bash
# Установите Prisma CLI
npm install -g prisma

# Сгенерируйте клиент
cd backend
prisma generate
```

### Проблема: Mangum не найден

**Решение:**
```bash
# Добавьте в requirements.txt
echo "mangum>=0.17.0" >> backend/requirements.txt
pip install -r backend/requirements.txt
```

## Полезные ссылки

- [Vercel Configuration](https://vercel.com/docs/configuration)
- [GitHub Actions](https://docs.github.com/en/actions)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Prisma](https://www.prisma.io/docs)
- [Mangum](https://mangum.io/)
