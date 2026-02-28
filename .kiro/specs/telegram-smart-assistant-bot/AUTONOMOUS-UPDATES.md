# Autonomous Updates Architecture

## Обзор

Полная автономность в обновлениях означает, что бот может:
- Автоматически обновлять свой код при пуше в репозиторий
- Автоматически применять миграции базы данных без потери данных
- Динамически менять поведение без перезапуска через конфиги в БД
- Самостоятельно восстанавливаться при сбоях
- Автоматически обновлять зависимости и API-ключи

## Трехуровневая архитектура автономности

### Уровень 1: CI/CD - Автоматический деплой кода

Самый базовый уровень. При каждом пуше в main бот автоматически пересобирается и перезапускается.

#### GitHub Actions Workflow

Файл: `.github/workflows/deploy.yml`

```yaml
name: Deploy Bot

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Python dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Install Prisma
        run: |
          pip install prisma
          prisma generate
      
      - name: Run tests
        run: pytest --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy-vercel:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-pterodactyl:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Pterodactyl Workers
        env:
          PTERODACTYL_URL: ${{ secrets.PTERODACTYL_URL }}
          PTERODACTYL_API_KEY: ${{ secrets.PTERODACTYL_API_KEY }}
          SERVER_ID: ${{ secrets.PTERODACTYL_SERVER_ID }}
        run: |
          # Отправляем команду на перезапуск через API Pterodactyl
          curl -X POST \
            -H "Authorization: Bearer $PTERODACTYL_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"command": "cd /app && git pull && pip install -r requirements.txt && prisma migrate deploy && pm2 restart bot"}' \
            "$PTERODACTYL_URL/api/client/servers/$SERVER_ID/command"
```

#### Настройка Pterodactyl API

В Pterodactyl нужно:
1. Включить API в настройках
2. Создать API-ключ с правами на управление сервером
3. Добавить ключ в GitHub Secrets

### Уровень 2: Динамическая конфигурация (Database-driven behavior)

Ключевой момент для автономности. Бот меняет поведение без перезапуска кода.

#### Prisma Schema для конфигурации

Файл: `prisma/schema.prisma` (дополнение)

```prisma
// Динамическая конфигурация бота
model BotConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json     // Может хранить любой JSON
  description String?
  updatedAt   DateTime @updatedAt
}

// Feature Flags для A/B тестирования
model FeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  enabled     Boolean  @default(false)
  rollout     Int?     // процент пользователей (0-100)
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Секреты (зашифрованные API ключи)
model Secret {
  id              String   @id @default(cuid())
  serviceKey      String   @unique // "groq:api_key", "google:client_id"
  encryptedValue  String
  lastRotated     DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### Config Service с кэшированием

Файл: `backend/services/config_service.py`

```python
import json
from redis import Redis
from prisma import Prisma
from typing import Any, Optional
import hashlib

class DynamicConfig:
    def __init__(self):
        self.db = Prisma()
        self.redis = Redis.from_url(REDIS_URL)
        self.cache_ttl = 60  # 1 минута
    
    async def get_config(self, key: str, default: Any = None) -> Any:
        """Получить конфигурацию с кэшированием"""
        # Пробуем взять из кэша
        cached = self.redis.get(f"config:{key}")
        if cached:
            return json.loads(cached)
        
        # Ищем в БД
        config = await self.db.botconfig.find_unique(where={"key": key})
        if config:
            value = config.value
            self.redis.setex(f"config:{key}", self.cache_ttl, json.dumps(value))
            return value
        
        return default
    
    async def set_config(self, key: str, value: Any, description: str = None):
        """Обновить конфигурацию"""
        await self.db.botconfig.upsert(
            where={"key": key},
            data={
                "create": {"key": key, "value": value, "description": description},
                "update": {"value": value, "description": description}
            }
        )
        # Инвалидируем кэш
        self.redis.delete(f"config:{key}")
    
    async def is_feature_enabled(self, feature_name: str, user_id: int = None) -> bool:
        """Проверить включена ли фича (с поддержкой A/B тестирования)"""
        flag = await self.db.featureflag.find_unique(where={"name": feature_name})
        if not flag or not flag.enabled:
            return False
        
        # Если есть rollout, проверяем хеш пользователя
        if flag.rollout and flag.rollout < 100 and user_id:
            user_hash = int(hashlib.md5(f"{user_id}{feature_name}".encode()).hexdigest(), 16) % 100
            return user_hash < flag.rollout
        
        return True

# Глобальный экземпляр
config = DynamicConfig()
```

#### Применение в хендлерах

Файл: `backend/api/conspect.py`

```python
from fastapi import FastAPI, Depends
from services.config_service import config

app = FastAPI()

@app.post("/api/conspect/create")
async def create_conspect(user_id: int, audio: bytes):
    # Проверяем, включена ли новая модель
    if await config.is_feature_enabled("new_groq_model", user_id):
        model = await config.get_config("groq_model_premium", "llama-3.3-70b-versatile")
    else:
        model = await config.get_config("groq_model_default", "llama-3.3-70b-versatile")
    
    # Динамический текст приветствия
    welcome_text = await config.get_config(
        "welcome_message",
        "Привет! Обрабатываю ваше аудио..."
    )
    
    # Используем конфигурацию
    # ...
```

### Уровень 3: Автоматические миграции и самовосстановление

#### Безопасные миграции БД

Файл: `backend/scripts/migrate.py`

```python
import asyncio
from prisma import Prisma
import logging
from datetime import datetime
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_backup():
    """Создать бэкап БД перед миграцией"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backup_{timestamp}.sql"
    
    try:
        subprocess.run([
            "pg_dump",
            "-h", DB_HOST,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", backup_file
        ], check=True)
        logger.info(f"Backup created: {backup_file}")
        return backup_file
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        raise

async def safe_migrate():
    """Безопасное применение миграций"""
    db = Prisma()
    await db.connect()
    
    try:
        # Создаем бэкап
        backup_file = await create_backup()
        logger.info("Starting migrations...")
        
        # Применяем миграции
        result = subprocess.run(
            ["prisma", "migrate", "deploy"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("Migrations completed successfully")
            logger.info(result.stdout)
        else:
            logger.error("Migration failed!")
            logger.error(result.stderr)
            raise Exception("Migration failed")
    
    except Exception as e:
        logger.error(f"Migration error: {e}")
        logger.info("Rolling back from backup...")
        # Восстанавливаем из бэкапа
        subprocess.run([
            "psql",
            "-h", DB_HOST,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", backup_file
        ])
        raise
    
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(safe_migrate())
```

#### Healthcheck и самовосстановление

Файл: `Dockerfile` (для Pterodactyl воркеров)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Установка Prisma
RUN pip install prisma
COPY prisma ./prisma
RUN prisma generate

COPY . .

# Healthcheck каждые 30 секунд
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

# Запуск с автоматическим перезапуском
CMD ["python", "-u", "worker.py"]
```

Файл: `backend/worker.py` (с healthcheck endpoint)

```python
from fastapi import FastAPI
from rq import Worker, Queue
from redis import Redis
import uvicorn
import threading

app = FastAPI()
redis_conn = Redis.from_url(REDIS_URL)

@app.get("/health")
async def health_check():
    """Healthcheck endpoint для Docker"""
    try:
        # Проверяем Redis
        redis_conn.ping()
        # Проверяем БД
        await db.query_raw("SELECT 1")
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}, 503

def run_worker():
    """Запуск RQ worker"""
    queue = Queue(connection=redis_conn)
    worker = Worker([queue], connection=redis_conn)
    worker.work()

def run_api():
    """Запуск healthcheck API"""
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    # Запускаем API в отдельном потоке
    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()
    
    # Запускаем worker в основном потоке
    run_worker()
```

### Уровень 4: Автообновление зависимостей

#### Dependabot для Python

Файл: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Python dependencies
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "python"
    # Автомерж для patch версий
    reviewers:
      - "your-username"
  
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
```

#### Автоматический мерж безопасных обновлений

Файл: `.github/workflows/auto-merge.yml`

```yaml
name: Auto-merge Dependabot PRs

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Check PR
        id: check
        uses: actions/github-script@v6
        with:
          script: |
            const pr = context.payload.pull_request;
            const title = pr.title.toLowerCase();
            
            // Автомерж только для patch и minor версий
            if (title.includes('bump') && !title.includes('major')) {
              return 'true';
            }
            return 'false';
      
      - name: Enable auto-merge
        if: steps.check.outputs.result == 'true'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Уровень 5: Ротация секретов

#### Secrets Manager

Файл: `backend/services/secrets_manager.py`

```python
import os
from cryptography.fernet import Fernet
from prisma import Prisma
from datetime import datetime, timedelta
import httpx

class SecretsManager:
    def __init__(self):
        self.db = Prisma()
        self.key = os.getenv("ENCRYPTION_KEY")
        self.cipher = Fernet(self.key.encode())
    
    async def get_secret(self, service: str, key_name: str) -> str:
        """Получить секрет (с fallback на env)"""
        # Пробуем из переменных окружения
        env_key = os.getenv(f"{service.upper()}_{key_name.upper()}")
        if env_key:
            return env_key
        
        # Ищем в БД
        secret = await self.db.secret.find_unique(
            where={"serviceKey": f"{service}:{key_name}"}
        )
        if secret:
            return self.cipher.decrypt(secret.encryptedValue.encode()).decode()
        
        raise ValueError(f"Secret not found: {service}:{key_name}")
    
    async def rotate_secret(self, service: str, key_name: str, new_value: str):
        """Обновить секрет"""
        encrypted = self.cipher.encrypt(new_value.encode()).decode()
        
        await self.db.secret.upsert(
            where={"serviceKey": f"{service}:{key_name}"},
            data={
                "create": {
                    "serviceKey": f"{service}:{key_name}",
                    "encryptedValue": encrypted,
                    "lastRotated": datetime.now()
                },
                "update": {
                    "encryptedValue": encrypted,
                    "lastRotated": datetime.now()
                }
            }
        )
        
        # Обновляем в Pterodactyl через API
        await self._update_pterodactyl_env(service, key_name, new_value)
    
    async def _update_pterodactyl_env(self, service: str, key_name: str, value: str):
        """Обновить переменную окружения в Pterodactyl"""
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{PTERODACTYL_URL}/api/client/servers/{SERVER_ID}/startup/variable",
                headers={"Authorization": f"Bearer {PTERODACTYL_API_KEY}"},
                json={
                    "key": f"{service.upper()}_{key_name.upper()}",
                    "value": value
                }
            )
            response.raise_for_status()
    
    async def check_rotation_needed(self) -> list:
        """Проверить какие секреты нужно ротировать"""
        secrets = await self.db.secret.find_many()
        rotation_needed = []
        
        for secret in secrets:
            # Ротация каждые 90 дней
            if datetime.now() - secret.lastRotated > timedelta(days=90):
                rotation_needed.append(secret.serviceKey)
        
        return rotation_needed

# Глобальный экземпляр
secrets = SecretsManager()
```

#### Автоматическая ротация (cron)

Файл: `.github/workflows/rotate-secrets.yml`

```yaml
name: Rotate Secrets

on:
  schedule:
    # Каждый понедельник в 3:00 UTC
    - cron: '0 3 * * 1'
  workflow_dispatch:  # Ручной запуск

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install prisma
          prisma generate
      
      - name: Check rotation needed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
        run: python scripts/check_rotation.py
      
      - name: Notify if rotation needed
        if: steps.check.outputs.needed == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Secrets rotation required',
              body: 'Some secrets need to be rotated. Please review and update.'
            })
```

### Уровень 6: Live UI Updates (WebSocket)

#### WebSocket для мгновенных обновлений

Файл: `backend/api/websocket.py`

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        self.active_connections[user_id].discard(websocket)
    
    async def send_to_user(self, user_id: int, message: dict):
        """Отправить сообщение всем подключениям пользователя"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)
    
    async def broadcast_config_update(self, config_key: str, new_value):
        """Уведомить всех о изменении конфигурации"""
        message = {
            "type": "config_update",
            "key": config_key,
            "value": new_value
        }
        for connections in self.active_connections.values():
            for connection in connections:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Ждем сообщений от клиента
            data = await websocket.receive_text()
            # Обрабатываем ping/pong для keep-alive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
```

#### Frontend WebSocket клиент

Файл: `frontend/src/services/websocket.ts`

```typescript
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(userId: number) {
    this.ws = new WebSocket(`wss://your-api.vercel.app/ws/${userId}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      // Отправляем ping каждые 30 секунд
      setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send('ping');
        }
      }, 30000);
    };
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'config_update') {
        // Обновляем конфигурацию в приложении
        this.handleConfigUpdate(update.key, update.value);
      } else if (update.type === 'task_completed') {
        // Уведомляем о завершении задачи
        this.handleTaskCompleted(update.taskId);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect(userId);
    };
  }
  
  private reconnect(userId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(userId), 1000 * this.reconnectAttempts);
    }
  }
  
  private handleConfigUpdate(key: string, value: any) {
    // Обновляем UI без перезагрузки
    if (key === 'menu_config') {
      // Обновляем меню
      window.dispatchEvent(new CustomEvent('menu-update', { detail: value }));
    }
  }
}

export const wsService = new WebSocketService();
```

## Итоговая архитектура автономности

| Компонент | Технология | Что даёт |
|-----------|-----------|----------|
| CI/CD | GitHub Actions + Pterodactyl API | Автодеплой при пуше |
| Динамические конфиги | Prisma + Redis | Изменение поведения без перезапуска |
| Feature Flags | PostgreSQL + хеширование | A/B тесты, постепенный rollout |
| Автомиграции | Prisma + backup-скрипты | Безопасное обновление схемы БД |
| Healthchecks | Docker + Pterodactyl | Самовосстановление при сбоях |
| Dependabot | GitHub | Автообновление зависимостей |
| Secrets Manager | Encrypted БД + ротация | Безопасное хранение и смена ключей |
| Live UI updates | WebSocket + React | Мгновенное обновление Mini App |

## Преимущества

### Для разработчика:
- Никаких ручных деплоев в 3 часа ночи
- Мгновенное включение/отключение фич через админку
- Автоматические бэкапы перед миграциями
- Мониторинг здоровья всех компонентов

### Для пользователей:
- Бот всегда актуален, даже без перезапуска
- Новые функции появляются плавно (A/B тесты)
- Интерфейс может меняться под каждого пользователя
- Нет простоев из-за обновлений

## Мониторинг автономности

### Метрики для отслеживания

1. **Deployment Frequency**: как часто деплоим (цель: несколько раз в день)
2. **Lead Time for Changes**: время от коммита до production (цель: < 1 час)
3. **Mean Time to Recovery (MTTR)**: время восстановления после сбоя (цель: < 5 минут)
4. **Change Failure Rate**: процент деплоев с ошибками (цель: < 5%)

### Дашборд в Grafana

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'bot-api'
    static_configs:
      - targets: ['api.your-domain.com:8000']
  
  - job_name: 'bot-workers'
    static_configs:
      - targets: ['worker1:8000', 'worker2:8000']
```

## Следующие шаги

1. Настроить GitHub Actions workflows
2. Добавить модели BotConfig, FeatureFlag, Secret в Prisma schema
3. Реализовать DynamicConfig и SecretsManager сервисы
4. Настроить Dependabot
5. Добавить WebSocket endpoints
6. Создать админ-панель для управления конфигами
7. Настроить мониторинг и алерты
