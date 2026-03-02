# Скрипт автоматической настройки Vercel для Windows

Write-Host "🚀 Настройка автоматического развертывания Vercel" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Функция проверки Vercel CLI
function Test-VercelCLI {
    try {
        $null = vercel --version 2>&1
        Write-Host "✅ Vercel CLI установлен" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Vercel CLI не установлен" -ForegroundColor Red
        Write-Host ""
        Write-Host "📦 Установите Vercel CLI:" -ForegroundColor Yellow
        Write-Host "   npm install -g vercel" -ForegroundColor White
        Write-Host "   или" -ForegroundColor White
        Write-Host "   yarn global add vercel" -ForegroundColor White
        Write-Host ""
        return $false
    }
}

# Функция проверки авторизации
function Test-VercelAuth {
    try {
        $null = vercel whoami 2>&1
        $user = vercel whoami
        Write-Host "✅ Авторизован в Vercel: $user" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Не авторизован в Vercel" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔐 Авторизуйтесь:" -ForegroundColor Yellow
        Write-Host "   vercel login" -ForegroundColor White
        Write-Host ""
        return $false
    }
}

# Функция проверки проекта
function Test-VercelProject {
    if (Test-Path ".vercel") {
        Write-Host "✅ Проект уже связан с Vercel" -ForegroundColor Green
        return $true
    }
    Write-Host "⚠️  Проект не связан с Vercel" -ForegroundColor Yellow
    return $false
}

# Функция связывания проекта
function Connect-VercelProject {
    Write-Host ""
    Write-Host "🔗 Связываем проект с Vercel..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        vercel link
        Write-Host ""
        Write-Host "✅ Проект связан с Vercel" -ForegroundColor Green
        return $true
    } catch {
        Write-Host ""
        Write-Host "❌ Ошибка при связывании проекта" -ForegroundColor Red
        return $false
    }
}

# Функция настройки Environment Variables
function Set-EnvironmentVariables {
    Write-Host ""
    Write-Host "🔧 Настройка Environment Variables..." -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path ".env.local") {
        Write-Host "✅ Файл .env.local найден" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Файл .env.local не найден" -ForegroundColor Yellow
        Write-Host "📝 Создайте .env.local с необходимыми переменными" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "📋 Необходимые переменные для Vercel:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Существующие:" -ForegroundColor Cyan
    Write-Host "   ✅ TELEGRAM_BOT_TOKEN" -ForegroundColor White
    Write-Host "   ✅ GROQ_API_KEY" -ForegroundColor White
    Write-Host "   ✅ DATABASE_URL" -ForegroundColor White
    Write-Host "   ✅ ADMIN_ID" -ForegroundColor White
    Write-Host "   ✅ MINIAPP_URL" -ForegroundColor White
    Write-Host ""
    Write-Host "Новые в v7.1:" -ForegroundColor Cyan
    Write-Host "   ⭐ SENTRY_DSN" -ForegroundColor Yellow
    Write-Host "   ⭐ AI_DAILY_LIMIT=50" -ForegroundColor Yellow
    Write-Host "   ⭐ AI_HOURLY_LIMIT=10" -ForegroundColor Yellow
    Write-Host "   ⭐ KV_URL" -ForegroundColor Yellow
    Write-Host "   ⭐ KV_REST_API_URL" -ForegroundColor Yellow
    Write-Host "   ⭐ KV_REST_API_TOKEN" -ForegroundColor Yellow
    Write-Host "   ⭐ KV_REST_API_READ_ONLY_TOKEN" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Добавьте переменные через:" -ForegroundColor Yellow
    Write-Host "   1. Vercel Dashboard → Settings → Environment Variables" -ForegroundColor White
    Write-Host "   2. Или используйте: vercel env add <NAME>" -ForegroundColor White
    Write-Host ""
}

# Функция настройки GitHub Integration
function Set-GitHubIntegration {
    Write-Host ""
    Write-Host "🔗 Настройка GitHub Integration..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Шаги:" -ForegroundColor Yellow
    Write-Host "1. Откройте: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Выберите проект Felix2.0" -ForegroundColor White
    Write-Host "3. Settings → Git" -ForegroundColor White
    Write-Host "4. Убедитесь, что:" -ForegroundColor White
    Write-Host "   ✅ Production Branch: main" -ForegroundColor Green
    Write-Host "   ✅ Auto-deploy: Enabled" -ForegroundColor Green
    Write-Host "   ✅ Preview Deployments: Enabled" -ForegroundColor Green
    Write-Host "   ✅ Deployment Protection: Enabled (опционально)" -ForegroundColor Yellow
    Write-Host ""
    
    # Открываем браузер
    Write-Host "🌐 Открываем Vercel Dashboard..." -ForegroundColor Cyan
    Start-Process "https://vercel.com/dashboard"
    Write-Host ""
}

# Функция деплоя
function Start-Deployment {
    Write-Host ""
    Write-Host "🚀 Готовы к деплою?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Убедитесь, что:" -ForegroundColor Yellow
    Write-Host "   - Все Environment Variables настроены" -ForegroundColor White
    Write-Host "   - GitHub Integration настроен" -ForegroundColor White
    Write-Host "   - Код запушен в GitHub" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Выполнить деплой сейчас? (y/n)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "🚀 Выполняем деплой..." -ForegroundColor Cyan
        Write-Host ""
        
        try {
            vercel --prod
            Write-Host ""
            Write-Host "✅ Деплой завершен!" -ForegroundColor Green
            return $true
        } catch {
            Write-Host ""
            Write-Host "❌ Ошибка при деплое" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host ""
        Write-Host "💡 Для деплоя выполните:" -ForegroundColor Yellow
        Write-Host "   vercel --prod" -ForegroundColor Cyan
        Write-Host ""
        return $false
    }
}

# Функция проверки деплоя
function Test-Deployment {
    Write-Host ""
    Write-Host "✅ Проверка деплоя..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Чеклист:" -ForegroundColor Yellow
    Write-Host "   - [ ] Deployment успешен" -ForegroundColor White
    Write-Host "   - [ ] Логи без ошибок" -ForegroundColor White
    Write-Host "   - [ ] Environment Variables настроены" -ForegroundColor White
    Write-Host "   - [ ] Webhook работает" -ForegroundColor White
    Write-Host "   - [ ] GitHub Actions запустились" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Проверьте:" -ForegroundColor Yellow
    Write-Host "   - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "   - GitHub Actions: https://github.com/nikolanikola202630-star/Felix2.0/actions" -ForegroundColor Cyan
    Write-Host ""
}

# Главная функция
function Main {
    Write-Host "  Felix Bot v7.1 - Vercel Auto-Deploy Setup" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Шаг 1: Проверка Vercel CLI
    if (-not (Test-VercelCLI)) {
        Write-Host ""
        Write-Host "❌ Установите Vercel CLI и запустите скрипт снова" -ForegroundColor Red
        exit 1
    }
    
    # Шаг 2: Проверка авторизации
    if (-not (Test-VercelAuth)) {
        Write-Host ""
        Write-Host "💡 Выполните авторизацию:" -ForegroundColor Yellow
        Write-Host "   vercel login" -ForegroundColor Cyan
        Write-Host ""
        $response = Read-Host "Авторизоваться сейчас? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            vercel login
            Write-Host ""
        } else {
            exit 1
        }
    }
    
    # Шаг 3: Проверка/связывание проекта
    if (-not (Test-VercelProject)) {
        if (-not (Connect-VercelProject)) {
            exit 1
        }
    }
    
    # Шаг 4: Настройка Environment Variables
    Set-EnvironmentVariables
    
    # Шаг 5: Настройка GitHub Integration
    Set-GitHubIntegration
    
    # Пауза для настройки
    Write-Host ""
    Read-Host "Нажмите Enter после настройки GitHub Integration..."
    
    # Шаг 6: Деплой
    Start-Deployment
    
    # Шаг 7: Проверка
    Test-Deployment
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ Настройка завершена!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📚 Документация:" -ForegroundColor Yellow
    Write-Host "   - VERCEL-AUTO-DEPLOY.md - Полная инструкция" -ForegroundColor White
    Write-Host "   - ГОТОВО-ДЕПЛОЙ.md - Чеклист деплоя" -ForegroundColor White
    Write-Host "   - CHECKLIST.md - Общий чеклист" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎯 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "   1. Проверить деплой в Vercel Dashboard" -ForegroundColor White
    Write-Host "   2. Протестировать бота (/start, /ask)" -ForegroundColor White
    Write-Host "   3. Проверить GitHub Actions" -ForegroundColor White
    Write-Host "   4. Проверить Sentry Dashboard" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🚀 После настройки каждый push в main будет автоматически деплоиться!" -ForegroundColor Green
    Write-Host ""
}

# Запуск
try {
    Main
} catch {
    Write-Host ""
    Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
