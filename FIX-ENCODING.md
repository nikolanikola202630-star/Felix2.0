# 🔧 Исправление кодировки

## Проблема
Бот работает, но текст отображается "кракозябрами" (неправильная кодировка UTF-8).

## Решение
Файл `api/webhook.js` пересохранен в правильной кодировке UTF-8.

## Что делать:

### 1. Сделайте новый Push

```bash
git add api/webhook.js
git commit -m "fix: Fix UTF-8 encoding for Russian text"
git push origin main
```

### 2. Подождите 1-2 минуты

Vercel автоматически задеплоит исправленную версию.

### 3. Проверьте бота

Откройте https://t.me/fel12x_bot и отправьте `/start`

Текст должен отображаться правильно!

---

## Если проблема осталась

Попробуйте:

1. Удалить webhook:
```bash
curl -X POST "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/deleteWebhook"
```

2. Установить заново:
```bash
curl -X POST "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook?url=https://felix-black.vercel.app/api/webhook"
```

3. Отправить `/start` снова

---

**Сделайте push прямо сейчас!** 🚀
