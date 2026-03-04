# 🎙️ Голосовой помощник Felix Academy - Полная инструкция

## 📋 Обзор

Полноценный голосовой помощник с использованием Groq API:
- **STT** (Speech-to-Text): Groq Whisper Large v3
- **LLM** (Language Model): Llama 3.3 70B Versatile
- **TTS** (Text-to-Speech): Groq Play (Suno)

## 🎯 Возможности

✅ Распознавание речи на русском и английском языках
✅ Генерация умных ответов с контекстом разговора
✅ Озвучивание ответов с выбором голоса (Jarvis, Erin, Ethan)
✅ История разговоров
✅ Работает полностью на бэкенде
✅ Оптимизировано для Telegram Mini App

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

Новые зависимости:
- `express` - веб-сервер
- `multer` - обработка multipart/form-data
- `form-data` - работа с формами
- `groq-sdk` - уже установлен

### 2. Настройка Groq API

1. Перейдите на [console.groq.com](https://console.groq.com)
2. Зарегистрируйтесь (через Google/GitHub)
3. Создайте API ключ: Settings → API Keys → Create Key
4. Скопируйте ключ (формат: `gsk_...`)

### 3. Добавьте ключ в .env

```env
GROQ_API_KEY=gsk_ваш_ключ_здесь
```

### 4. Запустите проект

Локально:
```bash
vercel dev
```

Или деплой на Vercel:
```bash
vercel --prod
```

## 📁 Структура файлов

```
felix-academy/
├── lib/voice/
│   ├── groq-services.js      # Основные сервисы: STT, LLM, TTS
│   └── transcription.js      # Транскрипция и конспекты (существующий)
├── api/
│   ├── voice-assistant.js    # API endpoint для голосового помощника
│   └── voice/index.js        # API для конспектов (существующий)
└── miniapp/
    ├── voice-assistant.html  # Интерфейс голосового помощника
    └── voice.html            # Голосовой ввод (существующий)
```

## 🔧 API Endpoints

### POST /api/voice-assistant

Полный пайплайн: STT → LLM → TTS

**Параметры (multipart/form-data):**
```javascript
{
  action: 'process',           // process | stt | llm | tts
  audio: File,                 // Аудио файл (webm, mp3, wav)
  userId: string,              // ID пользователя
  language: 'ru',              // Язык (ru, en)
  voice: 'Jarvis',             // Голос (Jarvis, Erin, Ethan)
  speed: 1.0,                  // Скорость речи (0.5 - 2.0)
  history: JSON                // История разговора (опционально)
}
```

**Ответ:**
- Content-Type: `audio/mpeg`
- Headers:
  - `X-Transcription`: Распознанный текст
  - `X-Response-Text`: Текст ответа
- Body: MP3 аудио

### Примеры использования

#### 1. Полный пайплайн (STT → LLM → TTS)

```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('action', 'process');
formData.append('userId', userId);
formData.append('language', 'ru');
formData.append('voice', 'Jarvis');

const response = await fetch('/api/voice-assistant', {
  method: 'POST',
  body: formData
});

const transcription = response.headers.get('X-Transcription');
const responseText = response.headers.get('X-Response-Text');
const audioBlob = await response.blob();

// Воспроизвести аудио
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

#### 2. Только STT (распознавание)

```javascript
formData.append('action', 'stt');
formData.append('audio', audioBlob);
formData.append('language', 'ru');

const response = await fetch('/api/voice-assistant', {
  method: 'POST',
  body: formData
});

const { text } = await response.json();
```

#### 3. Только LLM (генерация ответа)

```javascript
const response = await fetch('/api/voice-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'llm',
    message: 'Что такое JavaScript?',
    systemPrompt: 'Ты учитель программирования',
    history: [
      { role: 'user', content: 'Привет' },
      { role: 'assistant', content: 'Здравствуй!' }
    ]
  })
});

const { text } = await response.json();
```

#### 4. Только TTS (озвучивание)

```javascript
const response = await fetch('/api/voice-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'tts',
    text: 'Привет! Как дела?',
    voice: 'Jarvis',
    speed: 1.0
  })
});

const audioBlob = await response.blob();
```

## 🎨 Интерфейс

### Голосовой помощник (voice-assistant.html)

Полноценный чат с голосовым вводом:
- Удерживайте кнопку для записи
- Автоматическое распознавание и ответ
- История разговоров
- Выбор голоса (Jarvis, Erin, Ethan)
- Сохранение истории в localStorage

### Использование в Mini App

```html
<a href="voice-assistant.html" class="menu-item">
  🎙️ Голосовой помощник
</a>
```

## 🔐 Безопасность

1. **Аутентификация**: Передавайте `X-User-Id` в заголовках
2. **Rate Limiting**: Добавьте ограничения на количество запросов
3. **Валидация**: Проверяйте размер аудио файлов (макс. 25 МБ)

Пример middleware:

```javascript
// api/voice-assistant.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 30 // 30 запросов
});

app.use('/api/voice-assistant', limiter);
```

## 📊 Лимиты Groq API

### Free Tier
- **Whisper (STT)**: 30 запросов/мин, 1440/день
- **Llama 3.3 70B**: 30 запросов/мин, 14400/день
- **Play (TTS)**: 30 запросов/мин, 1440/день

### Оптимизация

1. **Кэширование частых ответов**:
```javascript
const cache = new Map();
const cacheKey = `tts:${text}:${voice}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const audio = await textToSpeech(text, voice);
cache.set(cacheKey, audio);
```

2. **Ограничение длины ответов**:
```javascript
// В groq-services.js
max_tokens: 300 // Короткие ответы для голоса
```

3. **Сжатие аудио**:
```javascript
// Используйте более низкий битрейт для TTS
response_format: 'mp3', // Вместо wav
```

## 🎯 Доступные голоса

| Голос | Описание | Язык |
|-------|----------|------|
| Jarvis | Мужской, профессиональный | EN, RU |
| Erin | Женский, дружелюбный | EN, RU |
| Ethan | Мужской, энергичный | EN, RU |

## 🐛 Отладка

### Проверка STT

```bash
curl -X POST http://localhost:3000/api/voice-assistant \
  -H "X-User-Id: test" \
  -F "action=stt" \
  -F "audio=@test.webm" \
  -F "language=ru"
```

### Проверка LLM

```bash
curl -X POST http://localhost:3000/api/voice-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "action": "llm",
    "message": "Привет!",
    "systemPrompt": "Ты помощник"
  }'
```

### Проверка TTS

```bash
curl -X POST http://localhost:3000/api/voice-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "action": "tts",
    "text": "Привет, мир!",
    "voice": "Jarvis"
  }' \
  --output test.mp3
```

## 📱 Интеграция с Telegram Bot

```javascript
// bot.js
bot.command('voice', (ctx) => {
  ctx.reply('Открой голосового помощника:', {
    reply_markup: {
      inline_keyboard: [[
        { 
          text: '🎙️ Голосовой помощник', 
          web_app: { url: 'https://your-domain.com/miniapp/voice-assistant.html' }
        }
      ]]
    }
  });
});
```

## 🚀 Деплой на Vercel

1. Убедитесь, что `GROQ_API_KEY` добавлен в Environment Variables
2. Деплой:

```bash
vercel --prod
```

3. Проверьте:

```bash
curl https://your-project.vercel.app/api/voice-assistant \
  -H "X-User-Id: test" \
  -F "action=stt" \
  -F "audio=@test.webm"
```

## 💡 Советы

1. **Используйте короткие промпты** для быстрых ответов
2. **Ограничьте историю** до 6 последних сообщений
3. **Кэшируйте TTS** для частых фраз
4. **Сжимайте аудио** перед отправкой на сервер
5. **Добавьте индикаторы загрузки** для лучшего UX

## 📚 Дополнительные ресурсы

- [Groq Documentation](https://console.groq.com/docs)
- [Whisper Model](https://github.com/openai/whisper)
- [Llama 3.3 70B](https://www.llama.com/)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

## 🎉 Готово!

Теперь у вас есть полноценный голосовой помощник с:
- ✅ Распознаванием речи
- ✅ Умными ответами
- ✅ Озвучиванием
- ✅ Историей разговоров
- ✅ Выбором голоса

Откройте `voice-assistant.html` в Mini App и начните общаться! 🚀
