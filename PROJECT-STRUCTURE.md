# 📁 EGOIST ACADEMY - Структура проекта

**Дата:** 4 марта 2026  
**Версия:** 1.0 (Оптимизированная)

---

## 🎯 Обзор

Чистая, понятная структура проекта EGOIST ACADEMY.  
Все файлы организованы логически, без дубликатов и устаревшего кода.

---

## 📂 Корневая структура

```
egoist-academy/
├── 📱 miniapp/          # Frontend приложение
├── 🔌 api/              # Backend API endpoints
├── 📚 lib/              # Библиотеки и утилиты
├── 🗄️  database/        # База данных и миграции
├── 📊 data/             # Данные курсов
├── 🛠️  scripts/         # Утилиты и скрипты
├── 📖 docs/             # Документация
├── 🧪 tests/            # Тесты
├── ⚙️  .github/         # GitHub Actions
├── 🔧 .kiro/            # Kiro конфигурация
├── 📄 README.md         # Главный README
├── 📄 CHANGELOG.md      # История изменений
├── 📄 FAQ.md            # Частые вопросы
└── 📄 package.json      # Зависимости
```

---

## 📱 Frontend (miniapp/)

### Основные страницы

```
miniapp/
├── egoist.html                 # 🏠 Главная страница (SPA)
├── egoist-catalog.html         # 📚 Каталог курсов
├── egoist-course.html          # 📖 Страница курса
├── egoist-lesson.html          # 📝 Страница урока
├── admin-panel.html            # 👨‍💼 Админ панель
├── partner-dashboard.html      # 💼 Партнёрский кабинет
├── voice-assistant.html        # 🤖 AI-ассистент
├── profile.html                # 👤 Профиль
├── my-courses.html             # 📚 Мои курсы
├── community.html              # 👥 Сообщества
├── settings.html               # ⚙️ Настройки
└── ai-chat.html                # 💬 AI чат
```

### Стили (css/)

```
miniapp/css/
├── egoist-theme.css            # 🎨 Основная тема (минимализм)
├── animations.css              # ✨ Анимации
├── micro-animations.css        # 🎭 Микро-анимации
├── enhanced-animations.css     # 🌟 Расширенные анимации
└── admin.css                   # 👨‍💼 Стили админки
```

### Скрипты (js/)

```
miniapp/js/
├── egoist-app.js               # 🎯 Главное приложение
├── app.js                      # 📱 Общая логика
├── catalog.js                  # 📚 Каталог
├── community.js                # 👥 Сообщества
├── settings.js                 # ⚙️ Настройки
├── search.js                   # 🔍 Поиск
├── voice.js                    # 🎤 Голосовой ввод
├── admin.js                    # 👨‍💼 Админка
├── admin-courses.js            # 📚 Управление курсами
├── partner-dashboard.js        # 💼 Партнёрский кабинет
├── course-editor.js            # ✏️ Редактор курсов
├── personalization.js          # 🎯 Персонализация
├── performance.js              # ⚡ Производительность
└── lazy-load.js                # 🔄 Ленивая загрузка
```

### Ядро (core/)

```
miniapp/core/
├── state.js                    # 📊 Управление состоянием
├── router.js                   # 🛣️ Роутинг
├── api.js                      # 🔌 API клиент
└── utils.js                    # 🛠️ Утилиты
```

### Стили переменных (styles/)

```
miniapp/styles/
└── variables.css               # 🎨 CSS переменные
```

### Service Worker

```
miniapp/
└── sw.js                       # 📦 Service Worker (кэширование)
```

---

## 🔌 Backend (api/)

### Основные endpoints

```
api/
├── webhook.js                  # 🔔 Telegram webhook
├── webhook-handler.js          # 🔧 Обработчик webhook
├── courses.js                  # 📚 Курсы
├── courses-full.js             # 📖 Полная информация о курсах
├── learning.js                 # 🎓 Обучение
├── community.js                # 👥 Сообщества
├── partner.js                  # 💼 Партнёры
├── partner-enhanced.js         # 💼+ Расширенный API партнёров
├── admin.js                    # 👨‍💼 Админ
├── admin-api.js                # 👨‍💼 Админ API
├── admin-enhanced.js           # 👨‍💼+ Расширенный админ API
├── payments.js                 # 💳 Платежи
├── voice-assistant.js          # 🤖 AI-ассистент
├── voice.js                    # 🎤 Голосовой ввод
├── ai-chat-folders.js          # 💬 Папки AI чата
├── history.js                  # 📜 История
├── export.js                   # 📤 Экспорт данных
├── miniapp.js                  # 📱 Mini App API
├── sync.js                     # 🔄 Синхронизация
└── _router.js                  # 🛣️ Роутер
```

### Подпапки

```
api/
├── admin/
│   └── courses-manage.js       # 📚 Управление курсами
├── courses/
│   ├── my-courses.js           # 📚 Мои курсы
│   └── check-access.js         # 🔐 Проверка доступа
├── payments/
│   ├── create-invoice.js       # 💳 Создание счёта
│   ├── webhook.js              # 🔔 Webhook платежей
│   └── refund.js               # 💸 Возврат
├── voice/
│   └── index.js                # 🎤 Голосовой API
├── health/
│   └── database.js             # 🏥 Проверка БД
├── routes/
│   ├── system.js               # ⚙️ Системные роуты
│   ├── partner.js              # 💼 Партнёрские роуты
│   └── courses.js              # 📚 Роуты курсов
└── webhook/
    └── index.js                # 🔔 Webhook handler
```

---

## 📚 Библиотеки (lib/)

### Основные модули

```
lib/
├── db.js                       # 🗄️ База данных
├── ai.js                       # 🤖 AI интеграция
├── cache.js                    # 💾 Кэширование
├── analytics.js                # 📊 Аналитика
├── monitoring.js               # 📈 Мониторинг
├── ai-rate-limit.js            # ⏱️ Rate limiting для AI
├── supabase-client.js          # 🗄️ Supabase клиент
└── db-purchases.js             # 💳 Покупки
```

### Подмодули

```
lib/
├── ai/
│   ├── grok-client.js          # 🤖 Groq клиент
│   └── memory.js               # 🧠 Память AI
├── bot/
│   ├── commands.js             # 📝 Команды бота
│   ├── callbacks.js            # 🔄 Обработчики
│   ├── keyboards.js            # ⌨️ Клавиатуры
│   └── ai-handlers.js          # 🤖 AI обработчики
├── voice/
│   ├── groq-services.js        # 🎤 Groq голосовые сервисы
│   └── transcription.js        # 📝 Транскрипция
├── payments/
│   └── telegram-stars.js       # ⭐ Telegram Stars
├── middleware/
│   ├── telegram-auth.js        # 🔐 Telegram авторизация
│   ├── telegram-init-data.js   # 📱 Init data
│   ├── validate.js             # ✅ Валидация
│   └── error-handler.js        # ❌ Обработка ошибок
├── utils/
│   └── sanitize.js             # 🧹 Санитизация
├── admin/
│   └── admin-system.js         # 👨‍💼 Админ система
├── learning/
│   └── adaptive-learning.js    # 🎓 Адаптивное обучение
└── ml/
    └── personalization.js      # 🎯 Персонализация ML
```

---

## 🗄️ База данных (database/)

```
database/
├── schema.sql                  # 📋 Основная схема
├── setup-all-tables.sql        # 🔧 Создание всех таблиц
├── add-bonus-balance.sql       # 💰 Бонусный баланс
├── fix-missing-columns.sql     # 🔧 Исправление колонок
├── FULL-SCHEMA-COMBINED.sql    # 📋 Полная схема
├── APPLY-ALL-MIGRATIONS.sql    # 🔄 Применение миграций
├── README.md                   # 📖 Документация БД
├── SETUP-SUPABASE.md           # 🔧 Настройка Supabase
└── APPLY-SCHEMA.md             # 📋 Применение схемы
```

### Миграции (migrations/)

```
database/migrations/
├── 001-add-ml-tables-safe.sql          # 🤖 ML таблицы
├── 002-academy-tables.sql              # 🎓 Таблицы академии
├── 003-partner-courses.sql             # 💼 Партнёрские курсы
├── 004-referral-system-v2.sql          # 🔗 Реферальная система
├── 005-community-system.sql            # 👥 Система сообществ
├── 006-partner-referral-customization-simple.sql  # 💼 Кастомизация
├── 007-ai-chat-folders.sql             # 💬 Папки AI чата
└── 008-voice-ai-assistant.sql          # 🎤 Голосовой ассистент
```

---

## 📊 Данные (data/)

```
data/
└── egoist-courses.json         # 📚 Структура курсов EGOIST
```

---

## 🛠️ Скрипты (scripts/)

### Основные скрипты

```
scripts/
├── optimize-egoist-project.js  # 🧹 Оптимизация проекта
├── set-webhook.js              # 🔔 Установка webhook
├── clear-telegram-cache.js     # 🧹 Очистка кэша Telegram
├── check-deploy-ready.js       # ✅ Проверка готовности
├── setup-vercel-env.js         # ⚙️ Настройка Vercel env
├── setup-vercel.js             # 🔧 Настройка Vercel
├── apply-migrations.js         # 🔄 Применение миграций
├── analyze-database.js         # 📊 Анализ БД
├── check-database.js           # ✅ Проверка БД
├── test-supabase.js            # 🧪 Тест Supabase
├── auto-deploy.js              # 🚀 Автодеплой
├── auto-commit.js              # 💾 Автокоммит
└── deploy-hooks.js             # 🔗 Deploy hooks
```

---

## 📖 Документация (docs/)

```
docs/
├── deployment.md               # 🚀 Деплой
└── BOTS-SYNC.md                # 🤖 Синхронизация ботов
```

---

## 🧪 Тесты (tests/)

```
tests/
├── unit/
│   ├── ai.test.js              # 🤖 Тесты AI
│   └── db.test.js              # 🗄️ Тесты БД
└── integration/
    └── webhook.test.js         # 🔔 Тесты webhook
```

---

## ⚙️ GitHub Actions (.github/)

```
.github/
└── workflows/
    └── ci-cd-full.yml          # 🔄 CI/CD pipeline
```

---

## 🔧 Kiro (.kiro/)

```
.kiro/
└── (конфигурация Kiro AI)
```

---

## 📄 Корневые файлы

```
├── bot.js                      # 🤖 Основной бот
├── README.md                   # 📖 Главный README
├── CHANGELOG.md                # 📜 История изменений
├── FAQ.md                      # ❓ Частые вопросы
├── ROADMAP-2026.md             # 🗺️ Дорожная карта
├── API-ENDPOINTS.md            # 📋 Документация API
├── DEPLOY-CHECKLIST.md         # ✅ Чек-лист деплоя
├── package.json                # 📦 Зависимости
├── vercel.json                 # ⚙️ Конфигурация Vercel
├── .env.example                # 🔐 Пример переменных
├── .env                        # 🔐 Переменные окружения
├── .env.local                  # 🔐 Локальные переменные
├── .gitignore                  # 🚫 Игнорируемые файлы
└── .vercelignore               # 🚫 Игнорируемые для Vercel
```

---

## 📚 Документация EGOIST ACADEMY

```
├── EGOIST-ACADEMY-README.md    # 📖 Главный README
├── EGOIST-ACADEMY-АНАЛИЗ-ТЗ.md # 📋 Анализ ТЗ
├── EGOIST-ACADEMY-ГОТОВО.md    # ✅ Отчёт о готовности
├── EGOIST-ACADEMY-ЗАПУСК.md    # 🚀 Инструкция запуска
├── EGOIST-ACADEMY-СВОДКА.md    # 📊 Краткая сводка
├── EGOIST-ACADEMY-МИНИМАЛИЗАЦИЯ.md  # 🎨 Отчёт о дизайне
├── EGOIST-VS-FELIX-СРАВНЕНИЕ.md     # ⚖️ Сравнение версий
├── EGOIST-ECOSYSTEM-БРЕНДИНГ.md     # 🎨 Брендинг
└── PROJECT-STRUCTURE.md        # 📁 Эта структура
```

---

## 🎯 Ключевые особенности структуры

### 1. Логическая организация
- Каждая папка имеет чёткое назначение
- Файлы сгруппированы по функционалу
- Нет дубликатов и устаревшего кода

### 2. Понятные имена
- `egoist-*` - файлы EGOIST ACADEMY
- `admin-*` - админские файлы
- `partner-*` - партнёрские файлы
- `voice-*` - голосовые функции

### 3. Модульность
- Frontend отделён от Backend
- Библиотеки изолированы
- Тесты отдельно
- Документация отдельно

### 4. Масштабируемость
- Легко добавлять новые страницы
- Легко добавлять новые API
- Легко добавлять новые функции
- Легко добавлять новые курсы

---

## 📊 Статистика проекта

### Размеры

```
Frontend:  ~50 файлов, ~200 KB
Backend:   ~40 файлов, ~150 KB
Database:  ~15 файлов, ~100 KB
Scripts:   ~15 файлов, ~50 KB
Docs:      ~10 файлов, ~200 KB
Total:     ~130 файлов, ~700 KB
```

### Строки кода

```
JavaScript:  ~15,000 строк
CSS:         ~5,000 строк
HTML:        ~3,000 строк
SQL:         ~2,000 строк
Markdown:    ~5,000 строк
Total:       ~30,000 строк
```

---

## 🚀 Быстрая навигация

### Для разработчиков:
- Начать: `README.md`
- API: `API-ENDPOINTS.md`
- Деплой: `docs/deployment.md`
- Тесты: `tests/`

### Для дизайнеров:
- Тема: `miniapp/css/egoist-theme.css`
- Компоненты: `miniapp/css/`
- Страницы: `miniapp/*.html`

### Для администраторов:
- Админка: `miniapp/admin-panel.html`
- API: `api/admin*.js`
- БД: `database/`

### Для партнёров:
- Кабинет: `miniapp/partner-dashboard.html`
- API: `api/partner*.js`

---

## 📝 Соглашения об именовании

### Файлы:
- `kebab-case.js` - для всех файлов
- `UPPERCASE.md` - для документации
- `egoist-*` - префикс для EGOIST файлов

### Переменные:
- `camelCase` - для переменных и функций
- `PascalCase` - для классов
- `UPPER_SNAKE_CASE` - для констант

### CSS:
- `kebab-case` - для классов
- `--kebab-case` - для переменных
- `.egoist-*` - префикс для EGOIST классов

---

## 🎉 Итог

Чистая, понятная, масштабируемая структура проекта EGOIST ACADEMY.

Всё организовано логически, без дубликатов, с чёткими соглашениями.

---

**Версия:** 1.0  
**Дата:** 4 марта 2026  
**Статус:** ✅ Оптимизировано
