# 🚀 Применить SQL - Пошаговая инструкция

**Время:** 2 минуты  
**Файл:** `database/setup-all-tables.sql`

---

## Шаг 1: Открыть Supabase Dashboard

1. Перейти на https://supabase.com/dashboard
2. Войти в аккаунт
3. Выбрать проект Felix Academy (nnegvsxhspdnsvjpcscn)

---

## Шаг 2: Открыть SQL Editor

1. В левом меню найти **SQL Editor**
2. Нажать **New query**

---

## Шаг 3: Скопировать SQL

1. Открыть файл `database/setup-all-tables.sql`
2. Выделить весь текст (Ctrl+A)
3. Скопировать (Ctrl+C)

---

## Шаг 4: Вставить и выполнить

1. Вставить SQL в редактор (Ctrl+V)
2. Нажать **Run** (или F5)
3. Дождаться выполнения (~5-10 секунд)

---

## Шаг 5: Проверить результат

Внизу должно появиться:

```
Success
Rows: 13 (список таблиц)
```

И еще один результат:

```
Success
Rows: 1
routine_name: update_bonus_balance
routine_type: FUNCTION
```

---

## ✅ Готово!

Теперь можно проверить:

```bash
node scripts/check-database.js
```

Должно показать:

```
✅ users - существует
✅ courses - существует
✅ lessons - существует
✅ lesson_progress - существует
✅ purchases - существует
✅ bonus_transactions - существует
✅ partner_payouts - существует
✅ partners - существует
✅ course_partners - существует
✅ course_students - существует
✅ partner_chats - существует
✅ partner_messages - существует
✅ partner_notifications - существует

📈 Итого:
   Существует: 13/13
   Отсутствует: 0/13

✅ update_bonus_balance - существует
```

---

## 🎉 Следующий шаг

После применения SQL:

```bash
npm run test:supabase
```

Все тесты должны пройти успешно!

---

*Создано: 3 марта 2026*
