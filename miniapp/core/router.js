// Felix Academy V12 - Router
// SPA роутер для навигации между страницами

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.container = document.getElementById('app');
    
    // Register routes
    this.registerRoutes();
  }
  
  // Register all routes
  registerRoutes() {
    this.routes.set('home', {
      title: 'Главная',
      load: () => this.loadPage('home')
    });
    
    this.routes.set('catalog', {
      title: 'Каталог',
      load: () => this.loadPage('catalog')
    });
    
    this.routes.set('my-courses', {
      title: 'Мои курсы',
      load: () => this.loadPage('my-courses')
    });
    
    this.routes.set('profile', {
      title: 'Профиль',
      load: () => this.loadPage('profile')
    });
    
    this.routes.set('course', {
      title: 'Курс',
      load: (params) => this.loadPage('course', params)
    });
    
    this.routes.set('lesson', {
      title: 'Урок',
      load: (params) => this.loadPage('lesson', params)
    });
    
    this.routes.set('settings', {
      title: 'Настройки',
      load: () => this.loadPage('settings')
    });
    
    this.routes.set('ai-chat', {
      title: 'AI Ассистент',
      load: () => this.loadPage('ai-chat')
    });
  }
  
  // Navigate to page
  async navigate(page, params = {}) {
    try {
      const route = this.routes.get(page);
      
      if (!route) {
        console.error(`Route not found: ${page}`);
        return;
      }
      
      // Show loading
      this.showLoading();
      
      // Load page
      await route.load(params);
      
      // Update current page
      this.currentPage = page;
      
      // Update title
      document.title = `${route.title} - Felix Academy`;
      
      // Hide loading
      this.hideLoading();
      
      console.log(`📄 Navigated to: ${page}`);
      
    } catch (error) {
      console.error('Navigation error:', error);
      this.showError(error.message);
    }
  }
  
  // Load page content
  async loadPage(page, params = {}) {
    const api = window.FelixApp.api;
    const user = window.FelixApp.user;
    
    switch (page) {
      case 'home':
        await this.loadHomePage();
        break;
        
      case 'catalog':
        await this.loadCatalogPage();
        break;
        
      case 'my-courses':
        await this.loadMyCoursesPage();
        break;
        
      case 'profile':
        await this.loadProfilePage();
        break;
        
      case 'course':
        await this.loadCoursePage(params.courseId);
        break;
        
      case 'lesson':
        await this.loadLessonPage(params.courseId, params.lessonId);
        break;
        
      case 'settings':
        await this.loadSettingsPage();
        break;
        
      case 'ai-chat':
        await this.loadAIChatPage();
        break;
        
      default:
        this.showError('Страница не найдена');
    }
  }
  
  // Load Home Page
  async loadHomePage() {
    const api = window.FelixApp.api;
    const user = window.FelixApp.user;
    
    // Load data
    const [stats, courses] = await Promise.all([
      api.request(`/app?action=getUserProgress&userId=${user.id}`, { cache: true }),
      api.request(`/app?action=getCourses&userId=${user.id}`, { cache: true })
    ]);
    
    // Render page
    this.container.innerHTML = `
      <div class="page active" id="home-page">
        <div class="welcome-card-brandbook">
          <div class="welcome-content-brandbook">
            <div class="avatar-brandbook">${user.first_name[0].toUpperCase()}</div>
            <div class="welcome-text-brandbook">
              <h1>Добро пожаловать, ${user.first_name}.</h1>
              <p>Мы вас ждали.</p>
            </div>
          </div>
        </div>
        
        <div class="stats-grid-brandbook">
          <div class="stat-card-brandbook">
            <span class="stat-icon-brandbook">🎯</span>
            <div class="stat-content-brandbook">
              <div class="stat-value-brandbook">${stats.progress?.level || 1}</div>
              <div class="stat-label-brandbook">Уровень</div>
            </div>
          </div>
          
          <div class="stat-card-brandbook">
            <span class="stat-icon-brandbook">⚡</span>
            <div class="stat-content-brandbook">
              <div class="stat-value-brandbook">${stats.progress?.xp || 0}</div>
              <div class="stat-label-brandbook">XP</div>
            </div>
          </div>
          
          <div class="stat-card-brandbook">
            <span class="stat-icon-brandbook">🔥</span>
            <div class="stat-content-brandbook">
              <div class="stat-value-brandbook">${stats.progress?.streak || 0}</div>
              <div class="stat-label-brandbook">Дней подряд</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">📚 Популярные курсы</h2>
          <div class="courses-grid" id="popular-courses">
            ${this.renderCourses(courses.courses?.slice(0, 6) || [])}
          </div>
        </div>
        
        <div class="section">
          <button class="btn-brandbook btn-brandbook-primary btn-brandbook-full" onclick="FelixApp.router.navigate('catalog')">
            Смотреть все курсы →
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.setupCourseCards();
  }
  
  // Load Catalog Page
  async loadCatalogPage() {
    const api = window.FelixApp.api;
    const user = window.FelixApp.user;
    
    // Load courses
    const { courses } = await api.request(`/app?action=getCourses&userId=${user.id}`, { cache: true });
    
    // Render page
    this.container.innerHTML = `
      <div class="page active" id="catalog-page">
        <div class="page-header">
          <h1>📚 Каталог курсов</h1>
          <p>Выберите курс для начала обучения</p>
        </div>
        
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="🔍 Поиск курсов..." />
        </div>
        
        <div class="filters">
          <button class="filter-btn active" data-filter="all">Все</button>
          <button class="filter-btn" data-filter="beginner">Начальный</button>
          <button class="filter-btn" data-filter="intermediate">Средний</button>
          <button class="filter-btn" data-filter="advanced">Продвинутый</button>
        </div>
        
        <div class="courses-grid" id="courses-list">
          ${this.renderCourses(courses || [])}
        </div>
      </div>
    `;
    
    // Setup search and filters
    this.setupSearch(courses);
    this.setupFilters(courses);
    this.setupCourseCards();
  }
  
  // Load My Courses Page
  async loadMyCoursesPage() {
    const api = window.FelixApp.api;
    const user = window.FelixApp.user;
    
    // Load user courses
    const { courses } = await api.request(`/app?action=getCourses&userId=${user.id}`, { cache: true });
    const myCourses = courses?.filter(c => c.enrolled) || [];
    
    // Render page
    this.container.innerHTML = `
      <div class="page active" id="my-courses-page">
        <div class="page-header">
          <h1>🎓 Мои курсы</h1>
          <p>Продолжайте обучение</p>
        </div>
        
        ${myCourses.length > 0 ? `
          <div class="courses-grid">
            ${this.renderCourses(myCourses)}
          </div>
        ` : `
          <div class="empty-state">
            <span class="empty-icon">📚</span>
            <h3>У вас пока нет курсов</h3>
            <p>Начните обучение прямо сейчас!</p>
            <button class="btn-primary" onclick="FelixApp.router.navigate('catalog')">
              Перейти в каталог
            </button>
          </div>
        `}
      </div>
    `;
    
    this.setupCourseCards();
  }
  
  // Load Profile Page
  async loadProfilePage() {
    const api = window.FelixApp.api;
    const user = window.FelixApp.user;
    
    // Load profile data
    const profile = await api.request(`/app?action=getProfile&userId=${user.id}`, { cache: true });
    
    // Render page
    this.container.innerHTML = `
      <div class="page active" id="profile-page">
        <div class="profile-header">
          <div class="profile-avatar">${user.first_name[0].toUpperCase()}</div>
          <h2>${user.first_name} ${user.last_name || ''}</h2>
          <p>@${user.username || 'user'}</p>
        </div>
        
        <div class="profile-stats">
          <div class="profile-stat">
            <span class="stat-value">${profile.profile?.level || 1}</span>
            <span class="stat-label">Уровень</span>
          </div>
          <div class="profile-stat">
            <span class="stat-value">${profile.profile?.xp || 0}</span>
            <span class="stat-label">XP</span>
          </div>
          <div class="profile-stat">
            <span class="stat-value">${profile.profile?.achievements || 0}</span>
            <span class="stat-label">Достижения</span>
          </div>
        </div>
        
        <div class="profile-menu">
          <div class="menu-item" onclick="FelixApp.router.navigate('settings')">
            <span>⚙️</span>
            <span>Настройки</span>
            <span>→</span>
          </div>
          <div class="menu-item" onclick="FelixApp.router.navigate('ai-chat')">
            <span>🤖</span>
            <span>AI Ассистент</span>
            <span>→</span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Render courses
  renderCourses(courses) {
    if (!courses || courses.length === 0) {
      return '<p class="empty-text">Курсы не найдены</p>';
    }
    
    return courses.map(course => `
      <div class="card-brandbook course-card" data-course-id="${course.id}">
        <div class="course-icon">${course.icon || '📚'}</div>
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description || ''}</p>
        <div class="course-meta">
          <span class="meta-item">⏱️ ${course.duration || '2 часа'}</span>
          <span class="meta-item">📊 ${course.level || 'Начальный'}</span>
        </div>
        ${course.progress ? `
          <div class="progress-bar-brandbook">
            <div class="progress-fill-brandbook" style="width: ${course.progress}%"></div>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  
  // Setup course cards click handlers
  setupCourseCards() {
    const cards = document.querySelectorAll('.course-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const courseId = card.dataset.courseId;
        this.navigate('course', { courseId });
        window.Telegram.WebApp.HapticFeedback?.impactOccurred('light');
      });
    });
  }
  
  // Setup search
  setupSearch(courses) {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
      
      document.getElementById('courses-list').innerHTML = this.renderCourses(filtered);
      this.setupCourseCards();
    });
  }
  
  // Setup filters
  setupFilters(courses) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter courses
        const filter = btn.dataset.filter;
        const filtered = filter === 'all' 
          ? courses 
          : courses.filter(c => c.level?.toLowerCase() === filter);
        
        document.getElementById('courses-list').innerHTML = this.renderCourses(filtered);
        this.setupCourseCards();
        
        window.Telegram.WebApp.HapticFeedback?.selectionChanged();
      });
    });
  }
  
  // Show loading
  showLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loader"></div>
        <p>Загрузка...</p>
      </div>
    `;
  }
  
  // Hide loading
  hideLoading() {
    const loading = this.container.querySelector('.loading-container');
    if (loading) {
      loading.remove();
    }
  }
  
  // Show error
  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <h3>⚠️ Ошибка</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn-primary">
          Перезагрузить
        </button>
      </div>
    `;
  }
}

// Export
window.Router = Router;
