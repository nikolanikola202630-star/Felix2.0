# 🔐 Подробная инструкция: GitHub Secrets

## 📍 Где находятся GitHub Secrets

```
GitHub Repository
  └── Settings (вкладка вверху)
      └── Secrets and variables (левое меню)
          └── Actions
              └── New repository secret (зеленая кнопка)
```

## 🎯 Пошаговая инструкция

### Шаг 1: Откройте настройки репозитория

1. Откройте ваш GitHub репозиторий
2. Нажмите на вкладку **Settings** (вверху страницы)
3. В левом меню найдите раздел **Secrets and variables**
4. Нажмите на **Actions**
5. Нажмите зеленую кнопку **New repository secret**

### Шаг 2: Добавьте secrets (по одному)

Вам нужно добавить 4 секрета. Для каждого:
1. Нажмите **New repository secret**
2. Введите **Name** (имя секрета)
3. Введите **Value** (значение секрета)
4. Нажмите **Add secret**
5. Повторите для следующего секрета

---

## 🔑 Secret 1: VERCEL_TOKEN

### Name (имя):
```
VERCEL_TOKEN
```

### Value (значение):
```
vcp_5YTUT7sffopJKEA8YKs5PJb9vQZhdOv4TPngNxAk0eZcacfPX70irGsH
```

### Где взять:
✅ **Уже готов!** Просто скопируйте значение выше.

### Для чего:
Токен для автоматического деплоя на Vercel через GitHub Actions.

---

## 🔑 Secret 2: VERCEL_ORG_ID

### Name (имя):
```
VERCEL_ORG_ID
```

### Value (значение):
```
egoistsuport-coders-projects
```

### Где взять:
✅ **Уже найден!** Просто скопируйте значение выше (из URL Vercel).

### Для чего:
Идентификатор вашей команды/организации в Vercel.

---

## 🔑 Secret 3: VERCEL_PROJECT_ID

### Name (имя):
```
VERCEL_PROJECT_ID
```

### Value (значение):
```
prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```

### Где взять:
✅ **Уже найден!** Просто скопируйте значение выше (из Vercel Dashboard).

### Для чего:
Идентификатор вашего проекта в Vercel.

---

## 🔑 Secret 4: DATABASE_URL

### Name (имя):
```
DATABASE_URL
```

### Value (значение):
```
postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
```

### Где взять:
✅ **Уже готов!** Просто скопируйте значение выше.

### Для чего:
Строка подключения к базе данных PostgreSQL для CI/CD.

---

## ✅ Проверка

После добавления всех 4 секретов, вы должны увидеть:

```
Repository secrets (4)
├── VERCEL_TOKEN          Updated X seconds ago
├── VERCEL_ORG_ID         Updated X seconds ago
├── VERCEL_PROJECT_ID     Updated X seconds ago
└── DATABASE_URL          Updated X seconds ago
```

## 🚀 Что дальше?

После настройки всех secrets:

1. **Создайте .env.local** в корне проекта
2. **Сделайте коммит:**
   ```bash
   git add .
   git commit -m "Setup credentials"
   git push origin main
   ```
3. **GitHub Actions автоматически:**
   - Запустит тесты
   - Сгенерирует Prisma Client
   - Задеплоит на Vercel

## 🆘 Troubleshooting

### Ошибка: "Secret name is invalid"
**Решение:** Убедитесь что имя секрета написано ЗАГЛАВНЫМИ буквами и содержит только буквы, цифры и подчеркивания.

### Ошибка: "Invalid VERCEL_ORG_ID"
**Решение:** 
1. Убедитесь что вы запустили `vercel link`
2. Проверьте что скопировали значение без кавычек
3. Значение должно начинаться с `team_` или `user_`

### Ошибка: "Invalid VERCEL_PROJECT_ID"
**Решение:**
1. Убедитесь что вы запустили `vercel link`
2. Проверьте что скопировали значение без кавычек
3. Значение должно начинаться с `prj_`

### Ошибка: "Database connection failed"
**Решение:**
1. Проверьте что заменили `[YOUR-PASSWORD]` на реальный пароль
2. Убедитесь что пароль не содержит специальных символов (или они правильно экранированы)
3. Проверьте что база данных активна в Supabase Dashboard

## 📚 Полезные ссылки

- **GitHub Secrets Docs:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Supabase Connection Strings:** https://supabase.com/docs/guides/database/connecting-to-postgres

---

**Время настройки:** ~3 минуты  
**Сложность:** Легко 🟢  
**Статус:** Готово к использованию ✅
