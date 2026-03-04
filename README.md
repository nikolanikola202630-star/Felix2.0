# 🎓 EGOIST ACADEMY

> Закрытое сообщество для мотивированных пользователей

**Минимализм. Строгость. Фокус на результате.**

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://felix2-0.vercel.app)
[![Version](https://img.shields.io/badge/version-1.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 Быстрый старт

EGOIST ACADEMY уже запущен и работает!

### Открыть приложение:
1. Откройте бота: [@fel12x_bot](https://t.me/fel12x_bot)
2. Отправьте: `/start`
3. Нажмите: "🎓 Открыть Академию"

### Для разработчиков:
```bash
# Клонировать
git clone <repo-url>

# Установить зависимости
npm install

# Настроить .env
cp .env.example .env

# Запустить локально
npm run dev
```

---

## ✨ Особенности

### Дизайн
- **Минимализм:** Ничего лишнего, фокус на контенте
- **Тёмная тема:** #0A0A0A фон, белый текст
- **Крупные заголовки:** 48px hero, жирные начертания
- **Системные шрифты:** SF Pro Display, Roboto (0 KB загрузки)

### Функционал
- ✅ 5 категорий курсов (расширяемо до 16+)
- ✅ YouTube видео + PDF материалы
- ✅ Telegram-сообщества для каждого курса
- ✅ AI-ассистент с голосовым вводом (Groq Llama 3.3)
- ✅ Партнёрская программа с реферальной системой
- ✅ Админ панель для управления

### Производительность
- ⚡ Загрузка <1 сек
- 📦 CSS: 11 KB
- 📦 JS: 8 KB
- 🎯 FPS: 60
- 🚀 Lighthouse: 95+

---

## 📁 Структура проекта

```
egoist-academy/
├── miniapp/              # Frontend
│   ├── egoist.html       # Главная (SPA)
│   ├── egoist-catalog.html
│   ├── egoist-course.html
│   ├── egoist-lesson.html
│   ├── css/egoist-theme.css
│   └── js/egoist-app.js
├── api/                  # Backend (40 endpoints)
├── lib/                  # Библиотеки
├── database/             # БД и миграции
├── data/                 # Курсы
└── bot.js                # Telegram бот
```

Подробнее: [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)

---

## 🎨 Категории курсов

1. 👑 **ACADEMY KINGS** - Элитное обучение
2. 🧠 **BRAIN** - Развитие мышления
3. 💻 **IT** - Технологии и программирование
4. 📈 **TRADING** - Трейдинг и инвестиции
5. 🎯 **SUCCESS** - Путь к успеху

---

## 🛠️ Технологии

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Telegram Web App SDK

**Backend:**
- Node.js
- Vercel Serverless Functions
- PostgreSQL (Supabase)

**AI:**
- Groq (Llama 3.3 70B)
- Whisper (STT)
- Play TTS (TTS)

---

## 📖 Документация

### Для пользователей:
- [FAQ.md](FAQ.md) - Частые вопросы
- [CHANGELOG.md](CHANGELOG.md) - История изменений

### Для разработчиков:
- [БЫСТРЫЙ-ЗАПУСК.md](БЫСТРЫЙ-ЗАПУСК.md) - Инструкция запуска
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Структура проекта
- [API-ENDPOINTS.md](API-ENDPOINTS.md) - Документация API
- [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) - Чек-лист деплоя

### О проекте:
- [EGOIST-ACADEMY-README.md](EGOIST-ACADEMY-README.md) - Полное описание
- [EGOIST-ACADEMY-АНАЛИЗ-ТЗ.md](EGOIST-ACADEMY-АНАЛИЗ-ТЗ.md) - Анализ ТЗ
- [EGOIST-ACADEMY-МИНИМАЛИЗАЦИЯ.md](EGOIST-ACADEMY-МИНИМАЛИЗАЦИЯ.md) - Отчёт о дизайне

---

## 🚀 Деплой

Проект автоматически деплоится на Vercel при push в main:

```bash
git add .
git commit -m "feat: новая функция"
git push
```

Vercel задеплоит за 1-2 минуты.

---

## 📊 Статистика

- **Файлов:** 149
- **Строк кода:** ~30,000
- **Размер:** ~700 KB
- **Оптимизация:** 62% уменьшение

---

## 🤝 Роли

### Студент
- Доступ к курсам
- Участие в сообществах
- AI-ассистент
- Отслеживание прогресса

### Партнёр
- Все возможности студента
- Публикация контента
- Реферальная система
- Статистика и комиссии

### Администратор
- Управление пользователями
- Управление курсами
- Модерация контента
- Просмотр статистики

---

## 📝 Лицензия

MIT License - see [LICENSE](LICENSE)

---

## 📞 Поддержка

- **Telegram:** [@fel12x_bot](https://t.me/fel12x_bot)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Docs:** [Документация](docs/)

---

**Версия:** 1.0  
**Дата:** 4 марта 2026  
**Статус:** ✅ Production Ready

**Made with ❤️ for motivated learners**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/felix-bot)

## 🎨 Brandbook V12 ✅ Интегрирован

Felix Academy V12 теперь имеет полный брендбук с премиальным дизайном:

- **Философия:** Old Money. Cold Mind. High Society.
- **Цвета:** Антрацит, Золото, Изумруд, Мрамор
- **Типографика:** Cormorant Garamond, Montserrat, Playfair Display
- **Tone of Voice:** Формальный, элегантный, премиальный
- **Статус:** ✅ Интегрирован (March 4, 2026)

**Быстрый старт:** [BRANDBOOK-START-HERE.md](BRANDBOOK-START-HERE.md)  
**Полный брендбук:** [BRANDBOOK-V12.md](BRANDBOOK-V12.md)  
**Демо:** [miniapp/brandbook-demo.html](miniapp/brandbook-demo.html)  
**Отчёт об интеграции:** [BRANDBOOK-INTEGRATION-COMPLETE.md](BRANDBOOK-INTEGRATION-COMPLETE.md)

## ✨ Features

- 🤖 **AI-Powered** - Groq (Llama 3.3 70B) with context awareness
- 🎙️ **Voice Assistant** - Full STT → LLM → TTS pipeline with Groq
- 🧠 **Machine Learning** - Personalization and adaptive learning
- 💾 **Full Database** - PostgreSQL with 22 tables
- 📱 **Mini App** - Beautiful Telegram Web App interface
- 🎓 **Learning System** - Courses, achievements, progress tracking
- 📊 **Analytics** - User statistics and insights
- 🎤 **Voice Support** - Transcription and lecture notes
- 🔍 **Smart Search** - Full-text search with Russian language support
- 🎯 **Rate Limiting** - AI usage limits (50/day)
- 🛡️ **Error Handling** - Comprehensive error handling and logging
- ⚡ **Optimized** - Lazy loading, caching, graceful shutdown

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Supabase account
- Groq API key
- Telegram Bot Token

### 2. Setup Database

1. Create Supabase project at https://supabase.com
2. Run `database/migrations/001-add-ml-tables-safe.sql` in SQL Editor
3. Copy DATABASE_URL from Settings → Database

### 3. Environment Variables

Create `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
GROQ_API_KEY=your_groq_key
DATABASE_URL=postgresql://...
ADMIN_ID=your_telegram_id
MINIAPP_URL=https://your-project.vercel.app/miniapp/elite.html
NODE_ENV=production
```

### 4. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Vercel will auto-deploy
# Add environment variables in Vercel Dashboard
```

### 5. Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-project.vercel.app/api/webhook"
```

**Full deployment guide:** [DEPLOYMENT-V9.md](DEPLOYMENT-V9.md)

## 📱 Commands

### Basic
- `/start` - Welcome message with interactive buttons
- `/help` - Show all commands
- `/profile` - User profile with stats
- `/stats` - Detailed statistics

### AI Commands
- `/ask [question]` - Ask AI anything
- `/summary [text]` - Summarize text
- `/analyze [text]` - Analyze content
- `/generate [topic]` - Generate content
- `/translate [text]` - Translate text
- `/improve [text]` - Improve writing
- `/brainstorm [topic]` - Generate ideas
- `/explain [topic]` - Explain concepts

### Features
- **Smart Responses** - Send any message, AI will understand
- **Personalization** - Adapts to your communication style
- **Context Awareness** - Remembers conversation history
- **Rate Limiting** - 50 AI requests per day

## 🏗️ Project Structure

```
felix-bot/
├── api/                    # API endpoints
│   ├── webhook.js         # Main bot webhook (v9.0)
│   ├── admin-api.js       # Admin API
│   ├── courses.js         # Courses API
│   ├── learning.js        # Learning system
│   └── ...
├── lib/                   # Core libraries
│   ├── db.js             # Database module
│   ├── ai.js             # AI module
│   ├── cache.js          # Caching
│   ├── monitoring.js     # Monitoring
│   ├── automation/       # Self-learning
│   ├── ml/               # ML personalization
│   └── ...
├── database/             # Database
│   ├── migrations/       # SQL migrations
│   └── schema.sql        # Base schema
├── miniapp/              # Mini App
│   ├── elite.html        # Main app
│   ├── admin-panel.html  # Admin panel
│   ├── css/              # Styles
│   └── js/               # Scripts
├── scripts/              # Utility scripts
└── tests/                # Tests
```

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+
- Vercel Serverless Functions
- PostgreSQL (Supabase)
- Groq AI (Llama 3.3 70B)

**Frontend:**
- Vanilla JavaScript
- Custom CSS3 with animations
- Telegram Web App SDK

**DevOps:**
- Git + GitHub
- Vercel auto-deploy
- Environment variables

## 📊 Database Schema

**22 Tables:**

**Core:**
- `users` - User profiles
- `messages` - Message history
- `tags` - Message tags
- `user_settings` - User preferences

**ML & Personalization:**
- `user_profiles` - ML profiles
- `user_learning_data` - Learning patterns
- `system_patterns` - System patterns
- `system_insights` - AI insights
- `system_logs` - Error logs

**Learning:**
- `courses` - Available courses
- `user_progress` - Course progress
- `achievements` - Available achievements
- `user_achievements` - Earned achievements
- `transcriptions` - Voice transcriptions
- `lecture_notes` - Lecture notes

**Content:**
- `partners` - Partner list
- `library_items` - User library

**15+ Indexes** for optimization

## 🎨 Mini App Features

**6 Tabs:**
1. **Profile** - Level, XP, streak, achievements
2. **Learning** - Daily tasks, active courses
3. **Analytics** - Activity graphs, team top
4. **Leaderboard** - User rankings
5. **Academy** - Course catalog with progress
6. **Settings** - Personalization options

**Design:**
- Modern glassmorphism style
- 15+ smooth animations
- Backdrop blur effects
- Responsive layout

## 🔧 Development

```bash
# Install dependencies
npm install

# Run locally (requires ngrok for webhook)
npm run dev

# Run tests
npm test

# Deploy
git push origin main
```

## 📈 Performance

- **Cold Start:** <1 second (lazy loading)
- **Response Time:** <500ms (with caching)
- **Database:** Optimized with 15+ indexes
- **AI Rate Limit:** 50 requests/day per user
- **Graceful Shutdown:** Proper connection cleanup

## 🛡️ Security

- ✅ Environment variables (no hardcoded credentials)
- ✅ SQL injection protection (parameterized queries)
- ✅ Rate limiting (20 req/min webhook, 50/day AI)
- ✅ Error handling and logging
- ✅ Graceful shutdown

## 📝 Documentation

### Core Documentation
- [DEPLOYMENT-V9.md](DEPLOYMENT-V9.md) - Full deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [API-ENDPOINTS.md](API-ENDPOINTS.md) - API documentation
- [АНАЛИЗ-ПРОЕКТА-FELIX-BOT.md](АНАЛИЗ-ПРОЕКТА-FELIX-BOT.md) - Project analysis

### Brandbook V12
- [BRANDBOOK-README.md](BRANDBOOK-README.md) - **Quick start guide** ⭐
- [BRANDBOOK-V12.md](BRANDBOOK-V12.md) - Complete brandbook
- [BRANDBOOK-IMPLEMENTATION.md](BRANDBOOK-IMPLEMENTATION.md) - Implementation guide
- [BRANDBOOK-VOICE-EXAMPLES.md](BRANDBOOK-VOICE-EXAMPLES.md) - Communication examples
- [BRANDBOOK-ICONS.md](BRANDBOOK-ICONS.md) - Icon system
- [miniapp/brandbook-demo.html](miniapp/brandbook-demo.html) - Live demo

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## 📊 Monitoring

**Vercel:**
- Analytics dashboard
- Real-time logs
- Performance metrics

**Supabase:**
- Database logs
- Query performance
- Connection pooling

## 🔄 Updates

Vercel automatically deploys on push to main branch:

```bash
git add .
git commit -m "feat: new feature"
git push
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 📚 Additional Documentation

- [Voice Assistant Setup](./VOICE-ASSISTANT-SETUP.md) - Full guide for voice assistant
- [Voice Assistant Quick Start](./VOICE-ASSISTANT-QUICKSTART.md) - Get started in 5 minutes
- [API Endpoints](./API-ENDPOINTS.md) - Complete API documentation
- [Deployment Guide](./docs/deployment.md) - Deployment instructions

## 🙏 Acknowledgments

- Telegram Bot API
- Groq AI (Llama 3.3 70B, Whisper, Play TTS)
- Supabase
- Vercel

## 📞 Support

- **Issues:** Open issue on GitHub
- **Documentation:** Check docs folder
- **Telegram:** @your_support_bot

---

**Version:** 9.0  
**Status:** ✅ Production Ready  
**Last Updated:** March 2, 2026

**Made with ❤️ for the Telegram community**
