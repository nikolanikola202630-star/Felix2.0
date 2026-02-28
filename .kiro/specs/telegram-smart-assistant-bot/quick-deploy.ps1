# Быстрый деплой для репозитория felix
# Все команды в одном скрипте

Write-Host "🚀 БЫСТРЫЙ ДЕПЛОЙ" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# 1. Инициализация Git
Write-Host "📦 Шаг 1/6: Инициализация Git..." -ForegroundColor Cyan
git init
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git инициализирован" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Git уже инициализирован" -ForegroundColor Yellow
}
Write-Host ""

# 2. Добавление remote
Write-Host "🔗 Шаг 2/6: Добавление remote..." -ForegroundColor Cyan
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "ℹ️  Remote уже существует: $remoteExists" -ForegroundColor Yellow
    git remote set-url origin https://github.com/egoistsupport-coder/felix.git
    Write-Host "✅ Remote обновлен" -ForegroundColor Green
} else {
    git remote add origin https://github.com/egoistsupport-coder/felix.git
    Write-Host "✅ Remote добавлен" -ForegroundColor Green
}
Write-Host ""

# 3. Добавление файлов
Write-Host "📁 Шаг 3/6: Добавление файлов..." -ForegroundColor Cyan
git add .
Write-Host "✅ Файлы добавлены" -ForegroundColor Green
Write-Host ""

# 4. Коммит
Write-Host "💾 Шаг 4/6: Создание коммита..." -ForegroundColor Cyan
git commit -m "Initial commit: Telegram Smart Assistant Bot with all credentials"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Коммит создан" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Нет изменений для коммита" -ForegroundColor Yellow
}
Write-Host ""

# 5. Переименование ветки
Write-Host "🌿 Шаг 5/6: Переименование ветки в main..." -ForegroundColor Cyan
git branch -M main
Write-Host "✅ Ветка переименована" -ForegroundColor Green
Write-Host ""

# 6. Push на GitHub
Write-Host "🚀 Шаг 6/6: Отправка на GitHub..." -ForegroundColor Cyan
Write-Host "   Репозиторий: https://github.com/egoistsupport-coder/felix.git" -ForegroundColor Gray
Write-Host ""

git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ КОД ОТПРАВЛЕН НА GITHUB!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Деплой запущен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Проверьте статус:" -ForegroundColor Cyan
    Write-Host "   - GitHub: https://github.com/egoistsupport-coder/felix" -ForegroundColor Gray
    Write-Host "   - GitHub Actions: https://github.com/egoistsupport-coder/felix/actions" -ForegroundColor Gray
    Write-Host "   - Vercel: https://vercel.com/egoistsuport-coders-projects/felix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⏳ Деплой займет ~2-3 минуты" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Cyan
    Write-Host "   1. Добавьте GitHub Secrets (см. COMPLETE-GITHUB-SECRETS.md)" -ForegroundColor White
    Write-Host "   2. Дождитесь завершения деплоя" -ForegroundColor White
    Write-Host "   3. Настройте Telegram Webhook" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при отправке на GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "   1. Нет доступа к репозиторию" -ForegroundColor Gray
    Write-Host "   2. Нужна аутентификация (git config user.name/email)" -ForegroundColor Gray
    Write-Host "   3. Репозиторий не существует" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Попробуйте:" -ForegroundColor Yellow
    Write-Host "   git config --global user.name 'Your Name'" -ForegroundColor Gray
    Write-Host "   git config --global user.email 'your@email.com'" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

