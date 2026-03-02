# 🔐 Vercel Environment Variables

**Для проекта Felix Bot v9.0**

---

## 📋 Скопировать эти переменные в Vercel

### TELEGRAM_BOT_TOKEN
```
8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
```

### GROQ_API_KEY
```
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
```

### DATABASE_URL
```
postgresql://postgres:[YOUR-PASSWORD]@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres
```
**⚠️ ВАЖНО:** Замените `[YOUR-PASSWORD]` на пароль от Supabase!

### ADMIN_ID
```
8264612178
```

### MINIAPP_URL
```
https://your-project.vercel.app/miniapp/elite.html
```
**⚠️ ВАЖНО:** После первого деплоя замените на реальный URL!

### NODE_ENV
```
production
```

---

## 🚀 Инструкция

### 1. Открыть Vercel
https://vercel.com → New Project

### 2. Import Repository
- Выбрать `Felix2.0` из GitHub

### 3. Configure Project
- Framework Preset: `Other`
- Build Command: (оставить пустым)
- Output Directory: (оставить пустым)

### 4. Add Environment Variables
Нажать "Add" для каждой переменной и вставить значения выше

### 5. Deploy
Нажать "Deploy" и дождаться завершения

### 6. Скопировать URL
После деплоя скопировать URL проекта (например: `https://felix2-0-abc123.vercel.app`)

### 7. Обновить MINIAPP_URL
1. Settings → Environment Variables
2. Найти `MINIAPP_URL`
3. Edit → заменить на: `https://[ваш-url].vercel.app/miniapp/elite.html`
4. Save
5. Deployments → Latest → Redeploy

---

## ✅ Проверка

После деплоя проверить:

```powershell
# Health check
Invoke-RestMethod -Uri "https://[ваш-url].vercel.app/api/webhook"
```

Должно вернуть:
```json
{
  "status": "ok",
  "bot": "Felix v9.0 Production"
}
```

---

## 📞 Следующий шаг

После успешного деплоя на Vercel:
1. Установить webhook (см. ДЕПЛОЙ-СЕЙЧАС.md)
2. Протестировать бота в Telegram

**Удачи! 🚀**
