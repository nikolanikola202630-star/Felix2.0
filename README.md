# Felix Bot - AI Assistant with Database Integration

Modern Telegram bot with AI capabilities, database integration, and Mini App interface.

## Features

- 🤖 AI-powered responses using Groq (Llama 3.3 70B)
- 💾 PostgreSQL database integration (Supabase)
- 📱 Telegram Mini App interface
- 🎓 Learning system with achievements
- 👥 Group moderation
- 📊 User statistics and analytics
- 🔍 Message search and history
- 🏷️ Automatic tagging
- 🎨 Personalization

## Quick Start

### 1. Setup Database

```bash
# Create Supabase project at https://supabase.com
# Run database/complete-schema.sql in SQL Editor
# Copy DATABASE_URL from Settings → Database
```

### 2. Environment Variables

Create `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
GROQ_API_KEY=your_groq_key
DATABASE_URL=postgresql://...
ADMIN_ID=your_telegram_id
MINIAPP_URL=https://your-project.vercel.app/miniapp/
```

### 3. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Vercel will auto-deploy
# Add environment variables in Vercel Dashboard
```

### 4. Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-project.vercel.app/api/webhook"
```

## Commands

### Basic
- `/start` - Welcome message
- `/help` - Show help
- `/profile` - User profile
- `/stats` - Statistics
- `/history` - Message history
- `/search [query]` - Search messages

### AI Commands
- `/ask [question]` - Ask AI
- `/summary [text]` - Summarize
- `/analyze [text]` - Analyze
- `/generate [topic]` - Generate content
- `/translate [text]` - Translate
- `/improve [text]` - Improve text
- `/brainstorm [topic]` - Generate ideas
- `/explain [topic]` - Explain

### Admin
- `/admin` - Admin panel (admin only)

## Project Structure

```
├── api/              # API endpoints
│   ├── webhook.js    # Main bot webhook
│   ├── admin.js      # Admin API
│   ├── learning.js   # Learning system
│   └── ...
├── lib/              # Libraries
│   ├── db.js         # Database module
│   └── ai.js         # AI module
├── database/         # Database schemas
│   └── complete-schema.sql
├── miniapp/          # Mini App files
│   ├── index.html    # Main app
│   └── admin.html    # Admin panel
└── package.json
```

## Tech Stack

- **Backend:** Node.js, Vercel Serverless
- **Database:** PostgreSQL (Supabase)
- **AI:** Groq (Llama 3.3 70B)
- **Bot:** Telegram Bot API
- **Frontend:** HTML/CSS/JS (Mini App)

## Database Schema

- `users` - User profiles
- `messages` - Message history
- `tags` - Message tags
- `user_settings` - User preferences
- `voice_messages` - Voice metadata
- `image_messages` - Image metadata
- `document_messages` - Document metadata
- `export_history` - Export tracking

## Development

```bash
# Install dependencies
npm install

# Run locally (requires ngrok for webhook)
npm run dev

# Deploy
git push origin main
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
