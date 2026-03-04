# 🚀 EGOIST ACADEMY - Быстрый запуск

**Время: 20 минут**

---

## Шаг 1: Обновить URL бота (5 минут)

### Вариант A: Через .env (рекомендуется)

Откройте `.env` или `.env.local`:

```env
MINIAPP_URL=https://felix2-0.vercel.app/miniapp/egoist.html
```

### Вариант B: В коде бота

Откройте `bot.js` (строка ~15):

```javascript
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://felix2-0.vercel.app/miniapp/egoist.html';
```

---

## Шаг 2: Создать Telegram-группы (10 минут)

### 2.1. Создайте 5 групп в Telegram:

1. **EGOIST ACADEMY KINGS** 👑
2. **EGOIST BRAIN** 🧠
3. **EGOIST IT** 💻
4. **EGOIST TRADING** 📈
5. **EGOIST SUCCESS** 🎯

### 2.2. Получите ссылки-приглашения:

Для каждой группы:
1. Настройки группы → Тип группы → Публичная
2. Или создайте ссылку-приглашение
3. Скопируйте ссылку (например: `https://t.me/+ABC123...`)

### 2.3. Обновите ссылки в коде:

**Файл:** `miniapp/js/egoist-app.js` (строка ~70)

```javascript
renderCommunityCard('ACADEMY KINGS', '👑', 'https://t.me/+ВАШ_ЛИНК_1')
renderCommunityCard('BRAIN', '🧠', 'https://t.me/+ВАШ_ЛИНК_2')
renderCommunityCard('IT', '💻', 'https://t.me/+ВАШ_ЛИНК_3')
renderCommunityCard('TRADING', '📈', 'https://t.me/+ВАШ_ЛИНК_4')
renderCommunityCard('SUCCESS', '🎯', 'https://t.me/+ВАШ_ЛИНК_5')
```

---

## Шаг 3: Деплой (5 минут)

### 3.1. Commit изменения:

```bash
git add .
git commit -m "feat: добавить EGOIST ACADEMY"
git push
```

### 3.2. Vercel автоматически задеплоит

Проверьте статус:
- https://vercel.com/dashboard
- Или: `vercel ls`

### 3.3. Обновите переменную окружения в Vercel:

1. Откройте: https://vercel.com/dashboard
2. Выберите проект: `felix2-0`
3. Settings → Environment Variables
4. Найдите: `MINIAPP_URL`
5. Измените на: `https://felix2-0.vercel.app/miniapp/egoist.html`
6. Сохраните
7. Redeploy проект

---

## Шаг 4: Тестирование (5 минут)

### 4.1. Откройте бота в Telegram

```
@fel12x_bot
```

### 4.2. Отправьте `/start`

### 4.3. Нажмите кнопку "🎓 Открыть Академию"

### 4.4. Проверьте:

- ✅ Открылась главная страница EGOIST ACADEMY
- ✅ Тёмная тема (#0A0A0A)
- ✅ Крупные заголовки
- ✅ Минималистичный дизайн
- ✅ 4 таба внизу работают
- ✅ Каталог показывает 5 категорий
- ✅ Можно открыть курс
- ✅ Можно открыть урок
- ✅ Видео загружается
- ✅ Сообщества открываются

---

## 🎉 Готово!

EGOIST ACADEMY запущен и работает!

---

## 📝 Что дальше?

### Опционально (можно сделать позже):

#### 1. Добавить реальный контент

**Видео:**
1. Запишите видео для курсов
2. Загрузите на YouTube
3. Обновите ссылки в `miniapp/egoist-lesson.html`

**PDF:**
1. Создайте PDF материалы
2. Загрузите в облако (Google Drive, Dropbox)
3. Получите публичные ссылки
4. Обновите в `miniapp/egoist-lesson.html`

#### 2. Расширить категории

Добавьте остальные 11 категорий из ТЗ:
- FINANCE
- TRAFFIC
- CRYPTO SIGNALS
- STYLE
- DATING
- AI
- FOREX SIGNALS
- AFFILIATE PROGRAM
- LIVE CONNECT
- ENGLISH
- MEDICINE

**Файлы для обновления:**
- `miniapp/egoist-catalog.html`
- `miniapp/egoist-course.html`
- `data/egoist-courses.json`

#### 3. Настроить уведомления

Добавьте уведомления через бота:
- О новых уроках
- О новых сообщениях в группах
- О достижениях

---

## 🐛 Если что-то не работает

### Проблема: Бот открывает старую версию

**Решение:**
1. Очистите кэш Telegram:
   ```bash
   node scripts/clear-telegram-cache.js
   ```
2. Или подождите 5-10 минут

### Проблема: 404 на egoist.html

**Решение:**
1. Проверьте, что файл закоммичен:
   ```bash
   git ls-files | grep egoist.html
   ```
2. Если нет, добавьте:
   ```bash
   git add miniapp/egoist.html
   git commit -m "add: egoist.html"
   git push
   ```

### Проблема: Дизайн не применился

**Решение:**
1. Проверьте, что CSS файл загружен:
   ```bash
   curl https://felix2-0.vercel.app/miniapp/css/egoist-theme.css
   ```
2. Очистите кэш браузера (Ctrl+Shift+R)

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи Vercel
2. Проверьте консоль браузера (F12)
3. Проверьте webhook статус бота

---

**Версия:** 1.0  
**Дата:** 4 марта 2026  
**Статус:** ✅ Инструкция готова
