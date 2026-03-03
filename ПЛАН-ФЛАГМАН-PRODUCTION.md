# 🚀 Felix Academy: Пошаговый план превращения MVP в Production-флагман

**Дата создания:** 3 марта 2026  
**Версия:** 1.0  
**Статус:** В разработке

---

## 1. Введение: Целевое состояние "Флагман"

После анализа текущего состояния (версия 9.0) мы определили, что проект имеет прочную основу, но нуждается в доработке критических компонентов. Флагманская версия — это полностью функциональная, безопасная, масштабируемая и готовая к коммерческому запуску образовательная платформа.

### Ключевые характеристики флагмана:

✅ Полностью интегрированные платежи через Telegram Stars  
✅ Надёжная система безопасности (rate limiting, валидация, шифрование)  
✅ 100% покрытие тестами критических модулей  
✅ Мониторинг и алертинг в реальном времени  
✅ Полноценная партнёрская программа с автоматическими выплатами  
✅ Юридически чистое пользовательское соглашение и политика обработки данных  
✅ Минимум 10 готовых курсов с качественным контентом  
✅ Масштабируемая архитектура, выдерживающая 10 000+ одновременных пользователей

---

## 2. Пошаговый план реализации флагманской версии

План разбит на этапы с конкретными задачами, ответственными и ожидаемыми результатами. Каждый шаг сопровождается техническими рекомендациями.

---

## Этап 0: Подготовка инфраструктуры (3 дня)

**Цель:** Обеспечить среду для безопасной разработки и будущего масштабирования.

### Задачи:

#### 0.1. Переход на платный тариф Vercel Pro
- [ ] Убрать ограничения на 100 деплоев в день
- [ ] Настроить custom domain (например, academy.felix.com)
- [ ] Настроить SSL сертификаты
- [ ] Включить Analytics и Speed Insights

**Стоимость:** $20/месяц  
**Время:** 1 час

#### 0.2. Обновление Supabase до платного тарифа (Pro)
- [ ] Получить 8 ГБ БД, бэкапы, мониторинг производительности
- [ ] Настроить ежедневные автоматические бэкапы
- [ ] Включить Point-in-Time Recovery
- [ ] Настроить Connection Pooling

**Стоимость:** $25/месяц  
**Время:** 2 часа

#### 0.3. Настройка переменных окружения
- [ ] Создать `.env.production` файл
- [ ] Перенести все ключи в Vercel Environment Variables:
  - `TELEGRAM_BOT_TOKEN`
  - `GROQ_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `SENTRY_DSN`
  - `REDIS_URL`
- [ ] Удалить все hardcoded ключи из кода
- [ ] Обновить `.gitignore`

**Время:** 3 часа

#### 0.4. Инициализация системы контроля версий
- [ ] Убедиться, что репозиторий приватный
- [ ] Настроить branch protection rules
- [ ] Создать ветки: `main`, `develop`, `staging`
- [ ] Настроить GitHub Actions для CI/CD

**Время:** 2 часа

#### 0.5. Документирование архитектуры
- [ ] Создать диаграмму взаимодействия компонентов
- [ ] Обновить `ЕДИНАЯ-ЭКОСИСТЕМА.md`
- [ ] Создать API документацию (Swagger/OpenAPI)
- [ ] Документировать все environment variables

**Время:** 4 часа

**Итого Этап 0:** 12 часов (1.5 дня)

---

## Этап 1: Безопасность (критический, 5 дней)

**Цель:** Устранить уязвимости, защитить пользовательские данные и API от атак.

### 1.1. Rate Limiting

**Задача:** Внедрить middleware `express-rate-limit` на все API-эндпоинты.

**Реализация:**
```javascript
// lib/middleware/rate-limit.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // 100 запросов
  message: 'Слишком много запросов, попробуйте позже'
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 AI запросов в минуту
  message: 'Лимит AI запросов превышен'
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5, // 5 платежей в 5 минут
  message: 'Слишком много попыток оплаты'
});

module.exports = { apiLimiter, aiLimiter, paymentLimiter };
```

**Применение:**
```javascript
// api/webhook.js
const { apiLimiter } = require('../lib/middleware/rate-limit');

module.exports = async (req, res) => {
  apiLimiter(req, res, async () => {
    // Ваш код
  });
};
```

**Проверка:**
- [ ] Тест: превышение лимита → 429 Too Many Requests
- [ ] Проверка headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

**Время:** 8 часов

### 1.2. Валидация входных данных

**Задача:** Использовать библиотеку Joi или Zod для проверки всех входных параметров.

**Реализация:**
```javascript
// lib/validation/schemas.js
const Joi = require('joi');

const courseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().min(0).max(100000).required(),
  category: Joi.string().valid('psychology', 'business', 'it').required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required()
});

const userSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  first_name: Joi.string().min(1).max(100).required(),
  username: Joi.string().alphanum().min(3).max(50).optional()
});

module.exports = { courseSchema, userSchema };
```

**Middleware:**
```javascript
// lib/middleware/validate.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};

module.exports = validate;
```

**Проверка:**
- [ ] Тест: отправка невалидных данных → 400 Bad Request
- [ ] Проверка всех API endpoints

**Время:** 12 часов

### 1.3. CSRF-защита для Mini App

**Задача:** Проверять подпись Telegram WebApp Init Data.

**Реализация:**
```javascript
// lib/middleware/telegram-auth.js
const crypto = require('crypto');

function verifyTelegramWebAppData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}

const telegramAuth = (req, res, next) => {
  const initData = req.headers['x-telegram-webapp-init-data'];
  
  if (!initData) {
    return res.status(403).json({
      success: false,
      error: 'Missing Telegram auth data'
    });
  }
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!verifyTelegramWebAppData(initData, botToken)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid Telegram auth data'
    });
  }
  
  next();
};

module.exports = telegramAuth;
```

**Проверка:**
- [ ] Тест: подделка запроса → 403 Forbidden
- [ ] Проверка всех Mini App API endpoints

**Время:** 6 часов

### 1.4. Защита от XSS в Mini App

**Задача:** Экранировать весь пользовательский контент.

**Реализация:**
```javascript
// lib/utils/sanitize.js
const DOMPurify = require('isomorphic-dompurify');

function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
}

function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = { sanitizeHTML, escapeHTML };
```

**Применение в Mini App:**
```javascript
// miniapp/js/app.js
function renderCourseTitle(title) {
  const div = document.createElement('div');
  div.textContent = title; // Безопасно!
  return div.innerHTML;
}
```

**Проверка:**
- [ ] Проверка: ввод `<script>alert('XSS')</script>` → отображается как текст
- [ ] Проверка всех мест вывода пользовательского контента

**Время:** 8 часов

### 1.5. Шифрование чувствительных данных

**Задача:** Шифровать персональные данные в БД.

**Реализация:**
```sql
-- Включить pgcrypto в Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Создать функции шифрования
CREATE OR REPLACE FUNCTION encrypt_text(text_to_encrypt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      text_to_encrypt,
      current_setting('app.encryption_key')
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_text(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Использование:**
```javascript
// lib/db.js
async function saveUserEmail(userId, email) {
  const { data, error } = await supabase
    .rpc('encrypt_text', { text_to_encrypt: email })
    .then(encrypted => 
      supabase
        .from('users')
        .update({ email_encrypted: encrypted })
        .eq('id', userId)
    );
  
  return data;
}
```

**Проверка:**
- [ ] Проверка: прямой запрос к БД не показывает данные в открытом виде
- [ ] Тест шифрования/дешифрования

**Время:** 10 часов

**Итого Этап 1:** 44 часа (5.5 дней)

---

## Этап 2: Платёжная система (критический, 5 дней)

**Цель:** Реализовать приём платежей через Telegram Stars и автоматическую выдачу доступа.

### 2.1. Создание платежного провайдера в BotFather

**Шаги:**
1. Открыть @BotFather
2. Отправить `/mybots`
3. Выбрать бота
4. Payments → Telegram Stars
5. Получить provider token

**Проверка:**
- [ ] Наличие provider token
- [ ] Сохранить в `TELEGRAM_PAYMENT_TOKEN`

**Время:** 1 час

### 2.2. Эндпоинт создания инвойса

**Реализация:**
```javascript
// api/payments/create-invoice.js
const { paymentLimiter } = require('../../lib/middleware/rate-limit');
const validate = require('../../lib/middleware/validate');
const Joi = require('joi');

const invoiceSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required()
});

module.exports = async (req, res) => {
  paymentLimiter(req, res, async () => {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { course_id, user_id } = req.body;

    try {
      // Получить курс
      const course = await getCourse(course_id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Создать invoice
      const invoice = {
        title: course.title,
        description: course.description,
        payload: JSON.stringify({ course_id, user_id }),
        provider_token: '', // Пусто для Telegram Stars
        currency: 'XTR', // Telegram Stars
        prices: [{ label: course.title, amount: course.price }]
      };

      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice)
        }
      );

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.description);
      }

      return res.status(200).json({
        success: true,
        invoice_link: data.result
      });

    } catch (error) {
      console.error('Create invoice error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
```

**Проверка:**
- [ ] Тест: получение invoice_link
- [ ] Проверка валидности ссылки

**Время:** 8 часов

### 2.3. Обработка webhook от Telegram

**Реализация:**
```javascript
// api/payments/webhook.js
const crypto = require('crypto');

function verifyTelegramPayment(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = crypto.createHash('sha256').update(token).digest();
  
  const checkString = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  
  return hash === req.headers['x-telegram-bot-api-secret-token'];
}

module.exports = async (req, res) => {
  // Проверка подписи
  if (!verifyTelegramPayment(req)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const update = req.body;

  // Обработка успешного платежа
  if (update.pre_checkout_query) {
    // Подтвердить pre-checkout
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true
        })
      }
    );
  }

  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    const payload = JSON.parse(payment.invoice_payload);
    const { course_id, user_id } = payload;

    try {
      // Записать покупку
      await supabase.from('purchases').insert({
        user_id,
        course_id,
        amount: payment.total_amount,
        currency: payment.currency,
        telegram_payment_charge_id: payment.telegram_payment_charge_id,
        provider_payment_charge_id: payment.provider_payment_charge_id,
        status: 'completed'
      });

      // Начислить комиссии партнёрам
      await processPartnerCommissions(user_id, course_id, payment.total_amount);

      // Отправить уведомление
      await sendPurchaseNotification(user_id, course_id);

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error('Payment processing error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(200).json({ success: true });
};
```

**Проверка:**
- [ ] Тест: оплата тестовым методом
- [ ] Проверка записи в БД
- [ ] Проверка начисления комиссий

**Время:** 12 часов

### 2.4. UI для покупки в Mini App

**Реализация:**
```javascript
// miniapp/js/course.js
async function buyCourse(courseId) {
  try {
    // Создать invoice
    const response = await fetch(`${CONFIG.API_URL}/payments/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        user_id: tg.initDataUnsafe.user.id
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Открыть invoice
    tg.openInvoice(data.invoice_link, (status) => {
      if (status === 'paid') {
        tg.showAlert('✅ Оплата успешна! Курс доступен.');
        window.location.reload();
      } else if (status === 'cancelled') {
        tg.showAlert('Оплата отменена');
      } else if (status === 'failed') {
        tg.showAlert('Ошибка оплаты. Попробуйте снова.');
      }
    });

  } catch (error) {
    console.error('Buy course error:', error);
    tg.showAlert('Ошибка: ' + error.message);
  }
}
```

**Проверка:**
- [ ] Ручное тестирование покупки
- [ ] Проверка обновления интерфейса
- [ ] Проверка доступа к урокам

**Время:** 10 часов

### 2.5. Система возвратов (refund)

**Реализация:**
```javascript
// api/payments/refund.js
module.exports = async (req, res) => {
  const { purchase_id, reason } = req.body;

  try {
    // Получить покупку
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchase_id)
      .single();

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Выполнить возврат
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/refundStarPayment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: purchase.user_id,
          telegram_payment_charge_id: purchase.telegram_payment_charge_id
        })
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description);
    }

    // Обновить статус
    await supabase
      .from('purchases')
      .update({
        status: 'refunded',
        refund_reason: reason,
        refunded_at: new Date()
      })
      .eq('id', purchase_id);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ error: error.message });
  }
};
```

**Проверка:**
- [ ] Тест: возврат средств
- [ ] Проверка обновления статуса в БД

**Время:** 6 часов

**Итого Этап 2:** 37 часов (4.6 дней)

---

## Этап 3: Тестирование (критический, 5 дней)

**Цель:** Обеспечить покрытие тестами не менее 50% критических модулей.

### 3.1. Unit-тесты для lib/db.js

**Реализация:**
```javascript
// tests/unit/db.test.js
const { describe, it, expect, beforeEach, afterEach } = require('vitest');
const { createUser, getUser, updateUser } = require('../../lib/db');

describe('Database functions', () => {
  let testUserId;

  beforeEach(async () => {
    // Создать тестового пользователя
    const user = await createUser({
      user_id: 999999,
      first_name: 'Test User'
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Очистить тестовые данные
    await deleteUser(testUserId);
  });

  it('should create a user', async () => {
    const user = await getUser(testUserId);
    expect(user).toBeDefined();
    expect(user.first_name).toBe('Test User');
  });

  it('should update a user', async () => {
    await updateUser(testUserId, { first_name: 'Updated' });
    const user = await getUser(testUserId);
    expect(user.first_name).toBe('Updated');
  });

  // Добавить больше тестов...
});
```

**Проверка:**
- [ ] Покрытие > 70% для lib/db.js
- [ ] Все тесты проходят

**Время:** 12 часов

### 3.2. Unit-тесты для lib/ai-rate-limit.js

**Время:** 8 часов

### 3.3. Unit-тесты для реферальной логики

**Время:** 10 часов

### 3.4. E2E-тесты критического пути

**Реализация с Playwright:**
```javascript
// tests/e2e/purchase-flow.spec.js
const { test, expect } = require('@playwright/test');

test('complete purchase flow', async ({ page }) => {
  // 1. Открыть Mini App
  await page.goto('https://felix2-0.vercel.app/miniapp/index.html');

  // 2. Перейти в каталог
  await page.click('text=Академия');
  await expect(page).toHaveURL(/catalog/);

  // 3. Выбрать курс
  await page.click('.course-card:first-child');
  await expect(page).toHaveURL(/course/);

  // 4. Просмотреть бесплатный урок
  await page.click('text=Бесплатный урок');
  await expect(page.locator('video')).toBeVisible();

  // 5. Вернуться и купить курс
  await page.goBack();
  await page.click('text=Купить');

  // 6. Проверить открытие invoice
  await expect(page.locator('.invoice-modal')).toBeVisible();
});
```

**Проверка:**
- [ ] Все E2E сценарии проходят
- [ ] Скриншоты сохраняются

**Время:** 12 часов

### 3.5. Нагрузочное тестирование

**Реализация с Artillery:**
```yaml
# tests/load/artillery-config.yml
config:
  target: 'https://felix2-0.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Browse courses"
    flow:
      - get:
          url: "/api/courses-full"
      - think: 2
      - get:
          url: "/miniapp/catalog.html"
      - think: 3
      - get:
          url: "/api/courses-full?id=1"
```

**Запуск:**
```bash
artillery run tests/load/artillery-config.yml
```

**Проверка:**
- [ ] Среднее время ответа < 500ms
- [ ] Ошибок < 1%
- [ ] 95th percentile < 1000ms

**Время:** 8 часов

**Итого Этап 3:** 50 часов (6.25 дней)

---

## Сводная таблица этапов

| Этап | Длительность | Критичность | Статус |
|------|-------------|-------------|--------|
| 0. Инфраструктура | 3 дня | Высокая | ⏳ Ожидание |
| 1. Безопасность | 5 дней | Критическая | ⏳ Ожидание |
| 2. Платежи | 5 дней | Критическая | ⏳ Ожидание |
| 3. Тестирование | 5 дней | Критическая | ⏳ Ожидание |

**Общая длительность:** 18 дней

---

## Следующие шаги

После завершения критических этапов 0-3:

**Этап 4:** Мониторинг и логирование (3 дня)  
**Этап 5:** Контент и курсы (7 дней)  
**Этап 6:** Юридическое оформление (3 дня)  
**Этап 7:** Маркетинг и запуск (5 дней)

**Общая длительность до запуска:** ~36 дней (5 недель)

---

## Чек-лист готовности к Production

- [ ] Все критические этапы завершены
- [ ] Покрытие тестами > 50%
- [ ] Нагрузочное тестирование пройдено
- [ ] Безопасность проверена
- [ ] Платежи работают
- [ ] Мониторинг настроен
- [ ] Документация обновлена
- [ ] Юридические документы готовы
- [ ] Минимум 10 курсов опубликовано
- [ ] Beta-тестирование завершено

---

**Начинаем реализацию!** 🚀

*Документ будет обновляться по мере выполнения этапов.*
