# Felix Academy - Синхронизация Ботов

⟁ EGOIST ECOSYSTEM v10.3

## Обзор

Felix Academy использует два бота для полного функционала:

1. **Основной бот** (@fel12x_bot) - полный функционал академии
2. **Реферальный бот** - обработка партнерских ссылок

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram API                          │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌────────────────┐
    │  Main Bot      │          │ Referral Bot   │
    │  @fel12x_bot   │          │ @ref_bot       │
    └────────┬───────┘          └────────┬───────┘
             │                            │
             │    ┌──────────────┐        │
             └────►   Database   ◄────────┘
                  │  (Supabase)  │
                  └──────────────┘
```

## Основной бот (Main Bot)

### Функционал
- ✅ AI-ассистент (Groq API)
- ✅ Управление курсами
- ✅ Профиль пользователя
- ✅ Партнерская программа
- ✅ Админ-панель
- ✅ Сообщество
- ✅ Mini App интеграция

### Webhook
```
POST https://felix2-0.vercel.app/api/webhook
```

### Команды
```
/start - Главное меню
/help - Справка
/profile - Профиль
/ask [вопрос] - AI-ассистент
/partner - Партнерская программа
/partner_panel - Партнерский кабинет
/admin - Админ-панель
/community - Сообщество
```

### Обработка реферальных ссылок
```
/start ref_123456 - Обычный реферал
/start ref_partner123456 - Партнерский реферал
```

## Реферальный бот (Referral Bot)

### Функционал
- ✅ Обработка реферальных переходов
- ✅ Трекинг кликов
- ✅ Условия доступа (подписки, квизы, формы)
- ✅ Кастомизация партнерами
- ✅ Перенаправление в основного бота

### Webhook
```
POST https://felix2-0.vercel.app/api/referral-bot-v2
```

### Процесс работы

1. **Пользователь переходит по реферальной ссылке**
   ```
   https://t.me/ref_bot?start=ref_123456
   ```

2. **Реферальный бот:**
   - Сохраняет клик в БД
   - Проверяет условия доступа
   - Показывает кастомное приветствие
   - Перенаправляет в основного бота

3. **Основной бот:**
   - Получает пользователя с реферальным кодом
   - Связывает с партнером
   - Начисляет бонусы при покупке

## Синхронизация

### Автоматическая синхронизация

Используйте скрипт:
```bash
node scripts/sync-bots.js
```

Скрипт проверяет:
- ✅ Токены ботов
- ✅ Подключение к БД
- ✅ Статус webhook'ов
- ✅ Статистику
- ✅ Настройки

### Ручная синхронизация

#### 1. Проверка ботов
```bash
# Main Bot
curl https://api.telegram.org/bot<TOKEN>/getMe

# Referral Bot
curl https://api.telegram.org/bot<REF_TOKEN>/getMe
```

#### 2. Установка webhook'ов
```bash
# Main Bot
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://felix2-0.vercel.app/api/webhook"}'

# Referral Bot
curl -X POST https://api.telegram.org/bot<REF_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://felix2-0.vercel.app/api/referral-bot-v2"}'
```

#### 3. Проверка webhook'ов
```bash
# Main Bot
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Referral Bot
curl https://api.telegram.org/bot<REF_TOKEN>/getWebhookInfo
```

## База данных

### Общие таблицы

```sql
-- Пользователи (общая для обоих ботов)
users (
  id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  created_at TIMESTAMP
)

-- История сообщений
history (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  role TEXT,
  content TEXT,
  message_type TEXT,
  created_at TIMESTAMP
)

-- Партнерские аккаунты
partner_accounts (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  referral_code TEXT UNIQUE,
  is_active BOOLEAN,
  created_at TIMESTAMP
)

-- Реферальные клики
referral_clicks (
  id SERIAL PRIMARY KEY,
  partner_user_id BIGINT,
  referral_code TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  session_id TEXT,
  is_unique BOOLEAN,
  blocked_reason TEXT,
  created_at TIMESTAMP
)

-- Реферальные связи
user_referrals (
  user_id BIGINT PRIMARY KEY REFERENCES users(id),
  referrer_id BIGINT REFERENCES users(id),
  referral_code TEXT,
  created_at TIMESTAMP
)
```

## Переменные окружения

### Основной бот
```env
BOT_TOKEN=your_main_bot_token
TELEGRAM_BOT_TOKEN=your_main_bot_token
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_url
MINIAPP_URL=https://felix2-0.vercel.app/miniapp/index.html
```

### Реферальный бот
```env
REFERRAL_BOT_TOKEN=your_referral_bot_token
DATABASE_URL=your_database_url
```

## Локальное тестирование

### Polling режим (без webhook)

#### Основной бот
```bash
node bot.js
```

#### Реферальный бот (локально)
```bash
node bot-local-polling.js
```

### С ngrok (для webhook)
```bash
# Запустить ngrok
ngrok http 3000

# Установить webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://your-ngrok-url.ngrok.io/api/webhook"

# Запустить сервер
npm run dev
```

## Production Deployment

### Vercel

1. **Установить переменные окружения:**
   ```bash
   vercel env add BOT_TOKEN
   vercel env add REFERRAL_BOT_TOKEN
   vercel env add DATABASE_URL
   vercel env add GROQ_API_KEY
   ```

2. **Деплой:**
   ```bash
   vercel --prod
   ```

3. **Установить webhook'и:**
   ```bash
   node scripts/sync-bots.js
   ```

## Мониторинг

### Проверка статуса
```bash
# Main Bot
curl https://felix2-0.vercel.app/api/webhook

# Referral Bot
curl https://felix2-0.vercel.app/api/referral-bot-v2
```

### Логи
```bash
# Vercel logs
vercel logs

# Database logs
# Смотреть в Supabase Dashboard
```

### Метрики
- Количество пользователей
- AI запросы
- Реферальные клики
- Конверсия партнеров

## Troubleshooting

### Бот не отвечает
1. Проверить webhook: `getWebhookInfo`
2. Проверить логи Vercel
3. Проверить подключение к БД
4. Проверить токен бота

### Реферальные ссылки не работают
1. Проверить webhook реферального бота
2. Проверить таблицу `referral_clicks`
3. Проверить логику в `api/referral-bot-v2.js`

### AI не отвечает
1. Проверить `GROQ_API_KEY`
2. Проверить лимиты API
3. Проверить логи ошибок в БД

## Обновление

### Обновить основного бота
```bash
# Изменить код в api/webhook.js
git add api/webhook.js
git commit -m "Update main bot"
vercel --prod
```

### Обновить реферального бота
```bash
# Изменить код в api/referral-bot-v2.js
git add api/referral-bot-v2.js
git commit -m "Update referral bot"
vercel --prod
```

## Безопасность

### Токены
- ❌ Никогда не коммитить токены в git
- ✅ Использовать переменные окружения
- ✅ Ротация токенов раз в 3 месяца

### Webhook
- ✅ Использовать HTTPS
- ✅ Проверять подпись Telegram (опционально)
- ✅ Rate limiting

### База данных
- ✅ Использовать prepared statements
- ✅ Хешировать IP адреса
- ✅ Регулярные бэкапы

## Поддержка

Вопросы и проблемы:
- Telegram: @egoist_ecosystem
- Email: support@egoist-ecosystem.com

---

⟁ EGOIST ECOSYSTEM © 2026
