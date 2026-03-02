# Felix Bot v9.0 - Auto Deploy Script
# Автоматический деплой на Vercel

Write-Host "🚀 Felix Bot v9.0 - Автоматический деплой" -ForegroundColor Green
Write-Host ""

# Проверка Vercel CLI
Write-Host "📦 Проверка Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI не установлен" -ForegroundColor Red
    Write-Host "Установка..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI установлен" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI уже установлен" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Авторизация в Vercel..." -ForegroundColor Yellow
Write-Host "Откроется браузер для входа в аккаунт Vercel" -ForegroundColor Cyan
Write-Host ""

# Авторизация
vercel login

Write-Host ""
Write-Host "📋 Настройка переменных окружения..." -ForegroundColor Yellow
Write-Host ""

# Переменные из .env.local
Write-Host "📋 Загрузка переменных из .env.local..." -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.+)$") {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
    Write-Host "✅ Переменные загружены" -ForegroundColor Green
} else {
    Write-Host "❌ Файл .env.local не найден!" -ForegroundColor Red
    exit 1
}

# Запрос пароля БД
Write-Host "🔑 Введите пароль от Supabase:" -ForegroundColor Cyan
$dbPassword = Read-Host -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
$env:DATABASE_URL = "postgresql://postgres:$dbPasswordPlain@db.nnegvsxhspdnsvjpcscn.supabase.co:5432/postgres"

Write-Host ""
Write-Host "🚀 Запуск деплоя..." -ForegroundColor Yellow
Write-Host ""

# Деплой
vercel --prod `
  -e TELEGRAM_BOT_TOKEN=$env:TELEGRAM_BOT_TOKEN `
  -e GROQ_API_KEY=$env:GROQ_API_KEY `
  -e DATABASE_URL=$env:DATABASE_URL `
  -e ADMIN_ID=$env:ADMIN_ID `
  -e NODE_ENV=$env:NODE_ENV `
  -e MINIAPP_URL=https://your-project.vercel.app/miniapp/elite.html

Write-Host ""
Write-Host "✅ Деплой завершен!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Скопируйте URL проекта из вывода выше" -ForegroundColor Cyan
Write-Host "2. Обновите MINIAPP_URL на реальный URL" -ForegroundColor Cyan
Write-Host "3. Установите webhook (см. АВТОДЕПЛОЙ.md)" -ForegroundColor Cyan
Write-Host ""
