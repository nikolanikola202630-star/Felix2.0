# 🚀 Деплой Felix Bot v4.2

## Быстрый деплой за 3 шага

### Шаг 1: Получите токены

#### Telegram Bot Token
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Groq API Key
1. Зайдите на [console.groq.com](https://console.groq.com)
2. Зарегистрируйтесь (бесплатно)
3. Перейдите в API Keys
4. Создайте новый ключ
5. Скопируйте ключ (выглядит как `gsk_...`)

### Шаг 2: Настройте Vercel

#### Если проект уже на Vercel:
1. Откройте [vercel.com](https://vercel.com)
2. Выберите ваш проект
3. Settings → Environment Variables
4. Добавьте переменные:
   ```
   TELEGRAM_BOT_TOKEN = ваш_токен_бота
   GROQ_API_KEY = ваш_ключ_groq
   ```
5. Сохраните

#### Если проект новый:
1. Откройте [vercel.com](https://vercel.com)
2. New Project
3. Import Git Repository
4. Выберите ваш репозиторий
5. Добавьте Environment Variables (см. выше)
6. Deploy

### Шаг 3: Настройте Webhook

После деплоя выполните:

```bash
# Замените YOUR_BOT_TOKEN и YOUR_VERCEL_URL
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_VERCEL_URL/api/webhook"
```

Пример:
```bash
curl -X POST "https://api.telegram.org/bot123456789:ABCdefGHI/setWebhook?url=https://felix-black.vercel.app/api/webhook"
```

### ✅ Готово!

Откройте вашего бота в Telegram и отправьте `/start`

## 🔍 Проверка работы

### 1. Проверьте webhook
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

Должно вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-vercel-url/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 2. Проверьте API endpoint
Откройте в браузере:
```
https://your-vercel-url/api/webhook
```

Должно показать:
```
Felix Bot v4.2.0 - Working! 🚀
```

### 3. Протестируйте команды
Отправьте боту:
- `/start` - должно показать меню
- `/translate en Привет` - должно перевести
- Голосовое сообщение - должно распознать

## 🐛 Решение проблем

### Бот не отвечает

**Проверьте переменные окружения:**
```bash
# В Vercel Dashboard → Settings → Environment Variables
TELEGRAM_BOT_TOKEN = ✅ установлен
GROQ_API_KEY = ✅ установлен
```

**Проверьте логи:**
1. Vercel Dashboard → ваш проект
2. Functions → webhook
3. Logs → посмотрите ошибки

**Проверьте webhook:**
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

### Ошибка "Method not allowed"

Webhook настроен неправильно. Переустановите:
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_VERCEL_URL/api/webhook"
```

### Ошибка "Failed to get file"

Проблема с TELEGRAM_BOT_TOKEN. Проверьте:
1. Токен скопирован полностью
2. Нет лишних пробелов
3. Переменная называется именно `TELEGRAM_BOT_TOKEN`

### Ошибка "Не могу ответить"

Проблема с GROQ_API_KEY. Проверьте:
1. Ключ скопирован полностью
2. Ключ активен на console.groq.com
3. Не превышен лимит запросов (30/минуту на бесплатном плане)

### Голосовые не работают

1. Проверьте размер файла (максимум 20MB)
2. Проверьте GROQ_API_KEY
3. Посмотрите логи в Vercel

## 🔄 Обновление бота

### Через GitHub Desktop:
1. Внесите изменения в код
2. Commit changes
3. Push origin
4. Vercel автоматически задеплоит

### Через командную строку:
```bash
git add .
git commit -m "update: описание изменений"
git push origin main
```

### Проверка обновления:
1. Откройте Vercel Dashboard
2. Deployments → посмотрите статус
3. Когда статус "Ready" - обновление применено

## 📊 Мониторинг

### Vercel Dashboard
- **Deployments** - история деплоев
- **Functions** - логи функций
- **Analytics** - статистика использования
- **Speed Insights** - производительность

### Groq Console
- **Usage** - использование API
- **Limits** - лимиты запросов
- **Billing** - биллинг (если платный план)

## 🎯 Следующие шаги

После успешного деплоя:

1. **Протестируйте все команды**
   - /start
   - /translate
   - /improve
   - /brainstorm
   - /explain
   - /stats
   - /organize
   - /clear
   - Голосовые сообщения
   - Обычные сообщения

2. **Настройте Mini App**
   - Откройте через /start
   - Проверьте все секции
   - Убедитесь, что дизайн корректный

3. **Добавьте бота в описание**
   - BotFather → /setdescription
   - BotFather → /setabouttext
   - BotFather → /setuserpic

4. **Поделитесь ботом**
   - Отправьте друзьям
   - Опубликуйте в соцсетях
   - Добавьте в README вашего проекта

## 💡 Полезные ссылки

- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Groq Console**: https://console.groq.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/egoistsuport-coder/Felix-

## 📞 Поддержка

Если что-то не работает:
1. Проверьте FAQ.md
2. Посмотрите логи в Vercel
3. Создайте Issue на GitHub

---

**Удачного деплоя!** 🚀
