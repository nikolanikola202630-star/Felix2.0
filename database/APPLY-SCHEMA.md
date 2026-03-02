# Применение полной схемы базы данных

## Файлы схемы

- `complete-schema.sql` - Полная актуальная схема (рекомендуется)
- `v4-schema.sql` - Оригинальная схема v4
- `add-message-type-column.sql` - Миграция для добавления message_type

## Способ 1: Через Supabase Dashboard (Рекомендуется)

### Для новой базы данных:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Создайте новый запрос
5. Скопируйте содержимое `database/complete-schema.sql`
6. Нажмите **Run** (или Ctrl+Enter)
7. Дождитесь завершения (может занять 10-30 секунд)

### Для существующей базы данных:

Если у вас уже есть данные, используйте миграцию:

1. Откройте **SQL Editor** в Supabase
2. Выполните `database/add-message-type-column.sql`
3. Проверьте результат запросом:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'message_type';
```

## Способ 2: Через psql (командная строка)

```bash
# Получите строку подключения из Supabase Dashboard
# Settings → Database → Connection string → URI

# Подключитесь к базе данных
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Примените схему
\i database/complete-schema.sql

# Или для миграции
\i database/add-message-type-column.sql
```

## Способ 3: Через Node.js скрипт

Создайте файл `apply-schema.js`:

```javascript
import { readFileSync } from 'fs';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applySchema() {
  try {
    const schema = readFileSync('./database/complete-schema.sql', 'utf8');
    await pool.query(schema);
    console.log('✅ Schema applied successfully');
  } catch (error) {
    console.error('❌ Error applying schema:', error);
  } finally {
    await pool.end();
  }
}

applySchema();
```

Запустите:
```bash
node apply-schema.js
```

## Проверка после применения

Выполните эти запросы для проверки:

### 1. Проверить все таблицы
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Должны быть:
- users
- messages
- tags
- message_tags
- user_settings
- voice_messages
- image_messages
- document_messages
- export_history

### 2. Проверить столбец message_type
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'message_type';
```

Результат:
```
 column_name  | data_type         | is_nullable | column_default
--------------+-------------------+-------------+----------------
 message_type | character varying | NO          | 'text'::character varying
```

### 3. Проверить индексы
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY indexname;
```

### 4. Проверить функции
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Должны быть:
- cleanup_expired_exports
- get_user_message_count
- refresh_user_stats
- search_messages_ranked
- update_updated_at_column

### 5. Тестовый запрос
```sql
-- Создать тестового пользователя
INSERT INTO users (id, first_name, username) 
VALUES (123456789, 'Test User', 'testuser')
ON CONFLICT (id) DO NOTHING;

-- Создать тестовое сообщение
INSERT INTO messages (user_id, role, content, message_type)
VALUES (123456789, 'user', 'Привет!', 'text')
RETURNING *;

-- Проверить статистику
SELECT * FROM user_stats WHERE user_id = 123456789;
```

## Что включает полная схема

### Таблицы:
- `users` - пользователи Telegram
- `messages` - все сообщения с типами (text, voice, image, document)
- `tags` - теги для категоризации
- `message_tags` - связь сообщений и тегов
- `user_settings` - настройки пользователей
- `voice_messages` - метаданные голосовых сообщений
- `image_messages` - метаданные изображений
- `document_messages` - метаданные документов
- `export_history` - история экспортов

### Индексы:
- Первичные ключи и внешние ключи
- Индексы для быстрого поиска по user_id, created_at
- Full-text search индекс для поиска по содержимому
- Trigram индекс для нечеткого поиска

### Функции:
- `refresh_user_stats()` - обновление статистики
- `cleanup_expired_exports()` - очистка старых экспортов
- `get_user_message_count()` - подсчет сообщений
- `search_messages_ranked()` - поиск с ранжированием

### Триггеры:
- Автоматическое обновление `updated_at` при изменении записей

## Обслуживание

### Обновление статистики (запускать раз в час)
```sql
SELECT refresh_user_stats();
```

### Очистка старых экспортов (запускать раз в день)
```sql
SELECT cleanup_expired_exports();
```

### Оптимизация (запускать раз в неделю)
```sql
VACUUM ANALYZE;
```

## Откат изменений

Если нужно удалить все таблицы:

```sql
DROP MATERIALIZED VIEW IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS export_history CASCADE;
DROP TABLE IF EXISTS document_messages CASCADE;
DROP TABLE IF EXISTS image_messages CASCADE;
DROP TABLE IF EXISTS voice_messages CASCADE;
DROP TABLE IF EXISTS message_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

⚠️ **ВНИМАНИЕ**: Это удалит все данные!

## Переменные окружения

Убедитесь, что в `.env` или `.env.local` есть:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

Получить строку подключения:
1. Supabase Dashboard → Settings → Database
2. Connection string → URI
3. Скопируйте и замените `[YOUR-PASSWORD]`

## Поддержка

Если возникли проблемы:
1. Проверьте логи в Supabase Dashboard → Logs
2. Убедитесь, что DATABASE_URL правильный
3. Проверьте права доступа к базе данных
4. Попробуйте выполнить запросы по частям
