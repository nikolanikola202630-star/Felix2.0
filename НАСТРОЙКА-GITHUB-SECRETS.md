# 🔐 Настройка GitHub Secrets для автодеплоя

**Для полностью автономного деплоя через GitHub Actions**

---

## 📋 Шаг 1: Получить Vercel Token

1. **Откройте:** https://vercel.com/account/tokens
2. **Create Token:**
   - Token Name: `GitHub Actions`
   - Scope: `Full Account`
3. **Скопируйте токен** (показывается один раз!)

---

## 📋 Шаг 2: Получить Vercel Project ID и Org ID

### Вариант A: Через Vercel CLI (если проект уже создан)

```bash
# Установить Vercel CLI
npm install -g vercel

# Войти
vercel login

# Перейти в папку проекта
cd "C:\Users\Mag1c\Desktop\Асистент копирайтер"

# Связать с Vercel
vercel link

# Получить ID
vercel project ls
```

### Вариант B: Создать проект вручную

1. **Откройте:** https://vercel.com/new
2. **Import** `Felix2.0`
3. **После создания:**
   - Settings → General
   - Скопируйте **Project ID**
   - Скопируйте **Team ID** (или User ID)

---

## 📋 Шаг 3: Добавить Secrets в GitHub

1. **Откройте:** https://github.com/nikolanikola202630-star/Felix2.0/settings/secrets/actions
2. **New repository secret** для каждого:

### Secret 1: VERCEL_TOKEN
```
[ваш токен из шага 1]
```

### Secret 2: VERCEL_ORG_ID
```
[ваш Team/User ID]
```

### Secret 3: VERCEL_PROJECT_ID
```
[ваш Project ID]
```

### Secret 4: TELEGRAM_BOT_TOKEN
```
8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
```

### Secret 5: GROQ_API_KEY
```
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
```

### Secret 6: DATABASE_URL
```
postgresql://postgres:[YOUR-PASSWORD]@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
```
⚠️ Замените [YOUR-PASSWORD] на реальный пароль!

### Secret 7: ADMIN_ID
```
8264612178
```

---

## 📋 Шаг 4: Добавить Environment Variables в Vercel

1. **Откройте:** https://vercel.com/[your-username]/felix2-0/settings/environment-variables
2. **Добавьте каждую переменную:**

```
TELEGRAM_BOT_TOKEN = 8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
GROQ_API_KEY = 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
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
ADMIN_ID = 8264612178
NODE_ENV = production
MINIAPP_URL = https://[your-project].vercel.app/miniapp/elite.html
```

---

## 🚀 Шаг 5: Запустить автодеплой

После настройки всех secrets:

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions auto-deploy"
git push origin main
```

GitHub Actions автоматически:
1. ✅ Задеплоит на Vercel
2. ✅ Установит webhook
3. ✅ Проверит деплой

---

## 📊 Проверка

1. **GitHub:** https://github.com/nikolanikola202630-star/Felix2.0/actions
2. **Vercel:** https://vercel.com/dashboard
3. **Telegram:** Откройте бота и отправьте `/start`

---

## ✅ После настройки

Каждый `git push` будет автоматически деплоить на Vercel! 🎉

**Время настройки:** 10 минут  
**Результат:** Полностью автономный деплой
