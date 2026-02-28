# Autonomous Architecture - Визуальная схема

## Общая архитектура автономности

```mermaid
graph TB
    subgraph "Developer"
        DEV[Разработчик]
        CODE[Код в GitHub]
    end
    
    subgraph "CI/CD Layer"
        GHA[GitHub Actions]
        TESTS[Automated Tests]
        DEPLOY[Auto Deploy]
    end
    
    subgraph "Configuration Layer"
        DB[(PostgreSQL)]
        REDIS[(Redis Cache)]
        CONFIG[BotConfig]
        FLAGS[FeatureFlags]
        SECRETS[Encrypted Secrets]
    end
    
    subgraph "Application Layer"
        API[Vercel API]
        WORKERS[Pterodactyl Workers]
        WEBAPP[Mini App]
    end
    
    subgraph "Monitoring Layer"
        HEALTH[Healthcheck]
        METRICS[Prometheus]
        ALERTS[Alerts]
    end
    
    subgraph "Users"
        USERS[Пользователи]
    end
    
    DEV -->|git push| CODE
    CODE -->|trigger| GHA
    GHA --> TESTS
    TESTS -->|pass| DEPLOY
    DEPLOY -->|update| API
    DEPLOY -->|update| WORKERS
    
    API --> CONFIG
    API --> FLAGS
    API --> SECRETS
    CONFIG --> REDIS
    FLAGS --> REDIS
    
    API -->|WebSocket| WEBAPP
    WEBAPP --> USERS
    
    WORKERS --> HEALTH
    API --> HEALTH
    HEALTH --> METRICS
    METRICS --> ALERTS
    ALERTS -->|notify| DEV
```

## Уровень 1: CI/CD Pipeline

```mermaid
sequenceDiagram
    participant Dev as Разработчик
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant V as Vercel
    participant P as Pterodactyl
    
    Dev->>GH: git push main
    GH->>GHA: Trigger workflow
    GHA->>GHA: Run tests
    GHA->>GHA: Build project
    GHA->>GHA: Generate Prisma Client
    GHA->>V: Deploy API + Frontend
    GHA->>P: Deploy Workers (via API)
    P->>P: git pull && restart
    V-->>Dev: Deployment URL
    P-->>Dev: Worker restarted
```

## Уровень 2: Dynamic Configuration

```mermaid
graph LR
    subgraph "Admin Panel"
        ADMIN[Админ]
        UI[Web UI]
    end
    
    subgraph "Backend"
        API[API Endpoint]
        SERVICE[DynamicConfig]
    end
    
    subgraph "Storage"
        DB[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end
    
    subgraph "Clients"
        WS[WebSocket]
        APP1[User 1]
        APP2[User 2]
        APP3[User N]
    end
    
    ADMIN -->|update config| UI
    UI -->|POST /api/config| API
    API --> SERVICE
    SERVICE -->|save| DB
    SERVICE -->|invalidate| REDIS
    SERVICE -->|broadcast| WS
    WS -->|live update| APP1
    WS -->|live update| APP2
    WS -->|live update| APP3
```

## Уровень 3: Feature Flags & A/B Testing

```mermaid
graph TB
    subgraph "Feature Flag Decision"
        USER[User Request]
        CHECK{Feature Enabled?}
        ROLLOUT{In Rollout %?}
        HASH[Hash user_id]
    end
    
    subgraph "Outcomes"
        NEW[New Feature]
        OLD[Old Feature]
    end
    
    USER --> CHECK
    CHECK -->|Yes| ROLLOUT
    CHECK -->|No| OLD
    ROLLOUT -->|Has rollout| HASH
    ROLLOUT -->|100%| NEW
    HASH -->|< rollout %| NEW
    HASH -->|>= rollout %| OLD
```

## Уровень 4: Safe Migrations

```mermaid
sequenceDiagram
    participant CI as CI/CD
    participant SCRIPT as migrate.py
    participant DB as PostgreSQL
    participant BACKUP as Backup Storage
    
    CI->>SCRIPT: Run migration
    SCRIPT->>DB: Check current version
    SCRIPT->>BACKUP: Create backup
    BACKUP-->>SCRIPT: Backup created
    
    alt Migration Success
        SCRIPT->>DB: Apply migrations
        DB-->>SCRIPT: Success
        SCRIPT-->>CI: Migration completed
    else Migration Failed
        SCRIPT->>DB: Rollback
        SCRIPT->>BACKUP: Restore from backup
        BACKUP-->>DB: Data restored
        SCRIPT-->>CI: Migration failed (rolled back)
    end
```

## Уровень 5: Self-Healing

```mermaid
graph TB
    subgraph "Worker Container"
        APP[Application]
        HEALTH[/health endpoint]
    end
    
    subgraph "Docker"
        HC[Healthcheck]
    end
    
    subgraph "Pterodactyl"
        MONITOR[Monitor]
        RESTART[Auto Restart]
    end
    
    APP --> HEALTH
    HC -->|every 30s| HEALTH
    
    HEALTH -->|200 OK| HC
    HEALTH -->|timeout/error| HC
    
    HC -->|3 failures| MONITOR
    MONITOR --> RESTART
    RESTART -->|restart container| APP
```

## Уровень 6: Secrets Rotation

```mermaid
sequenceDiagram
    participant CRON as Cron Job
    participant SM as SecretsManager
    participant DB as PostgreSQL
    participant EXT as External Service
    participant PTER as Pterodactyl
    
    CRON->>SM: Check rotation needed
    SM->>DB: Get secrets older than 90 days
    DB-->>SM: List of secrets
    
    loop For each secret
        SM->>EXT: Generate new key (if supported)
        EXT-->>SM: New key
        SM->>SM: Encrypt new key
        SM->>DB: Save encrypted key
        SM->>PTER: Update env variable
        PTER-->>SM: Updated
    end
    
    SM-->>CRON: Rotation completed
```

## Полный цикл обновления

```mermaid
graph TB
    START[Developer commits code]
    
    subgraph "Automated Pipeline"
        TEST[Run Tests]
        BUILD[Build & Generate Prisma]
        MIGRATE[Safe Migration]
        DEPLOY_V[Deploy to Vercel]
        DEPLOY_P[Deploy to Pterodactyl]
    end
    
    subgraph "Runtime Updates"
        CONFIG[Update Config in DB]
        CACHE[Invalidate Cache]
        WS[Broadcast via WebSocket]
    end
    
    subgraph "Monitoring"
        HEALTH[Healthcheck]
        METRICS[Collect Metrics]
        ALERT{Issues?}
    end
    
    subgraph "Recovery"
        ROLLBACK[Rollback Deployment]
        RESTORE[Restore from Backup]
    end
    
    END[Users see updates]
    
    START --> TEST
    TEST -->|pass| BUILD
    BUILD --> MIGRATE
    MIGRATE -->|success| DEPLOY_V
    DEPLOY_V --> DEPLOY_P
    DEPLOY_P --> CONFIG
    CONFIG --> CACHE
    CACHE --> WS
    WS --> END
    
    DEPLOY_P --> HEALTH
    HEALTH --> METRICS
    METRICS --> ALERT
    ALERT -->|yes| ROLLBACK
    ALERT -->|no| END
    ROLLBACK --> RESTORE
    RESTORE --> END
```

## Компоненты взаимодействия

```mermaid
graph TB
    subgraph "Frontend"
        MA[Mini App]
        WSC[WebSocket Client]
    end
    
    subgraph "Backend Services"
        API[FastAPI]
        DC[DynamicConfig]
        SM[SecretsManager]
        CM[ConnectionManager]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        REDIS[(Redis)]
    end
    
    subgraph "External"
        GROQ[Groq API]
        GOOGLE[Google APIs]
    end
    
    MA <-->|HTTP| API
    MA <-->|WebSocket| WSC
    WSC <--> CM
    
    API --> DC
    API --> SM
    DC --> DB
    DC --> REDIS
    SM --> DB
    
    API --> GROQ
    API --> GOOGLE
    
    CM -->|broadcast| WSC
```

## Мониторинг и алерты

```mermaid
graph LR
    subgraph "Sources"
        API[API Logs]
        WORKERS[Worker Logs]
        DB[DB Metrics]
        REDIS_M[Redis Metrics]
    end
    
    subgraph "Collection"
        PROM[Prometheus]
        LOKI[Loki]
    end
    
    subgraph "Visualization"
        GRAF[Grafana]
    end
    
    subgraph "Alerting"
        ALERT[Alert Manager]
        SLACK[Slack]
        EMAIL[Email]
    end
    
    API --> PROM
    WORKERS --> PROM
    DB --> PROM
    REDIS_M --> PROM
    
    API --> LOKI
    WORKERS --> LOKI
    
    PROM --> GRAF
    LOKI --> GRAF
    
    PROM --> ALERT
    ALERT --> SLACK
    ALERT --> EMAIL
```

## Deployment Flow

```mermaid
graph TB
    START[git push main]
    
    subgraph "GitHub Actions"
        CHECKOUT[Checkout Code]
        SETUP_PY[Setup Python]
        SETUP_NODE[Setup Node.js]
        INSTALL[Install Dependencies]
        PRISMA[Generate Prisma Client]
        TEST[Run Tests]
        COVERAGE[Upload Coverage]
    end
    
    subgraph "Vercel Deployment"
        V_BUILD[Build Frontend]
        V_API[Build API]
        V_DEPLOY[Deploy to Vercel]
    end
    
    subgraph "Pterodactyl Deployment"
        P_API[Call Pterodactyl API]
        P_PULL[git pull on server]
        P_INSTALL[pip install -r requirements.txt]
        P_MIGRATE[prisma migrate deploy]
        P_RESTART[pm2 restart bot]
    end
    
    END[Deployment Complete]
    
    START --> CHECKOUT
    CHECKOUT --> SETUP_PY
    SETUP_PY --> SETUP_NODE
    SETUP_NODE --> INSTALL
    INSTALL --> PRISMA
    PRISMA --> TEST
    TEST --> COVERAGE
    
    COVERAGE --> V_BUILD
    V_BUILD --> V_API
    V_API --> V_DEPLOY
    
    COVERAGE --> P_API
    P_API --> P_PULL
    P_PULL --> P_INSTALL
    P_INSTALL --> P_MIGRATE
    P_MIGRATE --> P_RESTART
    
    V_DEPLOY --> END
    P_RESTART --> END
```

## Легенда

### Цвета и формы

- **Прямоугольник** - Процесс или компонент
- **Цилиндр** - База данных или хранилище
- **Ромб** - Условие или проверка
- **Параллелограмм** - Ввод/вывод
- **Круг** - Начало/конец процесса

### Стрелки

- **→** - Синхронный вызов
- **⇢** - Асинхронный вызов
- **↔** - Двусторонняя связь
- **⋯→** - Опциональный путь

## Использование диаграмм

Эти диаграммы можно:
1. Вставить в документацию (поддержка Mermaid)
2. Экспортировать в PNG/SVG через Mermaid Live Editor
3. Использовать в презентациях
4. Показать команде для понимания архитектуры

## Инструменты для просмотра

- **GitHub/GitLab** - нативная поддержка Mermaid
- **VS Code** - расширение Mermaid Preview
- **Mermaid Live Editor** - https://mermaid.live
- **Obsidian** - нативная поддержка
- **Notion** - через embed

---

**Примечание**: Все диаграммы написаны на Mermaid и могут быть отредактированы в любом текстовом редакторе.
