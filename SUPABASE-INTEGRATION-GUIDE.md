# 🗄️ Supabase Integration - Пошаговое руководство

**Дата:** 02.03.2026  
**Время:** 30-40 минут  
**Сложность:** Средняя

---

## 📋 Что будем делать

1. Создать проект Supabase
2. Применить схему базы данных
3. Настроить Storage buckets
4. Получить credentials
5. Добавить в Vercel Environment Variables
6. Интегрировать в код
7. Тестировать

---

## Шаг 1: Создание проекта Supabase (5 минут)

### 1.1 Регистрация/Вход

1. Открыть https://supabase.com
2. Нажать "Start your project"
3. Войти через GitHub (рекомендуется) или Email

### 1.2 Создание проекта

1. Нажать "New Project"
2. Выбрать организацию (или создать новую)
3. Заполнить форму:
   - **Name:** `felix-bot-v6`
   - **Database Password:** Сгенерировать надежный пароль (СОХРАНИТЬ!)
   - **Region:** Выбрать ближайший (например, `Europe (Frankfurt)`)
   - **Pricing Plan:** Free (достаточно для старта)
4. Нажать "Create new project"
5. Дождаться создания (2-3 минуты)

**⚠️ ВАЖНО:** Сохраните Database Password! Он понадобится позже.

---

## Шаг 2: Применение схемы БД (5 минут)

### 2.1 Открыть SQL Editor

1. В левом меню нажать "SQL Editor"
2. Нажать "New query"

### 2.2 Скопировать схему

Открыть файл `database/v4-schema.sql` в проекте и скопировать весь код.

### 2.3 Выполнить SQL

1. Вставить скопированный код в SQL Editor
2. Нажать "Run" (или Ctrl+Enter)
3. Дождаться выполнения (10-20 секунд)
4. Должно появиться: "Success. No rows returned"

### 2.4 Проверить таблицы

1. В левом меню нажать "Table Editor"
2. Должны появиться таблицы:
   - ✅ users
   - ✅ messages
   - ✅ tags
   - ✅ message_tags
   - ✅ user_settings
   - ✅ voice_messages
   - ✅ image_messages
   - ✅ document_messages
   - ✅ export_history
   - ✅ user_stats (materialized view)

---

## Шаг 3: Настройка Storage (10 минут)

### 3.1 Создать buckets

1. В левом меню нажать "Storage"
2. Нажать "Create a new bucket"

### 3.2 Bucket: voices

1. **Name:** `voices`
2. **Public bucket:** OFF (приватный)
3. **File size limit:** 20 MB
4. **Allowed MIME types:** `audio/ogg, audio/mpeg, audio/wav`
5. Нажать "Create bucket"

### 3.3 Bucket: images

1. **Name:** `images`
2. **Public bucket:** OFF
3. **File size limit:** 20 MB
4. **Allowed MIME types:** `image/jpeg, image/png, image/webp`
5. Нажать "Create bucket"

### 3.4 Bucket: documents

1. **Name:** `documents`
2. **Public bucket:** OFF
3. **File size limit:** 50 MB
4. **Allowed MIME types:** `application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
5. Нажать "Create bucket"

### 3.5 Bucket: exports

1. **Name:** `exports`
2. **Public bucket:** OFF
3. **File size limit:** 100 MB
4. **Allowed MIME types:** `text/plain, application/json, application/pdf`
5. Нажать "Create bucket"

### 3.6 Настроить Policies

Для каждого bucket нужно создать policies для доступа.

**Для bucket "voices":**

1. Открыть bucket "voices"
2. Нажать "Policies" → "New Policy"
3. Выбрать "For full customization"
4. Создать 3 policy:

**Policy 1: Upload**
```sql
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Read**
```sql
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Повторить для остальных buckets** (images, documents, exports), заменив `'voices'` на соответствующее имя.

---

## Шаг 4: Получение Credentials (5 минут)

### 4.1 Открыть Settings

1. В левом меню нажать "Project Settings" (иконка шестеренки)
2. Выбрать "API"

### 4.2 Скопировать данные

Скопировать следующие значения:

**Project URL:**
```
https://[your-project-ref].supabase.co
```

**API Keys:**

**anon (public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**service_role (secret):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 Получить Database URL

1. В Project Settings выбрать "Database"
2. Прокрутить до "Connection string"
3. Выбрать "URI" tab
4. Скопировать **Connection pooling** URL (рекомендуется):
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**⚠️ ВАЖНО:** Замените `[PASSWORD]` на ваш Database Password из Шага 1!

---

## Шаг 5: Добавление в Vercel (5 минут)

### 5.1 Открыть Vercel Dashboard

1. Перейти на https://vercel.com/dashboard
2. Выбрать проект Felix Bot
3. Перейти в Settings → Environment Variables

### 5.2 Добавить переменные

Добавить следующие переменные (нажать "Add" для каждой):

**DATABASE_URL:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**SUPABASE_URL:**
```
https://[your-project-ref].supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**SUPABASE_SERVICE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.3 Выбрать окружения

Для каждой переменной выбрать:
- ✅ Production
- ✅ Preview
- ✅ Development

### 5.4 Сохранить

Нажать "Save" для каждой переменной.

---

## Шаг 6: Обновление кода (уже готово!)

Код уже подготовлен в `lib/db.js`. Нужно только переключить storage.

### 6.1 Обновить webhook.js

Файл уже обновлен для работы с async storage. Проверим импорт:

```javascript
// В начале файла должно быть:
import { simpleStorage } from '../lib/storage-simple.js';

// Для Supabase нужно изменить на:
import { db } from '../lib/db.js';
```

Я сейчас создам версию с Supabase интеграцией.

---

## Шаг 7: Тестирование (5 минут)

### 7.1 Локальное тестирование (опционально)

```bash
# Создать .env.local
cp .env.example .env.local

# Добавить credentials в .env.local
# DATABASE_URL=...
# SUPABASE_URL=...
# и т.д.

# Запустить локально
vercel dev
```

### 7.2 Production тестирование

После деплоя:

1. Открыть бота в Telegram
2. Отправить `/start`
3. Отправить несколько сообщений
4. Проверить в Supabase Table Editor:
   - Таблица `users` - должна появиться запись
   - Таблица `messages` - должны появиться сообщения

### 7.3 Проверить команды

```
/profile - должен показать профиль
/stats - должен показать статистику
/level - должен показать уровень
```

---

## 📊 Что хранится в Supabase

### Таблица users
```sql
id (bigint) - Telegram user ID
username (varchar)
first_name (varchar)
last_name (varchar)
language (varchar) - ru/en
created_at (timestamp)
updated_at (timestamp)
```

### Таблица messages
```sql
id (bigserial) - Auto increment
user_id (bigint) - FK to users
role (varchar) - user/assistant
content (text) - Текст сообщения
message_type (varchar) - text/voice/image/document
metadata (jsonb) - Дополнительные данные
created_at (timestamp)
```

### Таблица user_settings
```sql
user_id (bigint) - FK to users
ai_temperature (decimal)
ai_model (varchar)
theme (varchar)
notifications_enabled (boolean)
```

---

## 🔍 Мониторинг

### Supabase Dashboard

1. **Table Editor** - просмотр данных
2. **SQL Editor** - выполнение запросов
3. **Database** → **Reports** - статистика
4. **Logs** - логи запросов

### Полезные запросы

**Количество пользователей:**
```sql
SELECT COUNT(*) FROM users;
```

**Количество сообщений:**
```sql
SELECT COUNT(*) FROM messages;
```

**Топ активных пользователей:**
```sql
SELECT u.username, COUNT(m.id) as msg_count
FROM users u
JOIN messages m ON u.id = m.user_id
GROUP BY u.id, u.username
ORDER BY msg_count DESC
LIMIT 10;
```

**Сообщения за сегодня:**
```sql
SELECT COUNT(*) FROM messages
WHERE created_at >= CURRENT_DATE;
```

---

## 💰 Лимиты Free Tier

### Supabase Free Plan
- ✅ 500 MB Database
- ✅ 1 GB File Storage
- ✅ 2 GB Bandwidth
- ✅ 50,000 Monthly Active Users
- ✅ Unlimited API requests

### Когда нужен upgrade
- >500 MB данных → Pro ($25/month)
- >1 GB файлов → Pro
- >50k MAU → Pro

---

## 🐛 Troubleshooting

### Проблема: Connection timeout

**Причина:** Неправильный DATABASE_URL или firewall

**Решение:**
1. Проверить DATABASE_URL (должен быть pooled connection)
2. Проверить что пароль правильный
3. Использовать pooled connection (port 6543, не 5432)

### Проблема: Authentication failed

**Причина:** Неправильный пароль

**Решение:**
1. Сбросить пароль в Supabase Dashboard
2. Обновить DATABASE_URL в Vercel
3. Redeploy

### Проблема: Таблицы не созданы

**Причина:** SQL скрипт не выполнен или ошибка

**Решение:**
1. Проверить SQL Editor - были ли ошибки
2. Выполнить скрипт заново
3. Проверить Table Editor

### Проблема: Storage policies не работают

**Причина:** Policies не созданы или неправильные

**Решение:**
1. Проверить Policies в каждом bucket
2. Создать недостающие policies
3. Проверить синтаксис SQL

---

## ✅ Чек-лист готовности

- [ ] Проект Supabase создан
- [ ] Схема БД применена (10 таблиц)
- [ ] Storage buckets созданы (4 шт)
- [ ] Storage policies настроены
- [ ] Credentials получены
- [ ] Environment Variables добавлены в Vercel
- [ ] Код обновлен для Supabase
- [ ] Деплой выполнен
- [ ] Тестирование пройдено

---

## 🎯 Следующие шаги

После успешной интеграции:

1. Мониторить использование в Supabase Dashboard
2. Настроить backup (автоматический в Pro плане)
3. Оптимизировать запросы при необходимости
4. Добавить индексы для часто используемых запросов

---

**Создано:** 02.03.2026  
**Время выполнения:** 30-40 минут  
**Сложность:** Средняя  
**Результат:** Полноценная PostgreSQL база данных

🚀 **Готовы начать? Переходите к Шагу 1!**
