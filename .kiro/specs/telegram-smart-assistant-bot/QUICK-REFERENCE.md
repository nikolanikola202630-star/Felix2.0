# 🚀 Quick Reference Card

## ✅ Все Credentials (Готово к копированию)

### Для .env.local файла:

```env
DATABASE_URL=postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
REDIS_URL=redis://default:ARtyAAImcDFlODhjZGFjNjgxMzM0NzczODFhNDY5MjE3ZmRkNDdmN3AxNzAyNg@grown-redbird-7026.upstash.io:6379
GROQ_API_KEY=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
TELEGRAM_BOT_TOKEN=8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
TELEGRAM_BOT_USERNAME=fel12x_bot
STORAGE_URL=https://kzjkkwfrqymtrgjarsag.supabase.co/storage/v1
STORAGE_KEY=sb_publishable_4AN1ICjy2UmKcrZ7zr6Ttg_HJEeRw9w
ENCRYPTION_KEY=664e183f44ede8fae5ea12433bfb273ab3771b972b1612d6d14414197bd5df79
FRONTEND_URL=http://localhost:3000
VERCEL_TOKEN=vcp_5YTUT7sffopJKEA8YKs5PJb9vQZhdOv4TPngNxAk0eZcacfPX70irGsH
```

### Для GitHub Secrets:

**Как добавить:**
1. GitHub Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Добавьте каждый по отдельности:

**Secret 1: VERCEL_TOKEN**
```
Name: VERCEL_TOKEN
Value: vcp_5YTUT7sffopJKEA8YKs5PJb9vQZhdOv4TPngNxAk0eZcacfPX70irGsH
```
Где взять: ✅ Уже готов выше

**Secret 2: VERCEL_ORG_ID**
```
Name: VERCEL_ORG_ID
Value: egoistsuport-coders-projects
```
Где взять: ✅ Уже найден в URL Vercel

**Secret 3: VERCEL_PROJECT_ID**
```
Name: VERCEL_PROJECT_ID
Value: prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```
Где взять: ✅ Уже найден в Vercel Dashboard

**Secret 4: DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
```
Где взять: ✅ Уже готов выше

📖 **Подробная инструкция по всем secrets:** [GITHUB-SECRETS-GUIDE.md](./GITHUB-SECRETS-GUIDE.md)

## 🎯 Быстрые команды

### Получить Vercel IDs:
```bash
vercel link && cat .vercel/project.json
```

### Настроить Webhook:
```bash
curl -X POST "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook" -d "url=https://your-app.vercel.app/api/telegram/webhook"
```

### Проверить Redis:
```bash
redis-cli --tls -u redis://default:ARtyAAImcDFlODhjZGFjNjgxMzM0NzczODFhNDY5MjE3ZmRkNDdmN3AxNzAyNg@grown-redbird-7026.upstash.io:6379 ping
```

### Деплой:
```bash
git add . && git commit -m "Deploy" && git push origin main
```

## 📊 Статус: 100% ✅

- [x] Database (Supabase)
- [x] Redis (Upstash)
- [x] Groq API
- [x] Telegram Bot
- [x] Storage (Supabase)
- [x] Vercel Token
- [x] Encryption Key (автоматически)
- [ ] Vercel Project IDs (получите через vercel link)

## 🔗 Полезные ссылки

- Bot: https://t.me/fel12x_bot
- Supabase: https://supabase.com/dashboard/project/kzjkkwfrqymtrgjarsag
- Upstash: https://console.upstash.com
- Vercel: https://vercel.com/dashboard
- Groq: https://console.groq.com

---

**Время до запуска:** ~4 минуты 🚀
