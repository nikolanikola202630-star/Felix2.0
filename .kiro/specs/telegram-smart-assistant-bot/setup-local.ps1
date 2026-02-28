# Локальная настройка без Git
# Используйте этот скрипт если хотите только настроить окружение

Write-Host "🔧 ЛОКАЛЬНАЯ НАСТРОЙКА" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Создание .env.local
Write-Host "📝 Создание .env.local..." -ForegroundColor Cyan
$envExample = ".kiro\specs\telegram-smart-assistant-bot\.env.example"
$envLocal = ".env.local"

if (-not (Test-Path $envLocal)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envLocal
        Write-Host "✅ .env.local создан" -ForegroundColor Green
        Write-Host ""
        Write-Host "📄 Файл создан: .env.local" -ForegroundColor Cyan
        Write-Host "   Все credentials уже настроены!" -ForegroundColor Gray
    } else {
        Write-Host "❌ Файл .env.example не найден!" -ForegroundColor Red
        Write-Host "   Путь: $envExample" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "ℹ️  .env.local уже существует" -ForegroundColor Yellow
    Write-Host ""
    $overwrite = Read-Host "Перезаписать? (y/n)"
    if ($overwrite -eq 'y') {
        Copy-Item $envExample $envLocal -Force
        Write-Host "✅ .env.local обновлен" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ НАСТРОЙКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Создайте GitHub репозиторий (если еще не создан)"
Write-Host "   2. Инициализируйте Git: git init"
Write-Host "   3. Добавьте remote: git remote add origin YOUR_REPO_URL"
Write-Host "   4. Добавьте GitHub Secrets (см. COMPLETE-GITHUB-SECRETS.md)"
Write-Host "   5. Запустите деплой: git add . && git commit -m 'Initial' && git push origin main"
Write-Host ""
Write-Host "📚 Документация:" -ForegroundColor Cyan
Write-Host "   - START-HERE.md - Начните отсюда"
Write-Host "   - COMPLETE-GITHUB-SECRETS.md - GitHub Secrets"
Write-Host "   - DEPLOY-SCRIPTS.md - Скрипты деплоя"
Write-Host ""
