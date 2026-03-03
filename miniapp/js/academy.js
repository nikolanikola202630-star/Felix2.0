// Felix Academy - Academy Module
class AcademyManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.API_URL = 'https://felix2-0.vercel.app/api';
    this.user = this.tg?.initDataUnsafe?.user || { first_name: 'Пользователь', id: 0 };
    this.init();
  }

  init() {
    this.tg?.ready();
    this.tg?.expand();
    this.showUserName();
    this.loadData();
  }

  showUserName() {
    const el = document.getElementById('userName');
    if (el) el.textContent = this.user.first_name;
  }

  async loadData() {
    try {
      // Загрузка курсов из API
      const response = await fetch(`${this.API_URL}/courses`);
      const data = await response.json();
      const courses = data.courses || [];

      // Фильтрация
      const freeCourses = courses.filter(c => c.price === 0 || c.themes?.some(t => t.lessons?.some(l => l.is_free)));
      const popularCourses = courses.sort((a, b) => b.students - a.students).slice(0, 5);

      this.renderCarousel('freeLessons', freeCourses);
      this.renderCarousel('popularCourses', popularCourses);
    } catch (error) {
      console.error('Error:', error);
      this.loadFallbackData();
    }
  }

  async loadFallbackData() {
    try {
      const response = await fetch('../data/courses-structure.json');
      const data = await response.json();
      const courses = data.courses || [];
      
      const freeCourses = courses.filter(c => c.price === 0);
      const popularCourses = courses.sort((a, b) => b.students - a.students);

      this.renderCarousel('freeLessons', freeCourses);
      this.renderCarousel('popularCourses', popularCourses);
    } catch (error) {
      console.error('Fallback error:', error);
    }
  }

  renderCarousel(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty">Пока нет курсов</div>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="card" onclick="academyManager.openCourse('${item.slug || item.id}')">
        <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-meta">
            <span class="card-price ${item.price === 0 ? 'free' : ''}">
              ${item.price > 0 ? item.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно'}
            </span>
            <span class="rating">⭐ ${item.rating}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  openCourse(slug) {
    if (this.tg?.HapticFeedback) {
      this.tg.HapticFeedback.impactOccurred('medium');
    }
    window.location.href = `course.html?slug=${slug}`;
  }
}

// Инициализация
let academyManager;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    academyManager = new AcademyManager();
  });
} else {
  academyManager = new AcademyManager();
}

window.academyManager = academyManager;
