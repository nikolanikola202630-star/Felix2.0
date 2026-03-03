# Скрипт для добавления SUPABASE_KEY в Vercel

$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZWd2c3hoc3BkbnN2anBjc2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTYxNzIsImV4cCI6MjA4Nzk5MjE3Mn0.x-1RyBBawYRvnfxCN-2y0zpryCs3SOtIQI0B_S49Msc"

Write-Host "`n🔧 Добавление SUPABASE_KEY в Vercel...`n"

# Добавить переменную
echo $SUPABASE_KEY | vercel env add SUPABASE_KEY production

Write-Host "`n✅ Готово!`n"
Write-Host "Проверить: vercel env ls | Select-String 'SUPABASE_KEY'`n"
