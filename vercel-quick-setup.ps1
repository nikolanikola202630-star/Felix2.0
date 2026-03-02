# Быстрая настройка Vercel с существующим Project ID

Write-Host "🚀 Быстрая настройка Vercel для Felix Bot v7.1" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$projectId = "prj_g2V31bJlWXxqxcKsewFxT98vEJwd"

Write-Host "✅ Project ID найден: $projectId" -ForegroundColor Green
Write-Host ""

# Проверка Vercel CLI
Write-Host "📦 Проверка Vercel CLI..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI установлен: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI не установлен" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Vercel CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g vercel" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Проверка авторизации
Write-Host "🔐 Проверка авторизации..." -ForegroundColor Cyan
try {
    $user = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Авторизован: $user" -ForegroundColor Green
    } else {
        throw "Not authorized"
    }
} catch {
    Write-Host "❌ Не авторизован в Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Авторизуйтесь сейчас? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        vercel login
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Выполните: vercel login" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host ""

# Проверка .vercel/project.json
Write-Host "📁 Проверка конфигурации проекта..." -ForegroundColor Cyan
if (Test-Path ".vercel/project.json") {
    Write-Host "✅ Проект уже связан" -ForegroundColor Green
    $config = Get-Content ".vercel/project.json" | ConvertFrom-Json
    Write-Host "   Project ID: $($config.projectId)" -ForegroundColor White
} else {
    Write-Host "⚠️  Файл .vercel/project.json не найден" -ForegroundColor Yellow
    Write-Host "   Создаем конфигурацию..." -ForegroundColor White
    
    if (-not (Test-Path ".vercel")) {
        New-Item -ItemType Directory -Path ".vercel" | Out-Null
    }
    
    @{
        projectId = $projectId
        orgId = "team_placeholder"
    } | ConvertTo-Json | Set-Content ".vercel/project.json"
    
    Write-Host "✅ Конфигурация создана" -ForegroundColor Green
}

Write-Host ""

# Environment Variables
Write-Host "🔧 Environment Variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Необходимые переменные:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Существующие:" -ForegroundColor White
Write-Host "   ✅ TELEGRAM_BOT_TOKEN" -ForegroundColor Green
Write-Host "   ✅ GROQ_API_KEY" -ForegroundColor Green
Write-Host "   ✅ DATABASE_URL" -ForegroundColor Green
Write-Host "   ✅ ADMIN_ID" -ForegroundColor Green
Write-Host "   ✅ MINIAPP_URL" -ForegroundColor Green
Write-Host ""
Write-Host "Новые в v7.1:" -ForegroundColor White
Write-Host "   ⭐ SENTRY_DSN" -ForegroundColor Yellow
Write-Host "   ⭐ AI_DAILY_LIMIT=50" -ForegroundColor Yellow
Write-Host "   ⭐ AI_HOURLY_LIMIT=10" -ForegroundColor Yellow
Write-Host "   ⭐ KV_URL" -ForegroundColor Yellow
Write-Host "   ⭐ KV_REST_API_URL" -ForegroundColor Yellow
Write-Host "   ⭐ KV_REST_API_TOKEN" -ForegroundColor Yellow
Write-Host "   ⭐ KV_REST_API_READ_ONLY_TOKEN" -ForegroundColor Yellow
Write-Host ""

Write-Host "💡 Настройте через:" -ForegroundColor Cyan
Write-Host "   1. Vercel Dashboard → Settings → Environment Variables" -ForegroundColor White
Write-Host "   2. Или: vercel env add <NAME>" -ForegroundColor White
Write-Host ""

# Открыть Dashboard
Write-Host "🌐 Открыть Vercel Dashboard? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Открываем Dashboard..." -ForegroundColor Cyan
    Start-Process "https://vercel.com/dashboard"
    Write-Host "✅ Dashboard открыт" -ForegroundColor Green
}

Write-Host ""

# Деплой
Write-Host "🚀 Выполнить деплой сейчас? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "⚠️  Убедитесь, что Environment Variables настроены!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Продолжить деплой? (y/n): " -ForegroundColor Yellow -NoNewline
    $confirm = Read-Host
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host ""
        Write-Host "🚀 Выполняем production деплой..." -ForegroundColor Cyan
        Write-Host ""
        
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Деплой успешно завершен!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Проверьте:" -ForegroundColor Yellow
            Write-Host "   - Vercel Dashboard" -ForegroundColor White
            Write-Host "   - Telegram Bot (/start)" -ForegroundColor White
            Write-Host "   - Mini App" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Ошибка при деплое" -ForegroundColor Red
            Write-Host ""
            Write-Host "Проверьте:" -ForegroundColor Yellow
            Write-Host "   - Environment Variables настроены" -ForegroundColor White
            Write-Host "   - Логи: vercel logs" -ForegroundColor White
        }
    }
} else {
    Write-Host ""
    Write-Host "💡 Для деплоя выполните:" -ForegroundColor Yellow
    Write-Host "   vercel --prod" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Настройка завершена!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Документация:" -ForegroundColor Yellow
Write-Host "   - VERCEL-AUTO-DEPLOY.md" -ForegroundColor White
Write-Host "   - ЗАПУСК-VERCEL.md" -ForegroundColor White
Write-Host "   - ГОТОВО-К-ЗАПУСКУ.md" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Следующие шаги:" -ForegroundColor Yellow
Write-Host "   1. Настроить Environment Variables" -ForegroundColor White
Write-Host "   2. Создать Vercel KV database" -ForegroundColor White
Write-Host "   3. Создать Sentry проект" -ForegroundColor White
Write-Host "   4. Выполнить деплой: vercel --prod" -ForegroundColor White
Write-Host ""

Write-Host "🚀 После настройки каждый push в main автоматически деплоится!" -ForegroundColor Green
Write-Host ""

Write-Host "Project ID: $projectId" -ForegroundColor Cyan
Write-Host ""
