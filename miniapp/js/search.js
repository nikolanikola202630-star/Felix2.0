// Felix Academy - Search Module
class SearchManager {
  constructor() {
    this.allCourses = [];
    this.currentFilter = 'all';
    this.tg = window.Telegram?.WebApp;
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.tg?.BackButton.show();
    this.tg?.BackButton.onClick(() => window.location.href = 'catalog.html');
    
    this.setupEventListeners();
    this.loadCourses();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    searchInput?.addEventListener('input', this.debounce((e) => {
      const query = e.target.value.trim();
      clearBtn.classList.toggle('visible', query.length > 0);
      this.performSearch(query);
    }, 300));

    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.remove('visible');
      this.showEmptyState();
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilter = chip.dataset.filter;
        this.performSearch(searchInput.value.trim());
        this.hapticFeedback('light');
      });
    });
  }

  async loadCourses() {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      this.allCourses = data.courses || [];
    } catch (error) {
      console.error('Error loading courses:', error);
      try {
        const response = await fetch('../data/courses-structure.json');
        const data = await response.json();
        this.allCourses = data.courses || [];
      } catch (err) {
        console.error('Error loading local courses:', err);
      }
    }
  }

  performSearch(query) {
    if (!query) {
      this.showEmptyState();
      return;
    }

    const results = this.allCourses.filter(course => {
      const filterMatch = this.currentFilter === 'all' || course.category === this.currentFilter;
      const searchMatch = 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor?.name.toLowerCase().includes(query.toLowerCase()) ||
        course.themes?.some(theme => 
          theme.title.toLowerCase().includes(query.toLowerCase())
        );
      
      return filterMatch && searchMatch;
    });

    this.renderResults(results, query);
  }

  renderResults(results, query) {
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">😔</div>
          <h3>Ничего не найдено</h3>
          <p style="color: var(--text-secondary);">Попробуйте изменить запрос</p>
        </div>
      `;
      return;
    }

    container.innerHTML = results.map(course => `
      <div class="result-item" onclick="searchManager.openCourse('${course.slug}')">
        <div class="result-category">${this.getCategoryName(course.category)}</div>
        <div class="result-title">${this.highlightText(course.title, query)}</div>
        <div class="result-meta">
          <span>⭐ ${course.rating}</span>
          <span>⏱️ ${course.duration_hours}ч</span>
          <span>👥 ${course.students.toLocaleString('ru-RU')}</span>
        </div>
      </div>
    `).join('');
  }

  showEmptyState() {
    document.getElementById('searchResults').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Начните поиск</h3>
        <p style="color: var(--text-secondary);">Введите запрос для поиска курсов</p>
      </div>
    `;
  }

  highlightText(text, query) {
    if (!query) return this.escapeHtml(text);
    const regex = new RegExp(`(${query})`, 'gi');
    return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  getCategoryName(category) {
    const names = {
      psychology: 'Психология',
      'self-development': 'Саморазвитие',
      business: 'Бизнес'
    };
    return names[category] || category;
  }

  openCourse(slug) {
    this.hapticFeedback('medium');
    window.location.href = `course.html?slug=${slug}`;
  }

  hapticFeedback(type = 'light') {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred(type);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

const searchManager = new SearchManager();
