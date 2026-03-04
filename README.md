# Felix Academy V12 - Elite Educational Platform

> **Old Money. Cold Mind. High Society.**

Modern Telegram bot with AI capabilities, machine learning, and comprehensive Mini App interface. Designed with elegance and sophistication for the intellectual elite.

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
