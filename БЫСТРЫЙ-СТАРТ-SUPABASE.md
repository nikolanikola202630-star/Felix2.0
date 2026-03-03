# ⚡ Быстрый старт Supabase

**Время:** 5 минут  
**Статус:** Готово к запуску

---

## 🚀 Шаг 1: Установить зависимости (1 мин)

```bash
npm install
```

Это установит:
- `@supabase/supabase-js` - клиент Supabase
- `dotenv` - для переменных окружения
- Все остальные зависимости

---

## 🔑 Шаг 2: Настроить .env (2 мин)

Откройте `.env` и добавьте (или обновите):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Telegram (уже есть)
TELEGRAM_BOT_TOKEN=8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U

# Groq AI (уже есть)
GROQ_API_KEY=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

# Environment
NODE_ENV=development
```

**Где взять SUPABASE_URL и SUPABASE_KEY:**
1. Открыть https://supabase.com/dashboard
2. Выбрать проект Felix Academy
3. Settings → API
4. Скопировать:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_KEY`

---

## 🗄️ Шаг 3: Применить SQL функцию (1 мин)

1. Открыть Supabase Dashboard → SQL Editor
2. Скопировать содержимое `database/functions/update_bonus_balance.sql`
3. Вставить и выполнить
4. Должно появиться: "Success. No rows returned"

---

## ✅ Шаг 4: Протестировать (1 мин)

```bash
npm run test:supabase
```

Ожидаемый вывод:
```
🔍 Тестирование подключения к Supabase...

1️⃣ Статистика клиента:
{
  "connected": true,
  "url": "your-project.supabase.co",
  "hasKey": true,
  "client": true
}

2️⃣ Проверка подключения:
{
  "connected": true,
  "message": "Database connection OK"
}

✅ Supabase подключен! Тестируем функции...

3️⃣ Тест SELECT:
✅ Найдено пользователей: 5

4️⃣ Тест создания покупки:
✅ Покупка создана: 123

5️⃣ Тест проверки покупки:
✅ Доступ к курсу: Да

6️⃣ Тест получения покупок:
✅ Покупок пользователя: 1

7️⃣ Очистка тестовых данных:
✅ Тестовые данные удалены

8️⃣ Тест RPC функции:
✅ RPC функция работает
✅ Баланс бонусов: 500
✅ Тестовый пользователь удален

9️⃣ Тест статистики:
✅ Статистика покупок:
   Всего покупок: 42
   Общая выручка: 125000

✅ Все тесты завершены!

🎉 Тестирование завершено успешно!
```

---

## 🌐 Шаг 5: Проверить health endpoint

```bash
# Локально (если запущен сервер)
curl http://localhost:3000/api/health/database

# Production
curl https://felix2-0.vercel.app/api/health/database
```

Ожидаемый ответ:
```json
{
  "success": true,
  "database": {
    "connected": true,
    "message": "Database connection OK"
  },
  "status": "healthy",
  "message": "All systems operational"
}
```

---

## 🎯 Что дальше?

### Если все работает ✅

1. **Добавить переменные в Vercel:**
   ```bash
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_KEY production
   ```

2. **Задеплоить:**
   ```bash
   vercel --prod
   ```

3. **Протестировать покупку:**
   - Открыть Mini App
   - Выбрать курс
   - Нажать "Купить"
   - Проверить, что покупка сохранилась

### Если не работает ❌

**Проблема: "Supabase not configured"**
- Проверить, что `.env` содержит правильные значения
- Проверить, что `npm install` выполнен
- Перезапустить скрипт

**Проблема: "Database connection failed"**
- Проверить URL (должен быть `https://xxxxx.supabase.co`)
- Проверить ключ (должен начинаться с `eyJ`)
- Проверить статус проекта в Supabase Dashboard

**Проблема: "Function not found"**
- Применить SQL функцию из `database/functions/update_bonus_balance.sql`
- Проверить в Supabase Dashboard → Database → Functions

---

## 📚 Дополнительная информация

- **Полная документация:** `ПОДКЛЮЧЕНИЕ-SUPABASE.md`
- **API справка:** `ФИНАЛЬНАЯ-ДОКУМЕНТАЦИЯ.md`
- **Чеклист запуска:** `ЧЕКЛИСТ-ЗАПУСКА.md`

---

## 🎉 Готово!

После выполнения этих шагов:
- ✅ Supabase подключен
- ✅ Все функции работают
- ✅ Покупки сохраняются в БД
- ✅ Комиссии начисляются автоматически
- ✅ Готово к production

**Следующий шаг:** Настроить Telegram Stars для приема платежей

---

*Создано: 3 марта 2026*  
*Версия: 1.0*
