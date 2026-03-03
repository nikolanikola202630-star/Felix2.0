# 🚀 ФИНАЛЬНАЯ НАСТРОЙКА PRODUCTION

## ⟁ EGOIST ECOSYSTEM Edition v9.0 ULTIMATE

---

## 📋 ВСЕ ГОТОВО К ЗАПУСКУ!

### ✅ Что уже задеплоено:
- 🤖 Код обоих ботов
- 📱 MiniApp (19 страниц)
- 💼 Партнерская система
- ⚙️ Админ-панель
- 🗄️ Интеграция с БД
- 🎨 EGOIST брендинг

### ⏳ Что нужно настроить:
1. Переменные окружения в Vercel
2. Webhook для основного бота

---

## 🔑 ТОКЕНЫ БОТОВ

### Основной бот (Felix Academy):
```
8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
```

### Реферальный бот:
```
8609120719:AAHsLIpWnc3i7MwcEsmfkNTeFIucZqukx9g
```
✅ Уже настроен и работает!

---

## 📝 ШАГ 1: Настроить переменные в Vercel

### Перейти в Vercel Dashboard:
```
https://vercel.com/nikolanikola202630-stars-projects/felix2-0/settings/environment-variables
```

### Добавить переменные:

**1. TELEGRAM_BOT_TOKEN** (основной бот)
```
8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
```

**2. GROQ_API_KEY** (AI)
```
Нужен ключ от Groq: https://console.groq.com/keys
```

**3. DATABASE_URL** (PostgreSQL)
```
Формат: postgresql://user:password@host:port/database?sslmode=require
```

**4. SUPABASE_URL**
```
Формат: https://your-project.supabase.co
```

**5. SUPABASE_KEY**
```
Anon/public key из Supabase Dashboard
```

### Как добавить:
1. Открыть ссылку выше
2. Нажать "Add New"
3. Ввести Name и Value
4. Выбрать "Production, Preview, Development"
5. Нажать "Save"

---

## 🚀 ШАГ 2: Redeploy после добавления переменных

После добавления всех переменных:

```bash
vercel --prod
```

Или через Vercel Dashboard:
1. Deployments → Latest
2. Три точки → Redeploy
3. Выбрать "Use existing Build Cache"

---

## 🔗 ШАГ 3: Настроить webhook основного бота

### Автоматически (после redeploy):
```bash
node scripts/setup-main-bot-webhook.js
```

### Или вручную через API:
```bash
curl "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook?url=https://felix2-0.vercel.app/api/webhook"
```

### Проверить webhook:
```bash
curl "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/getWebhookInfo"
```

Должен вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://felix2-0.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## 🧪 ШАГ 4: Протестировать

### 1. Основной бот:
- Найти бота по username (получить через getMe)
- Отправить `/start`
- Должен ответить с EGOIST брендингом

### 2. Реферальный бот:
- @felix_inputbot
- Отправить `/start ref_123456`
- Должен показать приветствие с партнером

### 3. MiniApp:
- Открыть через кнопку в боте
- Проверить footer с EGOIST логотипом
- Навигация по страницам

### 4. Партнерка:
- `/partner_panel` в основном боте
- Должен открыть кабинет

### 5. Админка:
- `/admin` в основном боте
- Должен открыть панель (если ID в списке админов)

---

## 🗄️ ШАГ 5: Настроить базу данных (опционально)

Если нужна полная функциональность с БД:

### 1. Создать Supabase проект:
```
https://supabase.com/dashboard
```

### 2. Применить схему:
```sql
-- Скопировать из database/setup-all-tables.sql
-- Выполнить в Supabase SQL Editor
```

### 3. Получить credentials:
- Project Settings → API
- Скопировать URL и anon key
- Добавить в Vercel переменные

### 4. Или использовать свой PostgreSQL:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

---

## 📊 ТЕКУЩИЙ СТАТУС

### ✅ Работает:
- Vercel deployment
- Webhook endpoints
- Реферальный бот (@felix_inputbot)
- MiniApp (все 19 страниц)
- API endpoints
- Static assets
- EGOIST брендинг

### ⏳ Требует настройки:
- Переменные окружения в Vercel
- Webhook основного бота
- База данных (опционально)

### 🎯 После настройки будет работать:
- Основной бот с AI
- Сохранение пользователей в БД
- История сообщений
- Статистика AI использования
- Партнерская система с БД
- Админ-панель с данными

---

## 🔧 БЫСТРАЯ НАСТРОЙКА (5 минут)

### Минимум для запуска бота:

1. **Добавить в Vercel:**
```
TELEGRAM_BOT_TOKEN=8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U
```

2. **Redeploy:**
```bash
vercel --prod
```

3. **Установить webhook:**
```bash
curl "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook?url=https://felix2-0.vercel.app/api/webhook"
```

4. **Протестировать:**
- Найти бота
- Отправить `/start`

**Бот будет работать без AI и БД, но с полным MiniApp!**

---

## 🎯 ПОЛНАЯ НАСТРОЙКА (15 минут)

Для полного функционала добавить все переменные:

1. TELEGRAM_BOT_TOKEN ✅
2. GROQ_API_KEY (для AI)
3. DATABASE_URL (для БД)
4. SUPABASE_URL (для БД)
5. SUPABASE_KEY (для БД)

После этого:
- AI будет отвечать на сообщения
- Пользователи сохраняются в БД
- История сообщений
- Статистика
- Партнерская система с отслеживанием
- Админ-панель с данными

---

## 📞 ПОДДЕРЖКА

Если что-то не работает:

1. Проверить логи Vercel:
```bash
vercel logs
```

2. Проверить webhook:
```bash
curl https://felix2-0.vercel.app/api/webhook
```

3. Проверить переменные:
```bash
vercel env ls
```

---

## 🎉 ГОТОВО!

После настройки у тебя будет:

✅ Полноценный бот с AI  
✅ 19 страниц MiniApp  
✅ Партнерская система  
✅ Реферальный бот  
✅ Админ-панель  
✅ База данных  
✅ EGOIST ECOSYSTEM брендинг  

**⟁ EGOIST ECOSYSTEM © 2026**

---

## 🔗 ССЫЛКИ

- **Production:** https://felix2-0.vercel.app
- **MiniApp:** https://felix2-0.vercel.app/miniapp/index.html
- **Vercel Dashboard:** https://vercel.com/nikolanikola202630-stars-projects/felix2-0
- **GitHub:** https://github.com/nikolanikola202630-star/Felix2.0
- **EGOIST:** t.me/egoist_ecosystem
