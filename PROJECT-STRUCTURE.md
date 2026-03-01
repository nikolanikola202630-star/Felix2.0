# Структура проекта Felix Bot v4.2

## 📁 Текущая структура (v4.2 - без БД)

```
felix-bot/
├── api/
│   └── webhook.js              # ✅ ОСНОВНОЙ ФАЙЛ - весь функционал бота
│
├── miniapp/
│   └── index.html              # ✅ Mini App интерфейс
│
├── lib/                        # 📦 Библиотеки (для будущих версий с БД)
│   ├── ai.js                   # AI сервис
│   ├── voice.js                # Voice сервис
│   ├── storage.js              # Storage сервис
│   ├── db.js                   # Database сервис
│   ├── tag.js                  # Tag сервис
│   ├── search.js               # Search сервис
│   ├── export.js               # Export сервис
│   ├── i18n.js                 # Мультиязычность
│   ├── analytics.js            # Аналитика
│   ├── cache.js                # Кеширование
│   └── ratelimit.js            # Rate limiting
│
├── database/                   # 📦 Схемы БД (для будущих версий)
│   ├── v4-schema.sql           # Полная схема PostgreSQL
│   └── SETUP-SUPABASE.md       # Инструкции по настройке
│
├── .kiro/                      # 🔧 Конфигурация Kiro IDE
│   └── specs/                  # Спецификации проекта
│
├── vercel.json                 # ⚙️ Конфигурация Vercel
├── package.json                # 📦 Зависимости (v4.2.0)
├── .env.example                # 📝 Пример переменных окружения
├── .gitignore                  # 🚫 Игнорируемые файлы
│
├── README.md                   # 📖 Основная документация
├── CHANGELOG.md                # 📝 История изменений
├── FAQ.md                      # ❓ Часто задаваемые вопросы
└── PROJECT-STRUCTURE.md        # 📁 Этот файл
```

## 🎯 Основные файлы

### api/webhook.js
**Назначение**: Единственный активный файл API, содержит весь функционал бота

**Содержит**:
- Обработку всех команд (/start, /translate, /improve, /brainstorm, /explain, /stats, /organize, /clear)
- AI функции (getAIResponse, translateText, improveText, brainstormIdeas, explainSimply)
- Обработку голосовых сообщений (downloadVoiceFile, transcribeVoice)
- In-memory хранилище (conversations, userStats)
- Telegram Bot API интеграцию

**Размер**: ~400 строк  
**Зависимости**: groq-sdk

### miniapp/index.html
**Назначение**: Telegram Mini App интерфейс

**Содержит**:
- Красивый градиентный дизайн
- Описание всех функций v4.2
- Примеры использования команд
- Информацию о технологиях

**Размер**: ~300 строк  
**Зависимости**: Telegram WebApp API

## 📦 Библиотеки (lib/) - Для будущих версий

Эти файлы готовы для версии с базой данных, но пока не используются:

- **ai.js** - Расширенные AI функции (summary, analyze, generate)
- **voice.js** - Продвинутая обработка голоса
- **storage.js** - Работа с файловым хранилищем
- **db.js** - Подключение к PostgreSQL/Supabase
- **tag.js** - Система тегов
- **search.js** - Поиск по истории
- **export.js** - Экспорт в PDF/DOCX
- **i18n.js** - Мультиязычность
- **analytics.js** - Расширенная аналитика
- **cache.js** - Кеширование запросов
- **ratelimit.js** - Ограничение частоты запросов

## 🗄️ База данных (database/) - Для будущих версий

- **v4-schema.sql** - Полная схема БД с таблицами:
  - users (пользователи)
  - messages (сообщения)
  - voice_messages (голосовые)
  - tags (теги)
  - user_settings (настройки)

- **SETUP-SUPABASE.md** - Инструкции по настройке Supabase

## 🔧 Конфигурация

### vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### package.json
```json
{
  "name": "felix-bot",
  "version": "4.2.0",
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@vercel/speed-insights": "^1.3.1",
    "groq-sdk": "^0.3.0",
    "pg": "^8.11.3"
  }
}
```

## 🚀 Как добавить новую функцию

### 1. Новая команда (без БД)
Добавьте в `api/webhook.js`:

```javascript
// Handle /mycommand command
if (text.startsWith('/mycommand ')) {
    const input = text.replace('/mycommand ', '');
    
    updateStats(userId, 'mycommand');
    await sendMessage(chatId, '⏳ Обрабатываю...');
    
    const result = await myFunction(input);
    
    await sendMessage(chatId, `✅ Результат:\n\n${result}`);
    
    return res.status(200).json({ ok: true });
}

// Добавьте функцию
async function myFunction(input) {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'Ваш промпт' },
            { role: 'user', content: input }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048
    });
    
    return completion.choices[0]?.message?.content || 'Ошибка';
}
```

### 2. Новая команда (с БД)
1. Создайте функцию в соответствующем файле `lib/`
2. Импортируйте в `api/webhook.js`
3. Добавьте обработчик команды
4. Обновите схему БД если нужно

### 3. Новый API endpoint
1. Создайте файл `api/myendpoint.js`
2. Экспортируйте default async function handler
3. Добавьте в `vercel.json` если нужна маршрутизация

## 📊 Переход на версию с БД

Когда будете готовы добавить базу данных:

1. **Настройте Supabase**
   ```bash
   # Следуйте инструкциям в database/SETUP-SUPABASE.md
   ```

2. **Добавьте переменные окружения**
   ```
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=...
   ```

3. **Обновите api/webhook.js**
   ```javascript
   import { saveMessage, getHistory } from '../lib/db.js';
   
   // Замените in-memory storage на БД вызовы
   ```

4. **Активируйте дополнительные API**
   - api/history.js - история сообщений
   - api/stats.js - статистика
   - api/search.js - поиск
   - api/export.js - экспорт
   - api/settings.js - настройки

## 🎨 Модульная структура

Проект спроектирован для легкого расширения:

```
Текущая версия (v4.2):
webhook.js → Groq API → Telegram

Будущая версия (v4.3+):
webhook.js → lib/* → database → Telegram
           ↓
        api/* (дополнительные endpoints)
```

## 📝 Соглашения о коде

1. **Именование функций**: camelCase (getAIResponse, translateText)
2. **Именование констант**: UPPER_CASE (BOT_TOKEN, API_URL)
3. **Async/await**: всегда используйте для асинхронных операций
4. **Обработка ошибок**: try/catch с логированием
5. **Комментарии**: на русском или английском
6. **Форматирование**: 4 пробела для отступов

## 🔄 Workflow разработки

1. **Локальная разработка**
   ```bash
   npm install
   vercel dev
   ```

2. **Тестирование**
   ```bash
   # Отправьте команды боту в Telegram
   # Проверьте логи в консоли
   ```

3. **Деплой**
   ```bash
   git add .
   git commit -m "feat: добавлена новая функция"
   git push origin main
   ```

4. **Проверка**
   - Откройте Vercel Dashboard
   - Проверьте логи Functions
   - Протестируйте бота

## 📚 Дополнительная документация

- **README.md** - Основная документация и быстрый старт
- **CHANGELOG.md** - История всех изменений
- **FAQ.md** - Ответы на частые вопросы
- **database/SETUP-SUPABASE.md** - Настройка БД

---

**Структура обновлена**: 01.03.2026  
**Версия**: v4.2.0
