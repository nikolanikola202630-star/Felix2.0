# ⚠️ Исправление ошибки "relation users does not exist"

## Проблема

```
ERROR: 42P01: relation "users" does not exist
```

Это значит, что базовая схема БД еще не создана.

---

## ✅ Решение (2 шага)

### Шаг 1: Применить базовую схему (5 мин)

1. В Supabase SQL Editor создайте **New Query**
2. Откройте файл `database/complete-schema.sql`
3. Скопируйте **ВСЁ** содержимое
4. Вставьте в SQL Editor
5. Нажмите **RUN**

**Результат:** Должны создаться основные таблицы:
- users
- messages
- tags
- message_tags
- user_settings
- voice_messages
- image_messages
- document_messages
- export_history

### Шаг 2: Применить миграцию ML таблиц (3 мин)

После успешного выполнения Шага 1:

1. Создайте **New Query**
2. Откройте файл `database/migrations/001-add-ml-tables-safe.sql`
3. Скопируйте **ВСЁ** содержимое
4. Вставьте в SQL Editor
5. Нажмите **RUN**

**Результат:** Должно появиться:
```
✅ Migration 001 completed successfully! All tables created.
tables_created: 13
```

---

## 🔍 Проверка

После обоих шагов выполните:

```sql
-- Проверить все таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Ожидаемый результат:** 22 таблицы
- 9 базовых (users, messages, и т.д.)
- 13 новых (user_profiles, courses, и т.д.)

---

## 📋 Быстрая команда

Если хотите выполнить всё одним запросом, можно объединить:

1. Откройте `database/complete-schema.sql`
2. Скопируйте всё
3. Добавьте в конец содержимое `database/migrations/001-add-ml-tables-safe.sql`
4. Выполните всё вместе

**Внимание:** Это займет ~30 секунд выполнения

---

## ✅ Готово!

После успешного выполнения обоих шагов:
- ✅ Все 22 таблицы созданы
- ✅ Индексы настроены
- ✅ Триггеры работают
- ✅ Бот готов к работе

**Следующий шаг:** Вернуться к деплою (git push)
