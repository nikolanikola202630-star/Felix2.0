# Felix - Telegram Smart Assistant Bot

Умный ассистент для Telegram с поддержкой голосовых заметок и AI-диалогов.

## Возможности

- 🎤 Транскрибация голосовых сообщений (Groq Whisper)
- 📝 Умные саммари и анализ текста
- 💬 AI-диалоги с контекстом (Groq LLaMA 3.3)
- 📄 Экспорт в PDF, DOCX, Google Docs, Google Sheets
- 🔄 Автономные обновления без перезапуска

## Технологии

- **Backend**: Python + Vercel Serverless
- **Database**: PostgreSQL (Supabase) + Prisma
- **AI**: Groq API (Whisper + LLaMA 3.3)
- **Cache**: Redis (Upstash)
- **Frontend**: Telegram Mini App (React)

## Деплой

Проект автоматически деплоится на Vercel при push в main ветку.

### Переменные окружения

```env
TELEGRAM_BOT_TOKEN=your_token
DATABASE_URL=postgresql://...
GROQ_API_KEY=your_key
REDIS_URL=redis://...
```

## Разработка

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск локально
vercel dev
```

## Документация

Полная документация находится в `.kiro/specs/telegram-smart-assistant-bot/`

## Бот

Telegram: [@fel12x_bot](https://t.me/fel12x_bot)
