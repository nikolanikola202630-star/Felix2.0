// Felix Academy - Catalog Module
// Управление каталогом курсов

class CatalogManager {
  constructor() {
    this.allCourses = [];
    this.filteredCourses = [];
    this.currentCategory = 'all';
    this.currentSort = 'popular';
    this.searchQuery = '';
    this.tg = window.Telegram?.WebApp;
    
    this.categoryEmoji = {
      psychology: '🧠',
      'self-development': '🚀',
      business: '💼'
    };
    
    this.levelLabels = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
      all: 'Все уровни'
    };
    
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.setupEventListeners();
    this.loadCourses();
  }

  setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.searchQuery = e.target.value;
        this.filterCourses();
      }, 300));
    }

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.sortCourses();
        this.renderCourses();
      });
    }

    // Filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.handleFilterClick(chip);
      });
    });
  }

  handleFilterClick(chip) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    this.currentCategory = chip.dataset.category;
    this.filterCourses();
    this.hapticFeedback('light');
  }

  async loadCourses() {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      this.allCourses = data.courses || [];
      this.filteredCourses = [...this.allCourses];
      this.renderCourses();
    } catch (error) {
      console.error('Error loading courses from API:', error);
      await this.loadLocalCourses();
    }
  }

  async loadLocalCourses() {
    try {
      const response = await fetch('../data/courses-structure.json');
      const data = await response.json();
      this.allCourses = data.courses || [];
      this.filteredCourses = [...this.allCourses];
      this.renderCourses();
    } catch (error) {
      console.error('Error loading local courses:', error);
      this.showEmptyState('Ошибка загрузки курсов');
    }
  }

  filterCourses() {
    this.filteredCourses = this.allCourses.filter(course => {
      const categoryMatch = this.currentCategory === 'all' || 
                           course.category === this.currentCategory ||
                           course.level === this.currentCategory;
      
      const searchMatch = !this.searchQuery || 
                         course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         course.instructor?.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });

    this.sortCourses();
    this.renderCourses();
  }

  sortCourses() {
    const sortFunctions = {
      popular: (a, b) => b.students - a.students,
      rating: (a, b) => b.rating - a.rating,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      newest: (a, b) => b.id - a.id
    };

    const sortFn = sortFunctions[this.currentSort];
    if (sortFn) {
      this.filteredCourses.sort(sortFn);
    }
  }

  renderCourses() {
    const grid = document.getElementById('coursesGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!grid) return;

    resultsCount.textContent = `Найдено курсов: ${this.filteredCourses.length}`;

    if (this.filteredCourses.length === 0) {
      this.showEmptyState('Курсы не найдены');
      return;
    }

    grid.innerHTML = this.filteredCourses.map(course => this.createCourseCard(course)).join('');
    this.hapticFeedback('light');
  }

  createCourseCard(course) {
    const totalLessons = course.themes?.reduce((sum, theme) => sum + (theme.lessons?.length || 0), 0) || 0;
    
    return `
      <div class="course-card" onclick="catalogManager.openCourse('${course.slug}')">
        <img src="${course.image}" alt="${course.title}" class="course-image" loading="lazy">
        <div class="course-badge">${this.levelLabels[course.level]}</div>
        
        <div class="course-content">
          <div class="course-category">
            ${this.categoryEmoji[course.category] || '📖'} ${this.getCategoryName(course.category)}
          </div>
          
          <h3 class="course-title">${this.escapeHtml(course.title)}</h3>
          <p class="course-description">${this.escapeHtml(course.description)}</p>
          
          <div class="course-meta">
            <div class="meta-item">
              <span>⭐</span>
              <span>${course.rating}</span>
            </div>
            <div class="meta-item">
              <span>⏱️</span>
              <span>${course.duration_hours}ч</span>
            </div>
            <div class="meta-item">
              <span>📊</span>
              <span>${totalLessons} уроков</span>
            </div>
          </div>
          
          <div class="course-footer">
            <div class="course-price">${course.price.toLocaleString('ru-RU')} ₽</div>
            <div class="course-students">${course.students.toLocaleString('ru-RU')} студентов</div>
          </div>
        </div>
      </div>
    `;
  }

  showEmptyState(message) {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">📚</div>
        <h3 class="empty-title">${this.escapeHtml(message)}</h3>
        <p class="empty-text">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    `;
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
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize on page load
let catalogManager;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    catalogManager = new CatalogManager();
  });
} else {
  catalogManager = new CatalogManager();
}
