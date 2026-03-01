# 📱 Felix Bot v5.0 - Mini App

## Обзор

Полноценное веб-приложение для управления Felix Bot прямо из Telegram!

---

## ✨ Возможности Mini App:

### 👤 Вкладка "Профиль"
- **Прогресс обучения**: Визуальный индикатор 0-100%
- **Статистика**: Сообщения, команды, стиль, эмодзи
- **Интересы**: Топ-10 тем, которые вы обсуждаете
- **Обновление**: Кнопка для получения свежих данных

### ⚡ Вкладка "Команды"
- **AI Команды**: Все 8 AI команд с описанием
  - /ask - Вопросы AI
  - /summary - Краткое содержание
  - /analyze - Анализ текста
  - /generate - Генерация контента
  - /translate - Перевод
  - /improve - Улучшение текста
  - /brainstorm - Идеи
  - /explain - Объяснения
- **Информация**: /profile, /stats, /help
- **Быстрый запуск**: Тап на команду = отправка в бота

### 👥 Вкладка "Группа"
- **Модерация**: Статус и настройки
  - Автомодерация спама
  - Фильтры CAPS и повторов
  - Система предупреждений
  - Автоудаление
- **Приветствие**: Настройка сообщения для новых
- **Статистика группы**: Сообщения, активные пользователи
- **FAQ**: Добавление и поиск в базе знаний

### ⚙️ Вкладка "Настройки"
- **Самообучение**:
  - Адаптация стиля (вкл/выкл)
  - Анализ интересов (вкл/выкл)
  - Персонализация ответов (вкл/выкл)
- **Уведомления**:
  - Приветствия (вкл/выкл)
  - Модерация (вкл/выкл)
- **О боте**: Версия, AI модель, хостинг

---

## 🔌 API Endpoints

### GET/POST `/api/miniapp`

#### 1. Получить профиль пользователя
```javascript
GET /api/miniapp?action=getProfile&userId=123456789

Response:
{
  "success": true,
  "profile": {
    "userId": 123456789,
    "username": "user",
    "firstName": "John",
    "learningScore": 65,
    "totalMessages": 127,
    "style": {
      "formality": "casual",
      "formalityEmoji": "😎",
      "emojiUsage": 2.3,
      "avgMessageLength": 85
    },
    "interests": [
      { "topic": "программирование", "count": 15 },
      { "topic": "путешествия", "count": 8 }
    ],
    "topCommands": [
      { "command": "/ask", "count": 23 },
      { "command": "/summary", "count": 12 }
    ],
    "memberSince": "2026-03-01T00:00:00.000Z",
    "lastActive": "2026-03-01T12:00:00.000Z"
  }
}
```

#### 2. Получить статистику группы
```javascript
GET /api/miniapp?action=getGroupStats&groupId=-1001234567890

Response:
{
  "success": true,
  "group": {
    "groupId": -1001234567890,
    "groupName": "My Group",
    "totalMessages": 5432,
    "activeUsers": 87,
    "topUsers": [
      { "userId": 123456789, "messageCount": 234 }
    ],
    "moderation": {
      "enabled": true,
      "autoDelete": true,
      "warnLimit": 3,
      "filters": {
        "spam": true,
        "profanity": true,
        "links": false
      }
    },
    "welcome": {
      "enabled": true,
      "message": "Добро пожаловать!",
      "rulesCount": 3
    },
    "faqCount": 15,
    "memberSince": "2026-02-01T00:00:00.000Z"
  }
}
```

#### 3. Обновить настройки
```javascript
POST /api/miniapp
Content-Type: application/json

{
  "action": "updateSettings",
  "userId": 123456789,
  "settings": {
    "user": {
      "language": "ru"
    }
  }
}

Response:
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

## 🎨 Дизайн

### Цветовая схема
- **Градиент**: #667eea → #764ba2
- **Акцент**: #ffd700 (золотой)
- **Карточки**: rgba(255, 255, 255, 0.1) с blur
- **Текст**: #fff

### Компоненты
- **Табы**: 4 вкладки с иконками
- **Карточки**: Закругленные с backdrop-filter
- **Кнопки**: Градиентные и прозрачные
- **Переключатели**: iOS-стиль toggle
- **Прогресс-бар**: Градиентная заливка

### Анимации
- **fadeIn**: Плавное появление
- **slideUp**: Появление снизу
- **scale**: Эффект нажатия

---

## 📱 Интеграция с Telegram

### Telegram WebApp API
```javascript
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получить данные пользователя
const user = tg.initDataUnsafe?.user;

// Отправить данные боту
tg.sendData(JSON.stringify({ command: '/profile' }));

// Показать алерт
tg.showAlert('Команда отправлена!');

// Вибрация
tg.HapticFeedback.impactOccurred('light');

// Кнопка "Назад"
tg.BackButton.show();
tg.BackButton.onClick(() => tg.close());
```

### Открытие Mini App
```
https://t.me/fel12x_bot/app
```

---

## 🚀 Деплой

### Файлы
- `miniapp/index.html` - Основной файл Mini App
- `api/miniapp.js` - API endpoint для данных

### URL
- **Mini App**: https://felix-black.vercel.app/miniapp/
- **API**: https://felix-black.vercel.app/api/miniapp

### Настройка в BotFather
```
/setmenubutton
@fel12x_bot
text: 📱 Открыть панель
url: https://felix-black.vercel.app/miniapp/
```

---

## 🧪 Тестирование

### Локально
1. Открыть `miniapp/index.html` в браузере
2. Проверить все вкладки
3. Протестировать кнопки

### В Telegram
1. Открыть бота @fel12x_bot
2. Нажать кнопку меню
3. Выбрать "Открыть панель"
4. Проверить все функции

### API
```bash
# Тест профиля
curl "https://felix-black.vercel.app/api/miniapp?action=getProfile&userId=123456789"

# Тест группы
curl "https://felix-black.vercel.app/api/miniapp?action=getGroupStats&groupId=-1001234567890"
```

---

## 📊 Функции по вкладкам

### Профиль
- ✅ Отображение имени и ID
- ✅ Прогресс обучения с анимацией
- ✅ 4 статистики (сообщения, команды, стиль, эмодзи)
- ✅ Список интересов
- ✅ Кнопка обновления

### Команды
- ✅ 8 AI команд с описанием
- ✅ 3 информационные команды
- ✅ Тап для отправки команды
- ✅ Группировка по категориям

### Группа
- ✅ Статус модерации
- ✅ Настройка приветствия
- ✅ Статистика группы
- ✅ FAQ система

### Настройки
- ✅ Переключатели самообучения
- ✅ Настройки уведомлений
- ✅ Информация о боте
- ✅ Кнопка открытия бота

---

## 🎯 Следующие шаги

### v5.1
- [ ] Редактор приветствия в Mini App
- [ ] Управление FAQ через интерфейс
- [ ] Настройки модерации
- [ ] История команд

### v5.2
- [ ] Графики статистики
- [ ] Экспорт данных
- [ ] Темная/светлая тема
- [ ] Мультиязычность

### v5.3
- [ ] Напоминания
- [ ] Опросы
- [ ] Расписание
- [ ] Уведомления

---

## 💡 Особенности

### Адаптивность
- Работает на всех размерах экранов
- Оптимизирован для мобильных
- Поддержка Telegram темы

### Производительность
- Минимальный размер (один HTML файл)
- Быстрая загрузка
- Плавные анимации

### UX
- Интуитивный интерфейс
- Быстрый доступ к командам
- Визуальная обратная связь
- Haptic feedback

---

## 📞 Информация

**URL**: https://felix-black.vercel.app/miniapp/  
**API**: https://felix-black.vercel.app/api/miniapp  
**Бот**: @fel12x_bot  
**Версия**: 5.0.0  

**Статус**: ✅ ГОТОВ К ИСПОЛЬЗОВАНИЮ!

---

**Создано**: 01.03.2026  
**Обновлено**: 01.03.2026
