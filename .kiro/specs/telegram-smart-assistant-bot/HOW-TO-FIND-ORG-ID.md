# 🔍 Как найти Organization ID в Vercel

## ✅ Project ID уже найден!
```
prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```

## 🎯 Осталось найти Organization ID

### Способ 1: Через Vercel Dashboard (самый простой)

1. Откройте https://vercel.com/dashboard
2. В левом верхнем углу нажмите на название вашей команды/организации (рядом с логотипом Vercel)
3. Выберите **Settings** из выпадающего меню
4. В URL адресной строки вы увидите:
   ```
   https://vercel.com/teams/TEAM_ID/settings
   ```
   Скопируйте `TEAM_ID` - это и есть ваш Organization ID

**Пример:**
- URL: `https://vercel.com/teams/port-coders-projects/settings`
- Organization ID: `port-coders-projects`

### Способ 2: Через настройки проекта

1. Откройте ваш проект в Vercel Dashboard
2. Settings → General
3. Найдите раздел **Team** или **Organization**
4. Скопируйте ID команды

### Способ 3: Через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm install -g vercel

# Логин
vercel login

# Подключите проект
vercel link

# Откройте файл с IDs
cat .vercel/project.json
```

Вы увидите:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh"
}
```

Скопируйте значение `orgId`.

### Способ 4: Через URL проекта

Посмотрите на URL вашего проекта в Vercel:
```
https://vercel.com/TEAM_NAME/PROJECT_NAME
```

`TEAM_NAME` - это ваш Organization ID (или username, если личный аккаунт).

## 📝 Что делать после того как найдете Organization ID

### 1. Обновите .env.local
```env
VERCEL_ORG_ID=your_found_org_id
VERCEL_PROJECT_ID=prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```

### 2. Добавьте в GitHub Secrets

Откройте GitHub Repository → Settings → Secrets and variables → Actions

Добавьте 2 секрета:

**Secret 1: VERCEL_ORG_ID**
```
Name: VERCEL_ORG_ID
Value: <ваш найденный org_id>
```

**Secret 2: VERCEL_PROJECT_ID**
```
Name: VERCEL_PROJECT_ID
Value: prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh
```

## 🎯 Примеры Organization ID

Organization ID может выглядеть так:
- `team_abc123def456` (команда)
- `port-coders-projects` (название команды)
- `user_xyz789` (личный аккаунт)
- `felix` (username)

## 🆘 Не можете найти?

Попробуйте:

1. **Проверьте URL проекта:**
   - Откройте https://vercel.com/dashboard
   - Нажмите на ваш проект
   - Посмотрите на URL: `https://vercel.com/TEAM_NAME/felix`
   - `TEAM_NAME` - это ваш Organization ID

2. **Используйте Vercel CLI:**
   ```bash
   vercel whoami
   ```
   Это покажет ваш username/team name

3. **Проверьте настройки аккаунта:**
   - https://vercel.com/account
   - Посмотрите на **Username** - это может быть ваш Organization ID

## ✅ После того как найдете

Обновите все файлы и добавьте в GitHub Secrets. Затем можно делать деплой!

---

**Текущий статус:**
- ✅ Project ID: `prj_1XAiqn2maVyfTiDLTPBVxqZDHgAh`
- ⏳ Organization ID: нужно найти (см. инструкции выше)
