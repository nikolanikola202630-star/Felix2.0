# 📡 API Endpoints для Felix Bot Mini App

## Единый endpoint: `/api/app`

Все запросы Mini App теперь идут через один endpoint с параметрами `endpoint` и `action`.

### Формат запроса
```
GET /api/app?endpoint={endpoint}&action={action}&userId={userId}
POST /api/app
```

---

## 📚 Learning API

### Получить прогресс пользователя
```
GET /api/app?endpoint=learning&action=getUserProgress&userId=123
```

**Ответ:**
```json
{
  "success": true,
  "progress": {
    "level": 5,
    "xp": 2500,
    "xpToNext": 3000,
    "streak": 7,
    "totalXP": 12500,
    "rank": "Продвинутый"
  }
}
```

### Получить ежедневные задания
```
GET /api/app?endpoint=learning&action=getDailyTasks&userId=123
```

### Получить достижения
```
GET /api/app?endpoint=learning&action=getAchievements&userId=123
```

### Получить аналитику
```
GET /api/app?endpoint=learning&action=getAnalytics&userId=123
```

### Получить лидерборд
```
GET /api/app?endpoint=learning&action=getLeaderboard
```

---

## 🎓 Courses API

### Получить список курсов
```
GET /api/app?endpoint=courses&action=getCourses&userId=123
GET /api/app?action=getCourses&userId=123
```

**Ответ:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "ai-basics",
      "title": "Основы AI",
      "description": "Изучите основы искусственного интеллекта",
      "icon": "🤖",
      "level": "Начальный",
      "duration": "2 часа",
      "lessons": 5,
      "progress": 60,
      "enrolled": true,
      "lessons_data": [...]
    }
  ]
}
```

### Получить конкретный курс
```
GET /api/app?endpoint=courses&action=getCourse&courseId=ai-basics&userId=123
GET /api/app?action=getCourse&courseId=ai-basics&userId=123
```

### Начать курс (POST)
```javascript
fetch('/api/app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'startCourse',
    courseId: 'ai-basics',
    userId: 123
  })
})
```

### Завершить урок (POST)
```javascript
fetch('/api/app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'completeLesson',
    courseId: 'ai-basics',
    lessonId: 1,
    userId: 123
  })
})
```

---

## 🔐 Admin API

### Получить партнеров
```
GET /api/app?endpoint=admin&action=getPartners
```

**Ответ:**
```json
{
  "success": true,
  "partners": [
    {
      "id": 1,
      "name": "TechCorp",
      "logo": "🏢",
      "status": "active",
      "category": "Технологии"
    }
  ]
}
```

### Получить настройки пользователя
```
GET /api/app?endpoint=admin&action=getUserSettings&userId=123
```

### Сохранить настройки (POST)
```javascript
fetch('/api/app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'saveSettings',
    userId: 123,
    settings: {
      avatar: '👤',
      theme: 'dark',
      notifications: true
    }
  })
})
```

---

## 👤 Profile API

### Получить профиль
```
GET /api/app?endpoint=profile&action=getProfile&userId=123
GET /api/app?action=getProfile&userId=123
```

**Ответ:**
```json
{
  "success": true,
  "profile": {
    "id": "123",
    "username": "User",
    "level": 5,
    "xp": 2500,
    "xpToNext": 3000,
    "streak": 7,
    "totalMessages": 150,
    "achievements": 12,
    "avatar": "👤",
    "style": "casual",
    "theme": "dark"
  }
}
```

---

## 🎤 Voice API

### Распознать голос (POST)
```javascript
fetch('/api/app?endpoint=voice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audio: 'base64_audio_data',
    userId: 123
  })
})
```

**Ответ:**
```json
{
  "success": true,
  "text": "Привет! Это распознанный текст из голосового сообщения.",
  "confidence": 0.95
}
```

---

## 🎯 Общие POST действия

### Завершить задание
```javascript
fetch('/api/app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'completeTask',
    userId: 123,
    taskId: 1,
    xp: 50
  })
})
```

---

## 🔗 Примеры использования в Mini App

### JavaScript
```javascript
// Константы
const API_URL = '/api/app';

// Получить прогресс
async function loadProgress(userId) {
  const response = await fetch(`${API_URL}?endpoint=learning&action=getUserProgress&userId=${userId}`);
  const data = await response.json();
  return data.progress;
}

// Получить курсы
async function loadCourses(userId) {
  const response = await fetch(`${API_URL}?action=getCourses&userId=${userId}`);
  const data = await response.json();
  return data.courses;
}

// Начать курс
async function startCourse(userId, courseId) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'startCourse',
      userId,
      courseId
    })
  });
  return await response.json();
}
```

---

## 📝 Замена старых URL

Заменить в `miniapp/index.html`:

**Было:**
```javascript
fetch('https://felix-black.vercel.app/api/learning?action=getUserProgress&userId=${user.id}')
fetch('https://felix-black.vercel.app/api/admin?action=getPartners')
fetch('https://felix-black.vercel.app/api/courses?action=getCourses')
```

**Стало:**
```javascript
fetch('/api/app?endpoint=learning&action=getUserProgress&userId=${user.id}')
fetch('/api/app?endpoint=admin&action=getPartners')
fetch('/api/app?action=getCourses&userId=${user.id}')
```

---

## ✅ Преимущества единого endpoint

1. **Меньше serverless functions** - не превышаем лимит Vercel (12 функций)
2. **Проще поддержка** - весь код в одном файле
3. **Быстрее деплой** - меньше файлов для сборки
4. **Единая обработка ошибок** - централизованная логика

---

**Версия:** v7.1  
**Дата:** 02.03.2026
