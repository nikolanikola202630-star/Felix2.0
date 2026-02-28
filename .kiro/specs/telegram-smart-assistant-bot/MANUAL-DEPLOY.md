# 📖 Ручной деплой (пошаговая инструкция)

Если автоматические скрипты не работают, следуйте этой инструкции.

## Шаг 1: Создайте .env.local

```powershell
Copy-Item .kiro\specs\telegram-smart-assistant-bot\.env.example .env.local
```

Или вручную:
1. Скопируйте файл `.kiro/specs/telegram-smart-assistant-bot/.env.example`
2. Переименуйте копию в `.env.local` (в корне проекта)

## Шаг 2: Создайте GitHub репозиторий

1. Откройте https://github.com/new
2. Создайте новый репозиторий (например: `telegram-smart-assistant-bot`)
3. **НЕ** инициализируйте с README, .gitignore или license
4. Скопируйте URL репозитория (например: `https://github.com/YOUR_USERNAME/telegram-smart-assistant-bot.git`)

## Шаг 3: Инициализируйте Git локально

```powershell
# Инициализация Git
git init

# Настройка пользователя (если еще не настроено)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Добавление remote
git remote add origin https://github.com/YOUR_USERNAME/telegram-smart-assistant-bot.git

# Проверка
git remote -v
```

## Шаг 4: Добавьте GitHub Secrets

1. Откройте ваш GitHub репозиторий
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Добавьте 4 секрета:

### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: vcp_5YTUT7sffopJKEA8YKs5PJb9vQZhdOv4TPngNxAk0eZcacfPX70irGsH
```

### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: egoistsuport-coders-projects
```

### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```

### Secret 4: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
```

## Шаг 5: Создайте .gitignore

Создайте файл `.gitignore` в корне проекта:

```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/
__pycache__/
*.pyc

# Build
dist/
build/
.vercel/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
```

## Шаг 6: Первый коммит и push

```powershell
# Добавить все файлы
git add .

# Создать коммит
git commit -m "Initial commit: Telegram Smart Assistant Bot setup complete"

# Отправить на GitHub
git push -u origin main
```

Если ошибка "main doesn't exist", попробуйте:
```powershell
git branch -M main
git push -u origin main
```

## Шаг 7: Проверьте деплой

1. **GitHub Actions:**
   - Откройте https://github.com/YOUR_USERNAME/YOUR_REPO/actions
   - Должен запуститься workflow
   - Дождитесь зеленой галочки (✅)

2. **Vercel Dashboard:**
   - Откройте https://vercel.com/egoistsuport-coders-projects/felix
   - Проверьте статус деплоя
   - Скопируйте URL приложения (например: `https://felix.vercel.app`)

## Шаг 8: Настройте Telegram Webhook

### Вариант 1: PowerShell

```powershell
$APP_URL = "https://felix.vercel.app"  # Замените на ваш URL
$WEBHOOK_URL = "$APP_URL/api/telegram/webhook"
$TELEGRAM_API = "https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook"

Invoke-RestMethod -Uri $TELEGRAM_API -Method Post -Body @{url=$WEBHOOK_URL}
```

### Вариант 2: Через браузер

Откройте в браузере (замените YOUR_APP_URL):
```
https://api.telegram.org/bot8623255560:AAE7sC-7-eWA5LD-ebATDUh6nGUG0pYm03U/setWebhook?url=https://YOUR_APP_URL/api/telegram/webhook
```

Должны увидеть:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

## Шаг 9: Протестируйте бота

1. Откройте Telegram
2. Найдите @fel12x_bot
3. Отправьте `/start`
4. Попробуйте:
   - Отправить голосовое сообщение
   - Написать текстовое сообщение
   - Попросить суммаризацию

## 🆘 Troubleshooting

### Git: "fatal: not a git repository"
**Решение:** Выполните `git init` в корне проекта

### Git: "failed to push"
**Решение:** 
```powershell
# Проверьте remote
git remote -v

# Если пусто, добавьте
git remote add origin YOUR_REPO_URL

# Попробуйте снова
git push -u origin main
```

### GitHub Actions не запускается
**Решение:**
1. Проверьте что файл `.github/workflows/deploy.yml` существует
2. Проверьте что GitHub Secrets добавлены
3. Проверьте вкладку Actions в GitHub

### Vercel деплой не работает
**Решение:**
1. Проверьте логи в Vercel Dashboard
2. Убедитесь что GitHub Secrets правильные
3. Проверьте что Vercel проект подключен к GitHub репозиторию

### Webhook не настраивается
**Решение:**
1. Убедитесь что деплой завершен
2. Проверьте что URL правильный (https://)
3. Проверьте что приложение доступно по URL
4. Попробуйте через браузер (см. Вариант 2 выше)

## ✅ Готово!

После выполнения всех шагов бот должен работать!

Проверьте:
- ✅ Бот отвечает на /start
- ✅ Голосовые сообщения транскрибируются
- ✅ AI диалог работает
- ✅ Логи в Vercel чистые

---

**Время выполнения:** ~10-15 минут  
**Сложность:** Средняя 🟡
