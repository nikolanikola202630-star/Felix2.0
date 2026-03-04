# 🎨 Внедрение брендбука Felix Academy V12

## Обзор

Брендбук "Old Money. Cold Mind. High Society." создан для придания платформе Felix Academy элегантного, статусного и интеллектуального образа.

## Созданные файлы

### 1. Документация
- `BRANDBOOK-V12.md` - полный брендбук с описанием философии, цветов, типографики и правил

### 2. CSS файлы
- `miniapp/styles/brandbook-variables.css` - CSS переменные брендбука
- `miniapp/css/brandbook-components.css` - готовые компоненты в стиле брендбука

### 3. Демо
- `miniapp/brandbook-demo.html` - демонстрационная страница с примерами всех компонентов

## Быстрый старт

### Подключение стилей

Добавьте в `<head>` ваших HTML страниц:

```html
<!-- Шрифты -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

<!-- Стили брендбука -->
<link rel="stylesheet" href="styles/brandbook-variables.css">
<link rel="stylesheet" href="css/brandbook-components.css">
```

### Использование компонентов

#### Приветственная карточка

```html
<div class="welcome-card-brandbook">
  <div class="welcome-content-brandbook">
    <div class="avatar-brandbook">👤</div>
    <div class="welcome-text-brandbook">
      <h2>Добро пожаловать, [Имя].</h2>
      <p>Мы вас ждали.</p>
      <div class="level-badge-brandbook">
        <span>⚜️</span>
        <span>Elite Member</span>
      </div>
    </div>
  </div>
</div>
```

#### Статистические карточки

```html
<div class="stats-grid-brandbook">
  <div class="stat-card-brandbook">
    <span class="stat-icon-brandbook">📚</span>
    <div class="stat-value-brandbook">12</div>
    <div class="stat-label-brandbook">Курсов</div>
  </div>
  <!-- Добавьте больше карточек -->
</div>
```

#### Карточка курса с прогрессом

```html
<div class="card-brandbook">
  <div class="card-header-brandbook">
    <div class="card-icon-brandbook">📜</div>
    <div class="card-info-brandbook">
      <div class="card-title-brandbook">Название курса</div>
      <div class="card-meta-brandbook">
        <span>12 уроков</span>
        <span>•</span>
        <span class="card-badge-brandbook">Premium</span>
      </div>
    </div>
  </div>
  <div class="progress-container-brandbook">
    <div class="progress-header-brandbook">
      <span class="progress-label-brandbook">Прогресс</span>
      <span class="progress-value-brandbook">75%</span>
    </div>
    <div class="progress-bar-brandbook">
      <div class="progress-fill-brandbook" style="width: 75%"></div>
    </div>
  </div>
</div>
```

#### Кнопки

```html
<!-- Основная кнопка -->
<button class="btn-brandbook btn-brandbook-primary">
  Начать обучение
</button>

<!-- Вторичная кнопка -->
<button class="btn-brandbook">
  Мой профиль
</button>

<!-- Полная ширина -->
<button class="btn-brandbook btn-brandbook-primary btn-brandbook-full">
  Продолжить
</button>
```

#### Навигация

```html
<nav class="nav-brandbook">
  <div class="nav-item-brandbook active">Все</div>
  <div class="nav-item-brandbook">В процессе</div>
  <div class="nav-item-brandbook">Завершенные</div>
</nav>
```

## Цветовая палитра

### Основные цвета (CSS переменные)

```css
--anthracite: #1A1C1E;           /* Основной фон */
--noble-graphite: #2D2F31;       /* Карточки, панели */
--cold-marble: #F5F5F3;          /* Текст на темном фоне */
--old-gold: #C4A962;             /* Акценты (макс 10%) */
--platinum: #E5E4E2;             /* Второстепенные акценты */
--blood-cherry: #8B2C2C;         /* Ошибки */
--deep-emerald: #1E4D3E;         /* Успех */
```

### Использование в коде

```css
/* Фон */
background: var(--bg-primary);      /* Антрацит */
background: var(--bg-secondary);    /* Графит */

/* Текст */
color: var(--text-primary);         /* Мрамор */
color: var(--text-secondary);       /* Платина */
color: var(--text-accent);          /* Золото */

/* Границы */
border: 1px solid var(--border);
border-color: var(--border-gold);   /* Золотая граница */

/* Тени */
box-shadow: var(--shadow-md);
box-shadow: var(--shadow-gold);     /* Золотое свечение */
```

## Типографика

### Шрифты

```css
--font-heading: 'Cormorant Garamond', Georgia, serif;
--font-body: 'Montserrat', sans-serif;
--font-accent: 'Playfair Display', Georgia, serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Использование

```html
<!-- Заголовок (Cormorant Garamond) -->
<h1 style="font-family: var(--font-heading);">FELIX ACADEMY</h1>

<!-- Основной текст (Montserrat) -->
<p style="font-family: var(--font-body);">Текст описания</p>

<!-- Цифры/статистика (Playfair Display) -->
<div class="text-accent-number">1,234</div>
```

## Правила брендбука

### 1. Золото - не более 10%
Старое золото (#C4A962) должно занимать не более 10% поверхности экрана. Используйте его для:
- Акцентных кнопок
- Иконок
- Границ важных элементов
- Цифр в статистике

### 2. Сдержанность в анимациях
```css
/* Используйте строгий easing */
transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
```

### 3. Тонкие линии
```css
/* Толщина линий */
border-width: 1px;      /* Основные границы */
border-width: 1.5px;    /* Иконки */
border-width: 2px;      /* Акцентные элементы */
```

### 4. Uppercase для заголовков
```html
<h1 style="text-transform: uppercase; letter-spacing: 0.1em;">
  FELIX ACADEMY
</h1>
```

### 5. Тон коммуникации

❌ Неправильно:
- "Привет! Как дела?"
- "Упс, что-то пошло не так"
- "Ура, оплата прошла!"

✅ Правильно:
- "Добро пожаловать, [Имя]. Мы вас ждали."
- "Операция не может быть выполнена. Проверьте введенные данные."
- "Средства зачислены. Ваш баланс: X."

## Миграция существующих страниц

### Шаг 1: Подключите новые стили

```html
<link rel="stylesheet" href="styles/brandbook-variables.css">
<link rel="stylesheet" href="css/brandbook-components.css">
```

### Шаг 2: Замените классы

| Старый класс | Новый класс |
|--------------|-------------|
| `.card` | `.card-brandbook` |
| `.btn-primary` | `.btn-brandbook-primary` |
| `.stat-card` | `.stat-card-brandbook` |
| `.nav-item` | `.nav-item-brandbook` |

### Шаг 3: Обновите цвета

```css
/* Было */
background: #3B82F6;
color: #FFFFFF;

/* Стало */
background: var(--old-gold);
color: var(--anthracite);
```

### Шаг 4: Обновите шрифты

```css
/* Было */
font-family: -apple-system, sans-serif;

/* Стало */
font-family: var(--font-body);
```

## Примеры интеграции

### Главная страница (index.html)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Felix Academy</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/brandbook-variables.css">
  <link rel="stylesheet" href="css/brandbook-components.css">
</head>
<body>
  <div class="container">
    <header class="header-brandbook">
      <div class="logo-brandbook">
        <div class="logo-icon">🦁</div>
        <div>
          <div class="logo-text">Felix Academy</div>
          <div class="logo-subtitle">Old Money. Cold Mind. High Society.</div>
        </div>
      </div>
    </header>
    
    <!-- Ваш контент -->
  </div>
</body>
</html>
```

### Страница курса

```html
<div class="section-brandbook">
  <div class="section-header-brandbook">
    <h3 class="section-title-brandbook">Уроки курса</h3>
    <div class="view-all-brandbook">Все →</div>
  </div>
  
  <div class="card-brandbook">
    <div class="card-header-brandbook">
      <div class="card-icon-brandbook">📖</div>
      <div class="card-info-brandbook">
        <div class="card-title-brandbook">Урок 1: Введение</div>
        <div class="card-meta-brandbook">
          <span>15 минут</span>
          <span>•</span>
          <span class="card-badge-brandbook">Видео</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Тестирование

1. Откройте `miniapp/brandbook-demo.html` в браузере
2. Проверьте все компоненты на разных разрешениях
3. Убедитесь, что шрифты загружаются корректно
4. Проверьте анимации и переходы

## Поддержка

Для вопросов по внедрению брендбука обращайтесь к:
- `BRANDBOOK-V12.md` - полная документация
- `miniapp/brandbook-demo.html` - живые примеры
- `miniapp/styles/brandbook-variables.css` - все переменные

## Чек-лист внедрения

- [ ] Подключены шрифты Google Fonts
- [ ] Подключены файлы `brandbook-variables.css` и `brandbook-components.css`
- [ ] Обновлены цвета на палитру брендбука
- [ ] Заменены классы компонентов
- [ ] Обновлена типографика
- [ ] Проверена адаптивность на мобильных устройствах
- [ ] Обновлен тон коммуникации в текстах
- [ ] Золото занимает не более 10% экрана
- [ ] Анимации используют правильный easing
- [ ] Протестировано на разных браузерах

## Следующие шаги

1. Внедрить брендбук на главной странице
2. Обновить страницы курсов
3. Обновить профиль пользователя
4. Обновить админ-панель
5. Обновить партнерский кабинет
6. Создать брендированные email-шаблоны
7. Обновить голосового помощника (тон общения)
