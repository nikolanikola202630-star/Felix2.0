# 🎨 Иконки Felix Academy - Brandbook

## Стиль: Engraving / Линейный

Все иконки выполнены в линейном стиле с толщиной линии 1.5-2px, напоминающем классические гравюры.

---

## 📚 Основные иконки

### Образование
- 📚 **Курсы** - стопка книг
- 📜 **Урок** - свиток
- 📖 **Чтение** - открытая книга
- ✍️ **Задание** - перо
- 📝 **Тест** - документ с галочкой
- 🎓 **Сертификат** - академическая шапочка
- 🏆 **Достижение** - кубок

### Профиль и статус
- 👤 **Профиль** - силуэт человека
- 🦁 **Elite Member** - лев (символ власти)
- ⚜️ **Premium** - геральдическая лилия
- 👑 **VIP** - корона
- 🎖️ **Ранг** - медаль
- ⭐ **Рейтинг** - звезда

### Финансы
- ⚖️ **Баланс** - весы (символ справедливости)
- 💰 **Деньги** - мешок с монетами
- 💳 **Оплата** - кредитная карта
- 💎 **Премиум** - бриллиант
- 📊 **Статистика** - график
- 💼 **Бизнес** - портфель

### Время и прогресс
- ⏱️ **Время** - песочные часы
- ⏰ **Напоминание** - будильник
- 📅 **Календарь** - календарь
- ⌛ **Ожидание** - песочные часы (вертикальные)
- ✅ **Завершено** - галочка
- 🔄 **В процессе** - стрелки по кругу

### Навигация
- ➡️ **Вперед** - стрелка вправо
- ⬅️ **Назад** - стрелка влево
- ⬆️ **Вверх** - стрелка вверх
- ⬇️ **Вниз** - стрелка вниз
- 🏠 **Главная** - дом
- 🔍 **Поиск** - лупа

### Действия
- ⚙️ **Настройки** - шестеренка
- 🔔 **Уведомления** - колокольчик
- 📧 **Сообщения** - конверт
- 🔗 **Ссылка** - цепь
- 📤 **Отправить** - стрелка из коробки
- 📥 **Получить** - стрелка в коробку

### Социальное
- 👥 **Сообщество** - группа людей
- 💬 **Чат** - облако диалога
- 🤝 **Партнерство** - рукопожатие
- 📢 **Объявление** - мегафон
- ❤️ **Избранное** - сердце
- ⭐ **Оценка** - звезда

### Контент
- 🎥 **Видео** - камера
- 🎧 **Аудио** - наушники
- 🎤 **Голос** - микрофон
- 📷 **Фото** - фотоаппарат
- 📄 **Документ** - лист бумаги
- 🗂️ **Папка** - папка

### Статусы
- ✅ **Успех** - зеленая галочка
- ❌ **Ошибка** - красный крестик
- ⚠️ **Предупреждение** - треугольник с восклицательным знаком
- ℹ️ **Информация** - буква i в круге
- 🔒 **Закрыто** - замок
- 🔓 **Открыто** - открытый замок

---

## 🎨 Использование в CSS

### Базовый стиль иконки

```css
.icon-brandbook {
  font-size: var(--icon-md);
  color: var(--old-gold);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  line-height: 1;
}

/* Размеры */
.icon-xs { font-size: var(--icon-xs); }  /* 16px */
.icon-sm { font-size: var(--icon-sm); }  /* 20px */
.icon-md { font-size: var(--icon-md); }  /* 24px */
.icon-lg { font-size: var(--icon-lg); }  /* 32px */
.icon-xl { font-size: var(--icon-xl); }  /* 48px */
```

### Иконка в круге

```css
.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  border: var(--line-normal) solid var(--old-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--icon-md);
  color: var(--old-gold);
  background: var(--bg-tertiary);
}
```

### Иконка в квадрате

```css
.icon-square {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: var(--line-thin) solid var(--border-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--icon-md);
  color: var(--old-gold);
  background: var(--bg-tertiary);
}
```

---

## 📱 Примеры использования

### Статистическая карточка

```html
<div class="stat-card-brandbook">
  <span class="stat-icon-brandbook">📚</span>
  <div class="stat-value-brandbook">12</div>
  <div class="stat-label-brandbook">Курсов</div>
</div>
```

### Карточка курса

```html
<div class="card-brandbook">
  <div class="card-header-brandbook">
    <div class="card-icon-brandbook">📜</div>
    <div class="card-info-brandbook">
      <div class="card-title-brandbook">Финансовая грамотность</div>
    </div>
  </div>
</div>
```

### Кнопка с иконкой

```html
<button class="btn-brandbook btn-brandbook-primary">
  <span>📚</span>
  <span>Начать обучение</span>
</button>
```

### Навигация с иконками

```html
<nav class="nav-brandbook">
  <div class="nav-item-brandbook active">
    <span>🏠</span>
    <span>Главная</span>
  </div>
  <div class="nav-item-brandbook">
    <span>📚</span>
    <span>Курсы</span>
  </div>
  <div class="nav-item-brandbook">
    <span>👤</span>
    <span>Профиль</span>
  </div>
</nav>
```

---

## 🎯 Семантические группы

### Курсы и обучение
```
📚 Каталог курсов
📜 Отдельный урок
📖 Материалы для чтения
✍️ Практические задания
📝 Тесты и экзамены
🎓 Сертификаты
🏆 Достижения и награды
```

### Профиль пользователя
```
👤 Личный профиль
⚜️ Статус Premium
🦁 Статус Elite
👑 VIP-доступ
🎖️ Ранг и уровень
⭐ Рейтинг
```

### Финансы и баланс
```
⚖️ Текущий баланс
💰 Пополнение счета
💳 История платежей
💎 Премиум-функции
📊 Финансовая статистика
💼 Партнерский доход
```

### Прогресс и время
```
⏱️ Время обучения
📅 Расписание
✅ Завершенные уроки
🔄 Текущий прогресс
⌛ Оставшееся время
```

---

## 🎨 Цветовые варианты

### Золотые иконки (основные)
```css
color: var(--old-gold);
```
Используются для:
- Активных элементов
- Акцентов
- Важных действий

### Платиновые иконки (второстепенные)
```css
color: var(--platinum);
```
Используются для:
- Неактивных элементов
- Вспомогательной информации
- Декоративных элементов

### Мраморные иконки (нейтральные)
```css
color: var(--cold-marble);
```
Используются для:
- Текстовых иконок
- Иконок в тексте
- Нейтральных элементов

### Цветные иконки (статусы)
```css
/* Успех */
color: var(--deep-emerald);

/* Ошибка */
color: var(--blood-cherry);

/* Предупреждение */
color: #B8860B;
```

---

## 🔤 Альтернатива: SVG иконки

Для более точного контроля можно использовать SVG иконки в стиле гравюры:

```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <!-- Ваш SVG код -->
</svg>
```

### Стиль SVG иконок

```css
.svg-icon {
  width: var(--icon-md);
  height: var(--icon-md);
  stroke: var(--old-gold);
  stroke-width: 1.5px;
  fill: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
```

---

## 📐 Правила использования

1. **Размер:** Иконки должны быть четкими и читаемыми
2. **Цвет:** Золото для акцентов, платина для второстепенных
3. **Толщина линий:** 1.5-2px для SVG иконок
4. **Тень:** Легкая тень для создания глубины
5. **Контекст:** Иконка должна соответствовать контексту
6. **Консистентность:** Используйте один стиль на всей платформе

---

## 🎭 Анимация иконок

### Пульсация (для активных элементов)

```css
@keyframes pulse-gold {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.icon-pulse {
  animation: pulse-gold 2s ease-in-out infinite;
}
```

### Вращение (для загрузки)

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-spin {
  animation: spin 1s linear infinite;
}
```

### Появление

```css
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.icon-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

---

## 📋 Чек-лист использования иконок

- [ ] Иконка соответствует контексту
- [ ] Размер читаемый (не менее 16px)
- [ ] Цвет соответствует важности элемента
- [ ] Добавлена легкая тень для глубины
- [ ] Иконка выровнена с текстом
- [ ] Есть альтернативный текст (для доступности)
- [ ] Стиль консистентен с остальными иконками

---

## 🎨 Примеры комбинаций

### Иконка + Текст

```html
<div style="display: flex; align-items: center; gap: var(--space-2);">
  <span style="color: var(--old-gold);">📚</span>
  <span>12 курсов</span>
</div>
```

### Иконка + Бейдж

```html
<div style="position: relative; display: inline-block;">
  <span style="font-size: var(--icon-lg); color: var(--old-gold);">🔔</span>
  <span style="position: absolute; top: -4px; right: -4px; background: var(--blood-cherry); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px;">3</span>
</div>
```

### Иконка в кнопке

```html
<button class="btn-brandbook btn-brandbook-primary">
  <span style="font-size: var(--icon-sm);">➡️</span>
  <span>Продолжить</span>
</button>
```

---

**Felix Academy V12**  
*Old Money. Cold Mind. High Society.*
