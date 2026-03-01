# ⚡ Быстрый старт Felix Bot v4.2

## 🎯 Цель: Запустить бота за 5 минут

## Шаг 1: Получите токены (2 минуты)

### 1.1 Telegram Bot Token
1. Откройте Telegram
2. Найдите [@BotFather](https://t.me/BotFather)
3. Отправьте `/newbot`
4. Введите имя бота (например: "My Felix Bot")
5. Введите username (например: "my_felix_bot")
6. Скопируйте токен (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Groq API Key
1. Откройте [console.groq.com](https://console.groq.com)
2. Нажмите "Sign Up" (бесплатно)
3. Войдите в аккаунт
4. Перейдите в "API Keys"
5. Нажмите "Create API Key"
6. Скопируйте ключ (выглядит как `gsk_...`)

## Шаг 2: Настройте Vercel (2 минуты)

### 2.1 Если проект УЖЕ на Vercel:
1. Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте 2 переменные:
   ```
   Name: TELEGRAM_BOT_TOKEN
   Value: [вставьте ваш токен бота]
   
   Name: GROQ_API_KEY
   Value: [вставьте ваш ключ Groq]
   ```
5. Нажмите **Save**
6. Перейдите к Шагу 3

### 2.2 Если проект НОВЫЙ:
1. Откройте [vercel.com](https://vercel.com)
2. Нажмите **New Project**
3. Нажмите **Import Git Repository**
4. Выберите ваш репозиторий Felix Bot
5. В разделе **Environment Variables** добавьте:
   ```
   TELEGRAM_BOT_TOKEN = [ваш токен]
   GROQ_API_KEY = [ваш ключ]
   ```
6. Нажмите **Deploy**
7. Дождитесь окончания деплоя (~1 минута)
8. Скопируйте URL проекта (например: `https://felix-black.vercel.app`)

## Шаг 3: Настройте Webhook (1 минута)

### 3.1 Откройте PowerShell или Terminal

### 3.2 Выполните команду:
```bash
curl -X POST "https://api.telegram.org/bot[ВАШ_ТОКЕН]/setWebhook?url=https://[ВАШ_URL]/api/webhook"
```

**Замените**:
- `[ВАШ_ТОКЕН]` - на ваш TELEGRAM_BOT_TOKEN
- `[ВАШ_URL]` - на ваш Vercel URL

**Пример**:
```bash
curl -X POST "https://api.telegram.org/bot123456789:ABCdefGHI/setWebhook?url=https://felix-black.vercel.app/api/webhook"
```

### 3.3 Проверьте ответ:
Должно вернуться:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

## ✅ Готово! Проверьте работу

### 1. Откройте вашего бота в Telegram
Найдите по username (например: @my_felix_bot)

### 2. Отправьте `/start`
Должно появиться меню с кнопками:
- 🚀 Открыть Mini App
- 👋 Начать диалог

### 3. Протестируйте команды:

#### Перевод
```
/translate en Привет мир
```
Ответ: `Hello world`

#### Улучшение текста
```
/improve я хочу сказать что этот продукт очень хороший
```

#### Генерация идей
```
/brainstorm идеи для YouTube канала
```

#### Простое объяснение
```
/explain что такое блокчейн
```

#### Статистика
```
/stats
```

#### Голосовое сообщение
Запишите и отправьте голосовое - бот распознает и ответит

#### Обычное сообщение
```
Привет! Как дела?
```

## 🐛 Если что-то не работает

### Бот не отвечает на /start

**Проверьте webhook:**
```bash
curl "https://api.telegram.org/bot[ВАШ_ТОКЕН]/getWebhookInfo"
```

Должно показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-url/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

**Если url пустой** - повторите Шаг 3

**Если pending_update_count > 0** - есть необработанные сообщения:
```bash
curl -X POST "https://api.telegram.org/bot[ВАШ_ТОКЕН]/deleteWebhook"
curl -X POST "https://api.telegram.org/bot[ВАШ_ТОКЕН]/setWebhook?url=https://[ВАШ_URL]/api/webhook"
```

### Бот отвечает "Не могу ответить"

**Проблема с Groq API**

1. Проверьте GROQ_API_KEY в Vercel
2. Проверьте лимиты на [console.groq.com](https://console.groq.com)
3. Посмотрите логи в Vercel:
   - Dashboard → ваш проект → Functions → webhook → Logs

### Голосовые не работают

1. Проверьте размер файла (максимум 20MB)
2. Проверьте GROQ_API_KEY
3. Попробуйте короткое голосовое (10-15 секунд)

### Команды не работают

1. Убедитесь что команда начинается с `/`
2. Проверьте что есть пробел после команды
3. Пример правильной команды: `/translate en Привет`

## 📊 Проверьте статус

### 1. Vercel Dashboard
Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
- **Deployments** - должен быть статус "Ready"
- **Functions** - webhook должен быть активен
- **Logs** - не должно быть ошибок

### 2. Проверьте API endpoint
Откройте в браузере:
```
https://[ВАШ_URL]/api/webhook
```

Должно показать:
```
Felix Bot v4.2.0 - Working! 🚀
```

### 3. Проверьте Mini App
1. Отправьте боту `/start`
2. Нажмите "🚀 Открыть Mini App"
3. Должен открыться красивый интерфейс

## 🎉 Поздравляем!

Ваш Felix Bot работает! Теперь вы можете:

### Использовать все команды:
- `/translate` - перевод на 12+ языков
- `/improve` - улучшение текста
- `/brainstorm` - генерация идей
- `/explain` - простое объяснение
- `/stats` - статистика
- `/organize` - структурирование
- `/clear` - очистка истории

### Отправлять голосовые сообщения
Бот распознает и ответит

### Общаться с AI
Просто пишите - бот помнит контекст

## 📚 Что дальше?

### Изучите документацию:
- **README.md** - Полное описание
- **FAQ.md** - Частые вопросы
- **DEPLOY.md** - Подробный деплой
- **PROJECT-STRUCTURE.md** - Структура проекта

### Настройте бота:
1. BotFather → `/setdescription` - описание бота
2. BotFather → `/setabouttext` - текст "О боте"
3. BotFather → `/setuserpic` - аватар бота
4. BotFather → `/setcommands` - список команд

### Добавьте функции:
- Изучите `api/webhook.js`
- Добавьте свои команды
- Настройте AI промпты

### Масштабируйте:
- Добавьте базу данных (см. `database/`)
- Используйте библиотеки (см. `lib/`)
- Создайте дополнительные API endpoints

## 💡 Полезные команды

### Проверить webhook:
```bash
curl "https://api.telegram.org/bot[ТОКЕН]/getWebhookInfo"
```

### Удалить webhook:
```bash
curl -X POST "https://api.telegram.org/bot[ТОКЕН]/deleteWebhook"
```

### Установить webhook:
```bash
curl -X POST "https://api.telegram.org/bot[ТОКЕН]/setWebhook?url=https://[URL]/api/webhook"
```

### Получить обновления (для теста):
```bash
curl "https://api.telegram.org/bot[ТОКЕН]/getUpdates"
```

## 🔗 Ссылки

- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Groq Console**: https://console.groq.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/egoistsuport-coder/Felix-

## 📞 Поддержка

Если нужна помощь:
1. Проверьте **FAQ.md**
2. Посмотрите логи в Vercel
3. Создайте Issue на GitHub

---

**Удачи с вашим Felix Bot!** 🚀

Время запуска: **5 минут**  
Сложность: **Очень простая**  
Требования: **2 токена**
