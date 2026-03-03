// Felix Academy - Community Module v3.0
// EGOIST ECOSYSTEM Edition - Course Discussions

class CommunityManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.userId = this.getUserId();
    this.currentTab = 'all';
    this.currentCourse = 'all';
    this.discussions = [];
    this.courses = this.getCourses();
    this.init();
  }

  getUserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id') || this.tg?.initDataUnsafe?.user?.id || null;
  }

  getCourses() {
    return [
      { id: 'all', name: '📰 Все темы', category: 'all' },
      { id: 1, name: '📈 Трейдинг', category: 'trading' },
      { id: 2, name: '₿ Криптовалюты', category: 'crypto' },
      { id: 3, name: '🧠 Психология', category: 'psychology' },
      { id: 4, name: '💼 Инвестиции', category: 'investments' },
      { id: 5, name: '💬 Общее', category: 'general' }
    ];
  }

  async init() {
    this.tg?.ready();
    this.tg?.expand();
    this.tg?.BackButton.show();
    this.tg?.BackButton.onClick(() => window.location.href = 'index.html');
    
    this.renderCourseTabs();
    this.setupEventListeners();
    await this.loadStats();
    await this.loadDiscussions();
  }

  renderCourseTabs() {
    const tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = this.courses.map(course => `
      <button class="tab ${course.id === 'all' ? 'active' : ''}" data-course="${course.id}">
        ${course.name}
      </button>
    `).join('');
  }

  setupEventListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const courseId = e.target.dataset.course;
        this.switchCourse(courseId);
      });
    });
  }

  async switchCourse(courseId) {
    this.currentCourse = courseId;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-course="${courseId}"]`).classList.add('active');
    this.hapticFeedback('light');
    await this.loadDiscussions();
  }

  async loadStats() {
    try {
      const response = await fetch('/api/community/stats');
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('membersCount').textContent = data.stats.members.toLocaleString('ru-RU');
        document.getElementById('postsCount').textContent = data.stats.discussions.toLocaleString('ru-RU');
        document.getElementById('activeCount').textContent = data.stats.active.toLocaleString('ru-RU');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Use mock data
      this.animateStats();
    }
  }

  async loadDiscussions() {
    const content = document.getElementById('content');
    content.innerHTML = '<div style="text-align:center;padding:var(--space-8)">⏳ Загрузка...</div>';

    try {
      const courseParam = this.currentCourse === 'all' ? 'all' : this.currentCourse;
      const response = await fetch(`/api/community/discussions?course_id=${courseParam}&limit=50`);
      const data = await response.json();

      if (data.success && data.discussions.length > 0) {
        this.discussions = data.discussions;
        this.renderDiscussions();
      } else {
        this.renderEmptyState();
      }
    } catch (error) {
      console.error('Failed to load discussions:', error);
      this.renderMockDiscussions();
    }
  }

  renderDiscussions() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
      <button class="btn btn-primary" style="width:100%;margin-bottom:var(--space-4)" onclick="communityManager.createDiscussion()">
        ➕ Создать обсуждение
      </button>
      ${this.discussions.map(disc => this.renderDiscussionCard(disc)).join('')}
    `;
  }

  renderDiscussionCard(disc) {
    const categoryEmoji = {
      trading: '📈',
      crypto: '₿',
      psychology: '🧠',
      investments: '💼',
      general: '💬'
    };

    return `
      <div class="post-card" data-discussion-id="${disc.id}">
        <div class="post-header">
          <div class="post-avatar">${categoryEmoji[disc.category] || '💬'}</div>
          <div class="post-meta">
            <div class="post-author">${disc.author_name || 'Пользователь'}</div>
            <div class="post-time">${this.formatTime(disc.created_at)}</div>
          </div>
        </div>
        <div style="font-weight:600;margin-bottom:var(--space-2)">${disc.title}</div>
        <div class="post-content">${disc.content}</div>
        <div class="post-actions">
          <button class="post-action" onclick="communityManager.toggleLike(${disc.id})">
            <span>❤️</span>
            <span>${disc.likes_count || 0}</span>
          </button>
          <button class="post-action" onclick="communityManager.openComments(${disc.id})">
            <span>💬</span>
            <span>${disc.comments_count || 0}</span>
          </button>
          <button class="post-action" onclick="communityManager.shareDiscussion(${disc.id})">
            <span>📤</span>
            <span>Поделиться</span>
          </button>
        </div>
      </div>
    `;
  }

  renderMockDiscussions() {
    const mockData = [
      {
        id: 1,
        category: 'trading',
        title: 'Лучшие стратегии для начинающих',
        content: 'Поделитесь своими любимыми стратегиями для новичков в трейдинге. Что работает лучше всего?',
        author_name: 'Александр',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes_count: 24,
        comments_count: 8
      },
      {
        id: 2,
        category: 'crypto',
        title: 'Технический анализ криптовалют',
        content: 'Обсуждаем индикаторы и паттерны для крипторынка. Какие используете вы?',
        author_name: 'Мария',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes_count: 15,
        comments_count: 12
      },
      {
        id: 3,
        category: 'psychology',
        title: 'Как справиться со стрессом при торговле',
        content: 'Делитесь методами борьбы с эмоциями во время трейдинга. Медитация? Перерывы?',
        author_name: 'Дмитрий',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        likes_count: 42,
        comments_count: 15
      }
    ];

    this.discussions = mockData;
    this.renderDiscussions();
  }

  renderEmptyState() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-16);color:var(--text-secondary)">
        <div style="font-size:48px;margin-bottom:var(--space-4)">💬</div>
        <p style="margin-bottom:var(--space-4)">Пока нет обсуждений в этой категории</p>
        <button class="btn btn-primary" onclick="communityManager.createDiscussion()">
          ➕ Создать первое обсуждение
        </button>
      </div>
    `;
  }

  async createDiscussion() {
    this.hapticFeedback('light');
    
    const course = this.courses.find(c => c.id === this.currentCourse);
    const courseName = course ? course.name : 'Общее';
    
    this.tg?.showPopup({
      title: 'Новое обсуждение',
      message: `Создать обсуждение в категории "${courseName}"?\n\nФункция скоро будет доступна!`,
      buttons: [{ type: 'ok' }]
    });
  }

  async toggleLike(discussionId) {
    if (!this.userId) {
      this.tg?.showAlert('Войдите для взаимодействия с обсуждениями');
      return;
    }

    try {
      const response = await fetch(`/api/community/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: this.userId })
      });

      const data = await response.json();
      if (data.success) {
        this.hapticFeedback('success');
        await this.loadDiscussions();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      this.hapticFeedback('light');
    }
  }

  async openComments(discussionId) {
    this.hapticFeedback('light');
    
    try {
      const response = await fetch(`/api/community/discussions/${discussionId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        const count = data.comments.length;
        this.tg?.showAlert(`💬 Комментариев: ${count}\n\nПолный просмотр комментариев скоро будет доступен!`);
      }
    } catch (error) {
      this.tg?.showAlert('Комментарии скоро будут доступны! 💬');
    }
  }

  shareDiscussion(discussionId) {
    this.hapticFeedback('light');
    const disc = this.discussions.find(d => d.id === discussionId);
    if (disc) {
      const text = `${disc.title}\n\n${disc.content}\n\n⟁ Felix Academy - EGOIST ECOSYSTEM`;
      if (navigator.share) {
        navigator.share({ text });
      } else {
        this.tg?.showAlert('Функция "Поделиться" скоро будет доступна!');
      }
    }
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  }

  animateStats() {
    const animateValue = (id, start, end, duration) => {
      const element = document.getElementById(id);
      if (!element) return;
      
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          element.textContent = end.toLocaleString('ru-RU');
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }
      }, 16);
    };

    animateValue('membersCount', 0, 1234, 1000);
    animateValue('postsCount', 0, 567, 1200);
    animateValue('activeCount', 0, 89, 800);
  }

  hapticFeedback(type = 'light') {
    if (this.tg?.HapticFeedback) {
      if (type === 'success') {
        this.tg.HapticFeedback.notificationOccurred('success');
      } else {
        this.tg.HapticFeedback.impactOccurred(type);
      }
    }
  }
}

// Initialize
const communityManager = new CommunityManager();
