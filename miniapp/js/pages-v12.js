// Felix Academy V12 - Pages
// Полные страницы с визуалом

const PagesV12 = {
  // Главная страница
  renderHome(user, stats = {}) {
    return `
      <div class="page-content">
        <!-- Приветствие -->
        <div class="card-v12 card-v12-gradient mb-4-v12">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div class="avatar-v12 avatar-v12-xl" style="background: rgba(255,255,255,0.2);">
              ${user.first_name[0].toUpperCase()}
            </div>
            <div style="flex: 1;">
              <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-2);">
                Привет, ${user.first_name}! 👋
              </h1>
              <p style="opacity: 0.9;">Добро пожаловать в Felix Academy V12</p>
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <div class="grid-v12 grid-v12-3 mb-4-v12">
          <div class="stat-card-v12">
            <div class="stat-icon-v12 primary">📚</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">${stats.courses_purchased || 0}</div>
              <div class="stat-label-v12">Курсов куплено</div>
              <div class="stat-trend-v12 positive">↑ +2 за неделю</div>
            </div>
          </div>

          <div class="stat-card-v12">
            <div class="stat-icon-v12 success">⏱️</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">${stats.hours_learned || 0}ч</div>
              <div class="stat-label-v12">Часов обучения</div>
              <div class="stat-trend-v12 positive">↑ +5ч за неделю</div>
            </div>
          </div>

          <div class="stat-card-v12">
            <div class="stat-icon-v12 warning">💰</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">${stats.bonus_balance || 0}₽</div>
              <div class="stat-label-v12">Бонусный баланс</div>
              <div class="stat-trend-v12">Доступно</div>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">🚀 Быстрые действия</h2>
          </div>
          <div class="grid-v12 grid-v12-2 gap-4-v12">
            <button class="btn-v12 btn-v12-primary btn-v12-full" onclick="FelixApp.navigate('academy')">
              <span>🎓</span>
              <span>Академия</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="FelixApp.navigate('community')">
              <span>👥</span>
              <span>Сообщество</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html'">
              <span>📖</span>
              <span>Каталог курсов</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='ai-chat.html'">
              <span>🤖</span>
              <span>AI Ассистент</span>
            </button>
          </div>
        </div>

        <!-- Последние достижения -->
        <div class="card-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">🏆 Последние достижения</h2>
            <button class="btn-v12 btn-v12-ghost btn-v12-sm" onclick="window.location.href='achievements.html'">
              Все →
            </button>
          </div>
          <div class="grid-v12 grid-v12-3 gap-4-v12">
            <div class="text-center-v12">
              <div style="font-size: 48px; margin-bottom: var(--space-2);">🎯</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Первый курс</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">Куплен первый курс</div>
            </div>
            <div class="text-center-v12">
              <div style="font-size: 48px; margin-bottom: var(--space-2);">⚡</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Быстрый старт</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">5 часов обучения</div>
            </div>
            <div class="text-center-v12">
              <div style="font-size: 48px; margin-bottom: var(--space-2);">🌟</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Активный</div>
              <div style="font-size: var(--text-secondary);">7 дней подряд</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Академия
  renderAcademy() {
    return `
      <div class="page-content">
        <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">
          🎓 Академия
        </h1>

        <!-- Категории -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">📚 Категории курсов</h2>
          </div>
          <div class="grid-v12 grid-v12-3 gap-4-v12">
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html?category=programming'">
              <span>💻</span>
              <span>Программирование</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html?category=design'">
              <span>🎨</span>
              <span>Дизайн</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html?category=business'">
              <span>💼</span>
              <span>Бизнес</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html?category=marketing'">
              <span>📈</span>
              <span>Маркетинг</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html?category=languages'">
              <span>🌍</span>
              <span>Языки</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='catalog.html'">
              <span>📖</span>
              <span>Все курсы</span>
            </button>
          </div>
        </div>

        <!-- Мои курсы -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">📚 Мои курсы</h2>
            <button class="btn-v12 btn-v12-ghost btn-v12-sm" onclick="window.location.href='my-courses.html'">
              Все →
            </button>
          </div>
          <div id="myCoursesContainer">
            <div class="text-center-v12 p-4-v12">
              <div style="font-size: 64px; margin-bottom: var(--space-4);">📚</div>
              <p style="color: var(--text-secondary); margin-bottom: var(--space-4);">
                У вас пока нет курсов
              </p>
              <button class="btn-v12 btn-v12-primary" onclick="window.location.href='catalog.html'">
                Перейти в каталог
              </button>
            </div>
          </div>
        </div>

        <!-- Рекомендации -->
        <div class="card-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">⭐ Рекомендуем</h2>
          </div>
          <div class="alert-v12 alert-v12-info">
            <div class="alert-v12-icon">💡</div>
            <div class="alert-v12-content">
              <div class="alert-v12-title">Персональные рекомендации</div>
              <div class="alert-v12-message">
                Мы подберем курсы специально для вас на основе ваших интересов и прогресса
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Сообщество
  renderCommunity() {
    return `
      <div class="page-content">
        <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">
          👥 Сообщество
        </h1>

        <!-- Статистика сообщества -->
        <div class="grid-v12 grid-v12-3 mb-4-v12">
          <div class="stat-card-v12">
            <div class="stat-icon-v12 primary">👥</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">1,234</div>
              <div class="stat-label-v12">Участников</div>
            </div>
          </div>

          <div class="stat-card-v12">
            <div class="stat-icon-v12 success">💬</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">5,678</div>
              <div class="stat-label-v12">Сообщений</div>
            </div>
          </div>

          <div class="stat-card-v12">
            <div class="stat-icon-v12 warning">🔥</div>
            <div class="stat-content-v12">
              <div class="stat-value-v12">89</div>
              <div class="stat-label-v12">Онлайн сейчас</div>
            </div>
          </div>
        </div>

        <!-- Каналы -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">📢 Каналы</h2>
          </div>
          <div class="grid-v12 gap-4-v12">
            <button class="btn-v12 btn-v12-secondary btn-v12-full flex-between-v12" onclick="window.location.href='community.html?channel=general'">
              <div class="flex-v12 gap-4-v12" style="align-items: center;">
                <span style="font-size: 24px;">💬</span>
                <div style="text-align: left;">
                  <div style="font-weight: var(--font-semibold);">Общий чат</div>
                  <div style="font-size: var(--text-sm); color: var(--text-secondary);">Обсуждение всего</div>
                </div>
              </div>
              <span class="badge-v12 badge-v12-primary">234</span>
            </button>

            <button class="btn-v12 btn-v12-secondary btn-v12-full flex-between-v12" onclick="window.location.href='community.html?channel=help'">
              <div class="flex-v12 gap-4-v12" style="align-items: center;">
                <span style="font-size: 24px;">❓</span>
                <div style="text-align: left;">
                  <div style="font-weight: var(--font-semibold);">Помощь</div>
                  <div style="font-size: var(--text-sm); color: var(--text-secondary);">Вопросы и ответы</div>
                </div>
              </div>
              <span class="badge-v12 badge-v12-warning">12</span>
            </button>

            <button class="btn-v12 btn-v12-secondary btn-v12-full flex-between-v12" onclick="window.location.href='community.html?channel=showcase'">
              <div class="flex-v12 gap-4-v12" style="align-items: center;">
                <span style="font-size: 24px;">🎨</span>
                <div style="text-align: left;">
                  <div style="font-weight: var(--font-semibold);">Витрина проектов</div>
                  <div style="font-size: var(--text-sm); color: var(--text-secondary);">Покажите свои работы</div>
                </div>
              </div>
              <span class="badge-v12 badge-v12-success">45</span>
            </button>
          </div>
        </div>

        <!-- Топ участников -->
        <div class="card-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">🏆 Топ участников</h2>
          </div>
          <div class="grid-v12 gap-4-v12">
            ${[1, 2, 3].map(i => `
              <div class="flex-v12 gap-4-v12" style="align-items: center; padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-md);">
                <div class="avatar-v12">U${i}</div>
                <div style="flex: 1;">
                  <div style="font-weight: var(--font-semibold);">Пользователь ${i}</div>
                  <div style="font-size: var(--text-sm); color: var(--text-secondary);">${1000 - i * 100} баллов</div>
                </div>
                <span style="font-size: 24px;">${i === 1 ? '🥇' : i === 2 ? '🥈' : '🥉'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Настройки
  renderSettings(user) {
    return `
      <div class="page-content">
        <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">
          ⚙️ Настройки
        </h1>

        <!-- Профиль -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">👤 Профиль</h2>
          </div>
          <div class="form-group-v12">
            <label class="form-label-v12">Имя</label>
            <input type="text" class="form-input-v12" value="${user.first_name}" readonly>
          </div>
          <div class="form-group-v12">
            <label class="form-label-v12">Username</label>
            <input type="text" class="form-input-v12" value="@${user.username || 'user'}" readonly>
          </div>
        </div>

        <!-- Уведомления -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">🔔 Уведомления</h2>
          </div>
          <div class="flex-between-v12 mb-4-v12">
            <div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Новые курсы</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">Уведомления о новых курсах</div>
            </div>
            <input type="checkbox" class="form-checkbox-v12" checked>
          </div>
          <div class="flex-between-v12 mb-4-v12">
            <div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Сообщения</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">Уведомления о новых сообщениях</div>
            </div>
            <input type="checkbox" class="form-checkbox-v12" checked>
          </div>
          <div class="flex-between-v12">
            <div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Достижения</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">Уведомления о достижениях</div>
            </div>
            <input type="checkbox" class="form-checkbox-v12" checked>
          </div>
        </div>

        <!-- Тема -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">🎨 Внешний вид</h2>
          </div>
          <div class="form-group-v12">
            <label class="form-label-v12">Тема</label>
            <select class="form-input-v12 form-select-v12">
              <option value="auto">Автоматически</option>
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
            </select>
          </div>
        </div>

        <!-- Действия -->
        <div class="card-v12">
          <div class="grid-v12 gap-4-v12">
            <button class="btn-v12 btn-v12-secondary btn-v12-full">
              <span>📤</span>
              <span>Экспорт данных</span>
            </button>
            <button class="btn-v12 btn-v12-error btn-v12-full">
              <span>🚪</span>
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Профиль
  renderProfile(user, stats = {}) {
    return `
      <div class="page-content">
        <!-- Шапка профиля -->
        <div class="card-v12 card-v12-gradient mb-4-v12 text-center-v12">
          <div class="avatar-v12 avatar-v12-xl" style="margin: 0 auto var(--space-4); background: rgba(255,255,255,0.2);">
            ${user.first_name[0].toUpperCase()}
          </div>
          <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-2);">
            ${user.first_name}
          </h1>
          <p style="opacity: 0.9; margin-bottom: var(--space-4);">@${user.username || 'user'}</p>
          <div class="flex-center-v12 gap-4-v12">
            <span class="badge-v12 badge-v12-success">Активный</span>
            <span class="badge-v12 badge-v12-primary">Уровень ${stats.level || 1}</span>
          </div>
        </div>

        <!-- Статистика -->
        <div class="grid-v12 grid-v12-3 mb-4-v12">
          <div class="card-v12 text-center-v12">
            <div style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--primary); margin-bottom: var(--space-2);">
              ${stats.courses_purchased || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">Курсов</div>
          </div>
          <div class="card-v12 text-center-v12">
            <div style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--success); margin-bottom: var(--space-2);">
              ${stats.hours_learned || 0}ч
            </div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">Обучения</div>
          </div>
          <div class="card-v12 text-center-v12">
            <div style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--warning); margin-bottom: var(--space-2);">
              ${stats.achievements || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">Достижений</div>
          </div>
        </div>

        <!-- Прогресс -->
        <div class="card-v12 mb-4-v12">
          <div class="card-v12-header">
            <h2 class="card-v12-title">📈 Прогресс</h2>
          </div>
          <div class="mb-4-v12">
            <div class="flex-between-v12 mb-4-v12">
              <span style="font-weight: var(--font-semibold);">До следующего уровня</span>
              <span style="color: var(--text-secondary);">75%</span>
            </div>
            <div style="height: 8px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: 75%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: var(--radius-full);"></div>
            </div>
          </div>
          <div class="alert-v12 alert-v12-info">
            <div class="alert-v12-icon">🎯</div>
            <div class="alert-v12-content">
              <div class="alert-v12-message">
                Еще 250 баллов до уровня ${(stats.level || 1) + 1}!
              </div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="card-v12">
          <div class="grid-v12 grid-v12-2 gap-4-v12">
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='achievements.html'">
              <span>🏆</span>
              <span>Достижения</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='analytics.html'">
              <span>📊</span>
              <span>Аналитика</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="FelixApp.navigate('settings')">
              <span>⚙️</span>
              <span>Настройки</span>
            </button>
            <button class="btn-v12 btn-v12-secondary btn-v12-full" onclick="window.location.href='support.html'">
              <span>💬</span>
              <span>Поддержка</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// Экспорт
window.PagesV12 = PagesV12;
