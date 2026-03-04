# ⚡ Быстрое обновление Mini App URL

**Проблема:** Бот открывает старую версию мини-приложения  
**Решение:** 3 простых шага

---

## ✅ Что уже сделано

- ✅ Обновлены все файлы бота (bot.js, bot-v12.js, webhook-handler.js)
- ✅ Обновлен .env файл: `MINIAPP_URL=https://felix2-0.vercel.app/miniapp/app.html`
- ✅ Webhook переустановлен с очисткой кэша
- ✅ Pending updates очищены

---

## 🚀 Осталось 3 шага

### 1. Обновить переменную в Vercel Dashboard

```
1. Откройте: https://vercel.com/dashboard
2. Выберите проект: felix2-0
3. Settings → Environment Variables
4. Найдите: MINIAPP_URL
5. Измените на: https://felix2-0.vercel.app/miniapp/app.html
6. Нажмите Save
```

### 2. Redeploy проекта

```bash
vercel --prod
```

Или через Dashboard:
```
1. Deployments → ... (три точки) → Redeploy
2. Выберите: Use existing Build Cache
3. Нажмите: Redeploy
```

### 3. Проверить в Telegram

```
1. Откройте бота: @fel12x_bot
2. Отправьте: /start
3. Нажмите: "🎓 Открыть Академию"
4. Должно открыться новое приложение с брендбуком
```

**Если открылась старая версия:**
- Закройте приложение полностью
- Закройте чат с ботом
- Откройте снова через 1-2 минуты

**Если проблема сохраняется:**
- Очистите кэш Telegram: Настройки → Данные и память → Очистить кэш
- Или используйте Telegram Web: https://web.telegram.org

---

## 🔍 Проверка

После выполнения всех шагов проверьте:

- [ ] Переменная `MINIAPP_URL` обновлена в Vercel
- [ ] Выполнен redeploy
- [ ] Бот отвечает на `/start`
- [ ] Открывается новая версия (app.html)
- [ ] Применены стили брендбука (Антрацит, Золото, Мрамор)
- [ ] Навигация работает (4 вкладки внизу)

---

## 📊 Ожидаемый результат

**Новое приложение (app.html):**
- ✅ Единая точка входа (SPA)
- ✅ Роутер для навигации
- ✅ Брендбук V12 (Old Money. Cold Mind. High Society.)
- ✅ Цвета: Антрацит, Золото, Мрамор
- ✅ Шрифты: Cormorant Garamond, Montserrat, Playfair Display
- ✅ Анимации и переходы
- ✅ Централизованный API (/api/app)

**Старое приложение (index.html):**
- ❌ Множество отдельных HTML файлов
- ❌ Старые стили
- ❌ Нет единого роутера
- ❌ Разрозненные API endpoints

---

## 🐛 Если что-то не работает

### Проверить webhook:
```bash
curl "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/getWebhookInfo"
```

### Проверить app.html:
```bash
curl https://felix2-0.vercel.app/miniapp/app.html
```

### Проверить API:
```bash
curl "https://felix2-0.vercel.app/api/app?action=getCourses"
```

### Посмотреть логи:
```bash
vercel logs --follow
```

---

**Время выполнения:** 5-10 минут  
**Сложность:** Легко  
**Статус:** ✅ Готово к применению

