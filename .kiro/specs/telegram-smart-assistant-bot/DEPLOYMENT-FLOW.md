# Deployment Flow: Визуальная схема автоматического деплоя

## Полный цикл разработки и деплоя

```mermaid
graph TB
    A[Разработчик] -->|git push| B[GitHub Repository]
    B -->|webhook| C[GitHub Actions]
    
    C --> D[Setup Environment]
    D --> E[Install Node.js 18]
    D --> F[Install Python 3.11]
    
    E --> G[Install Prisma CLI]
    F --> H[Install Python deps]
    
    G --> I[Generate Prisma Client]
    H --> I
    
    I --> J{Branch?}
    
    J -->|main| K[Production Deploy]
    J -->|other| L[Preview Deploy]
    
    K --> M[Vercel Build]
    L --> M
    
    M --> N[Build Frontend]
    M --> O[Build Backend]
    
    N --> P[Static Assets]
    O --> Q[Serverless Functions]
    
    P --> R[Vercel CDN]
    Q --> S[Vercel Edge Network]
    
    R --> T[Production URL]
    S --> T
    
    T --> U[Live Application]
    
    U --> V{Success?}
    V -->|Yes| W[Notify Success]
    V -->|No| X[Notify Failure]
    
    X --> Y[Rollback Available]
```

## Детальный flow обработки запроса

```mermaid
sequenceDiagram
    participant User as Пользователь
    participant TG as Telegram
    participant MA as Mini App<br/>(Vercel CDN)
    participant API as Backend API<br/>(Vercel Serverless)
    participant RQ as Redis Queue
    participant W as Worker<br/>(Pterodactyl)
    participant DB as Supabase<br/>PostgreSQL
    participant GROQ as Groq API
    participant S3 as Storage<br/>(S3/Supabase)
    
    User->>TG: Открыть Mini App
    TG->>MA: Загрузить приложение
    MA-->>User: Отобразить интерфейс
    
    User->>MA: Записать аудио
    MA->>MA: MediaRecorder API
    
    User->>MA: Отправить на обработку
    MA->>API: POST /api/conspect/create
    
    API->>API: Валидация initData
    API->>DB: Проверить подписку
    DB-->>API: subscription_status
    
    API->>S3: Сохранить аудио
    S3-->>API: file_url
    
    API->>RQ: Создать задачу
    API-->>MA: task_id + status: queued
    
    Note over API,MA: API возвращается < 1 сек<br/>(в рамках 60 сек лимита)
    
    MA->>MA: Показать прогресс
    
    RQ->>W: Забрать задачу
    W->>S3: Скачать аудио
    
    W->>GROQ: STT (Whisper-large-v3)
    GROQ-->>W: Транскрипция
    
    W->>GROQ: LLM (llama-3.3-70b)
    GROQ-->>W: Конспект
    
    W->>GROQ: TTS
    GROQ-->>W: Аудио конспекта
    
    W->>S3: Сохранить результаты
    W->>DB: Сохранить в notes_history
    
    W->>TG: Отправить результат
    TG->>User: Уведомление + конспект
    
    loop Polling каждые 2 сек
        MA->>API: GET /api/conspect/status/{task_id}
        API->>DB: Получить статус
        API-->>MA: status + progress
    end
    
    MA->>MA: Показать готовый конспект
```

## Архитектура компонентов

```mermaid
graph LR
    subgraph "Vercel Platform"
        subgraph "Static Hosting"
            FE[Frontend<br/>React/Vue/Svelte]
            CDN[Global CDN]
        end
        
        subgraph "Serverless Functions"
            API1[API Function 1<br/>60 sec timeout]
            API2[API Function 2<br/>60 sec timeout]
            API3[API Function N<br/>60 sec timeout]
        end
    end
    
    subgraph "External Services"
        DB[(Supabase<br/>PostgreSQL)]
        REDIS[(Redis<br/>Queue)]
        S3[S3/Supabase<br/>Storage]
    end
    
    subgraph "Pterodactyl"
        W1[Worker 1<br/>No timeout]
        W2[Worker 2<br/>No timeout]
        W3[Worker N<br/>No timeout]
    end
    
    subgraph "AI Services"
        GROQ[Groq API<br/>Whisper + Llama]
        GOOGLE[Google APIs<br/>Docs + Sheets]
    end
    
    FE --> CDN
    CDN --> API1
    CDN --> API2
    CDN --> API3
    
    API1 --> DB
    API2 --> DB
    API3 --> DB
    
    API1 --> REDIS
    API2 --> REDIS
    
    API1 --> S3
    API2 --> S3
    
    REDIS --> W1
    REDIS --> W2
    REDIS --> W3
    
    W1 --> GROQ
    W2 --> GROQ
    W3 --> GROQ
    
    W1 --> GOOGLE
    W2 --> GOOGLE
    
    W1 --> DB
    W2 --> DB
    W3 --> DB
    
    W1 --> S3
    W2 --> S3
    W3 --> S3
```

## Deployment Pipeline

```mermaid
graph TB
    subgraph "Development"
        DEV1[Локальная разработка]
        DEV2[vercel dev]
        DEV3[Тестирование]
    end
    
    subgraph "Version Control"
        GIT1[git commit]
        GIT2[git push]
        GIT3[GitHub Repository]
    end
    
    subgraph "CI/CD"
        CI1[GitHub Actions Trigger]
        CI2[Install Dependencies]
        CI3[Generate Prisma Client]
        CI4[Run Tests]
        CI5[Build Project]
    end
    
    subgraph "Vercel Build"
        VB1[Build Frontend]
        VB2[Build Backend]
        VB3[Optimize Assets]
        VB4[Generate Sourcemaps]
    end
    
    subgraph "Deployment"
        D1{Branch?}
        D2[Preview Deploy]
        D3[Production Deploy]
        D4[Unique Preview URL]
        D5[Production URL]
    end
    
    subgraph "Post-Deploy"
        PD1[Health Checks]
        PD2[Smoke Tests]
        PD3[Monitoring]
        PD4[Notifications]
    end
    
    DEV1 --> DEV2
    DEV2 --> DEV3
    DEV3 --> GIT1
    
    GIT1 --> GIT2
    GIT2 --> GIT3
    
    GIT3 --> CI1
    CI1 --> CI2
    CI2 --> CI3
    CI3 --> CI4
    CI4 --> CI5
    
    CI5 --> VB1
    CI5 --> VB2
    VB1 --> VB3
    VB2 --> VB3
    VB3 --> VB4
    
    VB4 --> D1
    D1 -->|feature branch| D2
    D1 -->|main branch| D3
    
    D2 --> D4
    D3 --> D5
    
    D4 --> PD1
    D5 --> PD1
    
    PD1 --> PD2
    PD2 --> PD3
    PD3 --> PD4
```

## Environment Variables Flow

```mermaid
graph LR
    subgraph "Sources"
        S1[Vercel Dashboard]
        S2[Vercel CLI]
        S3[GitHub Secrets]
    end
    
    subgraph "Environments"
        E1[Production]
        E2[Preview]
        E3[Development]
    end
    
    subgraph "Runtime"
        R1[Serverless Functions]
        R2[Build Process]
        R3[Frontend Build]
    end
    
    S1 --> E1
    S1 --> E2
    S1 --> E3
    
    S2 --> E1
    S2 --> E2
    S2 --> E3
    
    S3 --> R2
    
    E1 --> R1
    E2 --> R1
    E3 --> R1
    
    E1 --> R3
    E2 --> R3
    E3 --> R3
```

## Rollback Strategy

```mermaid
graph TB
    A[Обнаружена проблема] --> B{Критичность?}
    
    B -->|Критическая| C[Немедленный Rollback]
    B -->|Некритическая| D[Hotfix]
    
    C --> E[Vercel Dashboard]
    E --> F[Выбрать предыдущий деплой]
    F --> G[Promote to Production]
    G --> H[Instant Rollback]
    
    D --> I[Создать hotfix ветку]
    I --> J[Исправить проблему]
    J --> K[Push в GitHub]
    K --> L[Автоматический деплой]
    
    H --> M[Мониторинг]
    L --> M
    
    M --> N{Проблема решена?}
    N -->|Да| O[Продолжить работу]
    N -->|Нет| P[Повторить процесс]
```

## Monitoring & Alerting Flow

```mermaid
graph TB
    subgraph "Application"
        APP1[Frontend]
        APP2[Backend API]
        APP3[Workers]
    end
    
    subgraph "Metrics Collection"
        M1[Vercel Analytics]
        M2[Application Logs]
        M3[Error Tracking]
    end
    
    subgraph "Monitoring Tools"
        T1[Vercel Dashboard]
        T2[Sentry]
        T3[Custom Monitoring]
    end
    
    subgraph "Alerting"
        A1{Threshold<br/>Exceeded?}
        A2[Slack Notification]
        A3[Email Alert]
        A4[PagerDuty]
    end
    
    APP1 --> M1
    APP2 --> M1
    APP3 --> M2
    
    APP1 --> M3
    APP2 --> M3
    APP3 --> M3
    
    M1 --> T1
    M2 --> T1
    M3 --> T2
    
    T1 --> A1
    T2 --> A1
    T3 --> A1
    
    A1 -->|Yes| A2
    A1 -->|Yes| A3
    A1 -->|Critical| A4
```

## Scaling Strategy

```mermaid
graph LR
    subgraph "Traffic Growth"
        T1[Low Traffic<br/>< 100 users]
        T2[Medium Traffic<br/>100-1000 users]
        T3[High Traffic<br/>1000+ users]
    end
    
    subgraph "Vercel Scaling"
        V1[Free Tier<br/>Serverless]
        V2[Pro Tier<br/>More Functions]
        V3[Enterprise<br/>Dedicated]
    end
    
    subgraph "Workers Scaling"
        W1[1-2 Workers<br/>Pterodactyl]
        W2[3-5 Workers<br/>Load Balanced]
        W3[10+ Workers<br/>Auto-scaling]
    end
    
    subgraph "Database Scaling"
        D1[Supabase Free<br/>500MB]
        D2[Supabase Pro<br/>8GB]
        D3[Dedicated<br/>PostgreSQL]
    end
    
    T1 --> V1
    T1 --> W1
    T1 --> D1
    
    T2 --> V2
    T2 --> W2
    T2 --> D2
    
    T3 --> V3
    T3 --> W3
    T3 --> D3
```

## Cost Optimization Flow

```mermaid
graph TB
    A[Мониторинг затрат] --> B{Превышен<br/>бюджет?}
    
    B -->|Нет| C[Продолжить]
    B -->|Да| D[Анализ затрат]
    
    D --> E{Основной<br/>источник?}
    
    E -->|Vercel| F[Оптимизация<br/>Functions]
    E -->|Groq API| G[Кэширование<br/>запросов]
    E -->|Storage| H[Очистка<br/>старых файлов]
    E -->|Database| I[Оптимизация<br/>запросов]
    
    F --> J[Уменьшить<br/>размер пакетов]
    G --> K[Redis кэш]
    H --> L[Retention policy]
    I --> M[Индексы + Pooling]
    
    J --> N[Повторный<br/>мониторинг]
    K --> N
    L --> N
    M --> N
    
    N --> A
```

## Полезные команды для каждого этапа

### Development
```bash
vercel dev                    # Локальная разработка
vercel env pull              # Загрузить env переменные
```

### Deployment
```bash
vercel                       # Preview деплой
vercel --prod               # Production деплой
```

### Monitoring
```bash
vercel logs                  # Просмотр логов
vercel logs --follow        # Real-time логи
vercel inspect [url]        # Детали деплоя
```

### Management
```bash
vercel ls                    # Список деплоев
vercel rm [url]             # Удалить деплой
vercel rollback             # Откат на предыдущую версию
```

### Environment
```bash
vercel env ls               # Список переменных
vercel env add [name]       # Добавить переменную
vercel env rm [name]        # Удалить переменную
```

## Следующие шаги

1. ✅ Изучить deployment flow
2. ⏭️ Настроить автоматический деплой (см. QUICKSTART.md)
3. ⏭️ Пройти deployment checklist (см. DEPLOYMENT-CHECKLIST.md)
4. ⏭️ Настроить мониторинг
5. ⏭️ Оптимизировать производительность
