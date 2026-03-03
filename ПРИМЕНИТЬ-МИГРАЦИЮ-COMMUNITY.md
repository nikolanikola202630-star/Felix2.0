# Применить Миграцию Community System

## Что добавляется

✅ Таблица `discussions` - обсуждения по курсам
✅ Таблица `discussion_comments` - комментарии к обсуждениям
✅ Таблица `discussion_likes` - лайки обсуждений
✅ Колонка `preferences` в `user_settings` - JSON настройки персонализации
✅ Тестовые данные - примеры обсуждений

## Как применить

### Вариант 1: Через Supabase Dashboard

1. Открой https://supabase.com/dashboard
2. Выбери проект Felix Academy
3. Перейди в SQL Editor
4. Скопируй содержимое файла `database/migrations/005-community-system.sql`
5. Вставь в редактор и нажми RUN

### Вариант 2: Через psql

```bash
psql "postgresql://postgres.xxxxxxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f database/migrations/005-community-system.sql
```

## Проверка

После применения миграции проверь:

```sql
-- Проверка таблиц
SELECT COUNT(*) FROM discussions;
SELECT COUNT(*) FROM discussion_comments;
SELECT COUNT(*) FROM discussion_likes;

-- Проверка тестовых данных
SELECT * FROM discussions LIMIT 5;
```

## Что работает после миграции

### Community (Сообщество)
- 📰 Обсуждения по темам курсов
- 💬 Комментарии к обсуждениям
- ❤️ Лайки обсуждений
- 📊 Статистика сообщества

### Settings (Настройки)
- 🎨 Персонализация темы
- 🤖 Настройки AI (модель, температура)
- 🔔 Управление уведомлениями
- 📚 Настройки обучения
- 💾 Синхронизация с сервером

## API Endpoints

### Community API
- `GET /api/community/discussions?course_id=1` - получить обсуждения
- `POST /api/community/discussions` - создать обсуждение
- `GET /api/community/discussions/:id/comments` - получить комментарии
- `POST /api/community/discussions/:id/comments` - добавить комментарий
- `POST /api/community/discussions/:id/like` - лайкнуть/убрать лайк
- `GET /api/community/stats` - статистика сообщества

### Settings API
- `GET /api/settings?user_id=123` - получить настройки
- `POST /api/settings` - сохранить настройки

## Тестирование

### 1. Проверь Community
https://felix2-0.vercel.app/miniapp/community.html

Должно работать:
- ✅ Табы по курсам (Трейдинг, Крипто, Психология и т.д.)
- ✅ Список обсуждений
- ✅ Лайки
- ✅ Комментарии
- ✅ Статистика (участники, посты, онлайн)

### 2. Проверь Settings
https://felix2-0.vercel.app/miniapp/settings.html

Должно работать:
- ✅ Переключение темы (светлая/темная/авто)
- ✅ Настройки AI (модель, температура)
- ✅ Уведомления (вкл/выкл)
- ✅ Настройки обучения
- ✅ Очистка кэша
- ✅ Синхронизация с сервером

### 3. Проверь персонализацию
1. Измени настройки в Settings
2. Перейди на главную страницу
3. Настройки должны применяться глобально:
   - Тема
   - Анимации
   - Размер шрифта

## Структура базы данных

```sql
-- Обсуждения
discussions (
  id, user_id, course_id, category, 
  title, content, is_pinned, is_locked,
  created_at, updated_at
)

-- Комментарии
discussion_comments (
  id, discussion_id, user_id, 
  content, created_at, updated_at
)

-- Лайки
discussion_likes (
  id, discussion_id, user_id, created_at
)

-- Настройки пользователя (обновлено)
user_settings (
  ...,
  preferences JSONB -- JSON с полными настройками
)
```

## Категории обсуждений

- `trading` - 📈 Трейдинг
- `crypto` - ₿ Криптовалюты
- `psychology` - 🧠 Психология
- `investments` - 💼 Инвестиции
- `general` - 💬 Общее

## Следующие шаги

После применения миграции:

1. ✅ Проверь работу Community
2. ✅ Проверь работу Settings
3. ✅ Протестируй персонализацию
4. ✅ Проверь синхронизацию настроек
5. ✅ Добавь реальные обсуждения через бота

## Команды бота

Пользователи могут открыть:
- `/community` - открыть сообщество
- `/settings` - открыть настройки

⟁ EGOIST ECOSYSTEM © 2026
