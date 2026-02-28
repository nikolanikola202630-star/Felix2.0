# 🚀 Запуск полной версии Felix Bot

## Шаг 1: Создать таблицы в Supabase (2 минуты)

### 1.1 Откройте SQL Editor
https://supabase.com/dashboard/project/kzjkkwfrqymtrgjarsag/sql/new

### 1.2 Скопируйте SQL
Откройте файл `database/simple-schema.sql` и скопируйте весь текст

### 1.3 Вставьте и выполните
1. Вставьте SQL в редактор
2. Нажмите **RUN** (зеленая кнопка) или **F5**
3. Дождитесь сообщения "Success"

### 1.4 Проверьте таблицы
Перейдите в Table Editor и убедитесь что созданы таблицы:
- users
- messages
- voice_messages
- sessions
- user_stats

---

## Шаг 2: Добавить DATABASE_URL в Vercel (1 минута)

### 2.1 Откройте настройки Vercel
https://vercel.com/egoistsuport-coders-projects/felix/settings/environment-variables

### 2.2 Проверьте переменные
Должны быть:
- ✅ TELEGRAM_BOT_TOKEN
- ✅ GROQ_API_KEY
- ❓ DATABASE_URL (добавьте если нет)

### 2.3 Добавьте DATABASE_URL (если нет)
```
Name: DATABASE_URL
Value: postgresql://postgres:JIr5iPt2l5bMJH8YipvNEyPX@db.kzjkkwfrqymtrgjarsag.supabase.co:5432/postgres
Environment: Production, Preview, Development
```

Нажмите **Save**

---

## Шаг 3: Отправить код на GitHub (1 минута)

### Через GitHub Desktop:
1. Откройте GitHub Desktop
2. Увидите изменения в файлах
3. Commit message: `Add full bot features with database`
4. Нажмите **Commit to main**
5. Нажмите **Push origin**

### Или через PowerShell:
```powershell
git add .
git commit -m "Add full bot features with database"
git push origin main
```

---

## Шаг 4: Дождаться деплоя (1-2 минуты)

### 4.1 Откройте Vercel
https://vercel.com/egoistsuport-coders-projects/felix

### 4.2 Следите за деплоем
Должно появиться:
- "Building..." → "Deploying..." → "Ready"

### 4.3 Проверьте логи
Если есть ошибки - посмотрите в Logs

---

## Шаг 5: Протестировать бота (2 минуты)

### 5.1 Откройте бота
https://t.me/fel12x_bot

### 5.2 Тесты

**Тест 1: Команда /start**
```
Отправьте: /start
Ожидается: Приветствие + кнопки (Статистика, Саммари, Очистить историю)
```

**Тест 2: Контекст диалога**
```
Отправьте: Меня зовут Иван
Ответ: (что-то про имя)

Отправьте: Как меня зовут?
Ожидается: Должен вспомнить что вас зовут Иван
```

**Тест 3: Статистика**
```
Отправьте: /stats
Ожидается: Статистика с количеством сообщений
```

**Тест 4: Голосовое (опционально)**
```
Отправьте голосовое сообщение
Ожидается: Транскрипция + AI ответ
```

**Тест 5: Саммари**
```
Напишите несколько сообщений
Отправьте: /summary
Ожидается: Краткое саммари диалога
```

---

## ✅ Чеклист

- [ ] Таблицы созданы в Supabase
- [ ] DATABASE_URL добавлен в Vercel
- [ ] Код отправлен на GitHub
- [ ] Деплой завершен успешно
- [ ] /start показывает кнопки
- [ ] Бот помнит контекст
- [ ] /stats работает
- [ ] Голосовые транскрибируются (опционально)
- [ ] /summary создает саммари

---

## 🐛 Если что-то не работает

### Ошибка: "Cannot connect to database"
**Решение:**
1. Проверьте DATABASE_URL в Vercel
2. Убедитесь что таблицы созданы в Supabase
3. Redeploy проект в Vercel

### Ошибка: "Table does not exist"
**Решение:**
1. Проверьте что SQL выполнился успешно
2. Посмотрите Table Editor в Supabase
3. Попробуйте выполнить SQL еще раз

### Бот не отвечает
**Решение:**
1. Проверьте логи в Vercel
2. Проверьте webhook: `/getWebhookInfo`
3. Переподключите webhook

### Нет контекста
**Решение:**
1. Проверьте что сообщения сохраняются в БД
2. Откройте Table Editor → messages
3. Должны быть записи

---

## 📊 После запуска

### Мониторинг
- Vercel Logs: https://vercel.com/egoistsuport-coders-projects/felix/logs
- Supabase Table Editor: https://supabase.com/dashboard/project/kzjkkwfrqymtrgjarsag/editor

### Статистика
Проверяйте таблицу `user_stats` для аналитики

### Backup
Supabase автоматически делает backup каждый день

---

## 🎉 Готово!

После выполнения всех шагов у вас будет:
- ✅ Полноценный AI-ассистент
- ✅ История диалогов
- ✅ Контекст (помнит последние 10 сообщений)
- ✅ Транскрибация голосовых
- ✅ Саммари диалогов
- ✅ Статистика пользователей
- ✅ Команды и кнопки

Начинайте с Шага 1!
