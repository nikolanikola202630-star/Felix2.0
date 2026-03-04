// EGOIST ACADEMY - Main Application
class EgoistApp {
  constructor() {
    this.currentPage = 'home';
    this.init();
  }

  init() {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#0A0A0A');
      window.Telegram.WebApp.setBackgroundColor('#0A0A0A');
    }

    this.loadPage('home');
  }

  loadPage(page) {
    this.currentPage = page;
    this.updateNav(page);
    
    const pages = {
      home: this.renderHome,
      catalog: this.renderCatalog,
      community: this.renderCommunity,
      profile: this.renderProfile
    };

    const app = document.getElementById('app');
    app.innerHTML = pages[page]?.call(this) || this.renderHome();
  }

  updateNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  }

  renderHome() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user || { first_name: 'Гость' };
    
    return `
      <div class="container" style="padding-top: var(--space-8);">
        <div class="header mb-8">
          <h1 style="margin-bottom: var(--space-3);">EGOIST ACADEMY</h1>
          <p class="text-secondary" style="font-size: var(--text-lg);">
            Добро пожаловать, ${user.first_name}
          </p>
        </div>

        <div class="stats-grid mb-8" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4);">
          <div class="stat-card card-minimal">
            <div style="font-size: var(--text-h2); font-weight: var(--font-bold); margin-bottom: var(--space-2);">5</div>
            <div class="text-secondary text-sm">Курсов</div>
          </div>
          <div class="stat-card card-minimal">
            <div style="font-size: var(--text-h2); font-weight: var(--font-bold); margin-bottom: var(--space-2);">0%</div>
            <div class="text-secondary text-sm">Прогресс</div>
          </div>
        </div>

        <div class="quick-actions mb-8">
          <h3 class="mb-4">Быстрый доступ</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <button class="btn btn-primary btn-full" onclick="navigate('catalog')">
              📚 Открыть каталог
            </button>
            <button class="btn btn-secondary btn-full" onclick="openAI()">
              🤖 AI-ассистент
            </button>
          </div>
        </div>

        <div class="features">
          <h3 class="mb-4">Возможности</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <div class="card-minimal">
              <div style="font-size: 24px; margin-bottom: var(--space-2);">📖</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">PDF + Видео</div>
              <div class="text-secondary text-sm">Материалы и видеоуроки</div>
            </div>
            <div class="card-minimal">
              <div style="font-size: 24px; margin-bottom: var(--space-2);">👥</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Сообщество</div>
              <div class="text-secondary text-sm">Общение с единомышленниками</div>
            </div>
            <div class="card-minimal">
              <div style="font-size: 24px; margin-bottom: var(--space-2);">🎯</div>
              <div style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">Прогресс</div>
              <div class="text-secondary text-sm">Отслеживание достижений</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCatalog() {
    window.location.href = 'egoist-catalog.html';
    return '';
  }

  renderCommunity() {
    return `
      <div class="container" style="padding-top: var(--space-8);">
        <h2 class="mb-6">СООБЩЕСТВО</h2>
        <p class="text-secondary mb-8">Присоединяйтесь к обсуждениям по каждому направлению</p>
        
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${this.renderCommunityCard('ACADEMY KINGS', '👑', 'https://t.me/+...')}
          ${this.renderCommunityCard('BRAIN', '🧠', 'https://t.me/+...')}
          ${this.renderCommunityCard('IT', '💻', 'https://t.me/+...')}
          ${this.renderCommunityCard('TRADING', '📈', 'https://t.me/+...')}
          ${this.renderCommunityCard('SUCCESS', '🎯', 'https://t.me/+...')}
        </div>
      </div>
    `;
  }

  renderCommunityCard(title, icon, link) {
    return `
      <div class="card" onclick="window.open('${link}', '_blank')" style="cursor: pointer;">
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <div style="font-size: 36px;">${icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: var(--font-bold); margin-bottom: var(--space-1);">${title}</div>
            <div class="text-secondary text-sm">Перейти в группу →</div>
          </div>
        </div>
      </div>
    `;
  }

  renderProfile() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user || { 
      first_name: 'Гость',
      username: 'guest'
    };
    
    return `
      <div class="container" style="padding-top: var(--space-8);">
        <div class="profile-header mb-8" style="text-align: center;">
          <div style="width: 80px; height: 80px; border-radius: var(--radius-full); background: var(--bg-tertiary); margin: 0 auto var(--space-4); display: flex; align-items: center; justify-content: center; font-size: 36px;">
            👤
          </div>
          <h2 class="mb-2">${user.first_name}</h2>
          <p class="text-secondary">@${user.username || 'guest'}</p>
          <div class="badge badge-default mt-3">Студент</div>
        </div>

        <div class="profile-stats mb-8">
          <div class="card">
            <h4 class="mb-4">Статистика</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); text-align: center;">
              <div>
                <div style="font-size: var(--text-h3); font-weight: var(--font-bold);">0</div>
                <div class="text-secondary text-xs mt-1">Курсов</div>
              </div>
              <div>
                <div style="font-size: var(--text-h3); font-weight: var(--font-bold);">0</div>
                <div class="text-secondary text-xs mt-1">Уроков</div>
              </div>
              <div>
                <div style="font-size: var(--text-h3); font-weight: var(--font-bold);">0</div>
                <div class="text-secondary text-xs mt-1">Часов</div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="btn btn-secondary btn-full mb-3" onclick="openPartner()">
            💼 Стать партнёром
          </button>
          <button class="btn btn-ghost btn-full" onclick="openSettings()">
            ⚙️ Настройки
          </button>
        </div>
      </div>
    `;
  }
}

// Глобальные функции
function navigate(page) {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  window.app.loadPage(page);
}

function openAI() {
  window.location.href = 'voice-assistant.html';
}

function openPartner() {
  window.location.href = 'partner-dashboard.html';
}

function openSettings() {
  window.location.href = 'settings.html';
}

// Инициализация
window.app = new EgoistApp();
