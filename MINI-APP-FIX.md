# 🔧 Исправление Mini App

## Проблема
Mini App использует старые URL (`felix-black.vercel.app`) и API endpoints не работают.

## Решение

### ✅ Что уже сделано

1. **Создан единый API endpoint** `/api/app`
   - Все функции объединены в один файл
   - Не превышаем лимит Vercel (12 serverless functions)
   - Поддерживает все действия: learning, courses, admin, profile, voice

2. **API работает** - можно проверить:
   ```bash
   curl "https://felix2-0.vercel.app/api/app?action=getCourses&userId=demo"
   curl "https://felix2-0.vercel.app/api/app?endpoint=learning&action=getUserProgress&userId=demo"
   ```

### 📝 Что нужно сделать в Mini App

Заменить в `miniapp/index.html` все старые URL на новые:

#### 1. Константы API (в начале скрипта)
```javascript
// Было:
const API_URL = 'https://felix-black.vercel.app/api/miniapp';
const LEARNING_API = 'https://felix-black.vercel.app/api/learning';
const COURSES_API = 'https://felix-black.vercel.app/api/courses';

// Стало:
const API_URL = '/api/app';
const LEARNING_API = '/api/app';
const COURSES_API = '/api/app';
```

#### 2. Запросы к Learning API
```javascript
// Было:
fetch('https://felix-black.vercel.app/api/learning?action=getUserProgress&userId=${user.id}')

// Стало:
fetch('/api/app?endpoint=learning&action=getUserProgress&userId=${user.id}')
```

#### 3. Запросы к Courses API
```javascript
// Было:
fetch('https://felix-black.vercel.app/api/admin?action=getCourses')

// Стало:
fetch('/api/app?action=getCourses&userId=${user.id}')
```

#### 4. Запросы к Admin API
```javascript
// Было:
fetch('https://felix-black.vercel.app/api/admin?action=getPartners')

// Стало:
fetch('/api/app?endpoint=admin&action=getPartners')
```

#### 5. POST запросы
```javascript
// Было:
fetch('https://felix-black.vercel.app/api/admin', {
  method: 'POST',
  body: JSON.stringify({ action: 'saveSettings', ... })
})

// Стало:
fetch('/api/app', {
  method: 'POST',
  body: JSON.stringify({ action: 'saveSettings', ... })
})
```

### 🔍 Поиск и замена (regex)

В редакторе кода выполнить:

1. **Найти:** `https://felix-black\.vercel\.app/api/learning`  
   **Заменить на:** `/api/app?endpoint=learning`

2. **Найти:** `https://felix-black\.vercel\.app/api/admin`  
   **Заменить на:** `/api/app?endpoint=admin`

3. **Найти:** `https://felix-black\.vercel\.app/api/courses`  
   **Заменить на:** `/api/app`

4. **Найти:** `https://felix-black\.vercel\.app/api/voice`  
   **Заменить на:** `/api/app?endpoint=voice`

### ✅ После замены

1. Сохранить `miniapp/index.html`
2. Закоммитить и запушить:
   ```bash
   git add miniapp/index.html
   git commit -m "fix: обновление API URLs в Mini App"
   git push
   vercel --prod
   ```

3. Проверить Mini App: https://felix2-0.vercel.app/miniapp/

### 🎯 Ожидаемый результат

После замены все функции Mini App заработают:
- ✅ Профиль с прогрессом
- ✅ Ежедневные задания
- ✅ Достижения
- ✅ Аналитика
- ✅ Лидерборд
- ✅ Курсы с уроками
- ✅ Партнеры
- ✅ Настройки
- ✅ Голосовое управление

---

**Статус:** API готов ✅, нужно обновить Mini App  
**Приоритет:** 🔴 Высокий
