# 🚀 Скрипты автоматического деплоя

## 📋 Доступные скрипты

### 1. Скрипты деплоя

#### Для Windows (PowerShell):
```powershell
.\.kiro\specs\telegram-smart-assistant-bot\deploy.ps1
```

#### Для Linux/Mac (Bash):
```bash
bash .kiro/specs/telegram-smart-assistant-bot/deploy.sh
```

**Что делает скрипт:**
1. ✅ Создает .env.local из .env.example
2. ✅ Добавляет все файлы в Git (`git add .`)
3. ✅ Создает коммит с сообщением
4. ✅ Отправляет на GitHub (`git push origin main`)
5. ✅ GitHub Actions автоматически деплоит на Vercel

### 2. Скрипты настройки Webhook

#### Для Windows (PowerShell):
```powershell
.\.kiro\specs\telegram-smart-assistant-bot\webhook.ps1
```

#### Для Linux/Mac (Bash):
```bash
bash .kiro/specs/telegram-smart-assistant-bot/webhook.sh
```

**Что делает скрипт:**
1. ✅ Запрашивает URL вашего приложения на Vercel
2. ✅ Настраивает Telegram Webhook
3. ✅ Проверяет успешность настройки

## 🎯 Быстрый старт

### Шаг 1: Запустите деплой

**Windows:**
```powershell
cd "C:\Users\Mag1c\Desktop\Асистент копирайтер"
.\.kiro\specs\telegram-smart-assistant-bot\deploy.ps1
```

**Linux/Mac:**
```bash
cd ~/your-project-directory
bash .kiro/specs/telegram-smart-assistant-bot/deploy.sh
```

### Шаг 2: Дождитесь завершения деплоя

Проверьте статус:
- GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- Vercel Dashboard: https://vercel.com/egoistsuport-coders-projects/felix

Деплой займет ~2-3 минуты.

### Шаг 3: Настройте Webhook

После успешного деплоя запустите:

**Windows:**
```powershell
.\.kiro\specs\telegram-smart-assistant-bot\webhook.ps1
```

**Linux/Mac:**
```bash
bash .kiro/specs/telegram-smart-assistant-bot/webhook.sh
```

Введите URL вашего приложения (например: `https://felix.vercel.app`)

### Шаг 4: Протестируйте бота

1. Откройте Telegram
2. Найдите @fel12x_bot
3. Отправьте `/start`
4. Попробуйте отправить голосовое сообщение
5. Попробуйте AI диалог

## 📝 Примечания

### Требования:
- ✅ Git установлен и настроен
- ✅ GitHub Secrets добавлены (см. COMPLETE-GITHUB-SECRETS.md)
- ✅ Vercel проект создан
- ✅ Все credentials настроены

### Если скрипт не запускается:

**Windows PowerShell:**
```powershell
# Разрешите выполнение скриптов
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Linux/Mac Bash:**
```bash
# Сделайте скрипт исполняемым
chmod +x .kiro/specs/telegram-smart-assistant-bot/deploy.sh
chmod +x .kiro/specs/telegram-smart-assistant-bot/webhook.sh
```

## 🆘 Troubleshooting

### Ошибка: "git: command not found"
**Решение:** Установите Git с https://git-scm.com/downloads

### Ошибка: "Permission denied"
**Решение:** 
- Проверьте права доступа к репозиторию
- Убедитесь что вы залогинены в Git: `git config --global user.name "Your Name"`

### Ошибка: "No changes to commit"
**Решение:** Это нормально, если файлы уже закоммичены. Скрипт продолжит работу.

### Webhook не настраивается
**Решение:**
- Проверьте что деплой завершен успешно
- Убедитесь что URL правильный (без trailing slash)
- Проверьте что приложение доступно по URL

## 🎉 Готово!

После выполнения всех шагов ваш бот будет работать!

Проверьте:
- ✅ Бот отвечает на команды
- ✅ Голосовые сообщения транскрибируются
- ✅ AI диалог работает
- ✅ Логи в Vercel Dashboard чистые

---

**Время выполнения:** ~5 минут  
**Сложность:** Легко 🟢  
**Автоматизация:** Полная ✅
