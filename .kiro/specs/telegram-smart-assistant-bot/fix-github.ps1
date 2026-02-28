# Скрипт для проверки и исправления GitHub remote

Write-Host "🔍 Проверка GitHub репозитория..." -ForegroundColor Cyan
Write-Host ""

# Возможные варианты URL
$urls = @(
    "https://github.com/egoistsupport-coder/felix.git",
    "https://github.com/egoistsuport-coder/felix.git",
    "git@github.com:egoistsupport-coder/felix.git",
    "git@github.com:egoistsuport-coder/felix.git"
)

Write-Host "📋 Попробуем разные варианты URL:" -ForegroundColor Yellow
Write-Host ""

foreach ($url in $urls) {
    Write-Host "Проверяем: $url" -ForegroundColor Gray
    
    # Обновляем remote
    git remote set-url origin $url 2>$null
    
    # Пробуем push
    $result = git push -u origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ УСПЕХ! Рабочий URL: $url" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Код отправлен на GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Проверьте:" -ForegroundColor Cyan
        Write-Host "   - GitHub: https://github.com/egoistsupport-coder/felix" -ForegroundColor Gray
        Write-Host "   - Vercel: https://vercel.com/egoistsuport-coders-projects/felix" -ForegroundColor Gray
        Write-Host ""
        exit 0
    } else {
        Write-Host "   ❌ Не подошел" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Write-Host "❌ Ни один URL не подошел" -ForegroundColor Red
Write-Host ""
Write-Host "🔧 РЕШЕНИЕ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Создайте репозиторий на GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Назовите его: felix" -ForegroundColor White
Write-Host ""
Write-Host "3. НЕ добавляйте README, .gitignore или лицензию" -ForegroundColor White
Write-Host ""
Write-Host "4. После создания скопируйте URL и выполните:" -ForegroundColor White
Write-Host "   git remote set-url origin <ВАШ_URL>" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "ИЛИ используйте GitHub Desktop:" -ForegroundColor Yellow
Write-Host "   1. Откройте GitHub Desktop" -ForegroundColor White
Write-Host "   2. File → Add Local Repository" -ForegroundColor White
Write-Host "   3. Выберите эту папку" -ForegroundColor White
Write-Host "   4. Publish repository" -ForegroundColor White
Write-Host ""
