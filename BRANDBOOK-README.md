# 📘 Felix Academy Brandbook - Быстрый старт

## Old Money. Cold Mind. High Society.

Элегантный, статусный и интеллектуальный образ платформы Felix Academy.

---

## 📁 Структура файлов

```
Felix Academy V12/
├── BRANDBOOK-V12.md                      # Полный брендбук
├── BRANDBOOK-IMPLEMENTATION.md           # Инструкции по внедрению
├── BRANDBOOK-VOICE-EXAMPLES.md           # Примеры текстов
├── BRANDBOOK-README.md                   # Этот файл
│
├── miniapp/
│   ├── styles/
│   │   └── brandbook-variables.css       # CSS переменные
│   ├── css/
│   │   └── brandbook-components.css      # Готовые компоненты
│   └── brandbook-demo.html               # Демо-страница
```

---

## 🚀 Быстрый старт (5 минут)

### 1. Откройте демо

```bash
# Откройте в браузере
miniapp/brandbook-demo.html
```

### 2. Подключите стили к вашей странице

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <!-- Шрифты -->
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
  
  <!-- Стили брендбука -->
  <link rel="stylesheet" href="styles/brandbook-variables.css">
  <link rel="stylesheet" href="css/brandbook-components.css">
</head>
<body>
  <!-- Ваш контент -->
</body>
</html>
```

### 3. Используйте компоненты

```html
<!-- Приветствие -->
<div class="welcome-card-brandbook">
  <div class="welcome-content-brandbook">
    <div class="avatar-brandbook">👤</div>
    <div class="welcome-text-brandbook">
      <h2>Добро пожаловать, Александр.</h2>
      <p>Мы вас ждали.</p>
    </div>
  </div>
</div>

<!-- Статистика -->
<div class="stats-grid-brandbook">
  <div class="stat-card-brandbook">
    <span class="stat-icon-brandbook">📚</span>
    <div class="stat-value-brandbook">12</div>
    <div class="stat-label-brandbook">Курсов</div>
  </div>
</div>

<!-- Кнопка -->
<button class="btn-brandbook btn-brandbook-primary">
  Начать обучение
</button>
```

---

## 🎨 Ключевые элементы

### Цвета

| Название | HEX | Применение |
|----------|-----|------------|
| Антрацит | `#1A1C1E` | Основной фон |
| Графит | `#2D2F31` | Карточки |
| Мрамор | `#F5F5F3` | Текст |
| Золото | `#C4A962` | Акценты (макс 10%) |
| Платина | `#E5E4E2` | Второстепенные элементы |

### Шрифты

- **Заголовки:** Cormorant Garamond
- **Текст:** Montserrat
- **Цифры:** Playfair Display
- **Код:** JetBrains Mono

### Тон коммуникации

✅ **Правильно:**
- "Добро пожаловать, [Имя]. Мы вас ждали."
- "Средства зачислены. Ваш баланс: 2,450₽."
- "Операция выполнена."

❌ **Неправильно:**
- "Привет! Рады тебя видеть!"
- "Ура! Оплата прошла!"
- "Упс, что-то пошло не так"

---

## 📚 Документация

### Для дизайнеров
→ `BRANDBOOK-V12.md` - полный брендбук с философией, цветами, типографикой

### Для разработчиков
→ `BRANDBOOK-IMPLEMENTATION.md` - инструкции по внедрению, примеры кода

### Для копирайтеров
→ `BRANDBOOK-VOICE-EXAMPLES.md` - примеры текстов в стиле брендбука

---

## 🎯 Основные правила

1. **Золото - не более 10%** экрана
2. **Обращение на "Вы"** с большой буквы
3. **Короткие предложения** - максимум 15 слов
4. **Без восклицательных знаков** - только точки
5. **Тонкие линии** - 1px для границ
6. **Uppercase для заголовков** с увеличенным межбуквенным расстоянием
7. **Плавные анимации** - 0.2-0.4 секунды

---

## 🔧 Готовые компоненты

### Карточки
- `.welcome-card-brandbook` - приветственная карточка
- `.stat-card-brandbook` - статистическая карточка
- `.card-brandbook` - универсальная карточка контента

### Кнопки
- `.btn-brandbook` - базовая кнопка
- `.btn-brandbook-primary` - основная кнопка (золотая)
- `.btn-brandbook-full` - кнопка на всю ширину

### Навигация
- `.nav-brandbook` - контейнер навигации
- `.nav-item-brandbook` - элемент навигации
- `.nav-item-brandbook.active` - активный элемент

### Прогресс
- `.progress-bar-brandbook` - контейнер прогресс-бара
- `.progress-fill-brandbook` - заполнение прогресса

### Модальные окна
- `.modal-backdrop-brandbook` - фон модального окна
- `.modal-brandbook` - само модальное окно

### Уведомления
- `.toast-brandbook` - всплывающее уведомление

---

## 💡 Примеры использования

### Страница профиля

```html
<div class="container">
  <!-- Шапка -->
  <header class="header-brandbook">
    <div class="logo-brandbook">
      <div class="logo-icon">🦁</div>
      <div class="logo-text">Felix Academy</div>
    </div>
  </header>

  <!-- Приветствие -->
  <div class="welcome-card-brandbook">
    <div class="welcome-content-brandbook">
      <div class="avatar-brandbook">АС</div>
      <div class="welcome-text-brandbook">
        <h2>Александр Смирнов</h2>
        <p>Elite Member с 2024</p>
      </div>
    </div>
  </div>

  <!-- Статистика -->
  <div class="stats-grid-brandbook">
    <div class="stat-card-brandbook">
      <span class="stat-icon-brandbook">📚</span>
      <div class="stat-value-brandbook">12</div>
      <div class="stat-label-brandbook">Курсов</div>
    </div>
    <div class="stat-card-brandbook">
      <span class="stat-icon-brandbook">⏱️</span>
      <div class="stat-value-brandbook">48</div>
      <div class="stat-label-brandbook">Часов</div>
    </div>
  </div>
</div>
```

### Список курсов

```html
<section class="section-brandbook">
  <div class="section-header-brandbook">
    <h3 class="section-title-brandbook">Мои курсы</h3>
    <div class="view-all-brandbook">Все →</div>
  </div>

  <div class="card-brandbook">
    <div class="card-header-brandbook">
      <div class="card-icon-brandbook">📜</div>
      <div class="card-info-brandbook">
        <div class="card-title-brandbook">Финансовая грамотность</div>
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
</section>
```

---

## 🎨 CSS переменные

### Цвета

```css
/* Основные */
var(--anthracite)        /* #1A1C1E */
var(--noble-graphite)    /* #2D2F31 */
var(--cold-marble)       /* #F5F5F3 */
var(--old-gold)          /* #C4A962 */
var(--platinum)          /* #E5E4E2 */

/* Семантические */
var(--bg-primary)        /* Основной фон */
var(--bg-secondary)      /* Второстепенный фон */
var(--text-primary)      /* Основной текст */
var(--text-secondary)    /* Второстепенный текст */
var(--text-accent)       /* Акцентный текст (золото) */
var(--border)            /* Граница */
var(--border-gold)       /* Золотая граница */
```

### Типографика

```css
var(--font-heading)      /* Cormorant Garamond */
var(--font-body)         /* Montserrat */
var(--font-accent)       /* Playfair Display */
var(--font-mono)         /* JetBrains Mono */

var(--text-xs)           /* 11px */
var(--text-sm)           /* 13px */
var(--text-base)         /* 16px */
var(--text-xl)           /* 20px */
var(--text-3xl)          /* 30px */
```

### Отступы

```css
var(--space-1)           /* 4px */
var(--space-2)           /* 8px */
var(--space-3)           /* 12px */
var(--space-4)           /* 16px */
var(--space-6)           /* 24px */
var(--space-8)           /* 32px */
```

### Тени

```css
var(--shadow-sm)         /* Маленькая тень */
var(--shadow-md)         /* Средняя тень */
var(--shadow-lg)         /* Большая тень */
var(--shadow-gold)       /* Золотое свечение */
```

---

## 📱 Адаптивность

Все компоненты адаптивны и корректно отображаются на:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (320px+)

---

## ✅ Чек-лист внедрения

- [ ] Подключены шрифты Google Fonts
- [ ] Подключен `brandbook-variables.css`
- [ ] Подключен `brandbook-components.css`
- [ ] Обновлены цвета
- [ ] Обновлена типографика
- [ ] Обновлен тон текстов
- [ ] Проверена адаптивность
- [ ] Золото занимает не более 10%

---

## 🆘 Поддержка

**Вопросы по дизайну:**
→ `BRANDBOOK-V12.md`

**Вопросы по коду:**
→ `BRANDBOOK-IMPLEMENTATION.md`

**Вопросы по текстам:**
→ `BRANDBOOK-VOICE-EXAMPLES.md`

**Живые примеры:**
→ `miniapp/brandbook-demo.html`

---

## 🎯 Философия

> "Old Money. Cold Mind. High Society."

Мы создаем не просто образовательную платформу. Мы создаем эксклюзивное пространство для интеллектуальной элиты. Каждый элемент дизайна, каждое слово должны отражать превосходство, интеллект и сдержанную роскошь.

Истинная роскошь не кричит. Она проявляется в деталях.

---

**Felix Academy V12**  
*EST. 2024*
