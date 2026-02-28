# Настройка Telegram Webhook (PowerShell)
# Запустите этот скрипт после успешного деплоя

Write-Host "🔗 Настройка Telegram Webhook..." -ForegroundColor Green
Write-Host ""

# Получите URL вашего приложения из Vercel
Write-Host "📝 Введите URL вашего приложения на Vercel:" -ForegroundColor Cyan
Write-Host "   (например: https://felix.vercel.app)"
$APP_URL = Read-Host "URL"

# Удаляем trailing slash если есть
$APP_URL = $APP_URL.TrimEnd('/')

Write-Host ""
Write-Host "🚀 Настраиваем webhook..." -ForegroundColor Cyan

# Настройка webhook
$WEBHOOK_URL = "${APP_URL}/api/telegram/webhook"
$TELEGRAM_API = "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook"

try {
    $Response = Invoke-RestMethod -Uri $TELEGRAM_API -Method Post -Body @{url=$WEBHOOK_URL}
    
    Write-Host ""
    Write-Host "📊 Ответ от Telegram:" -ForegroundColor Cyan
    Write-Host ($Response | ConvertTo-Json)
    Write-Host ""
    
    if ($Response.ok -eq $true) {
        Write-Host "✅ Webhook успешно настроен!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Бот готов к работе!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Протестируйте бота:" -ForegroundColor Cyan
        Write-Host "   1. Откройте Telegram"
        Write-Host "   2. Найдите @fel12x_bot"
        Write-Host "   3. Отправьте /start"
        Write-Host "   4. Попробуйте отправить голосовое сообщение"
    } else {
        Write-Host "❌ Ошибка при настройке webhook" -ForegroundColor Red
        Write-Host "   Проверьте URL и попробуйте снова"
    }
} catch {
    Write-Host "❌ Ошибка при настройке webhook: $_" -ForegroundColor Red
}
