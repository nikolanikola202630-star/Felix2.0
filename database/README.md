# 🗄️ База данных Felix Bot

## О папке database/

Эта папка содержит схемы базы данных для **будущих версий** Felix Bot.

**Текущая версия v4.2** использует in-memory storage и **НЕ требует** базу данных.

## 📁 Содержимое

- **v4-schema.sql** - Полная схема PostgreSQL с таблицами
- **SETUP-SUPABASE.md** - Инструкции по настройке Supabase
- **README.md** - Этот файл

## 🎯 Когда нужна база данных

База данных понадобится когда вы хотите:

### Постоянное хранение
- ✅ Сохранять историю сообщений между перезапусками
- ✅ Хранить настройки пользователей
- ✅ Сохранять статистику использования

### Расширенные функции
- ✅ Поиск по истории сообщений
- ✅ Экспорт данных в PDF/DOCX
- ✅ Теги и категории
- ✅ Расширенная аналитика

### Масштабирование
- ✅ Поддержка тысяч пользователей
- ✅ Резервное копирование данных
- ✅ Миграции и версионирование

## 📊 Схема базы данных

### Таблицы

#### users
Информация о пользователях
```sql
- id (bigint) - Telegram user ID
- username (text) - Telegram username
- first_name (text) - Имя
- language_code (text) - Язык (ru/en)
- created_at (timestamp) - Дата регистрации
- last_active (timestamp) - Последняя активность
```

#### messages
История сообщений
```sql
- id (uuid) - Уникальный ID
- user_id (bigint) - ID пользователя
- role (text) - user/assistant
- content (text) - Текст сообщения
- created_at (timestamp) - Дата создания
```

#### voice_messages
Голосовые сообщения
```sql
- id (uuid) - Уникальный ID
- user_id (bigint) - ID пользователя
- file_id (text) - Telegram file ID
- transcription (text) - Распознанный текст
- duration (integer) - Длительность в секундах
- created_at (timestamp) - Дата создания
```

#### tags
Теги для организации
```sql
- id (uuid) - Уникальный ID
- user_id (bigint) - ID пользователя
- name (text) - Название тега
- color (text) - Цвет тега
- created_at (timestamp) - Дата создания
```

#### user_settings
Настройки пользователей
```sql
- user_id (bigint) - ID пользователя
- language (text) - Язык интерфейса
- notifications (boolean) - Уведомления
- theme (text) - Тема (light/dark)
- updated_at (timestamp) - Дата обновления
```

## 🚀 Быстрый старт с Supabase

### Шаг 1: Создайте проект
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь инициализации (~2 минуты)

### Шаг 2: Создайте таблицы
1. Откройте SQL Editor в Supabase
2. Скопируйте содержимое `v4-schema.sql`
3. Выполните SQL запрос
4. Проверьте что все таблицы созданы

### Шаг 3: Получите credentials
1. Settings → API
2. Скопируйте:
   - Project URL
   - anon/public key
   - service_role key

### Шаг 4: Добавьте в Vercel
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### Шаг 5: Обновите код
```javascript
// В api/webhook.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Сохранение сообщения
await supabase.from('messages').insert({
    user_id: userId,
    role: 'user',
    content: text
});

// Получение истории
const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
```

## 📖 Подробная инструкция

Полная инструкция по настройке: **SETUP-SUPABASE.md**

## 🔄 Миграция с in-memory на БД

### Было (v4.2):
```javascript
// In-memory storage
const conversations = new Map();
const userStats = new Map();

// Сохранение
conversations.set(userId, messages);
userStats.set(userId, stats);

// Получение
const history = conversations.get(userId);
const stats = userStats.get(userId);
```

### Стало (v4.4+):
```javascript
// Database storage
import { saveMessage, getHistory } from '../lib/db.js';

// Сохранение
await saveMessage(userId, message);
await updateStats(userId, command);

// Получение
const history = await getHistory(userId);
const stats = await getUserStats(userId);
```

## 💰 Стоимость

### Supabase Free Tier
- ✅ 500MB база данных
- ✅ 1GB файлового хранилища
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Достаточно для 1000+ пользователей

### Когда нужен платный план
- Более 500MB данных
- Более 50,000 активных пользователей
- Нужны дополнительные функции (Point-in-time recovery)

## 🔒 Безопасность

### Row Level Security (RLS)
Схема включает RLS политики:
```sql
-- Пользователи видят только свои данные
CREATE POLICY "Users can view own data"
ON messages FOR SELECT
USING (auth.uid()::bigint = user_id);
```

### API Keys
- **anon key** - для клиентских запросов (безопасно)
- **service_role key** - для серверных запросов (секретно!)

### Best Practices
- ✅ Используйте service_role key только на сервере
- ✅ Никогда не коммитьте ключи в Git
- ✅ Храните ключи в переменных окружения
- ✅ Регулярно ротируйте ключи

## 📊 Производительность

### Индексы
Схема включает оптимальные индексы:
```sql
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### Оптимизация запросов
```javascript
// ❌ Плохо - загружает все сообщения
const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId);

// ✅ Хорошо - только последние 20
const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
```

## 🔧 Обслуживание

### Резервное копирование
Supabase автоматически создает бэкапы:
- Daily backups (7 дней)
- Point-in-time recovery (платный план)

### Мониторинг
Dashboard → Database → Statistics:
- Размер базы данных
- Количество запросов
- Производительность

### Очистка старых данных
```sql
-- Удалить сообщения старше 90 дней
DELETE FROM messages 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🎯 Roadmap

### v4.4 - Базовая БД
- ✅ Подключение Supabase
- ✅ Сохранение сообщений
- ✅ История диалогов

### v4.5 - Расширенные функции
- ✅ Поиск по истории
- ✅ Теги и категории
- ✅ Настройки пользователей

### v5.0 - Полный функционал
- ✅ Экспорт данных
- ✅ Расширенная аналитика
- ✅ Резервное копирование

## 🔗 Полезные ссылки

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript

## 💡 Примеры использования

### Пример 1: Сохранение сообщения
```javascript
const { data, error } = await supabase
    .from('messages')
    .insert({
        user_id: userId,
        role: 'user',
        content: text
    });
```

### Пример 2: Получение истории
```javascript
const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
```

### Пример 3: Поиск по тексту
```javascript
const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .textSearch('content', query);
```

---

**База данных готова к использованию, когда вы будете готовы!**

Подробная инструкция: **SETUP-SUPABASE.md**
