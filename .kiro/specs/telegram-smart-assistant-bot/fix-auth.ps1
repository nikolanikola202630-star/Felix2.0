# Исправление проблемы с авторизацией GitHub

Write-Host "🔐 Исправление авторизации GitHub" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "❌ Проблема: Git использует неправильный аккаунт (Mag1coon)" -ForegroundColor Red
Write-Host "✅ Нужно: Авторизоваться как egoistsuport-coder" -ForegroundColor Green
Write-Host ""

Write-Host "📋 РЕШЕНИЯ (выберите одно):" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "ВАРИАНТ 1: GitHub Desktop (САМЫЙ ПРОСТОЙ)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Скачайте GitHub Desktop:" -ForegroundColor White
Write-Host "   https://desktop.github.com/" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Установите и войдите как egoistsuport-coder" -ForegroundColor White
Write-Host ""
Write-Host "3. File → Add Local Repository" -ForegroundColor White
Write-Host "   Выберите: C:\Users\Mag1c\Desktop\Асистент копирайтер" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Нажмите 'Publish repository'" -ForegroundColor White
Write-Host "   Выберите репозиторий: Felix-" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Готово! Код будет отправлен автоматически" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "ВАРИАНТ 2: Personal Access Token (для командной строки)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Создайте токен на GitHub:" -ForegroundColor White
Write-Host "   https://github.com/settings/tokens/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Настройки токена:" -ForegroundColor White
Write-Host "   - Note: Felix Bot Deploy" -ForegroundColor Gray
Write-Host "   - Expiration: 90 days (или больше)" -ForegroundColor Gray
Write-Host "   - Scopes: отметьте 'repo' (все подпункты)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Нажмите 'Generate token' и СКОПИРУЙТЕ токен" -ForegroundColor White
Write-Host ""
Write-Host "4. Выполните команды:" -ForegroundColor White
Write-Host ""
Write-Host "   git remote set-url origin https://ВАШ_ТОКЕН@github.com/egoistsuport-coder/Felix-.git" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Замените ВАШ_ТОКЕН на скопированный токен" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "ВАРИАНТ 3: SSH ключ (для продвинутых)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Создайте SSH ключ:" -ForegroundColor White
Write-Host "   ssh-keygen -t ed25519 -C 'your@email.com'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Добавьте ключ на GitHub:" -ForegroundColor White
Write-Host "   https://github.com/settings/ssh/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Измените URL на SSH:" -ForegroundColor White
Write-Host "   git remote set-url origin git@github.com:egoistsuport-coder/Felix-.git" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 РЕКОМЕНДАЦИЯ: Используйте GitHub Desktop" -ForegroundColor Green
Write-Host "   Это самый простой и быстрый способ!" -ForegroundColor Green
Write-Host ""
