# Database Schema

Felix Bot использует PostgreSQL (Supabase) для хранения данных.

## Файлы

- `complete-schema.sql` - **Полная актуальная схема** (рекомендуется для новых проектов)
- `v4-schema.sql` - Оригинальная схема v4
- `add-message-type-column.sql` - Миграция для добавления message_type
- `APPLY-SCHEMA.md` - Подробная инструкция по применению
- `SETUP-SUPABASE.md` - Инструкция по настройке Supabase

## Быстрый старт

### Для новой базы данных:

1. Создайте проект на https://supabase.com
2. Откройте SQL Editor в Dashboard
3. Скопируйте содержимое `complete-schema.sql`
4. Выполните запрос (Run или Ctrl+Enter)
5. Добавьте в `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### Для существующей базы данных:

Если у вас уже есть данные и нужно добавить только message_type:

1. Откройте SQL Editor
2. Выполните `add-message-type-column.sql`
3. Проверьте результат

Подробнее: см. `APPLY-SCHEMA.md`

## Структура базы данных

### Основные таблицы:

- `users` - Пользователи Telegram
- `messages` - Все сообщения (text, voice, image, document)
- `tags` - Теги для категоризации
- `message_tags` - Связь сообщений и тегов
- `user_settings` - Настройки пользователей

### Метаданные:

- `voice_messages` - Метаданные голосовых сообщений
- `image_messages` - Метаданные изображений
- `document_messages` - Метаданные документов
- `export_history` - История экспортов

### Представления:

- `user_stats` - Материализованное представление со статистикой

## Возможности

✅ Full-text поиск на русском языке
✅ Trigram индексы для нечеткого поиска
✅ Автоматическая категоризация тегами
✅ История сообщений с фильтрами
✅ Статистика пользователей
✅ Экспорт в TXT, JSON, PDF
✅ Поддержка всех типов сообщений (текст, голос, изображения, документы)
✅ Оптимизированные индексы для быстрых запросов

## Функции

- `refresh_user_stats()` - Обновление статистики
- `cleanup_expired_exports()` - Очистка старых экспортов
- `get_user_message_count(user_id)` - Подсчет сообщений
- `search_messages_ranked(user_id, query, limit)` - Поиск с ранжированием

## Проверка

После применения схемы выполните:

```sql
-- Проверить таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Проверить message_type
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'message_type';

-- Тестовый запрос
INSERT INTO users (id, first_name) VALUES (123456789, 'Test') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (user_id, role, content, message_type)
VALUES (123456789, 'user', 'Привет!', 'text') RETURNING *;
```

## Обслуживание

Рекомендуется запускать периодически:

```sql
-- Обновить статистику (раз в час)
SELECT refresh_user_stats();

-- Очистить старые экспорты (раз в день)
SELECT cleanup_expired_exports();

-- Оптимизация (раз в неделю)
VACUUM ANALYZE;
```

## Поддержка

Если возникли проблемы, см. `APPLY-SCHEMA.md` или проверьте:
- Логи в Supabase Dashboard → Logs
- Правильность DATABASE_URL
- Права доступа к базе данных
