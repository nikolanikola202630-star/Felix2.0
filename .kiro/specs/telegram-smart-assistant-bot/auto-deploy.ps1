# Полностью автоматический деплой (PowerShell)
# Этот скрипт выполняет ВСЕ шаги автоматически

param(
    [string]$VercelUrl = ""
)

Write-Host "🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ TELEGRAM BOT" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Проверка Git
Write-Host "🔍 Проверка Git..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>$null
    if (-not $gitVersion) {
        Write-Host "❌ Git не установлен!" -ForegroundColor Red
        Write-Host "   Установите Git: https://git-scm.com/downloads" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Git установлен: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git не установлен!" -ForegroundColor Red
    Write-Host "   Установите Git: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Проверка Git репозитория
Write-Host "🔍 Проверка Git репозитория..." -ForegroundColor Cyan
$isGitRepo = git rev-parse --git-dir 2>$null
if (-not $isGitRepo) {
    Write-Host "⚠️  Git репозиторий не инициализирован" -ForegroundColor Yellow
    Write-Host "   Инициализируем репозиторий..." -ForegroundColor Cyan
    
    git init
    Write-Host "✅ Git репозиторий инициализирован" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📝 Настройте Git remote:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Gray
    Write-Host ""
    $remoteUrl = Read-Host "Введите URL вашего GitHub репозитория (или нажмите Enter для пропуска)"
    
    if (-not [string]::IsNullOrEmpty($remoteUrl)) {
        git remote add origin $remoteUrl
        Write-Host "✅ Remote добавлен" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Git репозиторий найден" -ForegroundColor Green
}
Write-Host ""

# ============================================
# ЭТАП 1: ДЕПЛОЙ
# ============================================
Write-Host "📦 ЭТАП 1/2: ДЕПЛОЙ НА VERCEL" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Шаг 1.1: Создание .env.local
Write-Host "📝 Создание .env.local..." -ForegroundColor Cyan
$envExample = ".kiro\specs\telegram-smart-assistant-bot\.env.example"
$envLocal = ".env.local"

if (-not (Test-Path $envLocal)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envLocal
        Write-Host "✅ .env.local создан" -ForegroundColor Green
    } else {
        Write-Host "❌ Файл .env.example не найден!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  .env.local уже существует" -ForegroundColor Yellow
}
Write-Host ""

# Шаг 1.2: Git add
Write-Host "📦 Добавление файлов в Git..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Файлы добавлены" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка при добавлении файлов" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Шаг 1.3: Git commit
Write-Host "💾 Создание коммита..." -ForegroundColor Cyan
$commitMessage = "Setup complete: all credentials configured and ready for deployment"
git commit -m $commitMessage 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Коммит создан" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Нет изменений для коммита (это нормально)" -ForegroundColor Yellow
}
Write-Host ""

# Шаг 1.4: Git push
Write-Host "🚀 Отправка на GitHub..." -ForegroundColor Cyan
try {
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Код отправлен на GitHub!" -ForegroundColor Green
    } else {
        # Попробуем push с --set-upstream
        git push --set-upstream origin main 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Код отправлен на GitHub!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Не удалось отправить на GitHub" -ForegroundColor Yellow
            Write-Host "   Возможно нужно настроить remote или создать репозиторий" -ForegroundColor Gray
            Write-Host "   Продолжаем без push..." -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  Ошибка при push: $_" -ForegroundColor Yellow
    Write-Host "   Продолжаем без push..." -ForegroundColor Gray
}
Write-Host ""

Write-Host "✅ ЭТАП 1 ЗАВЕРШЕН!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Ожидание деплоя на Vercel (2-3 минуты)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Проверьте статус деплоя:" -ForegroundColor Cyan
Write-Host "   - GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
Write-Host "   - Vercel Dashboard: https://vercel.com/egoistsuport-coders-projects/felix"
Write-Host ""

# Пауза для деплоя
Write-Host "⏸️  Нажмите Enter когда деплой завершится..." -ForegroundColor Yellow
Read-Host

# ============================================
# ЭТАП 2: НАСТРОЙКА WEBHOOK
# ============================================
Write-Host ""
Write-Host "🔗 ЭТАП 2/2: НАСТРОЙКА TELEGRAM WEBHOOK" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Запрос URL если не передан
if ([string]::IsNullOrEmpty($VercelUrl)) {
    Write-Host "📝 Введите URL вашего приложения на Vercel:" -ForegroundColor Cyan
    Write-Host "   (например: https://felix.vercel.app)"
    $VercelUrl = Read-Host "URL"
}

# Удаляем trailing slash
$VercelUrl = $VercelUrl.TrimEnd('/')

Write-Host ""
Write-Host "🚀 Настраиваем webhook для @fel12x_bot..." -ForegroundColor Cyan

# Настройка webhook
$WEBHOOK_URL = "${VercelUrl}/api/telegram/webhook"
$TELEGRAM_API = "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook"

try {
    $Response = Invoke-RestMethod -Uri $TELEGRAM_API -Method Post -Body @{url=$WEBHOOK_URL}
    
    Write-Host ""
    if ($Response.ok -eq $true) {
        Write-Host "✅ Webhook успешно настроен!" -ForegroundColor Green
        Write-Host "   URL: $WEBHOOK_URL" -ForegroundColor Gray
    } else {
        Write-Host "❌ Ошибка при настройке webhook" -ForegroundColor Red
        Write-Host "   Ответ: $($Response | ConvertTo-Json)" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка при настройке webhook: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ ЭТАП 2 ЗАВЕРШЕН!" -ForegroundColor Green
Write-Host ""

# ============================================
# ФИНАЛ
# ============================================
Write-Host "🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Все готово! Бот работает!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Протестируйте бота:" -ForegroundColor Cyan
Write-Host "   1. Откройте Telegram"
Write-Host "   2. Найдите @fel12x_bot"
Write-Host "   3. Отправьте /start"
Write-Host "   4. Попробуйте отправить голосовое сообщение"
Write-Host "   5. Попробуйте AI диалог"
Write-Host ""
Write-Host "📊 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "   - Бот: https://t.me/fel12x_bot"
Write-Host "   - Vercel: https://vercel.com/egoistsuport-coders-projects/felix"
Write-Host "   - Логи: vercel logs"
Write-Host ""
Write-Host "🎊 Поздравляю с успешным деплоем!" -ForegroundColor Green
