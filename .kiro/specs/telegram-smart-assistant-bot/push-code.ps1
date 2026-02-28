# Отправка кода на GitHub

Write-Host "📦 Отправка кода на GitHub..." -ForegroundColor Cyan
Write-Host ""

# Добавляем новые файлы
Write-Host "Добавление файлов..." -ForegroundColor Gray
git add .

# Коммит
Write-Host "Создание коммита..." -ForegroundColor Gray
git commit -m "Add minimal working bot implementation"

# Push
Write-Host "Отправка на GitHub..." -ForegroundColor Gray
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ КОД ОТПРАВЛЕН!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Vercel автоматически начнет деплой" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Проверьте статус:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/egoistsuport-coders-projects/felix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⏳ Деплой займет ~2-3 минуты" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при отправке" -ForegroundColor Red
    Write-Host ""
}
