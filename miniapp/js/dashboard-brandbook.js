// Felix Academy V12 - Dashboard Logic
// Old Money. Cold Mind. High Society.

class DashboardBrandbook {
  constructor() {
    this.user = this.loadUserData();
    this.init();
  }

  init() {
    this.renderDynamicContent();
    this.attachEventListeners();
    this.animateStats();
  }

  loadUserData() {
    // Загрузка данных пользователя
    // В реальном приложении - из API
    return {
      name: 'Пользователь',
      level: 5,
      activeCourse: {
        id: 1,
        title: 'Основы инвестирования',
        progress: 42,
        currentLesson: 5,
        totalLessons: 12
      },
      stats: {
        courses: 12,
        progress: 87,
        hours: 24,
        achievements: 15
      },
      isNewUser: false
    };
  }

  renderDynamicContent() {
    const progressBlock = document.getElementById('progressBlock');
    const recommendationsBlock = document.getElementById('recommendationsBlock');

    if (this.user.isNewUser) {
      // Показать onboarding для новичков
      progressBlock.innerHTML = this.renderOnboarding();
    } else if (this.user.activeCourse) {
      // Показать прогресс текущего курса
      // Уже отображается в HTML
    } else {
      // Показать рекомендации
      recommendationsBlock.innerHTML = this.renderRecommendations();
    }
  }

  renderOnboarding() {
    return `
      <div class="onboarding-block">
        <div class="onboarding-icon">🎓</div>
        <h2 class="onboarding-title">Добро пожаловать в Felix Academy</h2>
        <p class="onboarding-text">
          Вы вступаете в закрытое сообщество профессионалов.
          Начните свой путь к мастерству с базовых курсов.
        </p>
        <button class="btn-brandbook btn-brandbook-primary">
          Начать обучение
        </button>
      </div>
    `;
  }

  renderRecommendations() {
    return `
      <section class="section-brandbook">
        <div class="section-header-brandbook">
          <h3 class="section-title-brandbook">Рекомендуемые курсы</h3>
          <span class="view-all-brandbook">Все курсы</span>
        </div>
        <div class="recommendations-grid">
          <!-- Карточки курсов -->
        </div>
      </section>
    `;
  }

  attachEventListeners() {
    // Обработчики для кнопок
    document.querySelectorAll('.btn-brandbook').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleButtonClick(e);
      });
    });

    // Обработчики для карточек
    document.querySelectorAll('.card-brandbook').forEach(card => {
      card.addEventListener('click', (e) => {
        this.handleCardClick(e);
      });
    });

    // Обработчики для статистики
    document.querySelectorAll('.stat-card-brandbook').forEach(stat => {
      stat.addEventListener('click', (e) => {
        this.handleStatClick(e);
      });
    });

    // Обработчики для навигации
    document.querySelectorAll('.view-all-brandbook').forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleViewAllClick(e);
      });
    });
  }

  handleButtonClick(e) {
    const btn = e.currentTarget;
    const text = btn.textContent.trim();

    // Минимальная анимация нажатия
    btn.style.transform = 'scale(0.98)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 150);

    // Логика в зависимости от кнопки
    if (text === 'Продолжить') {
      this.continueLearning();
    } else if (text === 'Начать обучение') {
      this.startLearning();
    }
  }

  handleCardClick(e) {
    const card = e.currentTarget;
    const title = card.querySelector('.card-title-brandbook')?.textContent;
    
    console.log('Открыть курс:', title);
    // Навигация к курсу
  }

  handleStatClick(e) {
    const stat = e.currentTarget;
    const label = stat.querySelector('.stat-label-brandbook')?.textContent;
    
    console.log('Открыть статистику:', label);
    // Показать детальную статистику
  }

  handleViewAllClick(e) {
    const link = e.currentTarget;
    const text = link.textContent.trim();
    
    console.log('Открыть:', text);
    // Навигация к соответствующему разделу
  }

  continueLearning() {
    if (this.user.activeCourse) {
      console.log('Продолжить курс:', this.user.activeCourse.title);
      // Навигация к уроку
      window.location.href = `lesson.html?course=${this.user.activeCourse.id}&lesson=${this.user.activeCourse.currentLesson}`;
    }
  }

  startLearning() {
    console.log('Начать обучение');
    // Навигация к каталогу
    window.location.href = 'catalog.html';
  }

  animateStats() {
    // Анимация чисел в статистике
    const statValues = document.querySelectorAll('.stat-value-brandbook');
    
    statValues.forEach(stat => {
      const finalValue = stat.textContent;
      const isPercentage = finalValue.includes('%');
      const numericValue = parseInt(finalValue);
      
      if (!isNaN(numericValue)) {
        this.animateNumber(stat, 0, numericValue, 1000, isPercentage);
      }
    });
  }

  animateNumber(element, start, end, duration, isPercentage = false) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function для плавности
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      element.textContent = isPercentage ? `${current}%` : current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-brandbook';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Показать
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Скрыть и удалить
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new DashboardBrandbook();
});
