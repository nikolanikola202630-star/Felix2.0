# 🔄 Очистка Кэша Vercel

## Проблема
MiniApp не обновляется после деплоя из-за кэширования статических файлов.

## Решение 1: Автоматическое (уже сделано)
✅ Добавлены версии к footer.js через query параметры
✅ Код запушен в GitHub
✅ Vercel задеплоит обновленные файлы

## Решение 2: Ручная очистка кэша

### Через Vercel Dashboard:

1. Открой https://vercel.com/dashboard
2. Выбери проект **felix2-0**
3. Перейди в **Settings** → **General**
4. Найди секцию **Build & Development Settings**
5. Нажми **Redeploy** → **Use existing Build Cache: OFF**

### Через Vercel CLI:

```bash
# Установить Vercel CLI (если еще не установлен)
npm i -g vercel

# Войти в аккаунт
vercel login

# Очистить кэш и передеплоить
vercel --prod --force
```

## Решение 3: Принудительный редеплой

### Через GitHub:

```bash
# Создать пустой коммит
git commit --allow-empty -m "🔄 Force redeploy"
git push origin main
```

### Через Vercel Dashboard:

1. Открой https://vercel.com/dashboard
2. Выбери проект **felix2-0**
3. Перейди в **Deployments**
4. Найди последний деплой
5. Нажми три точки → **Redeploy**
6. Выбери **Redeploy without cache**

## Проверка обновления

После деплоя проверь:

1. **Открой MiniApp** в браузере
2. **Очисти кэш браузера**: Ctrl+Shift+R (Windows) или Cmd+Shift+R (Mac)
3. **Проверь футер** - должна быть ссылка на EGOIST ECOSYSTEM
4. **Открой консоль** (F12) - не должно быть ошибок загрузки footer.js

## Текущий статус

✅ Версионирование добавлено: `footer.js?v=202603031830`
✅ Код в GitHub (коммит c5915ac)
🔄 Vercel деплоит (2-3 минуты)

## Если все еще не работает

### 1. Проверь Vercel Logs:
```
https://vercel.com/dashboard → felix2-0 → Deployments → Latest → View Function Logs
```

### 2. Проверь файл существует:
```
https://felix2-0.vercel.app/miniapp/js/footer.js
```

### 3. Проверь консоль браузера:
- Открой F12
- Вкладка Network
- Обнови страницу
- Найди footer.js - должен быть статус 200

## Альтернатива: Service Worker

Если проблема с кэшем повторяется, можно использовать Service Worker для управления кэшем:

```javascript
// miniapp/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
```

---

**Статус:** ✅ Версионирование добавлено, деплой запущен  
**Время:** ~3 минуты до обновления  
**Проверить:** https://felix2-0.vercel.app/miniapp/
