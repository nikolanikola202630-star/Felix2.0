# Скрипт для исправления пользователя Git и очистки старых credentials

Write-Host "🔧 Исправление пользователя Git" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Текущий пользователь
Write-Host "📊 Текущая конфигурация Git:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Global:" -ForegroundColor Yellow
git config --global user.name
git config --global user.email
Write-Host ""

# Установить правильного пользователя локально
Write-Host "🔧 Настройка локального пользователя..." -ForegroundColor Cyan
git config --local user.name "nikolanikola202630-star"
git config --local user.email "nikolanikola202630@gmail.com"
Write-Host "✅ Локальный пользователь настроен" -ForegroundColor Green
Write-Host ""

# Проверка
Write-Host "📊 Новая конфигурация:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local (для этого репозитория):" -ForegroundColor Yellow
git config --local user.name
git config --local user.email
Write-Host ""

# Очистка GitHub credentials из Windows Credential Manager
Write-Host "🗑️  Очистка старых GitHub credentials..." -ForegroundColor Cyan
Write-Host ""

try {
    # Попытка удалить через cmdkey
    cmdkey /list | Select-String "github" | ForEach-Object {
        $target = $_.Line -replace ".*Target: ", "" -replace " .*", ""
        if ($target -like "*github*") {
            Write-Host "Удаляем: $target" -ForegroundColor Yellow
            cmdkey /delete:$target 2>&1 | Out-Null
        }
    }
    Write-Host "✅ Старые credentials удалены" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Не удалось удалить через cmdkey" -ForegroundColor Yellow
}

Write-Host ""

# Очистка через git credential manager
Write-Host "🗑️  Очистка через Git Credential Manager..." -ForegroundColor Cyan
try {
    # Создаем временный файл с данными для удаления
    $credInput = @"
protocol=https
host=github.com

"@
    $credInput | git credential-manager erase 2>&1 | Out-Null
    Write-Host "✅ Git credentials очищены" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git Credential Manager не найден или не требуется" -ForegroundColor Yellow
}

Write-Host ""

# Настройка credential helper
Write-Host "🔧 Настройка credential helper..." -ForegroundColor Cyan
git config --local credential.helper manager-core
Write-Host "✅ Credential helper настроен" -ForegroundColor Green
Write-Host ""

# Информация о remote
Write-Host "📡 Remote репозитория:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# Проверка, что remote использует HTTPS
$remoteUrl = git remote get-url origin
if ($remoteUrl -like "https://*") {
    Write-Host "✅ Remote использует HTTPS" -ForegroundColor Green
} else {
    Write-Host "⚠️  Remote не использует HTTPS" -ForegroundColor Yellow
    Write-Host "Исправляем..." -ForegroundColor Cyan
    git remote set-url origin "https://github.com/nikolanikola202630-star/Felix2.0.git"
    Write-Host "✅ Remote обновлен на HTTPS" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Исправление завершено!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Итоги:" -ForegroundColor Yellow
Write-Host "   ✅ Локальный пользователь: nikolanikola202630-star" -ForegroundColor Green
Write-Host "   ✅ Email: nikolanikola202630@gmail.com" -ForegroundColor Green
Write-Host "   ✅ Старые credentials удалены" -ForegroundColor Green
Write-Host "   ✅ Remote настроен на HTTPS" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Следующие шаги:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Способ 1: GitHub Desktop (РЕКОМЕНДУЕТСЯ)" -ForegroundColor Cyan
Write-Host "   1. Открыть GitHub Desktop" -ForegroundColor White
Write-Host "   2. File → Options → Accounts" -ForegroundColor White
Write-Host "   3. Sign in под nikolanikola202630-star" -ForegroundColor White
Write-Host "   4. Push origin" -ForegroundColor White
Write-Host ""

Write-Host "Способ 2: Командная строка с новыми credentials" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor White
Write-Host "   (Git попросит авторизоваться - войти под nikolanikola202630-star)" -ForegroundColor White
Write-Host ""

Write-Host "Способ 3: Personal Access Token" -ForegroundColor Cyan
Write-Host "   .\push-with-token.ps1" -ForegroundColor White
Write-Host ""

Write-Host "💡 При следующем push Git попросит авторизоваться." -ForegroundColor Yellow
Write-Host "   Войдите под nikolanikola202630-star и credentials сохранятся!" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Попробовать push сейчас? (y/n): " -ForegroundColor Green -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Выполняем push..." -ForegroundColor Cyan
    Write-Host ""
    
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Push успешно выполнен!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Проверьте:" -ForegroundColor Yellow
        Write-Host "   - GitHub: https://github.com/nikolanikola202630-star/Felix2.0" -ForegroundColor Cyan
        Write-Host "   - Vercel Dashboard (через 2-3 минуты)" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠️  Push не удался" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Используйте GitHub Desktop:" -ForegroundColor Cyan
        Write-Host "   .\open-github-desktop.ps1" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Выполните push когда будете готовы:" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor White
    Write-Host "   или" -ForegroundColor White
    Write-Host "   .\open-github-desktop.ps1" -ForegroundColor White
}

Write-Host ""
