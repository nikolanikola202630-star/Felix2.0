# ⚠️ Проблема: Лимит Vercel Serverless Functions

**Дата:** 3 марта 2026  
**Проблема:** Превышен лимит функций на Hobby плане  
**Лимит:** 12 функций  
**У нас:** 30+ функций

---

## 🔍 Суть проблемы

Vercel Hobby план позволяет максимум 12 serverless функций.  
У нас в папке `api/` более 30 файлов, каждый = отдельная функция.

```
Error: No more than 12 Serverless Functions can be added to a Deployment 
on the Hobby plan.
```

---

## 💡 Решения

### Вариант 1: Объединить API endpoints (рекомендуется)

Создать один главный API файл, который роутит все запросы:

```javascript
// api/index.js - единая точка входа
module.exports = async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  
  // Роутинг
  if (pathname.startsWith('/api/courses')) {
    return require('./routes/courses')(req, res);
  }
  if (pathname.startsWith('/api/payments')) {
    return require('./routes/payments')(req, res);
  }
  // и т.д.
};
```

**Плюсы:**
- Остаемся на бесплатном плане
- Быстрое решение
- Не нужно менять frontend

**Минусы:**
- Нужно рефакторить API
- Один файл обрабатывает все запросы

### Вариант 2: Upgrade на Pro план

Стоимость: $20/месяц  
Лимит функций: 100

**Плюсы:**
- Ничего не нужно менять
- Больше ресурсов
- Лучшая производительность

**Минусы:**
- Платно

### Вариант 3: Использовать другой хостинг

Варианты:
- Railway.app (бесплатно до $5/мес)
- Render.com (бесплатно)
- Fly.io (бесплатно)

**Плюсы:**
- Нет лимита на функции
- Можно использовать Node.js сервер

**Минусы:**
- Нужно настраивать заново
- Другая инфраструктура

---

## 🚀 Быстрое решение (5 мин)

Давай объединим API endpoints в группы:

### Структура:
```
api/
  index.js          - Главный роутер
  routes/
    courses.js      - Все endpoints курсов
    payments.js     - Все endpoints платежей
    admin.js        - Все admin endpoints
    partner.js      - Партнерские endpoints
    health.js       - Health checks
```

### Преимущества:
- 5 функций вместо 30+
- Укладываемся в лимит
- Остаемся на бесплатном плане

---

## 📊 Текущие API endpoints

### Группа 1: Courses (8 endpoints)
- `/api/courses-full`
- `/api/courses`
- `/api/courses/check-access`
- `/api/courses/my-courses`
- `/api/lessons`
- `/api/learning`
- `/api/history`
- `/api/search`

### Группа 2: Payments (4 endpoints)
- `/api/payments`
- `/api/payments/create-invoice`
- `/api/payments/webhook`
- `/api/payments/refund`

### Группа 3: Admin (5 endpoints)
- `/api/admin`
- `/api/admin-api`
- `/api/admin-courses`
- `/api/admin/courses-manage`
- `/api/export`

### Группа 4: Partner (2 endpoints)
- `/api/partner`
- `/api/partner-stats`

### Группа 5: Other (11 endpoints)
- `/api/webhook`
- `/api/webhook-test`
- `/api/health/database`
- `/api/miniapp`
- `/api/miniapp-data`
- `/api/voice`
- `/api/voice/index`
- `/api/analytics`
- `/api/community`
- `/api/settings`
- `/api/sync`

**Итого:** 30+ endpoints → нужно сократить до 12

---

## ✅ Рекомендация

### Сейчас (быстро):
1. Объединить endpoints в 5 групп
2. Создать роутер для каждой группы
3. Задеплоить снова

### Потом (когда будет доход):
1. Upgrade на Vercel Pro ($20/мес)
2. Вернуть раздельные endpoints
3. Добавить больше функций

---

## 🔧 Что делать дальше?

Выбери вариант:

**A. Объединить API (бесплатно, 30 мин работы)**
- Я создам объединенную структуру
- Протестируем локально
- Задеплоим

**B. Upgrade на Pro ($20/мес, 2 мин)**
- Открыть Vercel Dashboard
- Settings → Billing
- Upgrade to Pro
- Задеплоить снова

**C. Использовать другой хостинг (1-2 часа)**
- Настроить Railway/Render
- Перенести проект
- Обновить URLs

---

Какой вариант выбираешь?

*Создано: 3 марта 2026*
