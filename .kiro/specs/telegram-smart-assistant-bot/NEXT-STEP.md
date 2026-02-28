# 🎯 Следующий шаг: Найти Organization ID

## ✅ Что уже готово

- ✅ Database URL с паролем
- ✅ Encryption Key сгенерирован
- ✅ Project ID найден: `prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh`
- ✅ Все остальные credentials

## ⏳ Осталось найти Organization ID (1 минута)

### Быстрый способ:

1. **Посмотрите на URL вашего проекта в Vercel:**
   
   Вы открыли проект "felix" в Vercel Dashboard.
   
   Посмотрите на адресную строку браузера:
   ```
   https://vercel.com/TEAM_NAME/felix
   ```
   
   `TEAM_NAME` между `vercel.com/` и `/felix` - это ваш **Organization ID**.

2. **Или через настройки:**
   - В Vercel Dashboard нажмите на название команды (слева вверху)
   - Выберите **Settings**
   - В URL вы увидите: `https://vercel.com/teams/TEAM_ID/settings`
   - `TEAM_ID` - это ваш Organization ID

### Примеры Organization ID:

- `port-coders-projects`
- `team_abc123`
- `felix` (если личный аккаунт)
- `your-username`

## 📝 После того как найдете Organization ID

### 1. Добавьте в GitHub Secrets

GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

Добавьте 4 секрета:

```
1. VERCEL_TOKEN
   Value: vcp_5YTUT7sffopJKEA8YKs5PJb9vQZhdOv4TPngNxAk0eZcacfPX70irGsH

2. VERCEL_ORG_ID
   Value: <ваш найденный org_id>

3. VERCEL_PROJECT_ID
   Value: prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh

4. DATABASE_URL
   Value: postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
```

### 2. Деплой

```bash
git add .
git commit -m "Setup complete with all credentials"
git push origin main
```

GitHub Actions автоматически задеплоит на Vercel! 🚀

## 📚 Документация

- [HOW-TO-FIND-ORG-ID.md](./HOW-TO-FIND-ORG-ID.md) - Подробная инструкция
- [GITHUB-SECRETS-GUIDE.md](./GITHUB-SECRETS-GUIDE.md) - Как добавить secrets
- [ALL-CREDENTIALS-READY.md](./ALL-CREDENTIALS-READY.md) - Полный список credentials

---

**Текущий статус:** 95% готово  
**Осталось:** Найти Organization ID (1 мин) → Добавить GitHub Secrets (1 мин) → Деплой! 🚀
