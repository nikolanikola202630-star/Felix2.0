# ⚡ Добавить bonus_balance - 30 секунд

## Что делать:

1. Открыть Supabase Dashboard → SQL Editor
2. Скопировать содержимое файла `database/add-bonus-balance.sql`
3. Вставить и нажать **Run**

## Ожидаемый результат:

```
Success
NOTICE: Колонка bonus_balance добавлена

Rows: 1
column_name: bonus_balance
data_type: integer
column_default: 0
is_nullable: YES
```

## Проверить:

```bash
node scripts/check-database.js
```

Должно показать:
```
✅ update_bonus_balance - существует
```

---

**Готово! Теперь можно тестировать:**

```bash
npm run test:supabase
```
