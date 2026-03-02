# Скрипт для push в GitHub с использованием Personal Access Token

Write-Host "🔐 Push в GitHub с Personal Access Token" -ForegroundColor Green
Write-Host ""

# Проверяем статус
Write-Host "📊 Проверяем статус..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "⚠️  ВНИМАНИЕ: Вам нужен Personal Access Token" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Как получить токен:" -ForegroundColor Cyan
Write-Host "1. Перейдите: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "2. Generate new token (classic)" -ForegroundColor White
Write-Host "3. Выберите scopes: ✅ repo (full control)" -ForegroundColor White
Write-Host "4. Generate token" -ForegroundColor White
Write-Host "5. СКОПИРУЙТЕ ТОКЕН (показывается один раз!)" -ForegroundColor Red
Write-Host ""

# Запрашиваем токен
$token = Read-Host "Введите ваш Personal Access Token (или нажмите Enter для отмены)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host ""
    Write-Host "❌ Отменено" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Альтернативные способы:" -ForegroundColor Yellow
    Write-Host "1. Использовать GitHub Desktop (рекомендуется)" -ForegroundColor White
    Write-Host "   Запустите: .\open-github-desktop.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Установить GitHub CLI" -ForegroundColor White
    Write-Host "   winget install GitHub.cli" -ForegroundColor Cyan
    Write-Host "   gh auth login" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    exit
}

Write-Host ""
Write-Host "🔄 Настраиваем remote с токеном..." -ForegroundColor Cyan

# Настраиваем remote с токеном
$remoteUrl = "https://$token@github.com/nikolanikola202630-star/Felix2.0.git"
git remote set-url origin $remoteUrl

Write-Host "✅ Remote настроен" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Выполняем push..." -ForegroundColor Cyan

# Выполняем push
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push успешно выполнен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Проверьте репозиторий:" -ForegroundColor Yellow
    Write-Host "https://github.com/nikolanikola202630-star/Felix2.0" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Подключить к Vercel" -ForegroundColor White
    Write-Host "2. Настроить Environment Variables" -ForegroundColor White
    Write-Host "3. Проверить GitHub Actions" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 См. документацию: СЕЙЧАС-ДЕЛАТЬ.md" -ForegroundColor Cyan
    
    # Очищаем токен из remote (безопасность)
    Write-Host ""
    Write-Host "🔒 Очищаем токен из конфигурации..." -ForegroundColor Cyan
    git remote set-url origin "https://github.com/nikolanikola202630-star/Felix2.0.git"
    Write-Host "✅ Токен удален из конфигурации" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при push" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Возможные причины:" -ForegroundColor Yellow
    Write-Host "1. Неверный токен" -ForegroundColor White
    Write-Host "2. Недостаточно прав (нужен scope: repo)" -ForegroundColor White
    Write-Host "3. Репозиторий не существует" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Попробуйте:" -ForegroundColor Yellow
    Write-Host "1. Проверить токен" -ForegroundColor White
    Write-Host "2. Создать новый токен с правами repo" -ForegroundColor White
    Write-Host "3. Использовать GitHub Desktop" -ForegroundColor White
    
    # Очищаем токен из remote
    git remote set-url origin "https://github.com/nikolanikola202630-star/Felix2.0.git"
}

Write-Host ""
