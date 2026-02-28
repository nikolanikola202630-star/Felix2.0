# Автоматический деплой Telegram Smart Assistant Bot (PowerShell)
# Этот скрипт выполняет все необходимые команды для деплоя

Write-Host "🚀 Начинаем автоматический деплой..." -ForegroundColor Green
Write-Host ""

# Шаг 1: Создание .env.local
Write-Host "📝 Шаг 1/4: Создание .env.local..." -ForegroundColor Cyan
if (-not (Test-Path .env.local)) {
    Copy-Item .kiro/specs/telegram-smart-assistant-bot/.env.example .env.local
    Write-Host "✅ .env.local создан" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env.local уже существует, пропускаем" -ForegroundColor Yellow
}
Write-Host ""

# Шаг 2: Git add
Write-Host "📦 Шаг 2/4: Добавление файлов в Git..." -ForegroundColor Cyan
git add .
Write-Host "✅ Файлы добавлены" -ForegroundColor Green
Write-Host ""

# Шаг 3: Git commit
Write-Host "💾 Шаг 3/4: Создание коммита..." -ForegroundColor Cyan
git commit -m "Setup complete: all credentials configured and ready for deployment"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Коммит создан" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Нет изменений для коммита или коммит уже существует" -ForegroundColor Yellow
}
Write-Host ""

# Шаг 4: Git push
Write-Host "🚀 Шаг 4/4: Отправка на GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Код отправлен на GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Деплой запущен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Проверьте статус деплоя:" -ForegroundColor Cyan
    Write-Host "   - GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
    Write-Host "   - Vercel Dashboard: https://vercel.com/egoistsuport-coders-projects/felix"
    Write-Host ""
    Write-Host "⏳ Деплой займет ~2-3 минуты" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 После деплоя не забудьте:" -ForegroundColor Cyan
    Write-Host "   1. Настроить Telegram Webhook (см. webhook.ps1)"
    Write-Host "   2. Протестировать бота @fel12x_bot"
} else {
    Write-Host "❌ Ошибка при отправке на GitHub" -ForegroundColor Red
    Write-Host "   Проверьте подключение к интернету и права доступа к репозиторию"
    exit 1
}
