# 🔄 Обновление Mini App URL - Инструкция

**Дата:** 4 марта 2026  
**Проблема:** Бот открывает старую версию мини-приложения  
**Решение:** Обновить URL с `/miniapp/index.html` на `/miniapp/app.html`

---

## ✅ Что было сделано

### 1. Обновлены файлы бота

- ✅ `bot.js` - обновлен MINIAPP_URL
- ✅ `bot-v12.js` - обновлен webAppUrl
- ✅ `api/webhook-handler.js` - обновлен MINIAPP_URL
- ✅ `api/webhook/index.js` - уже использует переменную окружения

### 2. Создан скрипт очистки кэша

- ✅ `scripts/clear-telegram-cache.js` - автоматическая очистка

---

## 🚀 Шаги для применения изменений

### Шаг 1: Обновить переменные окружения в Vercel

```bash
# Вариант A: Через CLI
vercel env rm MINIAPP_URL production
vercel env add MINIAPP_URL production
# Введите: https://felix2-0.vercel.app/miniapp/app.html

# Вариант B: Через Dashboard
# 1. Откройте https://vercel.com/dashboard
# 2. Выберите проект felix2-0
# 3. Settings → Environment Variables
# 4. Найдите MINIAPP_URL
# 5. Измените на: https://felix2-0.vercel.app/miniapp/app.html
# 6. Сохраните
```

### Шаг 2: Redeploy на Vercel

```bash
# Commit изменений
git add .
git commit -m "fix: обновить MINIAPP_URL на app.html"
git push

# Или принудительный redeploy
vercel --prod
```

### Шаг 3: Очистить кэш Telegram

```bash
# Запустить скрипт очистки
node scripts/clear-telegram-cache.js
```

Скрипт выполнит:
- ✅ Удалит старый webhook
- ✅ Установит новый webhook
- ✅ Очистит pending updates
- ✅ Проверит корректность установки

### Шаг 4: Проверить в Telegram

1. Откройте бота: [@fel12x_bot](https://t.me/fel12x_bot)
2. Отправьте `/start`
3. Нажмите "🎓 Открыть Академию"
4. Должно открыться новое приложение с брендбуком

**Если открылась старая версия:**

1. Закройте приложение
2. Закройте чат с ботом полностью
3. Откройте снова и попробуйте еще раз

**Если проблема сохраняется:**

1. Очистите кэш Telegram:
   - Android: Настройки → Данные и память → Очистить кэш
   - iOS: Настройки → Данные и память → Очистить кэш
   - Desktop: Настройки → Продвинутые → Очистить кэш

2. Или используйте Telegram Web: https://web.telegram.org

3. Или переустановите Telegram

---

## 🔍 Проверка корректности

### Проверить webhook

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
```

Должно быть:
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

### Проверить переменные окружения

```bash
vercel env ls
```

Должно быть:
```
MINIAPP_URL    https://felix2-0.vercel.app/miniapp/app.html    Production
```

### Проверить файл app.html

```bash
curl https://felix2-0.vercel.app/miniapp/app.html
```

Должен вернуть HTML с:
- ✅ Telegram Web App SDK
- ✅ Brandbook styles
- ✅ Router и API
- ✅ Без ошибок 404

---

## 📋 Чек-лист проверки

После выполнения всех шагов проверьте:

- [ ] Переменная `MINIAPP_URL` обновлена в Vercel
- [ ] Выполнен redeploy: `vercel --prod`
- [ ] Webhook переустановлен: `node scripts/clear-telegram-cache.js`
- [ ] Бот отвечает на `/start`
- [ ] Кнопка "Открыть приложение" работает
- [ ] Открывается новая версия с брендбуком
- [ ] Навигация работает (Главная, Каталог, Мои курсы, Профиль)
- [ ] Стили брендбука применены (Антрацит, Золото, Мрамор)
- [ ] API отвечает корректно
- [ ] Нет ошибок в консоли браузера (F12)

---

## 🐛 Troubleshooting

### Проблема: Бот все еще открывает старую версию

**Причина:** Telegram кэширует URL мини-приложения

**Решение:**
1. Убедитесь, что webhook переустановлен с `drop_pending_updates=true`
2. Очистите кэш Telegram на устройстве
3. Используйте Telegram Web для тестирования
4. Подождите 5-10 минут (кэш обновится автоматически)

### Проблема: 404 Not Found при открытии app.html

**Причина:** Файл не задеплоен или неверный путь

**Решение:**
1. Проверьте, что файл существует: `ls miniapp/app.html`
2. Проверьте vercel.json для правильного роутинга
3. Выполните redeploy: `vercel --prod`
4. Проверьте логи: `vercel logs`

### Проблема: Приложение открывается, но стили не применяются

**Причина:** CSS файлы не загружаются

**Решение:**
1. Проверьте пути в app.html:
   - `/miniapp/styles/brandbook-variables.css`
   - `/miniapp/css/brandbook-components.css`
2. Проверьте, что файлы существуют
3. Проверьте консоль браузера (F12) на ошибки 404
4. Redeploy: `vercel --prod`

### Проблема: API не отвечает

**Причина:** Endpoint не работает или неверный URL

**Решение:**
1. Проверьте API: `curl https://felix2-0.vercel.app/api/app?action=getCourses`
2. Проверьте логи: `vercel logs`
3. Проверьте `api/_router.js` для правильного роутинга
4. Проверьте переменные окружения (SUPABASE_URL, SUPABASE_KEY)

---

## 📊 Мониторинг после обновления

### Vercel Logs

```bash
# Смотреть логи в реальном времени
vercel logs --follow

# Смотреть последние 100 строк
vercel logs -n 100
```

### Telegram Webhook Info

```bash
# Проверить статус webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo" | jq
```

### Browser Console

1. Откройте мини-приложение в Telegram
2. Нажмите F12 (Developer Tools)
3. Проверьте вкладку Console на ошибки
4. Проверьте вкладку Network на failed requests

---

## ✅ Ожидаемый результат

После выполнения всех шагов:

1. **Бот работает:**
   - Отвечает на команды
   - Кнопка "Открыть приложение" работает

2. **Мини-приложение открывается:**
   - URL: `https://felix2-0.vercel.app/miniapp/app.html`
   - Загружается без ошибок
   - Показывает экран загрузки

3. **Брендбук применен:**
   - Цвета: Антрацит (#1A1C1E), Золото (#C4A962), Мрамор (#F5F5F3)
   - Шрифты: Cormorant Garamond, Montserrat, Playfair Display
   - Стиль: Old Money. Cold Mind. High Society.

4. **Функционал работает:**
   - Навигация между страницами
   - Загрузка курсов из API
   - Отображение профиля
   - Все кнопки кликабельны

---

## 📞 Поддержка

Если проблема не решена:

1. Проверьте все шаги еще раз
2. Посмотрите логи: `vercel logs`
3. Проверьте webhook: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
4. Проверьте переменные: `vercel env ls`
5. Попробуйте в Telegram Web: https://web.telegram.org

---

**Версия:** 12.0  
**Дата:** 4 марта 2026  
**Статус:** ✅ Готово к применению

