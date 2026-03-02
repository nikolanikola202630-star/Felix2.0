# Добавление переменных окружения в Vercel
Write-Host "🔧 Добавление переменных окружения в Vercel..." -ForegroundColor Cyan

# Telegram
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add ADMIN_ID production

# Groq AI
vercel env add GROQ_API_KEY production

# Database (Supabase)
vercel env add DATABASE_URL production
vercel env add POSTGRES_URL production
vercel env add POSTGRES_URL_NON_POOLING production
vercel env add POSTGRES_PRISMA_URL production

# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Mini App
vercel env add MINIAPP_URL production

# AI Rate Limiting
vercel env add AI_DAILY_LIMIT production
vercel env add AI_HOURLY_LIMIT production

Write-Host "✅ Переменные добавлены!" -ForegroundColor Green
Write-Host "🔄 Запускаем redeploy..." -ForegroundColor Cyan

vercel --prod

Write-Host "✅ Готово!" -ForegroundColor Green
