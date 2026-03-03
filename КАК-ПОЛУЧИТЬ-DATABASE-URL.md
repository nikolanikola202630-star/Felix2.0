# Как Получить DATABASE_URL из Supabase

⟁ EGOIST ECOSYSTEM v10.3

## 🎯 Быстрая Инструкция

### Шаг 1: Открыть Supabase Dashboard

1. Перейти на https://supabase.com/dashboard
2. Войти в аккаунт
3. Выбрать проект Felix Academy (или создать новый)

### Шаг 2: Получить Connection String

1. В левом меню выбрать **Settings** (⚙️)
2. Выбрать **Database**
3. Прокрутить до раздела **Connection string**
4. Выбрать вкладку **URI**
5. Скопировать строку подключения

**Пример:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
```

### Шаг 3: Заменить [YOUR-PASSWORD]

1. В той же странице найти **Database password**
2. Если забыли пароль - нажать **Reset database password**
3. Скопировать новый пароль
4. Заменить `[YOUR-PASSWORD]` на реальный пароль

**Пример готовой строки:**
```
postgresql://postgres:MySecurePassword123@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
```

### Шаг 4: Обновить .env.local

Открыть файл `.env.local` и обновить:

```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
```

**ВАЖНО:** Не коммитить .env.local в git!

---

## 🔐 Альтернативный Способ (Pooler)

Для production рекомендуется использовать **Connection Pooler**:

### В Supabase Dashboard:

1. Settings → Database
2. Найти **Connection Pooling**
3. Выбрать **Transaction mode**
4. Скопировать **Connection string**

**Пример:**
```
postgresql://postgres.nnegvsxhspdnsvjpcscn:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Преимущества:**
- ✅ Лучше для serverless (Vercel)
- ✅ Автоматический connection pooling
- ✅ Меньше проблем с лимитами подключений

---

## ✅ Проверка Подключения

После обновления DATABASE_URL проверить:

```bash
node scripts/check-database.js
```

Должно вывести:
```
✅ Database connected
✅ Connection successful
```

---

## 🆘 Troubleshooting

### Ошибка: "getaddrinfo ENOTFOUND"

**Причина:** Неправильный хост или нет интернета

**Решение:**
1. Проверить что скопировали правильный URL
2. Проверить интернет соединение
3. Проверить что проект Supabase активен

### Ошибка: "password authentication failed"

**Причина:** Неправильный пароль

**Решение:**
1. Сбросить пароль в Supabase Dashboard
2. Обновить DATABASE_URL с новым паролем

### Ошибка: "too many connections"

**Причина:** Превышен лимит подключений

**Решение:**
1. Использовать Connection Pooler (см. выше)
2. Или увеличить лимит в Supabase (платные планы)

### Ошибка: "SSL connection required"

**Причина:** Supabase требует SSL

**Решение:**
Добавить `?sslmode=require` в конец URL:
```
postgresql://postgres:password@host:5432/postgres?sslmode=require
```

---

## 📋 Чеклист

- [ ] Открыл Supabase Dashboard
- [ ] Нашел Connection String
- [ ] Скопировал пароль (или сбросил)
- [ ] Заменил [YOUR-PASSWORD] на реальный
- [ ] Обновил .env.local
- [ ] Проверил подключение: `node scripts/check-database.js`
- [ ] Подключение работает ✅

---

## 🚀 После Успешного Подключения

Теперь можно применить миграции:

```bash
node scripts/apply-migrations.js
```

---

⟁ EGOIST ECOSYSTEM © 2026
