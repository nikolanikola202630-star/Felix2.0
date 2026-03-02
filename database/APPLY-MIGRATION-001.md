# 🗄️ Применение миграции 001 - ML Tables

## ⚡ Быстрая инструкция (5 минут)

### Шаг 1: Открыть Supabase

1. Перейти на https://supabase.com
2. Войти в аккаунт
3. Выбрать проект Felix Bot
4. Открыть **SQL Editor** (левое меню)

### Шаг 2: Выполнить миграцию

**ВАЖНО:** Используйте безопасную версию миграции!

1. Нажать **New Query**
2. Открыть файл `database/migrations/001-add-ml-tables-safe.sql` ⬅️ SAFE VERSION
3. Скопировать **весь** содержимое файла
4. Вставить в SQL Editor
5. Нажать **RUN** (или F5)

**Примечание:** Безопасная версия НЕ содержит DROP команд и безопасна для запуска

### Шаг 3: Проверить результат

Должно появиться сообщение:
```
Migration 001 completed successfully!
```

### Шаг 4: Проверить таблицы

Выполнить проверочный запрос:

```sql
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'user_profiles', 'user_learning_data', 'system_patterns', 
    'system_insights', 'system_logs', 'transcriptions', 
    'lecture_notes', 'courses', 'user_progress', 
    'achievements', 'user_achievements', 'partners', 'library_items'
  )
ORDER BY table_name;
```

**Ожидаемый результат:** 13 строк (все новые таблицы)

---

## ✅ Что добавляет миграция

### ML & Персонализация (5 таблиц)
- `user_profiles` - профили пользователей для ML
- `user_learning_data` - данные обучения
- `system_patterns` - паттерны системы
- `system_insights` - инсайты системы
- `system_logs` - логи системы

### Обучение & Курсы (6 таблиц)
- `transcriptions` - транскрипции голосовых
- `lecture_notes` - конспекты лекций
- `courses` - курсы
- `user_progress` - прогресс пользователей
- `achievements` - достижения
- `user_achievements` - достижения пользователей

### Дополнительно (2 таблицы)
- `partners` - партнеры
- `library_items` - элементы библиотеки

### Обновления существующих таблиц
- `user_settings` - добавлены поля: level, xp, avatar, ai_requests_today, ai_requests_total

---

## 🔍 Проверка после миграции

### 1. Проверить все таблицы

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Должно быть **22 таблицы** (9 старых + 13 новых)

### 2. Проверить индексы

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'courses', 'achievements')
ORDER BY tablename, indexname;
```

Должны быть индексы на всех новых таблицах

### 3. Проверить триггеры

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('user_profiles', 'courses', 'user_progress')
ORDER BY event_object_table;
```

Должны быть триггеры updated_at

### 4. Проверить начальные данные

```sql
-- Проверить достижения
SELECT COUNT(*) as achievements_count FROM achievements;
-- Должно быть 8

-- Проверить курсы
SELECT COUNT(*) as courses_count FROM courses;
-- Должно быть 5
```

---

## ⚠️ Если что-то пошло не так

### Ошибка: "relation already exists"

**Причина:** Таблица уже существует

**Решение:** Это нормально, миграция пропустит существующие таблицы

### Ошибка: "permission denied"

**Причина:** Недостаточно прав

**Решение:** 
1. Проверить, что вы владелец проекта
2. Использовать Service Role Key (Settings → API)

### Ошибка: "syntax error"

**Причина:** Неполный SQL код

**Решение:** Убедиться, что скопирован **весь** файл миграции

### Откат миграции

Если нужно откатить изменения:

```sql
-- ВНИМАНИЕ: Удалит все новые таблицы и данные!
DROP TABLE IF EXISTS library_items CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS lecture_notes CASCADE;
DROP TABLE IF EXISTS transcriptions CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS system_insights CASCADE;
DROP TABLE IF EXISTS system_patterns CASCADE;
DROP TABLE IF EXISTS user_learning_data CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Откатить изменения в user_settings
ALTER TABLE user_settings 
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS xp,
  DROP COLUMN IF EXISTS avatar,
  DROP COLUMN IF EXISTS ai_requests_today,
  DROP COLUMN IF EXISTS ai_requests_total;
```

---

## 📊 Размер БД после миграции

Проверить размер базы данных:

```sql
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;
```

Новые таблицы добавят ~1-2 MB к размеру БД (пустые таблицы + индексы)

---

## ✅ Готово!

После успешного применения миграции:

1. ✅ Все 13 новых таблиц созданы
2. ✅ Индексы настроены
3. ✅ Триггеры работают
4. ✅ Начальные данные загружены
5. ✅ Бот готов к использованию ML функций

**Следующий шаг:** Вернуться к `БЫСТРОЕ-ИСПРАВЛЕНИЕ.md` и продолжить деплой

---

**Время выполнения:** 5 минут  
**Сложность:** Легко  
**Результат:** Полная схема БД ✅
