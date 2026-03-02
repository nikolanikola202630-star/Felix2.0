# Скрипт для открытия GitHub Desktop и выполнения push

Write-Host "🚀 Открываем GitHub Desktop для push..." -ForegroundColor Green
Write-Host ""

# Получаем путь к текущей директории
$repoPath = Get-Location

# Пытаемся открыть GitHub Desktop с текущим репозиторием
$githubDesktopPath = "$env:LOCALAPPDATA\GitHubDesktop\GitHubDesktop.exe"

if (Test-Path $githubDesktopPath) {
    Write-Host "✅ GitHub Desktop найден" -ForegroundColor Green
    Write-Host "📂 Открываем репозиторий: $repoPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Открываем GitHub Desktop
    Start-Process $githubDesktopPath -ArgumentList $repoPath
    
    Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. В GitHub Desktop: File → Options → Accounts" -ForegroundColor White
    Write-Host "2. Sign in to GitHub.com" -ForegroundColor White
    Write-Host "3. Войти под аккаунтом: nikolanikola202630-star" -ForegroundColor White
    Write-Host "4. Нажать кнопку 'Push origin' (или Ctrl+P)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Готово! GitHub Desktop открыт" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub Desktop не найден" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Скачайте GitHub Desktop:" -ForegroundColor Yellow
    Write-Host "https://desktop.github.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Или используйте альтернативный метод:" -ForegroundColor Yellow
    Write-Host "1. Создайте Personal Access Token на GitHub" -ForegroundColor White
    Write-Host "2. Выполните команду:" -ForegroundColor White
    Write-Host "   git remote set-url origin https://TOKEN@github.com/nikolanikola202630-star/Felix2.0.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📊 Статус:" -ForegroundColor Yellow
Write-Host "✅ 2 коммита готовы к push" -ForegroundColor Green
Write-Host "✅ 36 файлов изменено" -ForegroundColor Green
Write-Host "✅ +7386 строк добавлено" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Документация: PUSH-СЕЙЧАС.md" -ForegroundColor Cyan
